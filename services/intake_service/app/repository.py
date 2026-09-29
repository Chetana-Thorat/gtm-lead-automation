from uuid import UUID

from sqlalchemy.orm import Session

from .enums import OutboxStatus
from .models import Inquiry, OutboxEvent


class InquiryRepository:

    def __init__(self, db: Session):
        self.db = db

    # Find inquiry by event id (idempotency)
    def find_by_event_id(
        self,
        event_id: UUID,
    ) -> Inquiry | None:

        return (
            self.db.query(Inquiry)
            .filter(Inquiry.event_id == event_id)
            .first()
        )

    # Insert inquiry
    def create_inquiry(
        self,
        inquiry: Inquiry,
    ) -> Inquiry:

        self.db.add(inquiry)

        return inquiry

    # Insert outbox event
    def create_outbox_event(
        self,
        outbox: OutboxEvent,
    ) -> OutboxEvent:

        self.db.add(outbox)

        return outbox

    # Refresh entity after commit
    def refresh(
        self,
        entity,
    ):

        self.db.refresh(entity)

    # Find pending outbox events
    def find_pending_events(
        self,
        limit: int = 20,
    ):

        return (
            self.db.query(OutboxEvent)
            .filter(
                OutboxEvent.status == OutboxStatus.PENDING.value
            )
            .order_by(OutboxEvent.created_at)
            .limit(limit)
            .all()
        )

    # Save updated outbox event
    def update_outbox(
        self,
        event: OutboxEvent,
    ):

        self.db.add(event)

        return event