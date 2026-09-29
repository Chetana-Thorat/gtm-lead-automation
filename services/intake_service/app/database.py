from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from .config import settings


# Creates the connection pool used by the Intake Service.
engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
)


# Creates a new database session for each unit of work.
SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    expire_on_commit=False,
)


# All SQLAlchemy models will inherit from this base class.
class Base(DeclarativeBase):
    pass


# FastAPI dependency for safely opening and closing DB sessions.
def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()