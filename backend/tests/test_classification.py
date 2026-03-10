"""Tests for classification pattern matching."""

import re
from app.services.classification.service import BUILTIN_PATTERNS
from app.models.classification import DataCategory


def test_pan_pattern():
    pattern = BUILTIN_PATTERNS[DataCategory.PAN]
    assert re.findall(pattern, "My PAN is ABCDE1234F")
    assert not re.findall(pattern, "ABCDE123F")


def test_aadhaar_pattern():
    pattern = BUILTIN_PATTERNS[DataCategory.AADHAAR]
    assert re.findall(pattern, "Aadhaar: 2345 6789 0123")
    assert not re.findall(pattern, "1234 5678 9012")  # starts with 1


def test_gstin_pattern():
    pattern = BUILTIN_PATTERNS[DataCategory.GSTIN]
    assert re.findall(pattern, "GSTIN: 22AAAAA0000A1Z5")


def test_ifsc_pattern():
    pattern = BUILTIN_PATTERNS[DataCategory.IFSC]
    assert re.findall(pattern, "IFSC: SBIN0001234")
    assert not re.findall(pattern, "SBIN1001234")


def test_email_pattern():
    pattern = BUILTIN_PATTERNS[DataCategory.PII]
    assert re.findall(pattern, "Contact: user@example.com")


def test_card_number_pattern():
    pattern = BUILTIN_PATTERNS[DataCategory.FINANCIAL]
    assert re.findall(pattern, "Card: 4111111111111111")


def test_aws_key_pattern():
    pattern = BUILTIN_PATTERNS[DataCategory.SOURCE_CODE_SECRETS]
    assert re.findall(pattern, "aws_key=AKIAIOSFODNN7EXAMPLE")
