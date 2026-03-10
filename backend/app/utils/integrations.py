"""External integration helpers for Alerting & Workflow Engine (Module 3.8)."""

import json
from typing import Optional

import httpx


class WebhookIntegration:
    """Send alerts via webhook."""

    @staticmethod
    async def send(url: str, payload: dict, headers: dict = None) -> bool:
        async with httpx.AsyncClient() as client:
            resp = await client.post(url, json=payload, headers=headers or {}, timeout=30)
            return resp.status_code < 400


class SlackIntegration:
    """Send alerts to Slack channels."""

    @staticmethod
    async def send_alert(webhook_url: str, title: str, severity: str, description: str, asset_name: str = None):
        color_map = {"critical": "#FF0000", "high": "#FF6600", "medium": "#FFCC00", "low": "#00CC00", "info": "#0066FF"}
        payload = {
            "attachments": [{
                "color": color_map.get(severity, "#808080"),
                "title": f"[DSPM Alert] {title}",
                "text": description,
                "fields": [
                    {"title": "Severity", "value": severity.upper(), "short": True},
                    {"title": "Asset", "value": asset_name or "N/A", "short": True},
                ],
            }]
        }
        return await WebhookIntegration.send(webhook_url, payload)


class JiraIntegration:
    """Create Jira tickets from alerts."""

    def __init__(self, base_url: str, email: str, api_token: str, project_key: str):
        self.base_url = base_url.rstrip("/")
        self.email = email
        self.api_token = api_token
        self.project_key = project_key

    async def create_ticket(self, summary: str, description: str, priority: str = "Medium") -> Optional[str]:
        priority_map = {"critical": "Highest", "high": "High", "medium": "Medium", "low": "Low", "info": "Lowest"}
        jira_priority = priority_map.get(priority, "Medium")

        payload = {
            "fields": {
                "project": {"key": self.project_key},
                "summary": summary,
                "description": description,
                "issuetype": {"name": "Bug"},
                "priority": {"name": jira_priority},
            }
        }

        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{self.base_url}/rest/api/2/issue",
                json=payload,
                auth=(self.email, self.api_token),
                timeout=30,
            )
            if resp.status_code == 201:
                data = resp.json()
                return data.get("key")
            return None


class EmailIntegration:
    """Send alert notifications via email (SMTP)."""

    @staticmethod
    async def send_alert(to_email: str, subject: str, body: str, smtp_config: dict):
        import smtplib
        from email.mime.text import MIMEText

        msg = MIMEText(body, "html")
        msg["Subject"] = subject
        msg["From"] = smtp_config.get("from_email", "dspm@techd.com")
        msg["To"] = to_email

        with smtplib.SMTP(smtp_config["host"], smtp_config.get("port", 587)) as server:
            server.starttls()
            if smtp_config.get("username"):
                server.login(smtp_config["username"], smtp_config["password"])
            server.send_message(msg)


class SIEMForwarder:
    """Forward alerts/logs to SIEM systems (Splunk, Sentinel, QRadar)."""

    @staticmethod
    async def forward_to_splunk(hec_url: str, hec_token: str, event: dict) -> bool:
        payload = {"event": event, "sourcetype": "dspm:alert"}
        headers = {"Authorization": f"Splunk {hec_token}"}
        return await WebhookIntegration.send(hec_url, payload, headers)

    @staticmethod
    async def forward_to_sentinel(workspace_id: str, shared_key: str, log_type: str, event: dict) -> bool:
        # Azure Sentinel Log Analytics API
        # Simplified - production would need HMAC signing
        url = f"https://{workspace_id}.ods.opinsights.azure.com/api/logs?api-version=2016-04-01"
        headers = {
            "Content-Type": "application/json",
            "Log-Type": log_type,
        }
        return await WebhookIntegration.send(url, event, headers)
