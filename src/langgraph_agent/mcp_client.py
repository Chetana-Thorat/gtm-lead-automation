import asyncio
import json
from typing import Any

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client


async def get_lead_context(lead_id: str) -> Any:
    # I tell the MCP client how to start my local MCP server.
    server_params = StdioServerParameters(
        command="python",
        args=["-m", "src.mcp_server.server"],
    )

    # I open a stdio connection between the client and MCP server.
    async with stdio_client(server_params) as (read_stream, write_stream):
        # I create an MCP session over the connection.
        async with ClientSession(read_stream, write_stream) as session:
            # I initialize the MCP session before calling any tools.
            await session.initialize()

            # I call the MCP tool using the lead ID from LangGraph state.
            result = await session.call_tool(
                "get_lead_context_tool",
                arguments={"lead_id": lead_id},
            )

            # I stop if the MCP server returned no content.
            if not result.content:
                raise ValueError("MCP returned an empty response.")

            # I read the first result returned by the MCP tool.
            first_content = result.content[0]

            # I convert the JSON text returned by MCP into a Python dictionary.
            if hasattr(first_content, "text"):
                return json.loads(first_content.text)

            # I return a fallback value for an unexpected MCP result type.
            return {"result": str(first_content)}


def get_lead_context_sync(lead_id: str) -> Any:
    # I provide a synchronous wrapper so a LangGraph node can call the async MCP client.
    return asyncio.run(get_lead_context(lead_id))