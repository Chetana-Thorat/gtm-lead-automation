import asyncio
import logging
from datetime import datetime, timezone

from .database import SessionLocal
from .enums import OutboxStatus
from .n8n_client import N8NClient
from .repository import InquiryRepository

logger = logging.getLogger(__name__)


class Dispatcher:

    def __init__(self):
        self.client = N8NClient()
        self.running = True

    async def run(self):

        logger.info("Dispatcher started.")

        while self.running:

            db = SessionLocal()

            repository = InquiryRepository(db)

            try:

                events = repository.find_pending_events()

                if events:
                    logger.info(
                        f"Found {len(events)} pending event(s)."
                    )

                for event in events:

                    logger.info(
                        f"Processing event {event.event_id}"
                    )

                    # Mark as processing
                    event.status = OutboxStatus.PROCESSING.value
                    db.commit()

                    delivered = await self.client.send_event(
                        event.payload
                    )

                    if delivered:

                        event.status = (
                            OutboxStatus.DELIVERED.value
                        )

                        event.delivered_at = datetime.now(
                            timezone.utc
                        )

                        logger.info(
                            f"Delivered {event.event_id}"
                        )

                    else:

                        event.status = (
                            OutboxStatus.FAILED.value
                        )

                        event.attempt_count += 1

                        logger.warning(
                            f"Failed {event.event_id}"
                        )

                    db.commit()

            except Exception:

                logger.exception(
                    "Dispatcher failed while processing outbox events."
                )

                db.rollback()

            finally:

                db.close()

            # Check every 2 seconds while developing
            await asyncio.sleep(2)

        logger.info("Dispatcher stopped.")

    def stop(self):
        self.running = False