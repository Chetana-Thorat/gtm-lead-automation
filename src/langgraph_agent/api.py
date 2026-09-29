from typing import Any

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from .graph import graph


app = FastAPI(title="GTM LangGraph Agent")


class LeadRequest(BaseModel):
    lead_id: str
    lead_data: dict[str, Any]
    priority: str
    fit_score: int
    intent_score: int
    total_score: int


@app.get("/health")
def health():
    # I provide a simple endpoint to confirm the service is running.
    return {"status": "ok"}


@app.post("/process-lead")
def process_lead(request: LeadRequest):
    # I allow only HIGH-priority leads into the AI workflow.
    if request.priority != "HIGH":
        raise HTTPException(
            status_code=400,
            detail="Only HIGH-priority leads are accepted.",
        )

    # I convert the HTTP request into LangGraph state.
    state = {
        "lead_id": request.lead_id,
        "lead_data": request.lead_data,
        "priority": request.priority,
        "fit_score": request.fit_score,
        "intent_score": request.intent_score,
        "total_score": request.total_score,
        "retry_count": 0,
    }

    # I use the lead ID as the stable LangGraph thread ID.
    config = {
        "configurable": {
            "thread_id": f"lead-{request.lead_id}"
        }
    }

    # I run the graph until it completes or reaches human review.
    result = graph.invoke(
        state,
        config=config,
    )

    # I check whether LangGraph paused at the human-review interrupt.
    interrupts = result.get("__interrupt__", [])

    if interrupts:
        # I extract the plain review payload from the LangGraph interrupt.
        review = interrupts[0].value

        # I return only JSON-serializable data to n8n.
        return {
            "status": "PENDING_REVIEW",
            "lead_id": request.lead_id,
            "summary": result.get("summary"),
            "recommended_action": result.get("recommended_action"),
            "reason": result.get("reason"),
            "outreach_draft": result.get("outreach_draft"),
            "review": review,
        }

    # I return the completed graph result when no interrupt exists.
    return {
        "status": "COMPLETED",
        "lead_id": request.lead_id,
        "summary": result.get("summary"),
        "recommended_action": result.get("recommended_action"),
        "reason": result.get("reason"),
        "outreach_draft": result.get("outreach_draft"),
        "review_status": result.get("review_status"),
        "review_reason": result.get("review_reason"),
    }