from langchain_ollama import ChatOllama
from langgraph.types import interrupt

from .mcp_client import get_lead_context_sync
from .prompts import SYSTEM_PROMPT
from .schemas import LeadAnalysis
from .state import LeadState


def load_context(state: LeadState) -> LeadState:
    # I ask the MCP server for verified lead context.
    lead_context = get_lead_context_sync(state["lead_id"])

    # I store the MCP result in LangGraph state.
    state["crm_context"] = {
        "lead_context": lead_context
    }

    return state


def analyze_lead(state: LeadState) -> LeadState:
    # I create the local Ollama model for the AI analysis step.
    model = ChatOllama(
        model="llama3.2:3b",
        temperature=0,
    )

    # I collect the verified CRM context for the Agent.
    lead_context = state["crm_context"]["lead_context"]

    # I create the prompt using the lead data and existing priority.
    user_prompt = f"""
Lead data:
{state["lead_data"]}

CRM context:
{lead_context}

Existing priority:
{state["priority"]}
"""

    # I ask the model to return the response in the LeadAnalysis schema.
    response = model.with_structured_output(LeadAnalysis).invoke(
        [
            ("system", SYSTEM_PROMPT),
            ("human", user_prompt),
        ]
    )

    # I save the structured summary in LangGraph state.
    state["summary"] = response.summary

    # I save the recommended GTM action in LangGraph state.
    state["recommended_action"] = response.recommended_action

    # I save the reason behind the recommendation.
    state["reason"] = response.reason

    # I save the outreach draft for human review.
    state["outreach_draft"] = response.outreach_draft

    # I clear any previous error after a successful AI response.
    state["error"] = ""

    return state


def validate_analysis(state: LeadState) -> LeadState:
    # I check that the AI returned a usable summary.
    if not state.get("summary"):
        state["error"] = "AI response is missing summary."
        return state

    # I check that the AI returned a usable next action.
    if not state.get("recommended_action"):
        state["error"] = "AI response is missing recommended action."
        return state

    # I check that the AI explained its recommendation.
    if not state.get("reason"):
        state["error"] = "AI response is missing reason."
        return state

    # I check that the outreach draft exists for human review.
    if not state.get("outreach_draft"):
        state["error"] = "AI response is missing outreach draft."
        return state

    # I clear the error when the output passes validation.
    state["error"] = ""

    return state


def should_retry(state: LeadState) -> str:
    # I send the graph back to analysis when validation fails.
    if state.get("error"):
        # I allow at most two retries for a recoverable AI-output problem.
        if state.get("retry_count", 0) < 2:
            return "retry"

        # I stop the graph after the retry limit is reached.
        return "failed"

    # I continue to human review when the output is valid.
    return "review"


def prepare_retry(state: LeadState) -> LeadState:
    # I increase the retry count before another AI attempt.
    state["retry_count"] = state.get("retry_count", 0) + 1

    # I remove the previous validation error before retrying.
    state["error"] = ""

    return state


def human_review(state: LeadState) -> LeadState:
    # I pause the graph so a human can review the AI recommendation.
    decision = interrupt(
        {
            "lead_id": state["lead_id"],
            "summary": state["summary"],
            "recommended_action": state["recommended_action"],
            "reason": state["reason"],
            "outreach_draft": state["outreach_draft"],
        }
    )

    # I store the human decision in LangGraph state.
    state["review_status"] = decision["status"]

    # I store the reviewer's explanation when one is provided.
    state["review_reason"] = decision.get("reason", "")

    return state


def route_after_review(state: LeadState) -> str:
    # I stop the graph when the reviewer rejects the AI recommendation.
    if state.get("review_status") == "REJECTED":
        return "rejected"

    # I continue to the approved action only after explicit approval.
    if state.get("review_status") == "APPROVED":
        return "approved"

    # I use a safe default for an unexpected review status.
    return "rejected"


def execute_approved_action(state: LeadState) -> LeadState:
    # I only execute the action after a human has approved it.
    print(
        f"Approved action for lead {state['lead_id']}: "
        f"{state['recommended_action']}"
    )

    return state


def audit_result(state: LeadState) -> LeadState:
    # I record the final review result for traceability.
    print(
        f"Audit - lead={state['lead_id']} "
        f"review_status={state.get('review_status')} "
        f"action={state.get('recommended_action')}"
    )

    return state