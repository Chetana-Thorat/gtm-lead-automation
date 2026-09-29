from datetime import datetime, timedelta, timezone
from typing import Literal
from uuid import UUID

from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    field_validator,
)


class InquiryRequest(BaseModel):

    # Reject fields that are not part of our API contract.
    model_config = ConfigDict(
        extra="forbid"
    )

    eventId: UUID

    occurredAt: datetime

    eventType: Literal[
        "prospective_student_form_submitted"
    ]

    source: Literal["website"]

    name: str = Field(
        min_length=1,
        max_length=150
    )

    email: EmailStr

    intendedMajor: str = Field(
        min_length=1,
        max_length=150
    )


    @field_validator(
        "name",
        "intendedMajor"
    )
    @classmethod
    def must_not_be_blank(
        cls,
        value: str
    ) -> str:

        if not value.strip():
            raise ValueError(
                "Field cannot be blank."
            )

        return value


    @field_validator("occurredAt")
    @classmethod
    def validate_occurred_at(
        cls,
        value: datetime
    ) -> datetime:

        # Require a timezone so the timestamp is unambiguous.
        if value.tzinfo is None:
            raise ValueError(
                "occurredAt must include a timezone."
            )

        now = datetime.now(timezone.utc)

        # Allow small client clock differences,
        # but reject clearly future-dated events.
        if value > now + timedelta(minutes=5):
            raise ValueError(
                "occurredAt cannot be in the future."
            )

        return value


class StudentData(BaseModel):
    name: str
    email: EmailStr
    intendedMajor: str


class TrustedInquiryEvent(BaseModel):
    eventId: UUID
    inquiryId: str

    occurredAt: datetime
    receivedAt: datetime

    eventType: str
    source: str

    student: StudentData


class InquiryResponse(BaseModel):
    inquiryId: str
    status: str
    duplicate: bool