import uuid
import logging

from datetime import datetime, timezone

from sqlalchemy.orm import Session

from .enums import InquiryStatus, OutboxStatus
from .models import Inquiry, OutboxEvent
from .normalization import normalize_inquiry
from .repository import InquiryRepository
from .schemas import (
    InquiryRequest,
    InquiryResponse,
    StudentData,
    TrustedInquiryEvent,
)

logger = logging.getLogger(__name__)


class InquiryService:

    def __init__(self, db: Session):
        self.db = db
        self.repository = InquiryRepository(db)

    def create_inquiry(
        self,
        request: InquiryRequest,
    ) -> InquiryResponse:

        print("SERVICE 1 - create_inquiry() started")

        logger.info("Starting inquiry processing.")

        #
        # Step 1.
        # Normalize already validated request.
        #
        normalized = normalize_inquiry(request)

        print("SERVICE 2 - normalization complete")

        logger.info("Inquiry normalized.")

        #
        # Step 2.
        # Check database idempotency.
        #
        existing = self.repository.find_by_event_id(
            normalized.eventId
        )

        print("SERVICE 3 - duplicate lookup complete")

        if existing:

            print("SERVICE 4 - duplicate found")

            logger.info(
                "Duplicate event detected.",
                extra={
                    "eventId": str(normalized.eventId)
                },
            )

            return InquiryResponse(
                inquiryId=str(existing.inquiry_id),
                status=existing.processing_status,
                duplicate=True,
            )

        print("SERVICE 4 - new inquiry")

        #
        # Step 3.
        # Generate server-owned metadata.
        #
        inquiry_id = uuid.uuid4()

        received_at = datetime.now(
            timezone.utc
        )

        #
        # Step 4.
        # Build trusted event.
        #
        trusted_event = TrustedInquiryEvent(
            eventId=normalized.eventId,
            inquiryId=str(inquiry_id),
            occurredAt=normalized.occurredAt,
            receivedAt=received_at,
            eventType=normalized.eventType,
            source=normalized.source,
            student=StudentData(
                name=normalized.name,
                email=normalized.email,
                intendedMajor=normalized.intendedMajor,
            ),
        )

        print("SERVICE 5 - trusted event created")

        #
        # Step 5.
        # Build Inquiry entity.
        #
        inquiry = Inquiry(
            inquiry_id=inquiry_id,
            event_id=normalized.eventId,
            name=normalized.name,
            email=str(normalized.email),
            intended_major=normalized.intendedMajor,
            event_type=normalized.eventType,
            source=normalized.source,
            occurred_at=normalized.occurredAt,
            received_at=received_at,
            processing_status=InquiryStatus.ACCEPTED.value,
        )

        print("SERVICE 6 - inquiry entity created")

        #
        # Step 6.
        # Build Outbox entity.
        #
        outbox = OutboxEvent(
            inquiry_id=inquiry_id,
            event_id=normalized.eventId,
            event_type=normalized.eventType,
            payload=trusted_event.model_dump(mode="json"),
            status=OutboxStatus.PENDING.value,
        )

        print("SERVICE 7 - outbox entity created")

        #
        # Step 7.
        # One database transaction.
        #
        try:

            print("SERVICE 8 - inserting inquiry")

            self.repository.create_inquiry(inquiry)

            print("SERVICE 9 - inquiry inserted")

            self.repository.create_outbox_event(outbox)

            print("SERVICE 10 - outbox inserted")

            logger.info("Committing transaction.")

            print("SERVICE 11 - before commit")

            self.db.commit()

            print("SERVICE 12 - commit finished")

            self.db.refresh(inquiry)

            print("SERVICE 13 - refresh finished")

            logger.info(
                "Inquiry committed successfully.",
                extra={
                    "inquiryId": str(inquiry_id),
                    "eventId": str(normalized.eventId),
                },
            )

        except Exception as ex:

            print("SERVICE ERROR:", ex)

            logger.exception(
                "Database transaction failed."
            )

            self.db.rollback()

            raise

        print("SERVICE 14 - returning response")

        #
        # Step 8.
        # Return immediately.
        #
        return InquiryResponse(
            inquiryId=str(inquiry_id),
            status=InquiryStatus.ACCEPTED.value,
            duplicate=False,
        )