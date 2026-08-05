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
    decoded_payload = jwt.decode(token, ENCRYPTION_SECRET_KEY, algorithms=[ENCRYPTION_ALGORITHM])
    return decoded_payload