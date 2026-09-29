from typing import Any, TypedDict


class LeadState(TypedDict, total=False):
    # Lead information coming from the existing GTM workflow.
    lead_id: str
    lead_data: dict[str, Any]

    # Existing deterministic qualification result.
    priority: str
    fit_score: int
    intent_score: int
    total_score: int

    # Context collected through MCP.
    crm_context: dict[str, Any]
    activity_context: dict[str, Any]

    # AI results.
    summary: str
    recommended_action: str
    reason: str
    outreach_draft: str

    # Validation and retry state.
    retry_count: int
    error: str

    # Human review state.
    review_status: str
    review_reason: str