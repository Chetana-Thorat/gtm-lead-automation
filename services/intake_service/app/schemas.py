from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field


class InquiryRequest(BaseModel):

    eventId: str = Field(
        min_length=1,
        max_length=100,
    )

    occurredAt: datetime

    eventType: Literal[
        "prospective_student_form_submitted"
    ]

    source: Literal[
        "website"
    ]

    name: str = Field(
        min_length=1,
        max_length=150,
    )

    email: EmailStr

    intendedMajor: str = Field(
        min_length=1,
        max_length=150,
    )


class StudentData(BaseModel):

    name: str

    email: EmailStr

    intendedMajor: str


class TrustedInquiryEvent(BaseModel):

    eventId: str

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