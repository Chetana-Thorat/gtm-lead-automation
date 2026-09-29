import logging

import httpx

from .config import settings

logger = logging.getLogger(__name__)


class N8NClient:

    def __init__(self):
        self.url = settings.n8n_inquiry_webhook_url

    async def send_event(
        self,
        payload: dict,
    ) -> bool:

        try:

            async with httpx.AsyncClient(
                timeout=10,
            ) as client:

                response = await client.post(
                    self.url,
                    json=payload,
                )

                response.raise_for_status()

                return True

        except Exception:

            logger.exception(
                "Failed sending event to n8n."
            )

            return False