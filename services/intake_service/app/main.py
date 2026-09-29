import asyncio
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .config import settings
from .database import get_db
from .dispatcher import Dispatcher
from .schemas import InquiryRequest, InquiryResponse
from .service import InquiryService


dispatcher = Dispatcher()


@asynccontextmanager
async def lifespan(app: FastAPI):

    dispatcher_task = asyncio.create_task(
        dispatcher.run()
    )

    yield

    dispatcher.stop()

    await dispatcher_task


app = FastAPI(
    title="Prospective Student Intake Service",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


@app.get("/health/live")
def health_live():
    return {"status": "ok"}


@app.post(
    "/api/v1/inquiries",
    response_model=InquiryResponse,
    status_code=status.HTTP_202_ACCEPTED,
)
def create_inquiry(
    request: InquiryRequest,
    db: Session = Depends(get_db),
):
    service = InquiryService(db)
    return service.create_inquiry(request)