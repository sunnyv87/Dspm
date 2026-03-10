"""Connector handlers for all supported data source types.

Each handler implements test_connection, list_assets, and fetch_metadata
for its respective connector type. Scan-time content retrieval for
classification is handled via scan_content.
"""

import ipaddress
import logging
import socket

logger = logging.getLogger(__name__)


def _is_internal_address(host: str) -> bool:
    """Block SSRF by rejecting internal/private/reserved IP addresses."""
    try:
        resolved = socket.getaddrinfo(host, None)
        for _, _, _, _, sockaddr in resolved:
            ip = ipaddress.ip_address(sockaddr[0])
            if ip.is_private or ip.is_loopback or ip.is_reserved or ip.is_link_local:
                return True
    except (socket.gaierror, ValueError):
        pass
    blocked_hosts = {"169.254.169.254", "metadata.google.internal", "metadata.internal"}
    if host.lower() in blocked_hosts:
        return True
    return False


def _sanitize_error(e: Exception) -> str:
    """Return a generic error message — never expose raw exception details."""
    logger.error("Connector error: %s", str(e), exc_info=True)
    error_type = type(e).__name__
    return f"Connection failed ({error_type}). Check credentials and network configuration."


# ---------------------------------------------------------------------------
# Base handler
# ---------------------------------------------------------------------------

class BaseConnectorHandler:
    """Base class for connector-specific handlers."""

    connector_label: str = "Unknown"

    async def test_connection(self, config: dict, credentials: dict) -> dict:
        raise NotImplementedError

    async def list_assets(self, config: dict, credentials: dict) -> list:
        raise NotImplementedError

    async def fetch_metadata(self, config: dict, credentials: dict, asset_path: str) -> dict:
        raise NotImplementedError

    async def scan_content(self, config: dict, credentials: dict, asset_path: str) -> str:
        """Retrieve textual content for classification. Returns raw text."""
        raise NotImplementedError


# ═══════════════════════════════════════════════════════════════════════════
# 1. CLOUD STORAGE CONNECTORS
# ═══════════════════════════════════════════════════════════════════════════

class AWSS3Handler(BaseConnectorHandler):
    connector_label = "AWS S3"

    async def test_connection(self, config: dict, credentials: dict) -> dict:
        try:
            import boto3
            session = boto3.Session(
                aws_access_key_id=credentials.get("access_key"),
                aws_secret_access_key=credentials.get("secret_key"),
                region_name=config.get("region", "us-east-1"),
            )
            s3 = session.client("s3")
            s3.list_buckets()
            return {"success": True, "message": "Connected to AWS S3 successfully"}
        except Exception as e:
            return {"success": False, "message": _sanitize_error(e)}

    async def list_assets(self, config: dict, credentials: dict) -> list:
        try:
            import boto3
            session = boto3.Session(
                aws_access_key_id=credentials.get("access_key"),
                aws_secret_access_key=credentials.get("secret_key"),
                region_name=config.get("region", "us-east-1"),
            )
            s3 = session.client("s3")
            response = s3.list_buckets()
            assets = []
            for bucket in response.get("Buckets", []):
                assets.append({
                    "name": bucket["Name"],
                    "asset_type": "bucket",
                    "path": f"s3://{bucket['Name']}",
                    "created_at": str(bucket.get("CreationDate", "")),
                })
            return assets
        except Exception as e:
            logger.error("S3 list_assets failed: %s", e)
            return []

    async def fetch_metadata(self, config: dict, credentials: dict, asset_path: str) -> dict:
        try:
            import boto3
            session = boto3.Session(
                aws_access_key_id=credentials.get("access_key"),
                aws_secret_access_key=credentials.get("secret_key"),
                region_name=config.get("region", "us-east-1"),
            )
            s3 = session.client("s3")
            bucket_name = asset_path.replace("s3://", "").split("/")[0]
            location = s3.get_bucket_location(Bucket=bucket_name)
            encryption = {}
            try:
                encryption = s3.get_bucket_encryption(Bucket=bucket_name)
            except Exception:
                pass
            acl = s3.get_bucket_acl(Bucket=bucket_name)
            public_access = any(
                g.get("URI", "").endswith("AllUsers") or g.get("URI", "").endswith("AuthenticatedUsers")
                for grant in acl.get("Grants", [])
                for g in [grant.get("Grantee", {})]
            )
            return {
                "region": location.get("LocationConstraint") or "us-east-1",
                "encryption": "encrypted" if encryption else "not_encrypted",
                "exposure": "public" if public_access else "private",
            }
        except Exception as e:
            logger.error("S3 fetch_metadata failed: %s", e)
            return {}

    async def scan_content(self, config: dict, credentials: dict, asset_path: str) -> str:
        try:
            import boto3
            session = boto3.Session(
                aws_access_key_id=credentials.get("access_key"),
                aws_secret_access_key=credentials.get("secret_key"),
                region_name=config.get("region", "us-east-1"),
            )
            s3 = session.client("s3")
            parts = asset_path.replace("s3://", "").split("/", 1)
            bucket, key = parts[0], parts[1] if len(parts) > 1 else ""
            if not key:
                # List objects and sample first few
                resp = s3.list_objects_v2(Bucket=bucket, MaxKeys=10)
                samples = []
                for obj in resp.get("Contents", [])[:5]:
                    try:
                        body = s3.get_object(Bucket=bucket, Key=obj["Key"], Range="bytes=0-65535")
                        samples.append(body["Body"].read().decode("utf-8", errors="replace"))
                    except Exception:
                        continue
                return "\n".join(samples)
            else:
                body = s3.get_object(Bucket=bucket, Key=key, Range="bytes=0-65535")
                return body["Body"].read().decode("utf-8", errors="replace")
        except Exception as e:
            logger.error("S3 scan_content failed: %s", e)
            return ""


class AzureBlobHandler(BaseConnectorHandler):
    connector_label = "Azure Blob Storage"

    async def test_connection(self, config: dict, credentials: dict) -> dict:
        try:
            from azure.storage.blob import BlobServiceClient
            connection_string = credentials.get("connection_string")
            client = BlobServiceClient.from_connection_string(connection_string)
            list(client.list_containers(max_results=1))
            return {"success": True, "message": "Connected to Azure Blob Storage successfully"}
        except Exception as e:
            return {"success": False, "message": _sanitize_error(e)}

    async def list_assets(self, config: dict, credentials: dict) -> list:
        try:
            from azure.storage.blob import BlobServiceClient
            client = BlobServiceClient.from_connection_string(credentials.get("connection_string"))
            assets = []
            for container in client.list_containers():
                assets.append({
                    "name": container["name"],
                    "asset_type": "container",
                    "path": f"azure://{container['name']}",
                })
            return assets
        except Exception as e:
            logger.error("Azure Blob list_assets failed: %s", e)
            return []

    async def fetch_metadata(self, config: dict, credentials: dict, asset_path: str) -> dict:
        try:
            from azure.storage.blob import BlobServiceClient
            client = BlobServiceClient.from_connection_string(credentials.get("connection_string"))
            container_name = asset_path.replace("azure://", "").split("/")[0]
            container_client = client.get_container_client(container_name)
            props = container_client.get_container_properties()
            access = props.get("public_access")
            return {
                "encryption": "encrypted",
                "exposure": "public" if access else "private",
                "last_modified": str(props.get("last_modified", "")),
            }
        except Exception as e:
            logger.error("Azure Blob fetch_metadata failed: %s", e)
            return {}

    async def scan_content(self, config: dict, credentials: dict, asset_path: str) -> str:
        try:
            from azure.storage.blob import BlobServiceClient
            client = BlobServiceClient.from_connection_string(credentials.get("connection_string"))
            container_name = asset_path.replace("azure://", "").split("/")[0]
            container_client = client.get_container_client(container_name)
            samples = []
            for blob in container_client.list_blobs(results_per_page=5):
                try:
                    blob_client = container_client.get_blob_client(blob.name)
                    data = blob_client.download_blob(max_concurrency=1, length=65536)
                    samples.append(data.readall().decode("utf-8", errors="replace"))
                except Exception:
                    continue
                if len(samples) >= 5:
                    break
            return "\n".join(samples)
        except Exception as e:
            logger.error("Azure Blob scan_content failed: %s", e)
            return ""


class ADLSHandler(BaseConnectorHandler):
    connector_label = "Azure Data Lake Storage"

    async def test_connection(self, config: dict, credentials: dict) -> dict:
        try:
            from azure.storage.filedatalake import DataLakeServiceClient
            client = DataLakeServiceClient(
                account_url=f"https://{config.get('storage_account')}.dfs.core.windows.net",
                credential=credentials.get("access_key"),
            )
            list(client.list_file_systems(max_results=1))
            return {"success": True, "message": "Connected to Azure Data Lake Storage successfully"}
        except Exception as e:
            return {"success": False, "message": _sanitize_error(e)}

    async def list_assets(self, config: dict, credentials: dict) -> list:
        try:
            from azure.storage.filedatalake import DataLakeServiceClient
            client = DataLakeServiceClient(
                account_url=f"https://{config.get('storage_account')}.dfs.core.windows.net",
                credential=credentials.get("access_key"),
            )
            assets = []
            for fs in client.list_file_systems():
                assets.append({
                    "name": fs["name"],
                    "asset_type": "datalake_object",
                    "path": f"adls://{config.get('storage_account')}/{fs['name']}",
                })
            return assets
        except Exception as e:
            logger.error("ADLS list_assets failed: %s", e)
            return []

    async def fetch_metadata(self, config: dict, credentials: dict, asset_path: str) -> dict:
        try:
            from azure.storage.filedatalake import DataLakeServiceClient
            client = DataLakeServiceClient(
                account_url=f"https://{config.get('storage_account')}.dfs.core.windows.net",
                credential=credentials.get("access_key"),
            )
            parts = asset_path.replace("adls://", "").split("/", 1)
            fs_name = parts[-1] if len(parts) > 1 else parts[0]
            fs_client = client.get_file_system_client(fs_name)
            props = fs_client.get_file_system_properties()
            return {
                "last_modified": str(props.get("last_modified", "")),
                "encryption": "encrypted",
                "exposure": "private",
            }
        except Exception as e:
            logger.error("ADLS fetch_metadata failed: %s", e)
            return {}

    async def scan_content(self, config: dict, credentials: dict, asset_path: str) -> str:
        try:
            from azure.storage.filedatalake import DataLakeServiceClient
            client = DataLakeServiceClient(
                account_url=f"https://{config.get('storage_account')}.dfs.core.windows.net",
                credential=credentials.get("access_key"),
            )
            parts = asset_path.replace("adls://", "").split("/", 1)
            fs_name = parts[-1] if len(parts) > 1 else parts[0]
            fs_client = client.get_file_system_client(fs_name)
            samples = []
            for path in fs_client.get_paths(max_results=5):
                if not path.is_directory:
                    try:
                        file_client = fs_client.get_file_client(path.name)
                        data = file_client.download_file(length=65536)
                        samples.append(data.readall().decode("utf-8", errors="replace"))
                    except Exception:
                        continue
            return "\n".join(samples)
        except Exception as e:
            logger.error("ADLS scan_content failed: %s", e)
            return ""


class GCSHandler(BaseConnectorHandler):
    connector_label = "Google Cloud Storage"

    async def test_connection(self, config: dict, credentials: dict) -> dict:
        try:
            from google.cloud import storage
            client = storage.Client(project=config.get("project_id"))
            list(client.list_buckets(max_results=1))
            return {"success": True, "message": "Connected to Google Cloud Storage successfully"}
        except Exception as e:
            return {"success": False, "message": _sanitize_error(e)}

    async def list_assets(self, config: dict, credentials: dict) -> list:
        try:
            from google.cloud import storage
            client = storage.Client(project=config.get("project_id"))
            assets = []
            for bucket in client.list_buckets():
                assets.append({
                    "name": bucket.name,
                    "asset_type": "bucket",
                    "path": f"gs://{bucket.name}",
                })
            return assets
        except Exception as e:
            logger.error("GCS list_assets failed: %s", e)
            return []

    async def fetch_metadata(self, config: dict, credentials: dict, asset_path: str) -> dict:
        try:
            from google.cloud import storage
            client = storage.Client(project=config.get("project_id"))
            bucket_name = asset_path.replace("gs://", "").split("/")[0]
            bucket = client.get_bucket(bucket_name)
            iam_policy = bucket.get_iam_policy()
            public = any("allUsers" in m or "allAuthenticatedUsers" in m for binding in iam_policy.bindings for m in binding.get("members", []))
            return {
                "region": bucket.location,
                "storage_class": bucket.storage_class,
                "encryption": "encrypted" if bucket.default_kms_key_name else "not_encrypted",
                "exposure": "public" if public else "private",
            }
        except Exception as e:
            logger.error("GCS fetch_metadata failed: %s", e)
            return {}

    async def scan_content(self, config: dict, credentials: dict, asset_path: str) -> str:
        try:
            from google.cloud import storage
            client = storage.Client(project=config.get("project_id"))
            bucket_name = asset_path.replace("gs://", "").split("/")[0]
            bucket = client.get_bucket(bucket_name)
            samples = []
            for blob in bucket.list_blobs(max_results=5):
                try:
                    data = blob.download_as_bytes(start=0, end=65535)
                    samples.append(data.decode("utf-8", errors="replace"))
                except Exception:
                    continue
            return "\n".join(samples)
        except Exception as e:
            logger.error("GCS scan_content failed: %s", e)
            return ""


class OneDriveHandler(BaseConnectorHandler):
    connector_label = "Microsoft OneDrive"

    async def test_connection(self, config: dict, credentials: dict) -> dict:
        try:
            import httpx
            token = credentials.get("access_token")
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    "https://graph.microsoft.com/v1.0/me/drive",
                    headers={"Authorization": f"Bearer {token}"},
                )
                resp.raise_for_status()
            return {"success": True, "message": "Connected to OneDrive successfully"}
        except Exception as e:
            return {"success": False, "message": _sanitize_error(e)}

    async def list_assets(self, config: dict, credentials: dict) -> list:
        try:
            import httpx
            token = credentials.get("access_token")
            user_id = config.get("user_id", "me")
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"https://graph.microsoft.com/v1.0/{user_id}/drive/root/children",
                    headers={"Authorization": f"Bearer {token}"},
                )
                resp.raise_for_status()
                data = resp.json()
            assets = []
            for item in data.get("value", []):
                assets.append({
                    "name": item["name"],
                    "asset_type": "file" if "file" in item else "folder",
                    "path": f"onedrive://{item['id']}",
                    "size_bytes": item.get("size"),
                })
            return assets
        except Exception as e:
            logger.error("OneDrive list_assets failed: %s", e)
            return []

    async def fetch_metadata(self, config: dict, credentials: dict, asset_path: str) -> dict:
        try:
            import httpx
            token = credentials.get("access_token")
            item_id = asset_path.replace("onedrive://", "")
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"https://graph.microsoft.com/v1.0/me/drive/items/{item_id}",
                    headers={"Authorization": f"Bearer {token}"},
                )
                resp.raise_for_status()
                data = resp.json()
            shared = data.get("shared", {})
            return {
                "size_bytes": data.get("size"),
                "last_modified": data.get("lastModifiedDateTime"),
                "exposure": "external_shared" if shared.get("scope") == "anonymous" else "private",
                "mime_type": data.get("file", {}).get("mimeType"),
            }
        except Exception as e:
            logger.error("OneDrive fetch_metadata failed: %s", e)
            return {}

    async def scan_content(self, config: dict, credentials: dict, asset_path: str) -> str:
        try:
            import httpx
            token = credentials.get("access_token")
            item_id = asset_path.replace("onedrive://", "")
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"https://graph.microsoft.com/v1.0/me/drive/items/{item_id}/content",
                    headers={"Authorization": f"Bearer {token}"},
                    follow_redirects=True,
                )
                resp.raise_for_status()
                return resp.text[:65536]
        except Exception as e:
            logger.error("OneDrive scan_content failed: %s", e)
            return ""


class SharePointOnlineHandler(BaseConnectorHandler):
    connector_label = "SharePoint Online"

    async def test_connection(self, config: dict, credentials: dict) -> dict:
        try:
            import httpx
            token = credentials.get("access_token")
            site_url = config.get("site_url", "")
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"https://graph.microsoft.com/v1.0/sites/{site_url}",
                    headers={"Authorization": f"Bearer {token}"},
                )
                resp.raise_for_status()
            return {"success": True, "message": "Connected to SharePoint Online successfully"}
        except Exception as e:
            return {"success": False, "message": _sanitize_error(e)}

    async def list_assets(self, config: dict, credentials: dict) -> list:
        try:
            import httpx
            token = credentials.get("access_token")
            site_id = config.get("site_id", "")
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"https://graph.microsoft.com/v1.0/sites/{site_id}/drive/root/children",
                    headers={"Authorization": f"Bearer {token}"},
                )
                resp.raise_for_status()
                data = resp.json()
            assets = []
            for item in data.get("value", []):
                assets.append({
                    "name": item["name"],
                    "asset_type": "file" if "file" in item else "folder",
                    "path": f"sharepoint://{site_id}/{item['id']}",
                    "size_bytes": item.get("size"),
                })
            return assets
        except Exception as e:
            logger.error("SharePoint list_assets failed: %s", e)
            return []

    async def fetch_metadata(self, config: dict, credentials: dict, asset_path: str) -> dict:
        try:
            import httpx
            token = credentials.get("access_token")
            parts = asset_path.replace("sharepoint://", "").split("/", 1)
            site_id, item_id = parts[0], parts[1] if len(parts) > 1 else ""
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"https://graph.microsoft.com/v1.0/sites/{site_id}/drive/items/{item_id}",
                    headers={"Authorization": f"Bearer {token}"},
                )
                resp.raise_for_status()
                data = resp.json()
            return {
                "size_bytes": data.get("size"),
                "last_modified": data.get("lastModifiedDateTime"),
                "exposure": "external_shared" if data.get("shared") else "internal",
            }
        except Exception as e:
            logger.error("SharePoint fetch_metadata failed: %s", e)
            return {}

    async def scan_content(self, config: dict, credentials: dict, asset_path: str) -> str:
        try:
            import httpx
            token = credentials.get("access_token")
            parts = asset_path.replace("sharepoint://", "").split("/", 1)
            site_id, item_id = parts[0], parts[1] if len(parts) > 1 else ""
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"https://graph.microsoft.com/v1.0/sites/{site_id}/drive/items/{item_id}/content",
                    headers={"Authorization": f"Bearer {token}"},
                    follow_redirects=True,
                )
                resp.raise_for_status()
                return resp.text[:65536]
        except Exception as e:
            logger.error("SharePoint scan_content failed: %s", e)
            return ""


class GoogleDriveHandler(BaseConnectorHandler):
    connector_label = "Google Drive"

    async def test_connection(self, config: dict, credentials: dict) -> dict:
        try:
            from google.oauth2.credentials import Credentials
            from googleapiclient.discovery import build
            creds = Credentials(token=credentials.get("access_token"))
            service = build("drive", "v3", credentials=creds)
            service.files().list(pageSize=1).execute()
            return {"success": True, "message": "Connected to Google Drive successfully"}
        except Exception as e:
            return {"success": False, "message": _sanitize_error(e)}

    async def list_assets(self, config: dict, credentials: dict) -> list:
        try:
            from google.oauth2.credentials import Credentials
            from googleapiclient.discovery import build
            creds = Credentials(token=credentials.get("access_token"))
            service = build("drive", "v3", credentials=creds)
            results = service.files().list(
                pageSize=100,
                fields="files(id,name,mimeType,size,modifiedTime,shared)",
            ).execute()
            assets = []
            for f in results.get("files", []):
                assets.append({
                    "name": f["name"],
                    "asset_type": "folder" if f["mimeType"] == "application/vnd.google-apps.folder" else "file",
                    "path": f"gdrive://{f['id']}",
                    "size_bytes": int(f.get("size", 0)),
                })
            return assets
        except Exception as e:
            logger.error("Google Drive list_assets failed: %s", e)
            return []

    async def fetch_metadata(self, config: dict, credentials: dict, asset_path: str) -> dict:
        try:
            from google.oauth2.credentials import Credentials
            from googleapiclient.discovery import build
            creds = Credentials(token=credentials.get("access_token"))
            service = build("drive", "v3", credentials=creds)
            file_id = asset_path.replace("gdrive://", "")
            meta = service.files().get(fileId=file_id, fields="*").execute()
            return {
                "mime_type": meta.get("mimeType"),
                "size_bytes": int(meta.get("size", 0)),
                "last_modified": meta.get("modifiedTime"),
                "exposure": "external_shared" if meta.get("shared") else "private",
            }
        except Exception as e:
            logger.error("Google Drive fetch_metadata failed: %s", e)
            return {}

    async def scan_content(self, config: dict, credentials: dict, asset_path: str) -> str:
        try:
            from google.oauth2.credentials import Credentials
            from googleapiclient.discovery import build
            creds = Credentials(token=credentials.get("access_token"))
            service = build("drive", "v3", credentials=creds)
            file_id = asset_path.replace("gdrive://", "")
            content = service.files().get_media(fileId=file_id).execute()
            if isinstance(content, bytes):
                return content[:65536].decode("utf-8", errors="replace")
            return str(content)[:65536]
        except Exception as e:
            logger.error("Google Drive scan_content failed: %s", e)
            return ""


class BoxHandler(BaseConnectorHandler):
    connector_label = "Box"

    async def test_connection(self, config: dict, credentials: dict) -> dict:
        try:
            import httpx
            token = credentials.get("access_token")
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    "https://api.box.com/2.0/users/me",
                    headers={"Authorization": f"Bearer {token}"},
                )
                resp.raise_for_status()
            return {"success": True, "message": "Connected to Box successfully"}
        except Exception as e:
            return {"success": False, "message": _sanitize_error(e)}

    async def list_assets(self, config: dict, credentials: dict) -> list:
        try:
            import httpx
            token = credentials.get("access_token")
            folder_id = config.get("folder_id", "0")
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"https://api.box.com/2.0/folders/{folder_id}/items",
                    headers={"Authorization": f"Bearer {token}"},
                    params={"limit": 100},
                )
                resp.raise_for_status()
                data = resp.json()
            assets = []
            for entry in data.get("entries", []):
                assets.append({
                    "name": entry["name"],
                    "asset_type": entry["type"],
                    "path": f"box://{entry['id']}",
                })
            return assets
        except Exception as e:
            logger.error("Box list_assets failed: %s", e)
            return []

    async def fetch_metadata(self, config: dict, credentials: dict, asset_path: str) -> dict:
        try:
            import httpx
            token = credentials.get("access_token")
            file_id = asset_path.replace("box://", "")
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"https://api.box.com/2.0/files/{file_id}",
                    headers={"Authorization": f"Bearer {token}"},
                )
                resp.raise_for_status()
                data = resp.json()
            shared_link = data.get("shared_link")
            return {
                "size_bytes": data.get("size"),
                "last_modified": data.get("modified_at"),
                "exposure": "external_shared" if shared_link and shared_link.get("access") == "open" else "private",
            }
        except Exception as e:
            logger.error("Box fetch_metadata failed: %s", e)
            return {}

    async def scan_content(self, config: dict, credentials: dict, asset_path: str) -> str:
        try:
            import httpx
            token = credentials.get("access_token")
            file_id = asset_path.replace("box://", "")
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"https://api.box.com/2.0/files/{file_id}/content",
                    headers={"Authorization": f"Bearer {token}"},
                    follow_redirects=True,
                )
                resp.raise_for_status()
                return resp.text[:65536]
        except Exception as e:
            logger.error("Box scan_content failed: %s", e)
            return ""


class DropboxHandler(BaseConnectorHandler):
    connector_label = "Dropbox"

    async def test_connection(self, config: dict, credentials: dict) -> dict:
        try:
            import httpx
            token = credentials.get("access_token")
            async with httpx.AsyncClient() as client:
                resp = await client.post(
                    "https://api.dropboxapi.com/2/users/get_current_account",
                    headers={"Authorization": f"Bearer {token}"},
                )
                resp.raise_for_status()
            return {"success": True, "message": "Connected to Dropbox successfully"}
        except Exception as e:
            return {"success": False, "message": _sanitize_error(e)}

    async def list_assets(self, config: dict, credentials: dict) -> list:
        try:
            import httpx
            token = credentials.get("access_token")
            folder_path = config.get("folder_path", "")
            async with httpx.AsyncClient() as client:
                resp = await client.post(
                    "https://api.dropboxapi.com/2/files/list_folder",
                    headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
                    json={"path": folder_path, "limit": 100},
                )
                resp.raise_for_status()
                data = resp.json()
            assets = []
            for entry in data.get("entries", []):
                assets.append({
                    "name": entry["name"],
                    "asset_type": "folder" if entry[".tag"] == "folder" else "file",
                    "path": f"dropbox://{entry.get('id', entry['name'])}",
                    "size_bytes": entry.get("size"),
                })
            return assets
        except Exception as e:
            logger.error("Dropbox list_assets failed: %s", e)
            return []

    async def fetch_metadata(self, config: dict, credentials: dict, asset_path: str) -> dict:
        try:
            import httpx
            token = credentials.get("access_token")
            file_id = asset_path.replace("dropbox://", "")
            async with httpx.AsyncClient() as client:
                resp = await client.post(
                    "https://api.dropboxapi.com/2/files/get_metadata",
                    headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
                    json={"path": file_id},
                )
                resp.raise_for_status()
                data = resp.json()
            shared = data.get("sharing_info", {})
            return {
                "size_bytes": data.get("size"),
                "last_modified": data.get("server_modified"),
                "exposure": "external_shared" if shared.get("shared_folder_id") else "private",
            }
        except Exception as e:
            logger.error("Dropbox fetch_metadata failed: %s", e)
            return {}

    async def scan_content(self, config: dict, credentials: dict, asset_path: str) -> str:
        try:
            import httpx
            import json as _json
            token = credentials.get("access_token")
            file_path = asset_path.replace("dropbox://", "")
            async with httpx.AsyncClient() as client:
                resp = await client.post(
                    "https://content.dropboxapi.com/2/files/download",
                    headers={
                        "Authorization": f"Bearer {token}",
                        "Dropbox-API-Arg": _json.dumps({"path": file_path}),
                    },
                )
                resp.raise_for_status()
                return resp.text[:65536]
        except Exception as e:
            logger.error("Dropbox scan_content failed: %s", e)
            return ""


class EgnyteHandler(BaseConnectorHandler):
    connector_label = "Egnyte"

    async def test_connection(self, config: dict, credentials: dict) -> dict:
        try:
            import httpx
            domain = config.get("domain")  # e.g. "company.egnyte.com"
            token = credentials.get("access_token")
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"https://{domain}/pubapi/v1/userinfo",
                    headers={"Authorization": f"Bearer {token}"},
                )
                resp.raise_for_status()
            return {"success": True, "message": "Connected to Egnyte successfully"}
        except Exception as e:
            return {"success": False, "message": _sanitize_error(e)}

    async def list_assets(self, config: dict, credentials: dict) -> list:
        try:
            import httpx
            domain = config.get("domain")
            token = credentials.get("access_token")
            folder_path = config.get("folder_path", "/Shared")
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"https://{domain}/pubapi/v1/fs{folder_path}",
                    headers={"Authorization": f"Bearer {token}"},
                )
                resp.raise_for_status()
                data = resp.json()
            assets = []
            for item in data.get("files", []) + data.get("folders", []):
                assets.append({
                    "name": item.get("name", ""),
                    "asset_type": "folder" if item.get("is_folder") else "file",
                    "path": f"egnyte://{item.get('path', '')}",
                    "size_bytes": item.get("size"),
                })
            return assets
        except Exception as e:
            logger.error("Egnyte list_assets failed: %s", e)
            return []

    async def fetch_metadata(self, config: dict, credentials: dict, asset_path: str) -> dict:
        try:
            import httpx
            domain = config.get("domain")
            token = credentials.get("access_token")
            path = asset_path.replace("egnyte://", "")
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"https://{domain}/pubapi/v1/fs{path}",
                    headers={"Authorization": f"Bearer {token}"},
                )
                resp.raise_for_status()
                data = resp.json()
            return {
                "size_bytes": data.get("size"),
                "last_modified": data.get("last_modified"),
                "exposure": "internal",
            }
        except Exception as e:
            logger.error("Egnyte fetch_metadata failed: %s", e)
            return {}

    async def scan_content(self, config: dict, credentials: dict, asset_path: str) -> str:
        try:
            import httpx
            domain = config.get("domain")
            token = credentials.get("access_token")
            path = asset_path.replace("egnyte://", "")
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"https://{domain}/pubapi/v1/fs-content{path}",
                    headers={"Authorization": f"Bearer {token}"},
                )
                resp.raise_for_status()
                return resp.text[:65536]
        except Exception as e:
            logger.error("Egnyte scan_content failed: %s", e)
            return ""


# ═══════════════════════════════════════════════════════════════════════════
# 2. DATABASE CONNECTORS
# ═══════════════════════════════════════════════════════════════════════════

class PostgreSQLHandler(BaseConnectorHandler):
    connector_label = "PostgreSQL"

    async def test_connection(self, config: dict, credentials: dict) -> dict:
        host = config.get("host", "")
        if _is_internal_address(host):
            return {"success": False, "message": "Connection to internal/private addresses is not allowed"}
        try:
            import asyncpg
            conn = await asyncpg.connect(
                host=host,
                port=config.get("port", 5432),
                user=credentials.get("username"),
                password=credentials.get("password"),
                database=config.get("database"),
            )
            await conn.execute("SELECT 1")
            await conn.close()
            return {"success": True, "message": "Connected to PostgreSQL successfully"}
        except Exception as e:
            return {"success": False, "message": _sanitize_error(e)}

    async def list_assets(self, config: dict, credentials: dict) -> list:
        try:
            import asyncpg
            conn = await asyncpg.connect(
                host=config.get("host"),
                port=config.get("port", 5432),
                user=credentials.get("username"),
                password=credentials.get("password"),
                database=config.get("database"),
            )
            rows = await conn.fetch(
                "SELECT schemaname, tablename FROM pg_tables WHERE schemaname NOT IN ('pg_catalog', 'information_schema')"
            )
            await conn.close()
            assets = []
            for row in rows:
                schema, table = row["schemaname"], row["tablename"]
                assets.append({
                    "name": f"{schema}.{table}",
                    "asset_type": "table",
                    "path": f"postgresql://{config.get('host')}/{config.get('database')}/{schema}.{table}",
                })
            return assets
        except Exception as e:
            logger.error("PostgreSQL list_assets failed: %s", e)
            return []

    async def fetch_metadata(self, config: dict, credentials: dict, asset_path: str) -> dict:
        try:
            import asyncpg
            conn = await asyncpg.connect(
                host=config.get("host"),
                port=config.get("port", 5432),
                user=credentials.get("username"),
                password=credentials.get("password"),
                database=config.get("database"),
            )
            parts = asset_path.split("/")
            table_ref = parts[-1]
            schema, table = table_ref.split(".", 1) if "." in table_ref else ("public", table_ref)
            row_count = await conn.fetchval(f"SELECT COUNT(*) FROM {schema}.{table}")
            columns = await conn.fetch(
                "SELECT column_name, data_type FROM information_schema.columns WHERE table_schema=$1 AND table_name=$2",
                schema, table,
            )
            await conn.close()
            return {
                "row_count": row_count,
                "columns": [{"name": c["column_name"], "type": c["data_type"]} for c in columns],
                "encryption": "unknown",
                "exposure": "private",
            }
        except Exception as e:
            logger.error("PostgreSQL fetch_metadata failed: %s", e)
            return {}

    async def scan_content(self, config: dict, credentials: dict, asset_path: str) -> str:
        try:
            import asyncpg
            conn = await asyncpg.connect(
                host=config.get("host"),
                port=config.get("port", 5432),
                user=credentials.get("username"),
                password=credentials.get("password"),
                database=config.get("database"),
            )
            parts = asset_path.split("/")
            table_ref = parts[-1]
            schema, table = table_ref.split(".", 1) if "." in table_ref else ("public", table_ref)
            rows = await conn.fetch(f"SELECT * FROM {schema}.{table} LIMIT 50")
            await conn.close()
            return "\n".join(str(dict(row)) for row in rows)
        except Exception as e:
            logger.error("PostgreSQL scan_content failed: %s", e)
            return ""


class _GenericDBHandler(BaseConnectorHandler):
    """Generic handler for SQL databases sharing a common pattern."""

    connector_label = "Database"
    _driver_module: str = ""
    _default_port: int = 3306

    def _build_connection_string(self, config: dict, credentials: dict) -> str:
        user = credentials.get("username", "")
        password = credentials.get("password", "")
        host = config.get("host", "")
        port = config.get("port", self._default_port)
        database = config.get("database", "")
        return f"{user}:{password}@{host}:{port}/{database}"

    async def test_connection(self, config: dict, credentials: dict) -> dict:
        host = config.get("host", "")
        if host and _is_internal_address(host):
            return {"success": False, "message": "Connection to internal/private addresses is not allowed"}
        try:
            import sqlalchemy
            from sqlalchemy import text
            url = f"{self._driver_module}://{self._build_connection_string(config, credentials)}"
            engine = sqlalchemy.create_engine(url, pool_pre_ping=True)
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            engine.dispose()
            return {"success": True, "message": f"Connected to {self.connector_label} successfully"}
        except Exception as e:
            return {"success": False, "message": _sanitize_error(e)}

    async def list_assets(self, config: dict, credentials: dict) -> list:
        try:
            import sqlalchemy
            from sqlalchemy import inspect
            url = f"{self._driver_module}://{self._build_connection_string(config, credentials)}"
            engine = sqlalchemy.create_engine(url)
            inspector = inspect(engine)
            assets = []
            for schema in inspector.get_schema_names():
                if schema.lower() in ("information_schema", "pg_catalog", "sys", "mysql", "performance_schema"):
                    continue
                for table in inspector.get_table_names(schema=schema):
                    assets.append({
                        "name": f"{schema}.{table}",
                        "asset_type": "table",
                        "path": f"{self._driver_module}://{config.get('host')}/{config.get('database')}/{schema}.{table}",
                    })
            engine.dispose()
            return assets
        except Exception as e:
            logger.error("%s list_assets failed: %s", self.connector_label, e)
            return []

    async def fetch_metadata(self, config: dict, credentials: dict, asset_path: str) -> dict:
        try:
            import sqlalchemy
            from sqlalchemy import inspect, text
            url = f"{self._driver_module}://{self._build_connection_string(config, credentials)}"
            engine = sqlalchemy.create_engine(url)
            parts = asset_path.split("/")
            table_ref = parts[-1]
            schema, table = table_ref.split(".", 1) if "." in table_ref else ("dbo", table_ref)
            inspector = inspect(engine)
            columns = inspector.get_columns(table, schema=schema)
            with engine.connect() as conn:
                row_count = conn.execute(text(f"SELECT COUNT(*) FROM {schema}.{table}")).scalar()
            engine.dispose()
            return {
                "row_count": row_count,
                "columns": [{"name": c["name"], "type": str(c["type"])} for c in columns],
                "encryption": "unknown",
                "exposure": "private",
            }
        except Exception as e:
            logger.error("%s fetch_metadata failed: %s", self.connector_label, e)
            return {}

    async def scan_content(self, config: dict, credentials: dict, asset_path: str) -> str:
        try:
            import sqlalchemy
            from sqlalchemy import text
            url = f"{self._driver_module}://{self._build_connection_string(config, credentials)}"
            engine = sqlalchemy.create_engine(url)
            parts = asset_path.split("/")
            table_ref = parts[-1]
            with engine.connect() as conn:
                rows = conn.execute(text(f"SELECT * FROM {table_ref} FETCH FIRST 50 ROWS ONLY")).mappings().all()
            engine.dispose()
            return "\n".join(str(dict(row)) for row in rows)
        except Exception as e:
            logger.error("%s scan_content failed: %s", self.connector_label, e)
            return ""


class MySQLHandler(_GenericDBHandler):
    connector_label = "MySQL"
    _driver_module = "mysql+pymysql"
    _default_port = 3306


class MSSQLHandler(_GenericDBHandler):
    connector_label = "Microsoft SQL Server"
    _driver_module = "mssql+pymssql"
    _default_port = 1433


class OracleHandler(_GenericDBHandler):
    connector_label = "Oracle Database"
    _driver_module = "oracle+oracledb"
    _default_port = 1521


class MariaDBHandler(_GenericDBHandler):
    connector_label = "MariaDB"
    _driver_module = "mariadb+mariadbconnector"
    _default_port = 3306


class DB2Handler(_GenericDBHandler):
    connector_label = "IBM Db2"
    _driver_module = "db2+ibm_db"
    _default_port = 50000


class MongoDBHandler(BaseConnectorHandler):
    connector_label = "MongoDB"

    async def test_connection(self, config: dict, credentials: dict) -> dict:
        host = config.get("host", "")
        if host and _is_internal_address(host):
            return {"success": False, "message": "Connection to internal/private addresses is not allowed"}
        try:
            from pymongo import MongoClient
            uri = credentials.get("connection_string") or (
                f"mongodb://{credentials.get('username')}:{credentials.get('password')}"
                f"@{host}:{config.get('port', 27017)}/{config.get('database', 'admin')}"
            )
            client = MongoClient(uri, serverSelectionTimeoutMS=5000)
            client.admin.command("ping")
            client.close()
            return {"success": True, "message": "Connected to MongoDB successfully"}
        except Exception as e:
            return {"success": False, "message": _sanitize_error(e)}

    async def list_assets(self, config: dict, credentials: dict) -> list:
        try:
            from pymongo import MongoClient
            uri = credentials.get("connection_string") or (
                f"mongodb://{credentials.get('username')}:{credentials.get('password')}"
                f"@{config.get('host')}:{config.get('port', 27017)}"
            )
            client = MongoClient(uri, serverSelectionTimeoutMS=5000)
            assets = []
            for db_name in client.list_database_names():
                if db_name in ("admin", "config", "local"):
                    continue
                db = client[db_name]
                for coll_name in db.list_collection_names():
                    assets.append({
                        "name": f"{db_name}.{coll_name}",
                        "asset_type": "table",
                        "path": f"mongodb://{config.get('host')}/{db_name}/{coll_name}",
                    })
            client.close()
            return assets
        except Exception as e:
            logger.error("MongoDB list_assets failed: %s", e)
            return []

    async def fetch_metadata(self, config: dict, credentials: dict, asset_path: str) -> dict:
        try:
            from pymongo import MongoClient
            uri = credentials.get("connection_string") or (
                f"mongodb://{credentials.get('username')}:{credentials.get('password')}"
                f"@{config.get('host')}:{config.get('port', 27017)}"
            )
            client = MongoClient(uri, serverSelectionTimeoutMS=5000)
            parts = asset_path.replace("mongodb://", "").split("/")
            db_name = parts[1] if len(parts) > 1 else parts[0]
            coll_name = parts[2] if len(parts) > 2 else ""
            db = client[db_name]
            if coll_name:
                stats = db.command("collStats", coll_name)
                client.close()
                return {
                    "document_count": stats.get("count"),
                    "size_bytes": stats.get("size"),
                    "index_count": stats.get("nindexes"),
                    "encryption": "unknown",
                    "exposure": "private",
                }
            client.close()
            return {}
        except Exception as e:
            logger.error("MongoDB fetch_metadata failed: %s", e)
            return {}

    async def scan_content(self, config: dict, credentials: dict, asset_path: str) -> str:
        try:
            import json
            from pymongo import MongoClient
            uri = credentials.get("connection_string") or (
                f"mongodb://{credentials.get('username')}:{credentials.get('password')}"
                f"@{config.get('host')}:{config.get('port', 27017)}"
            )
            client = MongoClient(uri, serverSelectionTimeoutMS=5000)
            parts = asset_path.replace("mongodb://", "").split("/")
            db_name = parts[1] if len(parts) > 1 else parts[0]
            coll_name = parts[2] if len(parts) > 2 else ""
            db = client[db_name]
            docs = list(db[coll_name].find({}, {"_id": 0}).limit(50))
            client.close()
            return "\n".join(json.dumps(doc, default=str) for doc in docs)
        except Exception as e:
            logger.error("MongoDB scan_content failed: %s", e)
            return ""


class CassandraHandler(BaseConnectorHandler):
    connector_label = "Cassandra"

    async def test_connection(self, config: dict, credentials: dict) -> dict:
        host = config.get("host", "")
        if host and _is_internal_address(host):
            return {"success": False, "message": "Connection to internal/private addresses is not allowed"}
        try:
            from cassandra.cluster import Cluster
            from cassandra.auth import PlainTextAuthProvider
            auth = None
            if credentials.get("username"):
                auth = PlainTextAuthProvider(
                    username=credentials.get("username"),
                    password=credentials.get("password"),
                )
            cluster = Cluster(
                contact_points=[host],
                port=config.get("port", 9042),
                auth_provider=auth,
            )
            session = cluster.connect()
            session.execute("SELECT now() FROM system.local")
            session.shutdown()
            cluster.shutdown()
            return {"success": True, "message": "Connected to Cassandra successfully"}
        except Exception as e:
            return {"success": False, "message": _sanitize_error(e)}

    async def list_assets(self, config: dict, credentials: dict) -> list:
        try:
            from cassandra.cluster import Cluster
            from cassandra.auth import PlainTextAuthProvider
            auth = None
            if credentials.get("username"):
                auth = PlainTextAuthProvider(
                    username=credentials.get("username"),
                    password=credentials.get("password"),
                )
            cluster = Cluster(
                contact_points=[config.get("host")],
                port=config.get("port", 9042),
                auth_provider=auth,
            )
            session = cluster.connect()
            rows = session.execute(
                "SELECT keyspace_name, table_name FROM system_schema.tables"
            )
            assets = []
            for row in rows:
                ks = row.keyspace_name
                if ks.startswith("system"):
                    continue
                assets.append({
                    "name": f"{ks}.{row.table_name}",
                    "asset_type": "table",
                    "path": f"cassandra://{config.get('host')}/{ks}/{row.table_name}",
                })
            session.shutdown()
            cluster.shutdown()
            return assets
        except Exception as e:
            logger.error("Cassandra list_assets failed: %s", e)
            return []

    async def fetch_metadata(self, config: dict, credentials: dict, asset_path: str) -> dict:
        try:
            from cassandra.cluster import Cluster
            from cassandra.auth import PlainTextAuthProvider
            auth = None
            if credentials.get("username"):
                auth = PlainTextAuthProvider(
                    username=credentials.get("username"),
                    password=credentials.get("password"),
                )
            cluster = Cluster(
                contact_points=[config.get("host")],
                port=config.get("port", 9042),
                auth_provider=auth,
            )
            session = cluster.connect()
            parts = asset_path.replace("cassandra://", "").split("/")
            ks = parts[1] if len(parts) > 1 else parts[0]
            table = parts[2] if len(parts) > 2 else ""
            cols = session.execute(
                "SELECT column_name, type FROM system_schema.columns WHERE keyspace_name=%s AND table_name=%s",
                (ks, table),
            )
            session.shutdown()
            cluster.shutdown()
            return {
                "columns": [{"name": c.column_name, "type": c.type} for c in cols],
                "encryption": "unknown",
                "exposure": "private",
            }
        except Exception as e:
            logger.error("Cassandra fetch_metadata failed: %s", e)
            return {}

    async def scan_content(self, config: dict, credentials: dict, asset_path: str) -> str:
        try:
            from cassandra.cluster import Cluster
            from cassandra.auth import PlainTextAuthProvider
            auth = None
            if credentials.get("username"):
                auth = PlainTextAuthProvider(
                    username=credentials.get("username"),
                    password=credentials.get("password"),
                )
            cluster = Cluster(
                contact_points=[config.get("host")],
                port=config.get("port", 9042),
                auth_provider=auth,
            )
            session = cluster.connect()
            parts = asset_path.replace("cassandra://", "").split("/")
            ks = parts[1] if len(parts) > 1 else parts[0]
            table = parts[2] if len(parts) > 2 else ""
            rows = session.execute(f"SELECT * FROM {ks}.{table} LIMIT 50")
            session.shutdown()
            cluster.shutdown()
            return "\n".join(str(dict(row._asdict())) for row in rows)
        except Exception as e:
            logger.error("Cassandra scan_content failed: %s", e)
            return ""


# ═══════════════════════════════════════════════════════════════════════════
# 3. DATA WAREHOUSE CONNECTORS
# ═══════════════════════════════════════════════════════════════════════════

class SnowflakeHandler(BaseConnectorHandler):
    connector_label = "Snowflake"

    async def test_connection(self, config: dict, credentials: dict) -> dict:
        try:
            import snowflake.connector
            conn = snowflake.connector.connect(
                account=config.get("account"),
                user=credentials.get("username"),
                password=credentials.get("password"),
                warehouse=config.get("warehouse"),
                database=config.get("database"),
            )
            conn.cursor().execute("SELECT 1")
            conn.close()
            return {"success": True, "message": "Connected to Snowflake successfully"}
        except Exception as e:
            return {"success": False, "message": _sanitize_error(e)}

    async def list_assets(self, config: dict, credentials: dict) -> list:
        try:
            import snowflake.connector
            conn = snowflake.connector.connect(
                account=config.get("account"),
                user=credentials.get("username"),
                password=credentials.get("password"),
                warehouse=config.get("warehouse"),
                database=config.get("database"),
            )
            cur = conn.cursor()
            cur.execute("SHOW SCHEMAS")
            schemas = [row[1] for row in cur.fetchall() if row[1] not in ("INFORMATION_SCHEMA",)]
            assets = []
            for schema in schemas:
                cur.execute(f"SHOW TABLES IN SCHEMA {schema}")
                for row in cur.fetchall():
                    assets.append({
                        "name": f"{schema}.{row[1]}",
                        "asset_type": "table",
                        "path": f"snowflake://{config.get('account')}/{config.get('database')}/{schema}.{row[1]}",
                    })
            conn.close()
            return assets
        except Exception as e:
            logger.error("Snowflake list_assets failed: %s", e)
            return []

    async def fetch_metadata(self, config: dict, credentials: dict, asset_path: str) -> dict:
        try:
            import snowflake.connector
            conn = snowflake.connector.connect(
                account=config.get("account"),
                user=credentials.get("username"),
                password=credentials.get("password"),
                warehouse=config.get("warehouse"),
                database=config.get("database"),
            )
            parts = asset_path.split("/")
            table_ref = parts[-1]
            cur = conn.cursor()
            cur.execute(f"DESCRIBE TABLE {table_ref}")
            columns = [{"name": row[0], "type": row[1]} for row in cur.fetchall()]
            cur.execute(f"SELECT COUNT(*) FROM {table_ref}")
            row_count = cur.fetchone()[0]
            conn.close()
            return {
                "row_count": row_count,
                "columns": columns,
                "encryption": "encrypted",
                "exposure": "private",
            }
        except Exception as e:
            logger.error("Snowflake fetch_metadata failed: %s", e)
            return {}

    async def scan_content(self, config: dict, credentials: dict, asset_path: str) -> str:
        try:
            import snowflake.connector
            conn = snowflake.connector.connect(
                account=config.get("account"),
                user=credentials.get("username"),
                password=credentials.get("password"),
                warehouse=config.get("warehouse"),
                database=config.get("database"),
            )
            parts = asset_path.split("/")
            table_ref = parts[-1]
            cur = conn.cursor()
            cur.execute(f"SELECT * FROM {table_ref} LIMIT 50")
            desc = [d[0] for d in cur.description]
            rows = cur.fetchall()
            conn.close()
            return "\n".join(str(dict(zip(desc, row))) for row in rows)
        except Exception as e:
            logger.error("Snowflake scan_content failed: %s", e)
            return ""


class BigQueryHandler(BaseConnectorHandler):
    connector_label = "Google BigQuery"

    async def test_connection(self, config: dict, credentials: dict) -> dict:
        try:
            from google.cloud import bigquery
            client = bigquery.Client(project=config.get("project_id"))
            list(client.list_datasets(max_results=1))
            return {"success": True, "message": "Connected to BigQuery successfully"}
        except Exception as e:
            return {"success": False, "message": _sanitize_error(e)}

    async def list_assets(self, config: dict, credentials: dict) -> list:
        try:
            from google.cloud import bigquery
            client = bigquery.Client(project=config.get("project_id"))
            assets = []
            for dataset in client.list_datasets():
                for table in client.list_tables(dataset.reference):
                    assets.append({
                        "name": f"{dataset.dataset_id}.{table.table_id}",
                        "asset_type": "table",
                        "path": f"bigquery://{config.get('project_id')}/{dataset.dataset_id}/{table.table_id}",
                    })
            return assets
        except Exception as e:
            logger.error("BigQuery list_assets failed: %s", e)
            return []

    async def fetch_metadata(self, config: dict, credentials: dict, asset_path: str) -> dict:
        try:
            from google.cloud import bigquery
            client = bigquery.Client(project=config.get("project_id"))
            parts = asset_path.replace("bigquery://", "").split("/")
            project = parts[0]
            dataset_id = parts[1] if len(parts) > 1 else ""
            table_id = parts[2] if len(parts) > 2 else ""
            table_ref = f"{project}.{dataset_id}.{table_id}"
            table = client.get_table(table_ref)
            return {
                "row_count": table.num_rows,
                "size_bytes": table.num_bytes,
                "columns": [{"name": f.name, "type": f.field_type} for f in table.schema],
                "encryption": "encrypted" if table.encryption_configuration else "not_encrypted",
                "exposure": "private",
            }
        except Exception as e:
            logger.error("BigQuery fetch_metadata failed: %s", e)
            return {}

    async def scan_content(self, config: dict, credentials: dict, asset_path: str) -> str:
        try:
            from google.cloud import bigquery
            client = bigquery.Client(project=config.get("project_id"))
            parts = asset_path.replace("bigquery://", "").split("/")
            project, dataset_id, table_id = parts[0], parts[1], parts[2]
            query = f"SELECT * FROM `{project}.{dataset_id}.{table_id}` LIMIT 50"
            rows = client.query(query).result()
            return "\n".join(str(dict(row)) for row in rows)
        except Exception as e:
            logger.error("BigQuery scan_content failed: %s", e)
            return ""


class RedshiftHandler(BaseConnectorHandler):
    connector_label = "Amazon Redshift"

    async def test_connection(self, config: dict, credentials: dict) -> dict:
        host = config.get("host", "")
        if host and _is_internal_address(host):
            return {"success": False, "message": "Connection to internal/private addresses is not allowed"}
        try:
            import asyncpg
            conn = await asyncpg.connect(
                host=host,
                port=config.get("port", 5439),
                user=credentials.get("username"),
                password=credentials.get("password"),
                database=config.get("database"),
            )
            await conn.execute("SELECT 1")
            await conn.close()
            return {"success": True, "message": "Connected to Amazon Redshift successfully"}
        except Exception as e:
            return {"success": False, "message": _sanitize_error(e)}

    async def list_assets(self, config: dict, credentials: dict) -> list:
        try:
            import asyncpg
            conn = await asyncpg.connect(
                host=config.get("host"),
                port=config.get("port", 5439),
                user=credentials.get("username"),
                password=credentials.get("password"),
                database=config.get("database"),
            )
            rows = await conn.fetch(
                "SELECT schemaname, tablename FROM pg_tables WHERE schemaname NOT IN ('pg_catalog', 'information_schema', 'pg_internal')"
            )
            await conn.close()
            assets = []
            for row in rows:
                assets.append({
                    "name": f"{row['schemaname']}.{row['tablename']}",
                    "asset_type": "table",
                    "path": f"redshift://{config.get('host')}/{config.get('database')}/{row['schemaname']}.{row['tablename']}",
                })
            return assets
        except Exception as e:
            logger.error("Redshift list_assets failed: %s", e)
            return []

    async def fetch_metadata(self, config: dict, credentials: dict, asset_path: str) -> dict:
        try:
            import asyncpg
            conn = await asyncpg.connect(
                host=config.get("host"),
                port=config.get("port", 5439),
                user=credentials.get("username"),
                password=credentials.get("password"),
                database=config.get("database"),
            )
            parts = asset_path.split("/")
            table_ref = parts[-1]
            schema, table = table_ref.split(".", 1) if "." in table_ref else ("public", table_ref)
            row_count = await conn.fetchval(f"SELECT COUNT(*) FROM {schema}.{table}")
            columns = await conn.fetch(
                "SELECT column_name, data_type FROM information_schema.columns WHERE table_schema=$1 AND table_name=$2",
                schema, table,
            )
            await conn.close()
            return {
                "row_count": row_count,
                "columns": [{"name": c["column_name"], "type": c["data_type"]} for c in columns],
                "encryption": "encrypted",
                "exposure": "private",
            }
        except Exception as e:
            logger.error("Redshift fetch_metadata failed: %s", e)
            return {}

    async def scan_content(self, config: dict, credentials: dict, asset_path: str) -> str:
        try:
            import asyncpg
            conn = await asyncpg.connect(
                host=config.get("host"),
                port=config.get("port", 5439),
                user=credentials.get("username"),
                password=credentials.get("password"),
                database=config.get("database"),
            )
            parts = asset_path.split("/")
            table_ref = parts[-1]
            rows = await conn.fetch(f"SELECT * FROM {table_ref} LIMIT 50")
            await conn.close()
            return "\n".join(str(dict(row)) for row in rows)
        except Exception as e:
            logger.error("Redshift scan_content failed: %s", e)
            return ""


class AzureSynapseHandler(_GenericDBHandler):
    connector_label = "Azure Synapse Analytics"
    _driver_module = "mssql+pymssql"
    _default_port = 1433


class DatabricksHandler(BaseConnectorHandler):
    connector_label = "Databricks"

    async def test_connection(self, config: dict, credentials: dict) -> dict:
        try:
            from databricks import sql
            conn = sql.connect(
                server_hostname=config.get("host"),
                http_path=config.get("http_path"),
                access_token=credentials.get("access_token"),
            )
            cursor = conn.cursor()
            cursor.execute("SELECT 1")
            cursor.close()
            conn.close()
            return {"success": True, "message": "Connected to Databricks successfully"}
        except Exception as e:
            return {"success": False, "message": _sanitize_error(e)}

    async def list_assets(self, config: dict, credentials: dict) -> list:
        try:
            from databricks import sql
            conn = sql.connect(
                server_hostname=config.get("host"),
                http_path=config.get("http_path"),
                access_token=credentials.get("access_token"),
            )
            cursor = conn.cursor()
            cursor.execute("SHOW DATABASES")
            databases = [row[0] for row in cursor.fetchall()]
            assets = []
            for db in databases:
                cursor.execute(f"SHOW TABLES IN {db}")
                for row in cursor.fetchall():
                    assets.append({
                        "name": f"{db}.{row[1]}",
                        "asset_type": "table",
                        "path": f"databricks://{config.get('host')}/{db}/{row[1]}",
                    })
            cursor.close()
            conn.close()
            return assets
        except Exception as e:
            logger.error("Databricks list_assets failed: %s", e)
            return []

    async def fetch_metadata(self, config: dict, credentials: dict, asset_path: str) -> dict:
        try:
            from databricks import sql
            conn = sql.connect(
                server_hostname=config.get("host"),
                http_path=config.get("http_path"),
                access_token=credentials.get("access_token"),
            )
            parts = asset_path.split("/")
            table_ref = f"{parts[-2]}.{parts[-1]}" if len(parts) >= 2 else parts[-1]
            cursor = conn.cursor()
            cursor.execute(f"DESCRIBE TABLE {table_ref}")
            columns = [{"name": row[0], "type": row[1]} for row in cursor.fetchall()]
            cursor.execute(f"SELECT COUNT(*) FROM {table_ref}")
            row_count = cursor.fetchone()[0]
            cursor.close()
            conn.close()
            return {
                "row_count": row_count,
                "columns": columns,
                "encryption": "encrypted",
                "exposure": "private",
            }
        except Exception as e:
            logger.error("Databricks fetch_metadata failed: %s", e)
            return {}

    async def scan_content(self, config: dict, credentials: dict, asset_path: str) -> str:
        try:
            from databricks import sql
            conn = sql.connect(
                server_hostname=config.get("host"),
                http_path=config.get("http_path"),
                access_token=credentials.get("access_token"),
            )
            parts = asset_path.split("/")
            table_ref = f"{parts[-2]}.{parts[-1]}" if len(parts) >= 2 else parts[-1]
            cursor = conn.cursor()
            cursor.execute(f"SELECT * FROM {table_ref} LIMIT 50")
            desc = [d[0] for d in cursor.description]
            rows = cursor.fetchall()
            cursor.close()
            conn.close()
            return "\n".join(str(dict(zip(desc, row))) for row in rows)
        except Exception as e:
            logger.error("Databricks scan_content failed: %s", e)
            return ""


class HDFSHandler(BaseConnectorHandler):
    connector_label = "Hadoop HDFS"

    async def test_connection(self, config: dict, credentials: dict) -> dict:
        try:
            import httpx
            namenode = config.get("namenode_url", "http://localhost:9870")
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"{namenode}/webhdfs/v1/?op=LISTSTATUS",
                    params={"user.name": credentials.get("username", "hdfs")},
                )
                resp.raise_for_status()
            return {"success": True, "message": "Connected to HDFS successfully"}
        except Exception as e:
            return {"success": False, "message": _sanitize_error(e)}

    async def list_assets(self, config: dict, credentials: dict) -> list:
        try:
            import httpx
            namenode = config.get("namenode_url", "http://localhost:9870")
            scan_path = config.get("scan_path", "/")
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"{namenode}/webhdfs/v1{scan_path}?op=LISTSTATUS",
                    params={"user.name": credentials.get("username", "hdfs")},
                )
                resp.raise_for_status()
                data = resp.json()
            assets = []
            for entry in data.get("FileStatuses", {}).get("FileStatus", []):
                assets.append({
                    "name": entry["pathSuffix"],
                    "asset_type": "folder" if entry["type"] == "DIRECTORY" else "file",
                    "path": f"hdfs://{scan_path}/{entry['pathSuffix']}",
                    "size_bytes": entry.get("length"),
                })
            return assets
        except Exception as e:
            logger.error("HDFS list_assets failed: %s", e)
            return []

    async def fetch_metadata(self, config: dict, credentials: dict, asset_path: str) -> dict:
        try:
            import httpx
            namenode = config.get("namenode_url", "http://localhost:9870")
            path = asset_path.replace("hdfs://", "")
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"{namenode}/webhdfs/v1{path}?op=GETFILESTATUS",
                    params={"user.name": credentials.get("username", "hdfs")},
                )
                resp.raise_for_status()
                data = resp.json()
            status = data.get("FileStatus", {})
            return {
                "size_bytes": status.get("length"),
                "owner": status.get("owner"),
                "group": status.get("group"),
                "permission": status.get("permission"),
                "encryption": "unknown",
                "exposure": "internal",
            }
        except Exception as e:
            logger.error("HDFS fetch_metadata failed: %s", e)
            return {}

    async def scan_content(self, config: dict, credentials: dict, asset_path: str) -> str:
        try:
            import httpx
            namenode = config.get("namenode_url", "http://localhost:9870")
            path = asset_path.replace("hdfs://", "")
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"{namenode}/webhdfs/v1{path}?op=OPEN",
                    params={"user.name": credentials.get("username", "hdfs"), "length": "65536"},
                    follow_redirects=True,
                )
                resp.raise_for_status()
                return resp.text[:65536]
        except Exception as e:
            logger.error("HDFS scan_content failed: %s", e)
            return ""


# ═══════════════════════════════════════════════════════════════════════════
# 4. SAAS / COLLABORATION CONNECTORS
# ═══════════════════════════════════════════════════════════════════════════

class Microsoft365Handler(BaseConnectorHandler):
    connector_label = "Microsoft 365"

    async def test_connection(self, config: dict, credentials: dict) -> dict:
        try:
            import httpx
            token = credentials.get("access_token")
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    "https://graph.microsoft.com/v1.0/organization",
                    headers={"Authorization": f"Bearer {token}"},
                )
                resp.raise_for_status()
            return {"success": True, "message": "Connected to Microsoft 365 successfully"}
        except Exception as e:
            return {"success": False, "message": _sanitize_error(e)}

    async def list_assets(self, config: dict, credentials: dict) -> list:
        try:
            import httpx
            token = credentials.get("access_token")
            assets = []
            async with httpx.AsyncClient() as client:
                # List SharePoint sites
                resp = await client.get(
                    "https://graph.microsoft.com/v1.0/sites?search=*",
                    headers={"Authorization": f"Bearer {token}"},
                )
                if resp.status_code == 200:
                    for site in resp.json().get("value", []):
                        assets.append({
                            "name": site.get("displayName", site.get("name", "")),
                            "asset_type": "saas_resource",
                            "path": f"m365://sites/{site['id']}",
                        })
                # List users' OneDrive
                resp = await client.get(
                    "https://graph.microsoft.com/v1.0/users?$select=id,displayName,mail",
                    headers={"Authorization": f"Bearer {token}"},
                )
                if resp.status_code == 200:
                    for user in resp.json().get("value", [])[:50]:
                        assets.append({
                            "name": f"OneDrive - {user.get('displayName', '')}",
                            "asset_type": "saas_resource",
                            "path": f"m365://drives/{user['id']}",
                        })
            return assets
        except Exception as e:
            logger.error("M365 list_assets failed: %s", e)
            return []

    async def fetch_metadata(self, config: dict, credentials: dict, asset_path: str) -> dict:
        return {"encryption": "encrypted", "exposure": "internal"}

    async def scan_content(self, config: dict, credentials: dict, asset_path: str) -> str:
        return ""


class MicrosoftTeamsHandler(BaseConnectorHandler):
    connector_label = "Microsoft Teams"

    async def test_connection(self, config: dict, credentials: dict) -> dict:
        try:
            import httpx
            token = credentials.get("access_token")
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    "https://graph.microsoft.com/v1.0/teams",
                    headers={"Authorization": f"Bearer {token}"},
                )
                resp.raise_for_status()
            return {"success": True, "message": "Connected to Microsoft Teams successfully"}
        except Exception as e:
            return {"success": False, "message": _sanitize_error(e)}

    async def list_assets(self, config: dict, credentials: dict) -> list:
        try:
            import httpx
            token = credentials.get("access_token")
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    "https://graph.microsoft.com/v1.0/groups?$filter=resourceProvisioningOptions/Any(x:x eq 'Team')",
                    headers={"Authorization": f"Bearer {token}"},
                )
                resp.raise_for_status()
                data = resp.json()
            assets = []
            for team in data.get("value", []):
                assets.append({
                    "name": team.get("displayName", ""),
                    "asset_type": "saas_resource",
                    "path": f"teams://{team['id']}",
                })
                # List channels
                ch_resp = await httpx.AsyncClient().__aenter__()
                try:
                    ch = await ch_resp.get(
                        f"https://graph.microsoft.com/v1.0/teams/{team['id']}/channels",
                        headers={"Authorization": f"Bearer {token}"},
                    )
                    if ch.status_code == 200:
                        for channel in ch.json().get("value", []):
                            assets.append({
                                "name": f"{team.get('displayName')}/{channel.get('displayName')}",
                                "asset_type": "saas_resource",
                                "path": f"teams://{team['id']}/channels/{channel['id']}",
                            })
                finally:
                    await ch_resp.__aexit__(None, None, None)
            return assets
        except Exception as e:
            logger.error("Teams list_assets failed: %s", e)
            return []

    async def fetch_metadata(self, config: dict, credentials: dict, asset_path: str) -> dict:
        return {"encryption": "encrypted", "exposure": "internal"}

    async def scan_content(self, config: dict, credentials: dict, asset_path: str) -> str:
        try:
            import httpx
            token = credentials.get("access_token")
            parts = asset_path.replace("teams://", "").split("/")
            team_id = parts[0]
            channel_id = parts[2] if len(parts) > 2 else None
            if channel_id:
                async with httpx.AsyncClient() as client:
                    resp = await client.get(
                        f"https://graph.microsoft.com/v1.0/teams/{team_id}/channels/{channel_id}/messages",
                        headers={"Authorization": f"Bearer {token}"},
                    )
                    resp.raise_for_status()
                    messages = resp.json().get("value", [])
                return "\n".join(m.get("body", {}).get("content", "") for m in messages[:50])
            return ""
        except Exception as e:
            logger.error("Teams scan_content failed: %s", e)
            return ""


class GmailHandler(BaseConnectorHandler):
    connector_label = "Gmail"

    async def test_connection(self, config: dict, credentials: dict) -> dict:
        try:
            from google.oauth2.credentials import Credentials
            from googleapiclient.discovery import build
            creds = Credentials(token=credentials.get("access_token"))
            service = build("gmail", "v1", credentials=creds)
            service.users().getProfile(userId="me").execute()
            return {"success": True, "message": "Connected to Gmail successfully"}
        except Exception as e:
            return {"success": False, "message": _sanitize_error(e)}

    async def list_assets(self, config: dict, credentials: dict) -> list:
        try:
            from google.oauth2.credentials import Credentials
            from googleapiclient.discovery import build
            creds = Credentials(token=credentials.get("access_token"))
            service = build("gmail", "v1", credentials=creds)
            labels = service.users().labels().list(userId="me").execute()
            assets = []
            for label in labels.get("labels", []):
                assets.append({
                    "name": label["name"],
                    "asset_type": "saas_resource",
                    "path": f"gmail://{label['id']}",
                })
            return assets
        except Exception as e:
            logger.error("Gmail list_assets failed: %s", e)
            return []

    async def fetch_metadata(self, config: dict, credentials: dict, asset_path: str) -> dict:
        return {"encryption": "encrypted", "exposure": "private"}

    async def scan_content(self, config: dict, credentials: dict, asset_path: str) -> str:
        try:
            import base64
            from google.oauth2.credentials import Credentials
            from googleapiclient.discovery import build
            creds = Credentials(token=credentials.get("access_token"))
            service = build("gmail", "v1", credentials=creds)
            label_id = asset_path.replace("gmail://", "")
            messages = service.users().messages().list(
                userId="me", labelIds=[label_id], maxResults=20,
            ).execute()
            content_parts = []
            for msg_ref in messages.get("messages", []):
                msg = service.users().messages().get(
                    userId="me", id=msg_ref["id"], format="full",
                ).execute()
                payload = msg.get("payload", {})
                body_data = payload.get("body", {}).get("data", "")
                if body_data:
                    decoded = base64.urlsafe_b64decode(body_data).decode("utf-8", errors="replace")
                    content_parts.append(decoded[:4096])
                if len(content_parts) >= 10:
                    break
            return "\n".join(content_parts)
        except Exception as e:
            logger.error("Gmail scan_content failed: %s", e)
            return ""


class GoogleWorkspaceHandler(BaseConnectorHandler):
    connector_label = "Google Workspace"

    async def test_connection(self, config: dict, credentials: dict) -> dict:
        try:
            from google.oauth2.credentials import Credentials
            from googleapiclient.discovery import build
            creds = Credentials(token=credentials.get("access_token"))
            service = build("admin", "directory_v1", credentials=creds)
            service.users().list(customer="my_customer", maxResults=1).execute()
            return {"success": True, "message": "Connected to Google Workspace successfully"}
        except Exception as e:
            return {"success": False, "message": _sanitize_error(e)}

    async def list_assets(self, config: dict, credentials: dict) -> list:
        try:
            from google.oauth2.credentials import Credentials
            from googleapiclient.discovery import build
            creds = Credentials(token=credentials.get("access_token"))
            drive_service = build("drive", "v3", credentials=creds)
            results = drive_service.files().list(
                pageSize=100, fields="files(id,name,mimeType,size,shared)",
            ).execute()
            assets = []
            for f in results.get("files", []):
                assets.append({
                    "name": f["name"],
                    "asset_type": "saas_resource",
                    "path": f"gworkspace://{f['id']}",
                    "size_bytes": int(f.get("size", 0)),
                })
            return assets
        except Exception as e:
            logger.error("Google Workspace list_assets failed: %s", e)
            return []

    async def fetch_metadata(self, config: dict, credentials: dict, asset_path: str) -> dict:
        return {"encryption": "encrypted", "exposure": "internal"}

    async def scan_content(self, config: dict, credentials: dict, asset_path: str) -> str:
        return ""


class SlackHandler(BaseConnectorHandler):
    connector_label = "Slack"

    async def test_connection(self, config: dict, credentials: dict) -> dict:
        try:
            import httpx
            token = credentials.get("bot_token") or credentials.get("access_token")
            async with httpx.AsyncClient() as client:
                resp = await client.post(
                    "https://slack.com/api/auth.test",
                    headers={"Authorization": f"Bearer {token}"},
                )
                resp.raise_for_status()
                data = resp.json()
            if data.get("ok"):
                return {"success": True, "message": "Connected to Slack successfully"}
            return {"success": False, "message": f"Slack auth failed: {data.get('error', 'unknown')}"}
        except Exception as e:
            return {"success": False, "message": _sanitize_error(e)}

    async def list_assets(self, config: dict, credentials: dict) -> list:
        try:
            import httpx
            token = credentials.get("bot_token") or credentials.get("access_token")
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    "https://slack.com/api/conversations.list",
                    headers={"Authorization": f"Bearer {token}"},
                    params={"limit": 200, "types": "public_channel,private_channel"},
                )
                resp.raise_for_status()
                data = resp.json()
            assets = []
            for ch in data.get("channels", []):
                assets.append({
                    "name": ch.get("name", ""),
                    "asset_type": "saas_resource",
                    "path": f"slack://{ch['id']}",
                })
            return assets
        except Exception as e:
            logger.error("Slack list_assets failed: %s", e)
            return []

    async def fetch_metadata(self, config: dict, credentials: dict, asset_path: str) -> dict:
        return {"encryption": "encrypted", "exposure": "internal"}

    async def scan_content(self, config: dict, credentials: dict, asset_path: str) -> str:
        try:
            import httpx
            token = credentials.get("bot_token") or credentials.get("access_token")
            channel_id = asset_path.replace("slack://", "")
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    "https://slack.com/api/conversations.history",
                    headers={"Authorization": f"Bearer {token}"},
                    params={"channel": channel_id, "limit": 50},
                )
                resp.raise_for_status()
                data = resp.json()
            return "\n".join(m.get("text", "") for m in data.get("messages", []))
        except Exception as e:
            logger.error("Slack scan_content failed: %s", e)
            return ""


class JiraHandler(BaseConnectorHandler):
    connector_label = "Jira"

    async def test_connection(self, config: dict, credentials: dict) -> dict:
        try:
            import httpx
            base_url = config.get("base_url")
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"{base_url}/rest/api/3/myself",
                    auth=(credentials.get("email"), credentials.get("api_token")),
                )
                resp.raise_for_status()
            return {"success": True, "message": "Connected to Jira successfully"}
        except Exception as e:
            return {"success": False, "message": _sanitize_error(e)}

    async def list_assets(self, config: dict, credentials: dict) -> list:
        try:
            import httpx
            base_url = config.get("base_url")
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"{base_url}/rest/api/3/project",
                    auth=(credentials.get("email"), credentials.get("api_token")),
                )
                resp.raise_for_status()
                projects = resp.json()
            assets = []
            for project in projects:
                assets.append({
                    "name": project.get("name", ""),
                    "asset_type": "saas_resource",
                    "path": f"jira://{project['key']}",
                })
            return assets
        except Exception as e:
            logger.error("Jira list_assets failed: %s", e)
            return []

    async def fetch_metadata(self, config: dict, credentials: dict, asset_path: str) -> dict:
        return {"encryption": "encrypted", "exposure": "internal"}

    async def scan_content(self, config: dict, credentials: dict, asset_path: str) -> str:
        try:
            import httpx
            base_url = config.get("base_url")
            project_key = asset_path.replace("jira://", "")
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"{base_url}/rest/api/3/search",
                    auth=(credentials.get("email"), credentials.get("api_token")),
                    params={"jql": f"project={project_key}", "maxResults": 50, "fields": "summary,description,comment"},
                )
                resp.raise_for_status()
                data = resp.json()
            parts = []
            for issue in data.get("issues", []):
                fields = issue.get("fields", {})
                parts.append(f"{fields.get('summary', '')} {fields.get('description', '')}")
            return "\n".join(parts)
        except Exception as e:
            logger.error("Jira scan_content failed: %s", e)
            return ""


class ConfluenceHandler(BaseConnectorHandler):
    connector_label = "Confluence"

    async def test_connection(self, config: dict, credentials: dict) -> dict:
        try:
            import httpx
            base_url = config.get("base_url")
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"{base_url}/wiki/rest/api/space",
                    auth=(credentials.get("email"), credentials.get("api_token")),
                    params={"limit": 1},
                )
                resp.raise_for_status()
            return {"success": True, "message": "Connected to Confluence successfully"}
        except Exception as e:
            return {"success": False, "message": _sanitize_error(e)}

    async def list_assets(self, config: dict, credentials: dict) -> list:
        try:
            import httpx
            base_url = config.get("base_url")
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"{base_url}/wiki/rest/api/space",
                    auth=(credentials.get("email"), credentials.get("api_token")),
                    params={"limit": 100},
                )
                resp.raise_for_status()
                data = resp.json()
            assets = []
            for space in data.get("results", []):
                assets.append({
                    "name": space.get("name", ""),
                    "asset_type": "saas_resource",
                    "path": f"confluence://{space['key']}",
                })
            return assets
        except Exception as e:
            logger.error("Confluence list_assets failed: %s", e)
            return []

    async def fetch_metadata(self, config: dict, credentials: dict, asset_path: str) -> dict:
        return {"encryption": "encrypted", "exposure": "internal"}

    async def scan_content(self, config: dict, credentials: dict, asset_path: str) -> str:
        try:
            import httpx
            base_url = config.get("base_url")
            space_key = asset_path.replace("confluence://", "")
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"{base_url}/wiki/rest/api/content",
                    auth=(credentials.get("email"), credentials.get("api_token")),
                    params={"spaceKey": space_key, "limit": 25, "expand": "body.storage"},
                )
                resp.raise_for_status()
                data = resp.json()
            parts = []
            for page in data.get("results", []):
                body = page.get("body", {}).get("storage", {}).get("value", "")
                parts.append(f"{page.get('title', '')} {body}")
            return "\n".join(parts)[:65536]
        except Exception as e:
            logger.error("Confluence scan_content failed: %s", e)
            return ""


class SalesforceHandler(BaseConnectorHandler):
    connector_label = "Salesforce"

    async def test_connection(self, config: dict, credentials: dict) -> dict:
        try:
            import httpx
            instance_url = config.get("instance_url")
            token = credentials.get("access_token")
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"{instance_url}/services/data/v58.0/",
                    headers={"Authorization": f"Bearer {token}"},
                )
                resp.raise_for_status()
            return {"success": True, "message": "Connected to Salesforce successfully"}
        except Exception as e:
            return {"success": False, "message": _sanitize_error(e)}

    async def list_assets(self, config: dict, credentials: dict) -> list:
        try:
            import httpx
            instance_url = config.get("instance_url")
            token = credentials.get("access_token")
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"{instance_url}/services/data/v58.0/sobjects/",
                    headers={"Authorization": f"Bearer {token}"},
                )
                resp.raise_for_status()
                data = resp.json()
            assets = []
            for obj in data.get("sobjects", []):
                if obj.get("queryable"):
                    assets.append({
                        "name": obj["name"],
                        "asset_type": "table",
                        "path": f"salesforce://{obj['name']}",
                    })
            return assets
        except Exception as e:
            logger.error("Salesforce list_assets failed: %s", e)
            return []

    async def fetch_metadata(self, config: dict, credentials: dict, asset_path: str) -> dict:
        try:
            import httpx
            instance_url = config.get("instance_url")
            token = credentials.get("access_token")
            obj_name = asset_path.replace("salesforce://", "")
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"{instance_url}/services/data/v58.0/sobjects/{obj_name}/describe/",
                    headers={"Authorization": f"Bearer {token}"},
                )
                resp.raise_for_status()
                data = resp.json()
            return {
                "columns": [{"name": f["name"], "type": f["type"]} for f in data.get("fields", [])],
                "encryption": "encrypted",
                "exposure": "private",
            }
        except Exception as e:
            logger.error("Salesforce fetch_metadata failed: %s", e)
            return {}

    async def scan_content(self, config: dict, credentials: dict, asset_path: str) -> str:
        try:
            import httpx
            instance_url = config.get("instance_url")
            token = credentials.get("access_token")
            obj_name = asset_path.replace("salesforce://", "")
            async with httpx.AsyncClient() as client:
                # Get first few fields to query
                desc_resp = await client.get(
                    f"{instance_url}/services/data/v58.0/sobjects/{obj_name}/describe/",
                    headers={"Authorization": f"Bearer {token}"},
                )
                desc_resp.raise_for_status()
                fields = [f["name"] for f in desc_resp.json().get("fields", [])[:20]]
                field_list = ",".join(fields)
                resp = await client.get(
                    f"{instance_url}/services/data/v58.0/query/",
                    headers={"Authorization": f"Bearer {token}"},
                    params={"q": f"SELECT {field_list} FROM {obj_name} LIMIT 50"},
                )
                resp.raise_for_status()
                data = resp.json()
            return "\n".join(str(rec) for rec in data.get("records", []))
        except Exception as e:
            logger.error("Salesforce scan_content failed: %s", e)
            return ""


# ═══════════════════════════════════════════════════════════════════════════
# 5. ON-PREM STORAGE CONNECTORS
# ═══════════════════════════════════════════════════════════════════════════

class SMBHandler(BaseConnectorHandler):
    connector_label = "Windows File Server (SMB)"

    async def test_connection(self, config: dict, credentials: dict) -> dict:
        try:
            import smbclient
            smbclient.register_session(
                config.get("server"),
                username=credentials.get("username"),
                password=credentials.get("password"),
            )
            smbclient.listdir(f"\\\\{config.get('server')}\\{config.get('share', 'C$')}")
            return {"success": True, "message": "Connected to SMB share successfully"}
        except Exception as e:
            return {"success": False, "message": _sanitize_error(e)}

    async def list_assets(self, config: dict, credentials: dict) -> list:
        try:
            import smbclient
            smbclient.register_session(
                config.get("server"),
                username=credentials.get("username"),
                password=credentials.get("password"),
            )
            share = config.get("share", "")
            base_path = f"\\\\{config.get('server')}\\{share}"
            entries = smbclient.listdir(base_path)
            assets = []
            for entry in entries:
                full_path = f"{base_path}\\{entry}"
                try:
                    stat = smbclient.stat(full_path)
                    is_dir = stat.st_file_attributes & 0x10  # FILE_ATTRIBUTE_DIRECTORY
                    assets.append({
                        "name": entry,
                        "asset_type": "folder" if is_dir else "file",
                        "path": f"smb://{config.get('server')}/{share}/{entry}",
                        "size_bytes": stat.st_size,
                    })
                except Exception:
                    assets.append({
                        "name": entry,
                        "asset_type": "file",
                        "path": f"smb://{config.get('server')}/{share}/{entry}",
                    })
            return assets
        except Exception as e:
            logger.error("SMB list_assets failed: %s", e)
            return []

    async def fetch_metadata(self, config: dict, credentials: dict, asset_path: str) -> dict:
        try:
            import smbclient
            smbclient.register_session(
                config.get("server"),
                username=credentials.get("username"),
                password=credentials.get("password"),
            )
            unc_path = asset_path.replace("smb://", "\\\\").replace("/", "\\")
            stat = smbclient.stat(unc_path)
            return {
                "size_bytes": stat.st_size,
                "last_modified": str(stat.st_mtime),
                "encryption": "unknown",
                "exposure": "internal",
            }
        except Exception as e:
            logger.error("SMB fetch_metadata failed: %s", e)
            return {}

    async def scan_content(self, config: dict, credentials: dict, asset_path: str) -> str:
        try:
            import smbclient
            smbclient.register_session(
                config.get("server"),
                username=credentials.get("username"),
                password=credentials.get("password"),
            )
            unc_path = asset_path.replace("smb://", "\\\\").replace("/", "\\")
            with smbclient.open_file(unc_path, mode="rb") as f:
                data = f.read(65536)
            return data.decode("utf-8", errors="replace")
        except Exception as e:
            logger.error("SMB scan_content failed: %s", e)
            return ""


class NFSHandler(BaseConnectorHandler):
    connector_label = "NFS File Share"

    async def test_connection(self, config: dict, credentials: dict) -> dict:
        try:
            import os
            mount_path = config.get("mount_path", "")
            if not mount_path or not os.path.isdir(mount_path):
                return {"success": False, "message": "NFS mount path not found. Ensure NFS share is mounted."}
            os.listdir(mount_path)
            return {"success": True, "message": "Connected to NFS share successfully"}
        except Exception as e:
            return {"success": False, "message": _sanitize_error(e)}

    async def list_assets(self, config: dict, credentials: dict) -> list:
        try:
            import os
            mount_path = config.get("mount_path", "")
            assets = []
            for entry in os.listdir(mount_path):
                full_path = os.path.join(mount_path, entry)
                assets.append({
                    "name": entry,
                    "asset_type": "folder" if os.path.isdir(full_path) else "file",
                    "path": f"nfs://{full_path}",
                    "size_bytes": os.path.getsize(full_path) if os.path.isfile(full_path) else None,
                })
            return assets
        except Exception as e:
            logger.error("NFS list_assets failed: %s", e)
            return []

    async def fetch_metadata(self, config: dict, credentials: dict, asset_path: str) -> dict:
        try:
            import os
            path = asset_path.replace("nfs://", "")
            stat = os.stat(path)
            return {
                "size_bytes": stat.st_size,
                "last_modified": str(stat.st_mtime),
                "owner_uid": stat.st_uid,
                "group_gid": stat.st_gid,
                "permissions": oct(stat.st_mode),
                "encryption": "unknown",
                "exposure": "internal",
            }
        except Exception as e:
            logger.error("NFS fetch_metadata failed: %s", e)
            return {}

    async def scan_content(self, config: dict, credentials: dict, asset_path: str) -> str:
        try:
            path = asset_path.replace("nfs://", "")
            with open(path, "rb") as f:
                data = f.read(65536)
            return data.decode("utf-8", errors="replace")
        except Exception as e:
            logger.error("NFS scan_content failed: %s", e)
            return ""


class LocalFSHandler(BaseConnectorHandler):
    connector_label = "Local File System"

    async def test_connection(self, config: dict, credentials: dict) -> dict:
        try:
            import os
            path = config.get("base_path", "")
            if not path or not os.path.isdir(path):
                return {"success": False, "message": "Path not found or not accessible."}
            os.listdir(path)
            return {"success": True, "message": "Connected to local file system successfully"}
        except Exception as e:
            return {"success": False, "message": _sanitize_error(e)}

    async def list_assets(self, config: dict, credentials: dict) -> list:
        try:
            import os
            base_path = config.get("base_path", "")
            assets = []
            for entry in os.listdir(base_path):
                full_path = os.path.join(base_path, entry)
                assets.append({
                    "name": entry,
                    "asset_type": "folder" if os.path.isdir(full_path) else "file",
                    "path": f"file://{full_path}",
                    "size_bytes": os.path.getsize(full_path) if os.path.isfile(full_path) else None,
                })
            return assets
        except Exception as e:
            logger.error("LocalFS list_assets failed: %s", e)
            return []

    async def fetch_metadata(self, config: dict, credentials: dict, asset_path: str) -> dict:
        try:
            import os
            path = asset_path.replace("file://", "")
            stat = os.stat(path)
            return {
                "size_bytes": stat.st_size,
                "last_modified": str(stat.st_mtime),
                "encryption": "unknown",
                "exposure": "private",
            }
        except Exception as e:
            logger.error("LocalFS fetch_metadata failed: %s", e)
            return {}

    async def scan_content(self, config: dict, credentials: dict, asset_path: str) -> str:
        try:
            path = asset_path.replace("file://", "")
            with open(path, "rb") as f:
                data = f.read(65536)
            return data.decode("utf-8", errors="replace")
        except Exception as e:
            logger.error("LocalFS scan_content failed: %s", e)
            return ""


class OnPremSharePointHandler(BaseConnectorHandler):
    connector_label = "On-Prem SharePoint"

    async def test_connection(self, config: dict, credentials: dict) -> dict:
        try:
            import httpx
            site_url = config.get("site_url")
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"{site_url}/_api/web",
                    auth=(credentials.get("username"), credentials.get("password")),
                    headers={"Accept": "application/json;odata=verbose"},
                )
                resp.raise_for_status()
            return {"success": True, "message": "Connected to on-prem SharePoint successfully"}
        except Exception as e:
            return {"success": False, "message": _sanitize_error(e)}

    async def list_assets(self, config: dict, credentials: dict) -> list:
        try:
            import httpx
            site_url = config.get("site_url")
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"{site_url}/_api/web/lists",
                    auth=(credentials.get("username"), credentials.get("password")),
                    headers={"Accept": "application/json;odata=verbose"},
                )
                resp.raise_for_status()
                data = resp.json()
            assets = []
            for lst in data.get("d", {}).get("results", []):
                assets.append({
                    "name": lst.get("Title", ""),
                    "asset_type": "saas_resource",
                    "path": f"sp-onprem://{lst.get('Id', '')}",
                })
            return assets
        except Exception as e:
            logger.error("On-prem SharePoint list_assets failed: %s", e)
            return []

    async def fetch_metadata(self, config: dict, credentials: dict, asset_path: str) -> dict:
        return {"encryption": "unknown", "exposure": "internal"}

    async def scan_content(self, config: dict, credentials: dict, asset_path: str) -> str:
        try:
            import httpx
            site_url = config.get("site_url")
            list_id = asset_path.replace("sp-onprem://", "")
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"{site_url}/_api/web/lists(guid'{list_id}')/items",
                    auth=(credentials.get("username"), credentials.get("password")),
                    headers={"Accept": "application/json;odata=verbose"},
                    params={"$top": 50},
                )
                resp.raise_for_status()
                data = resp.json()
            items = data.get("d", {}).get("results", [])
            return "\n".join(str(item) for item in items)[:65536]
        except Exception as e:
            logger.error("On-prem SharePoint scan_content failed: %s", e)
            return ""


# ═══════════════════════════════════════════════════════════════════════════
# 6. CLOUD INFRASTRUCTURE CONNECTORS
# ═══════════════════════════════════════════════════════════════════════════

class AWSCloudHandler(BaseConnectorHandler):
    connector_label = "AWS Cloud Infrastructure"

    async def test_connection(self, config: dict, credentials: dict) -> dict:
        try:
            import boto3
            session = boto3.Session(
                aws_access_key_id=credentials.get("access_key"),
                aws_secret_access_key=credentials.get("secret_key"),
                region_name=config.get("region", "us-east-1"),
            )
            sts = session.client("sts")
            sts.get_caller_identity()
            return {"success": True, "message": "Connected to AWS Cloud successfully"}
        except Exception as e:
            return {"success": False, "message": _sanitize_error(e)}

    async def list_assets(self, config: dict, credentials: dict) -> list:
        """Discover all data stores across AWS account: S3, RDS, DynamoDB, Redshift, EBS."""
        try:
            import boto3
            session = boto3.Session(
                aws_access_key_id=credentials.get("access_key"),
                aws_secret_access_key=credentials.get("secret_key"),
                region_name=config.get("region", "us-east-1"),
            )
            assets = []
            # S3 buckets
            s3 = session.client("s3")
            for bucket in s3.list_buckets().get("Buckets", []):
                assets.append({
                    "name": bucket["Name"],
                    "asset_type": "bucket",
                    "path": f"aws://s3/{bucket['Name']}",
                })
            # RDS instances
            rds = session.client("rds")
            for db in rds.describe_db_instances().get("DBInstances", []):
                assets.append({
                    "name": db["DBInstanceIdentifier"],
                    "asset_type": "database",
                    "path": f"aws://rds/{db['DBInstanceIdentifier']}",
                })
            # DynamoDB tables
            dynamo = session.client("dynamodb")
            for table_name in dynamo.list_tables().get("TableNames", []):
                assets.append({
                    "name": table_name,
                    "asset_type": "table",
                    "path": f"aws://dynamodb/{table_name}",
                })
            # Redshift clusters
            try:
                rs = session.client("redshift")
                for cluster in rs.describe_clusters().get("Clusters", []):
                    assets.append({
                        "name": cluster["ClusterIdentifier"],
                        "asset_type": "database",
                        "path": f"aws://redshift/{cluster['ClusterIdentifier']}",
                    })
            except Exception:
                pass
            # EBS snapshots (owned by self)
            ec2 = session.client("ec2")
            identity = session.client("sts").get_caller_identity()
            account_id = identity["Account"]
            for snap in ec2.describe_snapshots(OwnerIds=[account_id]).get("Snapshots", [])[:100]:
                assets.append({
                    "name": snap.get("Description", snap["SnapshotId"]),
                    "asset_type": "datalake_object",
                    "path": f"aws://ebs-snapshot/{snap['SnapshotId']}",
                    "size_bytes": snap.get("VolumeSize", 0) * 1073741824,
                })
            return assets
        except Exception as e:
            logger.error("AWS Cloud list_assets failed: %s", e)
            return []

    async def fetch_metadata(self, config: dict, credentials: dict, asset_path: str) -> dict:
        return {"encryption": "unknown", "exposure": "private"}

    async def scan_content(self, config: dict, credentials: dict, asset_path: str) -> str:
        return ""


class AzureSubscriptionHandler(BaseConnectorHandler):
    connector_label = "Azure Subscription"

    async def test_connection(self, config: dict, credentials: dict) -> dict:
        try:
            import httpx
            token = credentials.get("access_token")
            subscription_id = config.get("subscription_id")
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"https://management.azure.com/subscriptions/{subscription_id}?api-version=2022-12-01",
                    headers={"Authorization": f"Bearer {token}"},
                )
                resp.raise_for_status()
            return {"success": True, "message": "Connected to Azure Subscription successfully"}
        except Exception as e:
            return {"success": False, "message": _sanitize_error(e)}

    async def list_assets(self, config: dict, credentials: dict) -> list:
        """Discover storage accounts, SQL databases, Cosmos DB, Synapse, snapshots."""
        try:
            import httpx
            token = credentials.get("access_token")
            sub_id = config.get("subscription_id")
            base = f"https://management.azure.com/subscriptions/{sub_id}"
            assets = []
            async with httpx.AsyncClient() as client:
                # Storage accounts
                resp = await client.get(
                    f"{base}/providers/Microsoft.Storage/storageAccounts?api-version=2023-01-01",
                    headers={"Authorization": f"Bearer {token}"},
                )
                if resp.status_code == 200:
                    for sa in resp.json().get("value", []):
                        assets.append({
                            "name": sa["name"],
                            "asset_type": "container",
                            "path": f"azure://storage/{sa['name']}",
                        })
                # SQL servers
                resp = await client.get(
                    f"{base}/providers/Microsoft.Sql/servers?api-version=2023-05-01-preview",
                    headers={"Authorization": f"Bearer {token}"},
                )
                if resp.status_code == 200:
                    for server in resp.json().get("value", []):
                        assets.append({
                            "name": server["name"],
                            "asset_type": "database",
                            "path": f"azure://sql/{server['name']}",
                        })
                # Cosmos DB accounts
                resp = await client.get(
                    f"{base}/providers/Microsoft.DocumentDB/databaseAccounts?api-version=2023-11-15",
                    headers={"Authorization": f"Bearer {token}"},
                )
                if resp.status_code == 200:
                    for acct in resp.json().get("value", []):
                        assets.append({
                            "name": acct["name"],
                            "asset_type": "database",
                            "path": f"azure://cosmosdb/{acct['name']}",
                        })
                # VM snapshots
                resp = await client.get(
                    f"{base}/providers/Microsoft.Compute/snapshots?api-version=2023-10-02",
                    headers={"Authorization": f"Bearer {token}"},
                )
                if resp.status_code == 200:
                    for snap in resp.json().get("value", []):
                        assets.append({
                            "name": snap["name"],
                            "asset_type": "datalake_object",
                            "path": f"azure://snapshot/{snap['name']}",
                            "size_bytes": snap.get("properties", {}).get("diskSizeBytes"),
                        })
            return assets
        except Exception as e:
            logger.error("Azure Subscription list_assets failed: %s", e)
            return []

    async def fetch_metadata(self, config: dict, credentials: dict, asset_path: str) -> dict:
        return {"encryption": "encrypted", "exposure": "private"}

    async def scan_content(self, config: dict, credentials: dict, asset_path: str) -> str:
        return ""


class GCPCloudHandler(BaseConnectorHandler):
    connector_label = "Google Cloud Platform"

    async def test_connection(self, config: dict, credentials: dict) -> dict:
        try:
            import httpx
            token = credentials.get("access_token")
            project_id = config.get("project_id")
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"https://cloudresourcemanager.googleapis.com/v1/projects/{project_id}",
                    headers={"Authorization": f"Bearer {token}"},
                )
                resp.raise_for_status()
            return {"success": True, "message": "Connected to GCP successfully"}
        except Exception as e:
            return {"success": False, "message": _sanitize_error(e)}

    async def list_assets(self, config: dict, credentials: dict) -> list:
        """Discover Cloud Storage, Cloud SQL, BigQuery, Spanner, Firestore."""
        try:
            import httpx
            token = credentials.get("access_token")
            project_id = config.get("project_id")
            assets = []
            async with httpx.AsyncClient() as client:
                # Cloud Storage buckets
                resp = await client.get(
                    f"https://storage.googleapis.com/storage/v1/b?project={project_id}",
                    headers={"Authorization": f"Bearer {token}"},
                )
                if resp.status_code == 200:
                    for bucket in resp.json().get("items", []):
                        assets.append({
                            "name": bucket["name"],
                            "asset_type": "bucket",
                            "path": f"gcp://storage/{bucket['name']}",
                        })
                # Cloud SQL instances
                resp = await client.get(
                    f"https://sqladmin.googleapis.com/v1/projects/{project_id}/instances",
                    headers={"Authorization": f"Bearer {token}"},
                )
                if resp.status_code == 200:
                    for inst in resp.json().get("items", []):
                        assets.append({
                            "name": inst["name"],
                            "asset_type": "database",
                            "path": f"gcp://cloudsql/{inst['name']}",
                        })
                # BigQuery datasets
                resp = await client.get(
                    f"https://bigquery.googleapis.com/bigquery/v2/projects/{project_id}/datasets",
                    headers={"Authorization": f"Bearer {token}"},
                )
                if resp.status_code == 200:
                    for ds in resp.json().get("datasets", []):
                        ds_id = ds["datasetReference"]["datasetId"]
                        assets.append({
                            "name": ds_id,
                            "asset_type": "schema",
                            "path": f"gcp://bigquery/{project_id}/{ds_id}",
                        })
            return assets
        except Exception as e:
            logger.error("GCP Cloud list_assets failed: %s", e)
            return []

    async def fetch_metadata(self, config: dict, credentials: dict, asset_path: str) -> dict:
        return {"encryption": "encrypted", "exposure": "private"}

    async def scan_content(self, config: dict, credentials: dict, asset_path: str) -> str:
        return ""


# ═══════════════════════════════════════════════════════════════════════════
# 7. IDENTITY & ACCESS MANAGEMENT CONNECTORS
# ═══════════════════════════════════════════════════════════════════════════

class AzureADHandler(BaseConnectorHandler):
    connector_label = "Azure Active Directory"

    async def test_connection(self, config: dict, credentials: dict) -> dict:
        try:
            import httpx
            token = credentials.get("access_token")
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    "https://graph.microsoft.com/v1.0/organization",
                    headers={"Authorization": f"Bearer {token}"},
                )
                resp.raise_for_status()
            return {"success": True, "message": "Connected to Azure AD successfully"}
        except Exception as e:
            return {"success": False, "message": _sanitize_error(e)}

    async def list_assets(self, config: dict, credentials: dict) -> list:
        """List users, groups, service principals, and app registrations."""
        try:
            import httpx
            token = credentials.get("access_token")
            assets = []
            async with httpx.AsyncClient() as client:
                # Users
                resp = await client.get(
                    "https://graph.microsoft.com/v1.0/users?$select=id,displayName,mail,accountEnabled&$top=100",
                    headers={"Authorization": f"Bearer {token}"},
                )
                if resp.status_code == 200:
                    for user in resp.json().get("value", []):
                        assets.append({
                            "name": user.get("displayName", user.get("mail", "")),
                            "asset_type": "saas_resource",
                            "path": f"azuread://users/{user['id']}",
                            "metadata": {"type": "user", "enabled": user.get("accountEnabled")},
                        })
                # Groups
                resp = await client.get(
                    "https://graph.microsoft.com/v1.0/groups?$select=id,displayName&$top=100",
                    headers={"Authorization": f"Bearer {token}"},
                )
                if resp.status_code == 200:
                    for group in resp.json().get("value", []):
                        assets.append({
                            "name": group.get("displayName", ""),
                            "asset_type": "saas_resource",
                            "path": f"azuread://groups/{group['id']}",
                            "metadata": {"type": "group"},
                        })
                # Service principals
                resp = await client.get(
                    "https://graph.microsoft.com/v1.0/servicePrincipals?$select=id,displayName&$top=100",
                    headers={"Authorization": f"Bearer {token}"},
                )
                if resp.status_code == 200:
                    for sp in resp.json().get("value", []):
                        assets.append({
                            "name": sp.get("displayName", ""),
                            "asset_type": "saas_resource",
                            "path": f"azuread://servicePrincipals/{sp['id']}",
                            "metadata": {"type": "service_principal"},
                        })
            return assets
        except Exception as e:
            logger.error("Azure AD list_assets failed: %s", e)
            return []

    async def fetch_metadata(self, config: dict, credentials: dict, asset_path: str) -> dict:
        return {"encryption": "encrypted", "exposure": "internal"}

    async def scan_content(self, config: dict, credentials: dict, asset_path: str) -> str:
        return ""


class AWSIAMHandler(BaseConnectorHandler):
    connector_label = "AWS IAM"

    async def test_connection(self, config: dict, credentials: dict) -> dict:
        try:
            import boto3
            session = boto3.Session(
                aws_access_key_id=credentials.get("access_key"),
                aws_secret_access_key=credentials.get("secret_key"),
                region_name=config.get("region", "us-east-1"),
            )
            iam = session.client("iam")
            iam.get_account_summary()
            return {"success": True, "message": "Connected to AWS IAM successfully"}
        except Exception as e:
            return {"success": False, "message": _sanitize_error(e)}

    async def list_assets(self, config: dict, credentials: dict) -> list:
        """List IAM users, roles, groups, and policies."""
        try:
            import boto3
            session = boto3.Session(
                aws_access_key_id=credentials.get("access_key"),
                aws_secret_access_key=credentials.get("secret_key"),
                region_name=config.get("region", "us-east-1"),
            )
            iam = session.client("iam")
            assets = []
            # Users
            for user in iam.list_users().get("Users", []):
                assets.append({
                    "name": user["UserName"],
                    "asset_type": "saas_resource",
                    "path": f"aws-iam://users/{user['UserName']}",
                    "metadata": {"type": "user", "arn": user["Arn"]},
                })
            # Roles
            for role in iam.list_roles().get("Roles", []):
                assets.append({
                    "name": role["RoleName"],
                    "asset_type": "saas_resource",
                    "path": f"aws-iam://roles/{role['RoleName']}",
                    "metadata": {"type": "role", "arn": role["Arn"]},
                })
            # Groups
            for group in iam.list_groups().get("Groups", []):
                assets.append({
                    "name": group["GroupName"],
                    "asset_type": "saas_resource",
                    "path": f"aws-iam://groups/{group['GroupName']}",
                    "metadata": {"type": "group", "arn": group["Arn"]},
                })
            return assets
        except Exception as e:
            logger.error("AWS IAM list_assets failed: %s", e)
            return []

    async def fetch_metadata(self, config: dict, credentials: dict, asset_path: str) -> dict:
        return {"encryption": "encrypted", "exposure": "private"}

    async def scan_content(self, config: dict, credentials: dict, asset_path: str) -> str:
        return ""


class GoogleIAMHandler(BaseConnectorHandler):
    connector_label = "Google IAM"

    async def test_connection(self, config: dict, credentials: dict) -> dict:
        try:
            import httpx
            token = credentials.get("access_token")
            project_id = config.get("project_id")
            async with httpx.AsyncClient() as client:
                resp = await client.post(
                    f"https://cloudresourcemanager.googleapis.com/v1/projects/{project_id}:getIamPolicy",
                    headers={"Authorization": f"Bearer {token}"},
                    json={},
                )
                resp.raise_for_status()
            return {"success": True, "message": "Connected to Google IAM successfully"}
        except Exception as e:
            return {"success": False, "message": _sanitize_error(e)}

    async def list_assets(self, config: dict, credentials: dict) -> list:
        try:
            import httpx
            token = credentials.get("access_token")
            project_id = config.get("project_id")
            assets = []
            async with httpx.AsyncClient() as client:
                resp = await client.post(
                    f"https://cloudresourcemanager.googleapis.com/v1/projects/{project_id}:getIamPolicy",
                    headers={"Authorization": f"Bearer {token}"},
                    json={},
                )
                if resp.status_code == 200:
                    policy = resp.json()
                    for binding in policy.get("bindings", []):
                        for member in binding.get("members", []):
                            assets.append({
                                "name": member,
                                "asset_type": "saas_resource",
                                "path": f"gcp-iam://{project_id}/{member}",
                                "metadata": {"role": binding.get("role")},
                            })
                # Service accounts
                resp = await client.get(
                    f"https://iam.googleapis.com/v1/projects/{project_id}/serviceAccounts",
                    headers={"Authorization": f"Bearer {token}"},
                )
                if resp.status_code == 200:
                    for sa in resp.json().get("accounts", []):
                        assets.append({
                            "name": sa.get("displayName", sa.get("email", "")),
                            "asset_type": "saas_resource",
                            "path": f"gcp-iam://serviceAccounts/{sa['uniqueId']}",
                            "metadata": {"type": "service_account", "email": sa.get("email")},
                        })
            return assets
        except Exception as e:
            logger.error("Google IAM list_assets failed: %s", e)
            return []

    async def fetch_metadata(self, config: dict, credentials: dict, asset_path: str) -> dict:
        return {"encryption": "encrypted", "exposure": "private"}

    async def scan_content(self, config: dict, credentials: dict, asset_path: str) -> str:
        return ""


class LDAPHandler(BaseConnectorHandler):
    connector_label = "LDAP"

    async def test_connection(self, config: dict, credentials: dict) -> dict:
        try:
            import ldap3
            server = ldap3.Server(config.get("server"), port=config.get("port", 389), get_info=ldap3.ALL)
            conn = ldap3.Connection(
                server,
                user=credentials.get("bind_dn"),
                password=credentials.get("password"),
                auto_bind=True,
            )
            conn.unbind()
            return {"success": True, "message": "Connected to LDAP successfully"}
        except Exception as e:
            return {"success": False, "message": _sanitize_error(e)}

    async def list_assets(self, config: dict, credentials: dict) -> list:
        try:
            import ldap3
            server = ldap3.Server(config.get("server"), port=config.get("port", 389))
            conn = ldap3.Connection(
                server,
                user=credentials.get("bind_dn"),
                password=credentials.get("password"),
                auto_bind=True,
            )
            base_dn = config.get("base_dn", "")
            conn.search(base_dn, "(objectClass=person)", attributes=["cn", "mail", "sAMAccountName"])
            assets = []
            for entry in conn.entries:
                assets.append({
                    "name": str(entry.cn) if hasattr(entry, "cn") else str(entry.entry_dn),
                    "asset_type": "saas_resource",
                    "path": f"ldap://{entry.entry_dn}",
                    "metadata": {"type": "user"},
                })
            conn.unbind()
            return assets
        except Exception as e:
            logger.error("LDAP list_assets failed: %s", e)
            return []

    async def fetch_metadata(self, config: dict, credentials: dict, asset_path: str) -> dict:
        return {"encryption": "unknown", "exposure": "internal"}

    async def scan_content(self, config: dict, credentials: dict, asset_path: str) -> str:
        return ""


class MicrosoftADHandler(LDAPHandler):
    """Microsoft Active Directory — extends LDAP with AD-specific defaults."""
    connector_label = "Microsoft Active Directory"

    async def test_connection(self, config: dict, credentials: dict) -> dict:
        if not config.get("port"):
            config["port"] = 389
        return await super().test_connection(config, credentials)


class OktaHandler(BaseConnectorHandler):
    connector_label = "Okta"

    async def test_connection(self, config: dict, credentials: dict) -> dict:
        try:
            import httpx
            domain = config.get("domain")  # e.g. "company.okta.com"
            token = credentials.get("api_token")
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"https://{domain}/api/v1/org",
                    headers={"Authorization": f"SSWS {token}"},
                )
                resp.raise_for_status()
            return {"success": True, "message": "Connected to Okta successfully"}
        except Exception as e:
            return {"success": False, "message": _sanitize_error(e)}

    async def list_assets(self, config: dict, credentials: dict) -> list:
        try:
            import httpx
            domain = config.get("domain")
            token = credentials.get("api_token")
            assets = []
            async with httpx.AsyncClient() as client:
                # Users
                resp = await client.get(
                    f"https://{domain}/api/v1/users?limit=200",
                    headers={"Authorization": f"SSWS {token}"},
                )
                if resp.status_code == 200:
                    for user in resp.json():
                        profile = user.get("profile", {})
                        assets.append({
                            "name": f"{profile.get('firstName', '')} {profile.get('lastName', '')}",
                            "asset_type": "saas_resource",
                            "path": f"okta://users/{user['id']}",
                            "metadata": {"type": "user", "status": user.get("status")},
                        })
                # Groups
                resp = await client.get(
                    f"https://{domain}/api/v1/groups?limit=200",
                    headers={"Authorization": f"SSWS {token}"},
                )
                if resp.status_code == 200:
                    for group in resp.json():
                        profile = group.get("profile", {})
                        assets.append({
                            "name": profile.get("name", ""),
                            "asset_type": "saas_resource",
                            "path": f"okta://groups/{group['id']}",
                            "metadata": {"type": "group"},
                        })
                # Applications
                resp = await client.get(
                    f"https://{domain}/api/v1/apps?limit=200",
                    headers={"Authorization": f"SSWS {token}"},
                )
                if resp.status_code == 200:
                    for app in resp.json():
                        assets.append({
                            "name": app.get("label", ""),
                            "asset_type": "saas_resource",
                            "path": f"okta://apps/{app['id']}",
                            "metadata": {"type": "application", "status": app.get("status")},
                        })
            return assets
        except Exception as e:
            logger.error("Okta list_assets failed: %s", e)
            return []

    async def fetch_metadata(self, config: dict, credentials: dict, asset_path: str) -> dict:
        return {"encryption": "encrypted", "exposure": "internal"}

    async def scan_content(self, config: dict, credentials: dict, asset_path: str) -> str:
        return ""


class PingIdentityHandler(BaseConnectorHandler):
    connector_label = "Ping Identity"

    async def test_connection(self, config: dict, credentials: dict) -> dict:
        try:
            import httpx
            base_url = config.get("base_url")
            token = credentials.get("access_token")
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"{base_url}/environments",
                    headers={"Authorization": f"Bearer {token}"},
                )
                resp.raise_for_status()
            return {"success": True, "message": "Connected to Ping Identity successfully"}
        except Exception as e:
            return {"success": False, "message": _sanitize_error(e)}

    async def list_assets(self, config: dict, credentials: dict) -> list:
        try:
            import httpx
            base_url = config.get("base_url")
            env_id = config.get("environment_id")
            token = credentials.get("access_token")
            assets = []
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"{base_url}/environments/{env_id}/users",
                    headers={"Authorization": f"Bearer {token}"},
                )
                if resp.status_code == 200:
                    for user in resp.json().get("_embedded", {}).get("users", []):
                        assets.append({
                            "name": user.get("username", user.get("email", "")),
                            "asset_type": "saas_resource",
                            "path": f"ping://{env_id}/users/{user['id']}",
                            "metadata": {"type": "user"},
                        })
            return assets
        except Exception as e:
            logger.error("Ping Identity list_assets failed: %s", e)
            return []

    async def fetch_metadata(self, config: dict, credentials: dict, asset_path: str) -> dict:
        return {"encryption": "encrypted", "exposure": "internal"}

    async def scan_content(self, config: dict, credentials: dict, asset_path: str) -> str:
        return ""


# ═══════════════════════════════════════════════════════════════════════════
# 8. DEVOPS & CODE REPOSITORY CONNECTORS
# ═══════════════════════════════════════════════════════════════════════════

class GitHubHandler(BaseConnectorHandler):
    connector_label = "GitHub"

    async def test_connection(self, config: dict, credentials: dict) -> dict:
        try:
            import httpx
            token = credentials.get("access_token")
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    "https://api.github.com/user",
                    headers={"Authorization": f"Bearer {token}", "Accept": "application/vnd.github+json"},
                )
                resp.raise_for_status()
            return {"success": True, "message": "Connected to GitHub successfully"}
        except Exception as e:
            return {"success": False, "message": _sanitize_error(e)}

    async def list_assets(self, config: dict, credentials: dict) -> list:
        try:
            import httpx
            token = credentials.get("access_token")
            org = config.get("organization", "")
            assets = []
            async with httpx.AsyncClient() as client:
                url = f"https://api.github.com/orgs/{org}/repos" if org else "https://api.github.com/user/repos"
                resp = await client.get(
                    url,
                    headers={"Authorization": f"Bearer {token}", "Accept": "application/vnd.github+json"},
                    params={"per_page": 100},
                )
                resp.raise_for_status()
                for repo in resp.json():
                    assets.append({
                        "name": repo["full_name"],
                        "asset_type": "saas_resource",
                        "path": f"github://{repo['full_name']}",
                        "metadata": {
                            "visibility": repo.get("visibility"),
                            "default_branch": repo.get("default_branch"),
                        },
                    })
            return assets
        except Exception as e:
            logger.error("GitHub list_assets failed: %s", e)
            return []

    async def fetch_metadata(self, config: dict, credentials: dict, asset_path: str) -> dict:
        try:
            import httpx
            token = credentials.get("access_token")
            repo = asset_path.replace("github://", "")
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"https://api.github.com/repos/{repo}",
                    headers={"Authorization": f"Bearer {token}", "Accept": "application/vnd.github+json"},
                )
                resp.raise_for_status()
                data = resp.json()
            return {
                "visibility": data.get("visibility"),
                "size_bytes": data.get("size", 0) * 1024,
                "last_modified": data.get("pushed_at"),
                "exposure": "public" if not data.get("private") else "private",
                "default_branch": data.get("default_branch"),
            }
        except Exception as e:
            logger.error("GitHub fetch_metadata failed: %s", e)
            return {}

    async def scan_content(self, config: dict, credentials: dict, asset_path: str) -> str:
        """Scan repository for secrets — searches code for common secret patterns."""
        try:
            import httpx
            token = credentials.get("access_token")
            repo = asset_path.replace("github://", "")
            secret_patterns = [
                "password", "secret", "api_key", "apikey", "access_token",
                "private_key", "AKIA", "credentials", "auth_token",
            ]
            samples = []
            async with httpx.AsyncClient() as client:
                for pattern in secret_patterns[:5]:
                    resp = await client.get(
                        f"https://api.github.com/search/code?q={pattern}+repo:{repo}",
                        headers={"Authorization": f"Bearer {token}", "Accept": "application/vnd.github+json"},
                    )
                    if resp.status_code == 200:
                        for item in resp.json().get("items", [])[:3]:
                            # Fetch file content
                            file_resp = await client.get(
                                item["url"],
                                headers={"Authorization": f"Bearer {token}", "Accept": "application/vnd.github.raw+json"},
                            )
                            if file_resp.status_code == 200:
                                samples.append(f"--- {item['path']} ---\n{file_resp.text[:4096]}")
            return "\n".join(samples)[:65536]
        except Exception as e:
            logger.error("GitHub scan_content failed: %s", e)
            return ""


class GitLabHandler(BaseConnectorHandler):
    connector_label = "GitLab"

    async def test_connection(self, config: dict, credentials: dict) -> dict:
        try:
            import httpx
            base_url = config.get("base_url", "https://gitlab.com")
            token = credentials.get("private_token")
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"{base_url}/api/v4/user",
                    headers={"PRIVATE-TOKEN": token},
                )
                resp.raise_for_status()
            return {"success": True, "message": "Connected to GitLab successfully"}
        except Exception as e:
            return {"success": False, "message": _sanitize_error(e)}

    async def list_assets(self, config: dict, credentials: dict) -> list:
        try:
            import httpx
            base_url = config.get("base_url", "https://gitlab.com")
            token = credentials.get("private_token")
            group_id = config.get("group_id")
            assets = []
            async with httpx.AsyncClient() as client:
                url = f"{base_url}/api/v4/groups/{group_id}/projects" if group_id else f"{base_url}/api/v4/projects"
                resp = await client.get(
                    url,
                    headers={"PRIVATE-TOKEN": token},
                    params={"per_page": 100, "membership": "true"},
                )
                resp.raise_for_status()
                for project in resp.json():
                    assets.append({
                        "name": project["path_with_namespace"],
                        "asset_type": "saas_resource",
                        "path": f"gitlab://{project['id']}",
                        "metadata": {"visibility": project.get("visibility")},
                    })
            return assets
        except Exception as e:
            logger.error("GitLab list_assets failed: %s", e)
            return []

    async def fetch_metadata(self, config: dict, credentials: dict, asset_path: str) -> dict:
        try:
            import httpx
            base_url = config.get("base_url", "https://gitlab.com")
            token = credentials.get("private_token")
            project_id = asset_path.replace("gitlab://", "")
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"{base_url}/api/v4/projects/{project_id}",
                    headers={"PRIVATE-TOKEN": token},
                )
                resp.raise_for_status()
                data = resp.json()
            return {
                "visibility": data.get("visibility"),
                "last_modified": data.get("last_activity_at"),
                "exposure": "public" if data.get("visibility") == "public" else "private",
            }
        except Exception as e:
            logger.error("GitLab fetch_metadata failed: %s", e)
            return {}

    async def scan_content(self, config: dict, credentials: dict, asset_path: str) -> str:
        try:
            import httpx
            base_url = config.get("base_url", "https://gitlab.com")
            token = credentials.get("private_token")
            project_id = asset_path.replace("gitlab://", "")
            secret_patterns = ["password", "secret", "api_key", "AKIA", "private_key"]
            samples = []
            async with httpx.AsyncClient() as client:
                for pattern in secret_patterns:
                    resp = await client.get(
                        f"{base_url}/api/v4/projects/{project_id}/search",
                        headers={"PRIVATE-TOKEN": token},
                        params={"scope": "blobs", "search": pattern, "per_page": 5},
                    )
                    if resp.status_code == 200:
                        for item in resp.json()[:3]:
                            samples.append(f"--- {item.get('filename', '')} ---\n{item.get('data', '')[:4096]}")
            return "\n".join(samples)[:65536]
        except Exception as e:
            logger.error("GitLab scan_content failed: %s", e)
            return ""


class BitbucketHandler(BaseConnectorHandler):
    connector_label = "Bitbucket"

    async def test_connection(self, config: dict, credentials: dict) -> dict:
        try:
            import httpx
            base_url = config.get("base_url", "https://api.bitbucket.org/2.0")
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"{base_url}/user",
                    auth=(credentials.get("username"), credentials.get("app_password")),
                )
                resp.raise_for_status()
            return {"success": True, "message": "Connected to Bitbucket successfully"}
        except Exception as e:
            return {"success": False, "message": _sanitize_error(e)}

    async def list_assets(self, config: dict, credentials: dict) -> list:
        try:
            import httpx
            base_url = config.get("base_url", "https://api.bitbucket.org/2.0")
            workspace = config.get("workspace", "")
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"{base_url}/repositories/{workspace}",
                    auth=(credentials.get("username"), credentials.get("app_password")),
                    params={"pagelen": 100},
                )
                resp.raise_for_status()
                data = resp.json()
            assets = []
            for repo in data.get("values", []):
                assets.append({
                    "name": repo["full_name"],
                    "asset_type": "saas_resource",
                    "path": f"bitbucket://{repo['full_name']}",
                    "metadata": {"is_private": repo.get("is_private")},
                })
            return assets
        except Exception as e:
            logger.error("Bitbucket list_assets failed: %s", e)
            return []

    async def fetch_metadata(self, config: dict, credentials: dict, asset_path: str) -> dict:
        try:
            import httpx
            base_url = config.get("base_url", "https://api.bitbucket.org/2.0")
            repo = asset_path.replace("bitbucket://", "")
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"{base_url}/repositories/{repo}",
                    auth=(credentials.get("username"), credentials.get("app_password")),
                )
                resp.raise_for_status()
                data = resp.json()
            return {
                "size_bytes": data.get("size"),
                "last_modified": data.get("updated_on"),
                "exposure": "private" if data.get("is_private") else "public",
            }
        except Exception as e:
            logger.error("Bitbucket fetch_metadata failed: %s", e)
            return {}

    async def scan_content(self, config: dict, credentials: dict, asset_path: str) -> str:
        try:
            import httpx
            base_url = config.get("base_url", "https://api.bitbucket.org/2.0")
            repo = asset_path.replace("bitbucket://", "")
            secret_patterns = ["password", "secret", "api_key", "AKIA", "private_key"]
            samples = []
            async with httpx.AsyncClient() as client:
                for pattern in secret_patterns:
                    resp = await client.get(
                        f"{base_url}/repositories/{repo}/src",
                        auth=(credentials.get("username"), credentials.get("app_password")),
                        params={"q": f'name ~ "{pattern}"', "pagelen": 5},
                    )
                    if resp.status_code == 200:
                        for item in resp.json().get("values", [])[:3]:
                            file_resp = await client.get(
                                item.get("links", {}).get("self", {}).get("href", ""),
                                auth=(credentials.get("username"), credentials.get("app_password")),
                            )
                            if file_resp.status_code == 200:
                                samples.append(f"--- {item.get('path', '')} ---\n{file_resp.text[:4096]}")
            return "\n".join(samples)[:65536]
        except Exception as e:
            logger.error("Bitbucket scan_content failed: %s", e)
            return ""


class AzureDevOpsHandler(BaseConnectorHandler):
    connector_label = "Azure DevOps"

    async def test_connection(self, config: dict, credentials: dict) -> dict:
        try:
            import httpx
            org = config.get("organization")
            token = credentials.get("personal_access_token")
            import base64
            auth_header = base64.b64encode(f":{token}".encode()).decode()
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"https://dev.azure.com/{org}/_apis/projects?api-version=7.1",
                    headers={"Authorization": f"Basic {auth_header}"},
                )
                resp.raise_for_status()
            return {"success": True, "message": "Connected to Azure DevOps successfully"}
        except Exception as e:
            return {"success": False, "message": _sanitize_error(e)}

    async def list_assets(self, config: dict, credentials: dict) -> list:
        try:
            import httpx
            import base64
            org = config.get("organization")
            token = credentials.get("personal_access_token")
            auth_header = base64.b64encode(f":{token}".encode()).decode()
            assets = []
            async with httpx.AsyncClient() as client:
                # List projects
                resp = await client.get(
                    f"https://dev.azure.com/{org}/_apis/projects?api-version=7.1",
                    headers={"Authorization": f"Basic {auth_header}"},
                )
                resp.raise_for_status()
                projects = resp.json().get("value", [])
                for project in projects:
                    # List repos per project
                    repo_resp = await client.get(
                        f"https://dev.azure.com/{org}/{project['id']}/_apis/git/repositories?api-version=7.1",
                        headers={"Authorization": f"Basic {auth_header}"},
                    )
                    if repo_resp.status_code == 200:
                        for repo in repo_resp.json().get("value", []):
                            assets.append({
                                "name": f"{project['name']}/{repo['name']}",
                                "asset_type": "saas_resource",
                                "path": f"azuredevops://{org}/{project['id']}/{repo['id']}",
                            })
            return assets
        except Exception as e:
            logger.error("Azure DevOps list_assets failed: %s", e)
            return []

    async def fetch_metadata(self, config: dict, credentials: dict, asset_path: str) -> dict:
        return {"encryption": "encrypted", "exposure": "private"}

    async def scan_content(self, config: dict, credentials: dict, asset_path: str) -> str:
        try:
            import httpx
            import base64
            org = config.get("organization")
            token = credentials.get("personal_access_token")
            auth_header = base64.b64encode(f":{token}".encode()).decode()
            parts = asset_path.replace("azuredevops://", "").split("/")
            project_id = parts[1] if len(parts) > 1 else ""
            repo_id = parts[2] if len(parts) > 2 else ""
            samples = []
            async with httpx.AsyncClient() as client:
                # Get items in root
                resp = await client.get(
                    f"https://dev.azure.com/{org}/{project_id}/_apis/git/repositories/{repo_id}/items?recursionLevel=OneLevel&api-version=7.1",
                    headers={"Authorization": f"Basic {auth_header}"},
                )
                if resp.status_code == 200:
                    for item in resp.json().get("value", [])[:10]:
                        if not item.get("isFolder"):
                            file_resp = await client.get(
                                item.get("url", ""),
                                headers={"Authorization": f"Basic {auth_header}"},
                            )
                            if file_resp.status_code == 200:
                                samples.append(f"--- {item.get('path', '')} ---\n{file_resp.text[:4096]}")
            return "\n".join(samples)[:65536]
        except Exception as e:
            logger.error("Azure DevOps scan_content failed: %s", e)
            return ""


# ═══════════════════════════════════════════════════════════════════════════
# 9. SECURITY PLATFORM INTEGRATIONS
# ═══════════════════════════════════════════════════════════════════════════

class ForcepointDLPHandler(BaseConnectorHandler):
    connector_label = "Forcepoint DLP"

    async def test_connection(self, config: dict, credentials: dict) -> dict:
        try:
            import httpx
            base_url = config.get("base_url")
            token = credentials.get("api_key")
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"{base_url}/api/v1/status",
                    headers={"Authorization": f"Bearer {token}"},
                )
                resp.raise_for_status()
            return {"success": True, "message": "Connected to Forcepoint DLP successfully"}
        except Exception as e:
            return {"success": False, "message": _sanitize_error(e)}

    async def list_assets(self, config: dict, credentials: dict) -> list:
        try:
            import httpx
            base_url = config.get("base_url")
            token = credentials.get("api_key")
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"{base_url}/api/v1/policies",
                    headers={"Authorization": f"Bearer {token}"},
                )
                resp.raise_for_status()
                data = resp.json()
            assets = []
            for policy in data.get("policies", []):
                assets.append({
                    "name": policy.get("name", ""),
                    "asset_type": "saas_resource",
                    "path": f"forcepoint://{policy.get('id', '')}",
                    "metadata": {"type": "dlp_policy"},
                })
            return assets
        except Exception as e:
            logger.error("Forcepoint list_assets failed: %s", e)
            return []

    async def fetch_metadata(self, config: dict, credentials: dict, asset_path: str) -> dict:
        return {"encryption": "encrypted", "exposure": "private"}

    async def scan_content(self, config: dict, credentials: dict, asset_path: str) -> str:
        try:
            import httpx
            base_url = config.get("base_url")
            token = credentials.get("api_key")
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"{base_url}/api/v1/incidents",
                    headers={"Authorization": f"Bearer {token}"},
                    params={"limit": 50},
                )
                resp.raise_for_status()
                data = resp.json()
            return "\n".join(str(inc) for inc in data.get("incidents", []))[:65536]
        except Exception as e:
            logger.error("Forcepoint scan_content failed: %s", e)
            return ""


class SplunkHandler(BaseConnectorHandler):
    connector_label = "Splunk SIEM"

    async def test_connection(self, config: dict, credentials: dict) -> dict:
        try:
            import httpx
            base_url = config.get("base_url")
            token = credentials.get("bearer_token") or credentials.get("session_key")
            async with httpx.AsyncClient(verify=config.get("verify_ssl", True)) as client:
                resp = await client.get(
                    f"{base_url}/services/server/info",
                    headers={"Authorization": f"Bearer {token}"},
                    params={"output_mode": "json"},
                )
                resp.raise_for_status()
            return {"success": True, "message": "Connected to Splunk successfully"}
        except Exception as e:
            return {"success": False, "message": _sanitize_error(e)}

    async def list_assets(self, config: dict, credentials: dict) -> list:
        try:
            import httpx
            base_url = config.get("base_url")
            token = credentials.get("bearer_token") or credentials.get("session_key")
            async with httpx.AsyncClient(verify=config.get("verify_ssl", True)) as client:
                resp = await client.get(
                    f"{base_url}/services/data/indexes",
                    headers={"Authorization": f"Bearer {token}"},
                    params={"output_mode": "json", "count": 100},
                )
                resp.raise_for_status()
                data = resp.json()
            assets = []
            for entry in data.get("entry", []):
                assets.append({
                    "name": entry.get("name", ""),
                    "asset_type": "saas_resource",
                    "path": f"splunk://indexes/{entry.get('name', '')}",
                    "metadata": {"type": "index"},
                })
            return assets
        except Exception as e:
            logger.error("Splunk list_assets failed: %s", e)
            return []

    async def fetch_metadata(self, config: dict, credentials: dict, asset_path: str) -> dict:
        return {"encryption": "encrypted", "exposure": "private"}

    async def scan_content(self, config: dict, credentials: dict, asset_path: str) -> str:
        try:
            import httpx
            base_url = config.get("base_url")
            token = credentials.get("bearer_token") or credentials.get("session_key")
            index_name = asset_path.replace("splunk://indexes/", "")
            async with httpx.AsyncClient(verify=config.get("verify_ssl", True)) as client:
                resp = await client.post(
                    f"{base_url}/services/search/jobs/export",
                    headers={"Authorization": f"Bearer {token}"},
                    data={
                        "search": f"search index={index_name} | head 50",
                        "output_mode": "json",
                    },
                )
                resp.raise_for_status()
                return resp.text[:65536]
        except Exception as e:
            logger.error("Splunk scan_content failed: %s", e)
            return ""


class QRadarHandler(BaseConnectorHandler):
    connector_label = "IBM QRadar"

    async def test_connection(self, config: dict, credentials: dict) -> dict:
        try:
            import httpx
            base_url = config.get("base_url")
            token = credentials.get("sec_token")
            async with httpx.AsyncClient(verify=config.get("verify_ssl", True)) as client:
                resp = await client.get(
                    f"{base_url}/api/system/about",
                    headers={"SEC": token, "Accept": "application/json"},
                )
                resp.raise_for_status()
            return {"success": True, "message": "Connected to QRadar successfully"}
        except Exception as e:
            return {"success": False, "message": _sanitize_error(e)}

    async def list_assets(self, config: dict, credentials: dict) -> list:
        try:
            import httpx
            base_url = config.get("base_url")
            token = credentials.get("sec_token")
            assets = []
            async with httpx.AsyncClient(verify=config.get("verify_ssl", True)) as client:
                resp = await client.get(
                    f"{base_url}/api/config/event_sources/log_source_management/log_sources",
                    headers={"SEC": token, "Accept": "application/json"},
                    params={"Range": "items=0-99"},
                )
                if resp.status_code == 200:
                    for source in resp.json():
                        assets.append({
                            "name": source.get("name", ""),
                            "asset_type": "saas_resource",
                            "path": f"qradar://log_sources/{source.get('id', '')}",
                            "metadata": {"type": "log_source"},
                        })
            return assets
        except Exception as e:
            logger.error("QRadar list_assets failed: %s", e)
            return []

    async def fetch_metadata(self, config: dict, credentials: dict, asset_path: str) -> dict:
        return {"encryption": "encrypted", "exposure": "private"}

    async def scan_content(self, config: dict, credentials: dict, asset_path: str) -> str:
        try:
            import httpx
            base_url = config.get("base_url")
            token = credentials.get("sec_token")
            async with httpx.AsyncClient(verify=config.get("verify_ssl", True)) as client:
                # Start a search
                resp = await client.post(
                    f"{base_url}/api/ariel/searches",
                    headers={"SEC": token, "Accept": "application/json"},
                    params={"query_expression": "SELECT * FROM events LAST 1 HOURS LIMIT 50"},
                )
                if resp.status_code in (200, 201):
                    return resp.text[:65536]
            return ""
        except Exception as e:
            logger.error("QRadar scan_content failed: %s", e)
            return ""


class GenericSOARHandler(BaseConnectorHandler):
    connector_label = "SOAR Platform"

    async def test_connection(self, config: dict, credentials: dict) -> dict:
        try:
            import httpx
            base_url = config.get("base_url")
            token = credentials.get("api_key") or credentials.get("access_token")
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"{base_url}/api/v1/health",
                    headers={"Authorization": f"Bearer {token}"},
                )
                resp.raise_for_status()
            return {"success": True, "message": "Connected to SOAR platform successfully"}
        except Exception as e:
            return {"success": False, "message": _sanitize_error(e)}

    async def list_assets(self, config: dict, credentials: dict) -> list:
        try:
            import httpx
            base_url = config.get("base_url")
            token = credentials.get("api_key") or credentials.get("access_token")
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"{base_url}/api/v1/playbooks",
                    headers={"Authorization": f"Bearer {token}"},
                )
                resp.raise_for_status()
                data = resp.json()
            assets = []
            for pb in data.get("playbooks", data.get("results", [])):
                assets.append({
                    "name": pb.get("name", ""),
                    "asset_type": "saas_resource",
                    "path": f"soar://playbooks/{pb.get('id', '')}",
                })
            return assets
        except Exception as e:
            logger.error("SOAR list_assets failed: %s", e)
            return []

    async def fetch_metadata(self, config: dict, credentials: dict, asset_path: str) -> dict:
        return {"encryption": "encrypted", "exposure": "private"}

    async def scan_content(self, config: dict, credentials: dict, asset_path: str) -> str:
        return ""


class GenericCASBHandler(BaseConnectorHandler):
    connector_label = "CASB"

    async def test_connection(self, config: dict, credentials: dict) -> dict:
        try:
            import httpx
            base_url = config.get("base_url")
            token = credentials.get("api_key") or credentials.get("access_token")
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"{base_url}/api/v1/status",
                    headers={"Authorization": f"Bearer {token}"},
                )
                resp.raise_for_status()
            return {"success": True, "message": "Connected to CASB successfully"}
        except Exception as e:
            return {"success": False, "message": _sanitize_error(e)}

    async def list_assets(self, config: dict, credentials: dict) -> list:
        try:
            import httpx
            base_url = config.get("base_url")
            token = credentials.get("api_key") or credentials.get("access_token")
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"{base_url}/api/v1/applications",
                    headers={"Authorization": f"Bearer {token}"},
                )
                resp.raise_for_status()
                data = resp.json()
            assets = []
            for app in data.get("applications", data.get("results", [])):
                assets.append({
                    "name": app.get("name", ""),
                    "asset_type": "saas_resource",
                    "path": f"casb://apps/{app.get('id', '')}",
                })
            return assets
        except Exception as e:
            logger.error("CASB list_assets failed: %s", e)
            return []

    async def fetch_metadata(self, config: dict, credentials: dict, asset_path: str) -> dict:
        return {"encryption": "encrypted", "exposure": "private"}

    async def scan_content(self, config: dict, credentials: dict, asset_path: str) -> str:
        return ""


# ═══════════════════════════════════════════════════════════════════════════
# 10. BACKUP & SNAPSHOT CONNECTORS
# ═══════════════════════════════════════════════════════════════════════════

class AWSEBSSnapshotHandler(BaseConnectorHandler):
    connector_label = "AWS EBS Snapshots"

    async def test_connection(self, config: dict, credentials: dict) -> dict:
        try:
            import boto3
            session = boto3.Session(
                aws_access_key_id=credentials.get("access_key"),
                aws_secret_access_key=credentials.get("secret_key"),
                region_name=config.get("region", "us-east-1"),
            )
            ec2 = session.client("ec2")
            identity = session.client("sts").get_caller_identity()
            ec2.describe_snapshots(OwnerIds=[identity["Account"]], MaxResults=5)
            return {"success": True, "message": "Connected to AWS EBS Snapshots successfully"}
        except Exception as e:
            return {"success": False, "message": _sanitize_error(e)}

    async def list_assets(self, config: dict, credentials: dict) -> list:
        try:
            import boto3
            session = boto3.Session(
                aws_access_key_id=credentials.get("access_key"),
                aws_secret_access_key=credentials.get("secret_key"),
                region_name=config.get("region", "us-east-1"),
            )
            ec2 = session.client("ec2")
            identity = session.client("sts").get_caller_identity()
            paginator = ec2.get_paginator("describe_snapshots")
            assets = []
            for page in paginator.paginate(OwnerIds=[identity["Account"]]):
                for snap in page.get("Snapshots", []):
                    encrypted = snap.get("Encrypted", False)
                    assets.append({
                        "name": snap.get("Description", snap["SnapshotId"]),
                        "asset_type": "datalake_object",
                        "path": f"ebs-snapshot://{snap['SnapshotId']}",
                        "size_bytes": snap.get("VolumeSize", 0) * 1073741824,
                        "metadata": {
                            "encrypted": encrypted,
                            "state": snap.get("State"),
                            "volume_id": snap.get("VolumeId"),
                        },
                    })
                    if len(assets) >= 500:
                        break
                if len(assets) >= 500:
                    break
            return assets
        except Exception as e:
            logger.error("EBS Snapshot list_assets failed: %s", e)
            return []

    async def fetch_metadata(self, config: dict, credentials: dict, asset_path: str) -> dict:
        try:
            import boto3
            session = boto3.Session(
                aws_access_key_id=credentials.get("access_key"),
                aws_secret_access_key=credentials.get("secret_key"),
                region_name=config.get("region", "us-east-1"),
            )
            ec2 = session.client("ec2")
            snap_id = asset_path.replace("ebs-snapshot://", "")
            resp = ec2.describe_snapshots(SnapshotIds=[snap_id])
            snap = resp["Snapshots"][0] if resp["Snapshots"] else {}
            return {
                "size_bytes": snap.get("VolumeSize", 0) * 1073741824,
                "encryption": "encrypted" if snap.get("Encrypted") else "not_encrypted",
                "state": snap.get("State"),
                "exposure": "private",
            }
        except Exception as e:
            logger.error("EBS Snapshot fetch_metadata failed: %s", e)
            return {}

    async def scan_content(self, config: dict, credentials: dict, asset_path: str) -> str:
        # EBS snapshots require volume mounting — not directly scannable
        return ""


class AzureVMSnapshotHandler(BaseConnectorHandler):
    connector_label = "Azure VM Snapshots"

    async def test_connection(self, config: dict, credentials: dict) -> dict:
        try:
            import httpx
            token = credentials.get("access_token")
            sub_id = config.get("subscription_id")
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"https://management.azure.com/subscriptions/{sub_id}/providers/Microsoft.Compute/snapshots?api-version=2023-10-02",
                    headers={"Authorization": f"Bearer {token}"},
                )
                resp.raise_for_status()
            return {"success": True, "message": "Connected to Azure VM Snapshots successfully"}
        except Exception as e:
            return {"success": False, "message": _sanitize_error(e)}

    async def list_assets(self, config: dict, credentials: dict) -> list:
        try:
            import httpx
            token = credentials.get("access_token")
            sub_id = config.get("subscription_id")
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"https://management.azure.com/subscriptions/{sub_id}/providers/Microsoft.Compute/snapshots?api-version=2023-10-02",
                    headers={"Authorization": f"Bearer {token}"},
                )
                resp.raise_for_status()
                data = resp.json()
            assets = []
            for snap in data.get("value", []):
                props = snap.get("properties", {})
                assets.append({
                    "name": snap["name"],
                    "asset_type": "datalake_object",
                    "path": f"azure-snapshot://{snap['id']}",
                    "size_bytes": props.get("diskSizeBytes"),
                    "metadata": {
                        "encryption": bool(props.get("encryption")),
                        "state": props.get("provisioningState"),
                    },
                })
            return assets
        except Exception as e:
            logger.error("Azure VM Snapshot list_assets failed: %s", e)
            return []

    async def fetch_metadata(self, config: dict, credentials: dict, asset_path: str) -> dict:
        return {"encryption": "encrypted", "exposure": "private"}

    async def scan_content(self, config: dict, credentials: dict, asset_path: str) -> str:
        # VM snapshots require disk mounting — not directly scannable
        return ""


class BackupRepositoryHandler(BaseConnectorHandler):
    connector_label = "Backup Repository"

    async def test_connection(self, config: dict, credentials: dict) -> dict:
        try:
            import httpx
            base_url = config.get("base_url")
            token = credentials.get("api_key") or credentials.get("access_token")
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"{base_url}/api/v1/status",
                    headers={"Authorization": f"Bearer {token}"},
                )
                resp.raise_for_status()
            return {"success": True, "message": "Connected to Backup Repository successfully"}
        except Exception as e:
            return {"success": False, "message": _sanitize_error(e)}

    async def list_assets(self, config: dict, credentials: dict) -> list:
        try:
            import httpx
            base_url = config.get("base_url")
            token = credentials.get("api_key") or credentials.get("access_token")
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"{base_url}/api/v1/backups",
                    headers={"Authorization": f"Bearer {token}"},
                )
                resp.raise_for_status()
                data = resp.json()
            assets = []
            for backup in data.get("backups", data.get("results", [])):
                assets.append({
                    "name": backup.get("name", backup.get("id", "")),
                    "asset_type": "datalake_object",
                    "path": f"backup://{backup.get('id', '')}",
                    "size_bytes": backup.get("size_bytes"),
                    "metadata": {"type": "backup", "status": backup.get("status")},
                })
            return assets
        except Exception as e:
            logger.error("Backup Repository list_assets failed: %s", e)
            return []

    async def fetch_metadata(self, config: dict, credentials: dict, asset_path: str) -> dict:
        return {"encryption": "unknown", "exposure": "private"}

    async def scan_content(self, config: dict, credentials: dict, asset_path: str) -> str:
        return ""


class ArchiveStorageHandler(BaseConnectorHandler):
    connector_label = "Archive Storage"

    async def test_connection(self, config: dict, credentials: dict) -> dict:
        """Supports AWS Glacier, Azure Archive, or GCS Archive via standard cloud SDKs."""
        provider = config.get("provider", "aws")
        if provider == "aws":
            try:
                import boto3
                session = boto3.Session(
                    aws_access_key_id=credentials.get("access_key"),
                    aws_secret_access_key=credentials.get("secret_key"),
                    region_name=config.get("region", "us-east-1"),
                )
                glacier = session.client("glacier")
                glacier.list_vaults()
                return {"success": True, "message": "Connected to AWS Glacier successfully"}
            except Exception as e:
                return {"success": False, "message": _sanitize_error(e)}
        elif provider == "azure":
            try:
                from azure.storage.blob import BlobServiceClient
                client = BlobServiceClient.from_connection_string(credentials.get("connection_string"))
                list(client.list_containers(max_results=1))
                return {"success": True, "message": "Connected to Azure Archive Storage successfully"}
            except Exception as e:
                return {"success": False, "message": _sanitize_error(e)}
        return {"success": False, "message": "Unsupported archive provider"}

    async def list_assets(self, config: dict, credentials: dict) -> list:
        provider = config.get("provider", "aws")
        if provider == "aws":
            try:
                import boto3
                session = boto3.Session(
                    aws_access_key_id=credentials.get("access_key"),
                    aws_secret_access_key=credentials.get("secret_key"),
                    region_name=config.get("region", "us-east-1"),
                )
                glacier = session.client("glacier")
                vaults = glacier.list_vaults().get("VaultList", [])
                assets = []
                for vault in vaults:
                    assets.append({
                        "name": vault["VaultName"],
                        "asset_type": "datalake_object",
                        "path": f"glacier://{vault['VaultName']}",
                        "size_bytes": vault.get("SizeInBytes"),
                    })
                return assets
            except Exception as e:
                logger.error("Glacier list_assets failed: %s", e)
                return []
        return []

    async def fetch_metadata(self, config: dict, credentials: dict, asset_path: str) -> dict:
        return {"encryption": "encrypted", "exposure": "private"}

    async def scan_content(self, config: dict, credentials: dict, asset_path: str) -> str:
        # Archive retrieval requires hours — not suitable for real-time scanning
        return ""


# ═══════════════════════════════════════════════════════════════════════════
# HANDLER FACTORY — maps connector type strings to handler classes
# ═══════════════════════════════════════════════════════════════════════════

class ConnectorHandlerFactory:
    _handlers = {
        # Cloud Storage
        "aws_s3": AWSS3Handler,
        "azure_blob": AzureBlobHandler,
        "adls": ADLSHandler,
        "gcs": GCSHandler,
        "onedrive": OneDriveHandler,
        "sharepoint_online": SharePointOnlineHandler,
        "google_drive": GoogleDriveHandler,
        "box": BoxHandler,
        "dropbox": DropboxHandler,
        "egnyte": EgnyteHandler,
        # Databases
        "postgresql": PostgreSQLHandler,
        "mysql": MySQLHandler,
        "mssql": MSSQLHandler,
        "mongodb": MongoDBHandler,
        "oracle": OracleHandler,
        "mariadb": MariaDBHandler,
        "db2": DB2Handler,
        "cassandra": CassandraHandler,
        # Data Warehouses
        "snowflake": SnowflakeHandler,
        "bigquery": BigQueryHandler,
        "redshift": RedshiftHandler,
        "azure_synapse": AzureSynapseHandler,
        "databricks": DatabricksHandler,
        "hdfs": HDFSHandler,
        # SaaS / Collaboration
        "microsoft_365": Microsoft365Handler,
        "google_workspace": GoogleWorkspaceHandler,
        "microsoft_teams": MicrosoftTeamsHandler,
        "gmail": GmailHandler,
        "slack": SlackHandler,
        "jira": JiraHandler,
        "confluence": ConfluenceHandler,
        "salesforce": SalesforceHandler,
        # On-Prem Storage
        "smb": SMBHandler,
        "nfs": NFSHandler,
        "local_fs": LocalFSHandler,
        "on_prem_sharepoint": OnPremSharePointHandler,
        # Cloud Infrastructure
        "aws_cloud": AWSCloudHandler,
        "azure_subscription": AzureSubscriptionHandler,
        "gcp_cloud": GCPCloudHandler,
        # Identity & Access Management
        "azure_ad": AzureADHandler,
        "aws_iam": AWSIAMHandler,
        "google_iam": GoogleIAMHandler,
        "ldap": LDAPHandler,
        "microsoft_ad": MicrosoftADHandler,
        "okta": OktaHandler,
        "ping_identity": PingIdentityHandler,
        # DevOps & Code Repositories
        "github": GitHubHandler,
        "gitlab": GitLabHandler,
        "bitbucket": BitbucketHandler,
        "azure_devops": AzureDevOpsHandler,
        # Security Platform Integrations
        "forcepoint_dlp": ForcepointDLPHandler,
        "splunk": SplunkHandler,
        "qradar": QRadarHandler,
        "generic_soar": GenericSOARHandler,
        "generic_casb": GenericCASBHandler,
        # Backup & Snapshot
        "aws_ebs_snapshot": AWSEBSSnapshotHandler,
        "azure_vm_snapshot": AzureVMSnapshotHandler,
        "backup_repository": BackupRepositoryHandler,
        "archive_storage": ArchiveStorageHandler,
    }

    @classmethod
    def get_handler(cls, connector_type: str) -> BaseConnectorHandler:
        handler_class = cls._handlers.get(connector_type)
        if not handler_class:
            return BaseConnectorHandler()
        return handler_class()
