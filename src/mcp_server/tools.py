LEAD_CONTEXT = {
    "L1001": {
        "lead_id": "L1001",
        "company": "Western Research Institute",
        "email": "sarah.williams@example.com",
        "recent_activity": "dataset_download",
        "industry": "Research Services",
        "fit_score": 40,
        "intent_score": 40,
        "total_score": 80,
        "priority": "HIGH",
    },

    # I also support the HubSpot contact ID used by the real n8n test.
    "551075847918": {
        "lead_id": "551075847918",
        "company": "Western Research Institute",
        "email": "sarah.williams@westernresearchtest.edu",
        "recent_activity": "dataset_download",
        "industry": "Research Services",
        "fit_score": 40,
        "intent_score": 40,
        "total_score": 80,
        "priority": "HIGH",
    },
}


def get_lead_context(lead_id: str) -> dict:
    # I look up the lead using the identifier supplied by n8n.
    lead = LEAD_CONTEXT.get(lead_id)

    # I return a clear error when the lead does not exist.
    if lead is None:
        raise ValueError(f"Lead '{lead_id}' was not found.")

    # I return the verified lead context to the Agent.
    return lead