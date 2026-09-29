from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, START, StateGraph

from .nodes import (
    analyze_lead,
    audit_result,
    execute_approved_action,
    human_review,
    load_context,
    prepare_retry,
    route_after_review,
    should_retry,
    validate_analysis,
)
from .state import LeadState


def accept_high_priority_lead(state: LeadState) -> LeadState:
    # I keep the existing HIGH-priority decision from n8n unchanged.
    if state.get("priority") != "HIGH":
        raise ValueError("LangGraph only accepts HIGH-priority leads.")

    return state


builder = StateGraph(LeadState)

# I add the node that accepts only HIGH-priority leads.
builder.add_node(
    "accept_high_priority_lead",
    accept_high_priority_lead,
)

# I add the node that loads lead context through MCP.
builder.add_node(
    "load_context",
    load_context,
)

# I add the AI analysis node.
builder.add_node(
    "analyze_lead",
    analyze_lead,
)

# I add the AI output validation node.
builder.add_node(
    "validate_analysis",
    validate_analysis,
)

# I add the bounded retry node.
builder.add_node(
    "prepare_retry",
    prepare_retry,
)

# I add the human approval checkpoint.
builder.add_node(
    "human_review",
    human_review,
)

# I add the node that performs an already-approved action.
builder.add_node(
    "execute_approved_action",
    execute_approved_action,
)

# I add the audit node for traceability.
builder.add_node(
    "audit_result",
    audit_result,
)

# I start with the existing HIGH-priority check.
builder.add_edge(
    START,
    "accept_high_priority_lead",
)

# I send HIGH-priority leads to the context-loading step.
builder.add_edge(
    "accept_high_priority_lead",
    "load_context",
)

# I send the loaded context to the AI analysis step.
builder.add_edge(
    "load_context",
    "analyze_lead",
)

# I validate the AI result after generation.
builder.add_edge(
    "analyze_lead",
    "validate_analysis",
)

# I choose whether to retry, fail, or continue to human review.
builder.add_conditional_edges(
    "validate_analysis",
    should_retry,
    {
        "retry": "prepare_retry",
        "failed": "audit_result",
        "review": "human_review",
    },
)

# I send a retry back to the AI analysis step.
builder.add_edge(
    "prepare_retry",
    "analyze_lead",
)

# I decide what happens after the human review.
builder.add_conditional_edges(
    "human_review",
    route_after_review,
    {
        "rejected": "audit_result",
        "approved": "execute_approved_action",
    },
)

# I audit the result of the approved action.
builder.add_edge(
    "execute_approved_action",
    "audit_result",
)

# I finish the graph after auditing.
builder.add_edge(
    "audit_result",
    END,
)

# I keep graph state in memory so an interrupted run can be resumed.
checkpointer = MemorySaver()

graph = builder.compile(
    checkpointer=checkpointer
)