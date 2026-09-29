import re

from .schemas import InquiryRequest


def normalize_whitespace(
    value: str
) -> str:

    return re.sub(
        r"\s+",
        " ",
        value
    ).strip()


def normalize_inquiry(
    inquiry: InquiryRequest
) -> InquiryRequest:

    return inquiry.model_copy(
        update={
            "name": normalize_whitespace(
                inquiry.name
            ),

            "email": str(
                inquiry.email
            ).lower().strip(),

            "intendedMajor": normalize_whitespace(
                inquiry.intendedMajor
            ),
        }
    )