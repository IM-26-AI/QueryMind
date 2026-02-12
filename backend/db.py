from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
from config import settings

# Load variables from .env
load_dotenv()

SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL

# Create the engine
# check_same_thread is only needed for SQLite, not Postgres
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Create a SessionLocal class
# Each instance of this class will be a database session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for our models to inherit from
Base = declarative_base()

# Dependency to get a DB session (used in API endpoints)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()