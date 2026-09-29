from mcp.server.mcpserver import MCPServer

from .tools import get_lead_context


mcp = MCPServer("gtm-tools")


@mcp.tool()
def get_lead_context_tool(lead_id: str) -> dict:
    """Return verified GTM context for a lead."""
    return get_lead_context(lead_id)


if __name__ == "__main__":
    mcp.run()