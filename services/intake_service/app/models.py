import uuid
from datetime import datetime
from .enums import InquiryStatus
from .enums import OutboxStatus

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base


class Inquiry(Base):
    __tablename__ = "inquiries"

    # Internal identifier owned by our backend.
    inquiry_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    # Client event identifier used for idempotency.
    event_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
        unique=True,
        index=True,
    )

    name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    email: Mapped[str] = mapped_column(
        String(320),
        nullable=False,
        index=True,
    )

    intended_major: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    event_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    source: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    occurred_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )

    received_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )

    processing_status: Mapped[str] = mapped_column(
    String(30),
    nullable=False,
    default=InquiryStatus.ACCEPTED.value,
)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )


class OutboxEvent(Base):
    __tablename__ = "outbox_events"

    outbox_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    inquiry_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "inquiries.inquiry_id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    # One outbox delivery event for this intake event.
    event_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
        unique=True,
    )

    event_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    # Exact trusted event that will later be sent to n8n.
    payload: Mapped[dict] = mapped_column(
        JSONB,
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
    String(30),
    nullable=False,
    default=OutboxStatus.PENDING.value,
    index=True,
)

    attempt_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    next_attempt_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        index=True,
    )

    last_error: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    delivered_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )