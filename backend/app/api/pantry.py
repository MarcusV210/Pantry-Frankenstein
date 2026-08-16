from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.ingredients import IngredientModel
from app.models.pantry import PantryModel
from app.schemas.pantry import PantryItemOut, PantryItemCreate
from app.core.unit_engine import normalise
from app.core.security import get_current_user
from app.models.users import UserModel

router = APIRouter() 

@router.post("\items", response_model = PantryItemOut)
def add_pantry_item(body: PantryItemCreate, db: Session = Depends(get_db), c)