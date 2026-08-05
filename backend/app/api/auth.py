from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.users import UserModel
from app.core.security import hash_password, create_access_token
from pydantic import BaseModel

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db 
    finally:
        db.close()

# Model to verify what comes in
class RegisterRequest(BaseModel):
    email: str
    password: str

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