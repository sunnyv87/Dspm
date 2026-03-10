"""Classification Engine service (Module 3.3)."""

import re
from typing import Optional
from uuid import UUID

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.classification import (
    ClassificationRule, ClassificationResult, CustomClassifier,
    DataCategory, DetectionMethod, ClassificationLevel,
)


# Built-in regex patterns for Indian and common data types
BUILTIN_PATTERNS = {
    DataCategory.PAN: r"\b[A-Z]{5}[0-9]{4}[A-Z]\b",
    DataCategory.AADHAAR: r"\b[2-9]{1}[0-9]{3}\s?[0-9]{4}\s?[0-9]{4}\b",
    DataCategory.GSTIN: r"\b[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}\b",
    DataCategory.IFSC: r"\b[A-Z]{4}0[A-Z0-9]{6}\b",
    DataCategory.PASSPORT: r"\b[A-Z]{1}[0-9]{7}\b",
    DataCategory.DRIVING_LICENCE: r"\b[A-Z]{2}[0-9]{2}\s?[0-9]{4}\s?[0-9]{7}\b",
    DataCategory.VOTER_ID: r"\b[A-Z]{3}[0-9]{7}\b",
    DataCategory.UPI_ID: r"\b[a-zA-Z0-9._-]+@[a-zA-Z]{2,}\b",
    DataCategory.BANK_ACCOUNT: r"\b[0-9]{9,18}\b",
    DataCategory.CIN: r"\b[UL][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}\b",
    DataCategory.PII: r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b",  # email as example
    DataCategory.FINANCIAL: r"\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13})\b",  # card numbers
    DataCategory.AUTH_SECRETS: r"(?:password|secret|token|api[_-]?key)\s*[:=]\s*['\"][^'\"]{8,}['\"]",
    DataCategory.SOURCE_CODE_SECRETS: r"(?:AKIA|ABIA|ACCA|ASIA)[0-9A-Z]{16}",  # AWS key pattern
}


class ClassificationService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def classify_content(self, content: str, scan_job_id: UUID, asset_id: UUID) -> list[ClassificationResult]:
        """Run all active classification rules against content."""
        rules = await self.get_active_rules()
        results = []

        for rule in rules:
            if rule.detection_method == DetectionMethod.REGEX and rule.pattern:
                matches = re.findall(rule.pattern, content)
                if matches:
                    confidence = min(1.0, len(matches) * 0.2 + 0.5)
                    result = ClassificationResult(
                        asset_id=asset_id,
                        scan_job_id=scan_job_id,
                        rule_id=rule.id,
                        category=rule.category,
                        classification_level=rule.default_level,
                        detection_method=DetectionMethod.REGEX,
                        confidence_score=confidence,
                        matched_pattern=rule.pattern,
                        sample_count=len(matches),
                    )
                    self.db.add(result)
                    results.append(result)

            elif rule.detection_method == DetectionMethod.KEYWORD and rule.keywords:
                content_lower = content.lower()
                matched_keywords = [kw for kw in rule.keywords if kw.lower() in content_lower]
                if matched_keywords:
                    confidence = min(1.0, len(matched_keywords) * 0.15 + 0.4)
                    result = ClassificationResult(
                        asset_id=asset_id,
                        scan_job_id=scan_job_id,
                        rule_id=rule.id,
                        category=rule.category,
                        classification_level=rule.default_level,
                        detection_method=DetectionMethod.KEYWORD,
                        confidence_score=confidence,
                        matched_keyword=", ".join(matched_keywords[:5]),
                        sample_count=len(matched_keywords),
                    )
                    self.db.add(result)
                    results.append(result)

        await self.db.flush()
        return results

    async def get_active_rules(self, org_id: UUID = None) -> list[ClassificationRule]:
        query = select(ClassificationRule).where(ClassificationRule.enabled == True)
        if org_id:
            query = query.where(
                (ClassificationRule.org_id == org_id) | (ClassificationRule.org_id.is_(None))
            )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def create_rule(self, org_id: UUID, data: dict) -> ClassificationRule:
        rule = ClassificationRule(org_id=org_id, **data)
        self.db.add(rule)
        await self.db.flush()
        return rule

    async def mark_false_positive(self, result_id: UUID, notes: str = None):
        await self.db.execute(
            update(ClassificationResult)
            .where(ClassificationResult.id == result_id)
            .values(false_positive=True, feedback_notes=notes)
        )

    async def get_results_for_asset(self, asset_id: UUID) -> list[ClassificationResult]:
        result = await self.db.execute(
            select(ClassificationResult)
            .where(ClassificationResult.asset_id == asset_id)
            .where(ClassificationResult.false_positive == False)
        )
        return list(result.scalars().all())

    async def seed_builtin_rules(self):
        """Seed built-in classification rules for common data types."""
        for category, pattern in BUILTIN_PATTERNS.items():
            existing = await self.db.execute(
                select(ClassificationRule).where(
                    ClassificationRule.category == category,
                    ClassificationRule.is_builtin == True,
                )
            )
            if not existing.scalar_one_or_none():
                rule = ClassificationRule(
                    name=f"Built-in: {category.value}",
                    description=f"Auto-detect {category.value} data",
                    category=category,
                    detection_method=DetectionMethod.REGEX,
                    pattern=pattern,
                    default_level=ClassificationLevel.CONFIDENTIAL,
                    is_builtin=True,
                    enabled=True,
                )
                self.db.add(rule)
        await self.db.flush()
