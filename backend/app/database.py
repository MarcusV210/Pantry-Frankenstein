from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
import os
from dotenv import load_dotenv

load_dotenv(override=True)

DATABASE_URL = os.getenv("DATABASE_URL")

def get_db():
    db = SessionLocal()
    try:
        yield db 
    finally:
        db.close()

engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(autoflush=False, autocommit=False, bind=engine) # Bind it to the engine which is connected to the databse through the url. 

class Base(DeclarativeBase):
    pass    