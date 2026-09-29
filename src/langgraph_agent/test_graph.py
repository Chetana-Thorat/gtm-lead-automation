from langgraph.types import Command

from .graph import graph


def main() -> None:
    # I create a test lead that matches the HIGH-priority output from the GTM workflow.
    state = {
        "lead_id": "L1001",
        "lead_data": {
            "name": "Sarah Williams",
            "email": "sarah.williams@example.com",
            "organization": "Western Research Institute",
        },
        "fit_score": 40,
        "intent_score": 40,
        "total_score": 80,
        "priority": "HIGH",
        "retry_count": 0,
    }

    # I use a stable thread ID so LangGraph can resume this run after review.
    config = {
        "configurable": {
            "thread_id": "lead-L1001"
        }
    }

    # I run the graph until it reaches the human-review checkpoint.
    result = graph.invoke(
        state,
        config=config,
    )

    print("\nGraph result:")
    print(result)

    print("\nNow approving the recommendation...")

    # I resume the paused graph with an explicit human approval.
    approved_result = graph.invoke(
        Command(
            resume={
                "status": "APPROVED",
                "reason": "Recommendation reviewed and approved."
            }
        ),
        config=config,
    )

    print("\nFinal result:")
    print(approved_result)


if __name__ == "__main__":
    main()