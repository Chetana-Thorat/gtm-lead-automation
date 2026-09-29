from enum import Enum


class InquiryStatus(str, Enum):
    ACCEPTED = "ACCEPTED"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class OutboxStatus(str, Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    DELIVERED = "DELIVERED"
    FAILED = "FAILED"