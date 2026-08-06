from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.users import UserModel
from app.core.security import hash_password, create_access_token, verify_password, get_current_user
from pydantic import BaseModel
from app.database import get_db

router = APIRouter()

# Model to verify what comes in
class RegisterRequest(BaseModel):
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

# Register new user
@router.post('/register')
def register(main: RegisterRequest, db: Session = Depends(get_db)):
    exists = db.query(UserModel).filter(main.email == UserModel.email).first()
    if exists:
        raise HTTPException(status_code = 409, detail = "User already exists. Please go to log in.")
    
    # If it doesn't get raised.
    user = UserModel(email=main.email, hashed_password=hash_password(main.password))
    db.add(user)
    db.commit()
    db.refresh(user)

    # Return the token immediately instead of asking the user to log in again.
    token = create_access_token({"sub" : str(user.id)})
    return {"access_token": token, "token_type": "bearer"}


# Login 
@router.post('/login')
def login(main: LoginRequest, db : Session = Depends(get_db)):
    user = db.query(UserModel).filter(main.email == UserModel.email).first()
    if not user:
        raise HTTPException(status_code = 401, detail = "Invalid credentials")
    
    if not verify_password(main.password, user.hashed_password):
        raise HTTPException(status_code = 401, detail = "Invalid credentials")
    
    # After this, the user exists and the password is correct 
    payload = {"sub" : str(user.id)}
    token = create_access_token(payload)

    return {"access_token" : token, "token_type" : "bearer"}


# Test
@router.get('/me')
def get_me(current_user: UserModel = Depends(get_current_user)):
    return {"email" : current_user.email}