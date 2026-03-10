"""Schemas for the AI natural language query interface."""

from pydantic import BaseModel, Field


class AIQueryRequest(BaseModel):
    """Natural language query from CISO / security team."""
    query: str = Field(
        ...,
        min_length=3,
        max_length=1000,
        description="Natural language question about security posture, risk, alerts, compliance, etc.",
        examples=[
            "What is our overall security posture?",
            "Show me all critical alerts",
            "How many sensitive assets are publicly exposed?",
            "What is our GDPR compliance status?",
        ],
    )


class AIQueryResponse(BaseModel):
    """Structured response from the AI query engine."""
    query: str = Field(..., description="Original query text")
    intent: str = Field(..., description="Detected intent category")
    confidence: float = Field(..., description="Intent classification confidence 0-1")
    narrative: str = Field(..., description="Human-readable summary for CISO")
    data: dict = Field(default_factory=dict, description="Structured data backing the narrative")
    suggestions: list[str] = Field(default_factory=list, description="Follow-up query suggestions")
    data_residency: str = Field(
        default="local",
        description="Confirms data processing location — always 'local', no external calls",
    )

    model_config = {"from_attributes": True}
