from app.models.users import UserModel
from app.database import get_db
from sqlalchemy.orm import Session
from app.database import SessionLocal
from fastapi import Depends
from fastapi import HTTPException
from fastapi.security import OAuth2PasswordBearer
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt 
# pyrefly: ignore [missing-import]
from pwdlib import PasswordHash
import os
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv(), override = True)
# Config  
ENCRYPTION_SECRET_KEY = os.getenv("ENCRYPTION_SECRET_KEY")
ENCRYPTION_ALGORITHM = os.getenv("ENCRYPTION_ALGORITHM")
ENCRYPTION_EXPIRY_MINUTES = int(os.getenv("ENCRYPTION_EXPIRY_MINUTES"))

context = PasswordHash.recommended()
bearer = OAuth2PasswordBearer(tokenUrl="/auth/login")

# Hashing 
def hash_password(plain_password: str) -> str:
    return context.hash(plain_password)

def verify_password(entered_password: str, actual_password: str) -> bool:
    return context.verify(entered_password, actual_password)

# JWT access token 
def create_access_token(data: dict) -> str:
    payload = data.copy()

    exp = datetime.now(timezone.utc) + timedelta(minutes=ENCRYPTION_EXPIRY_MINUTES)
    payload["exp"] = exp # Add an expirty to the access token

    token = jwt.encode(payload, ENCRYPTION_SECRET_KEY, algorithm=ENCRYPTION_ALGORITHM)
    return token

def decode_token(token: str) -> dict:
    try:
        decoded_payload = jwt.decode(token, ENCRYPTION_SECRET_KEY, algorithms=[ENCRYPTION_ALGORITHM])
        return decoded_payload
    except JWTError:
        raise HTTPException(status_code = 401, detail = "Invalid or expired token")

def get_current_user(token: str = Depends(bearer), db : Session = Depends(get_db)):
    payload = decode_token(token)
    user_id = int(payload.get("sub"))
    user = db.query(UserModel).filter(user_id == UserModel.id).first()
    if not user:
        raise HTTPException(status_code = 401, detail = "User not found")
    
    # Definitely the user exists
    return user
