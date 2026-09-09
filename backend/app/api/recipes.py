from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session 
from app.core.prompt_builder import build_recipe_prompt 
# from app.core.cache import get_or_generate_recipe 
from app.models.pantry import PantryModel 
from app.models.users import UserModel
from app.database import get_db 
from app.core.security import get_current_user
from app.core.llm import generate_output 
from app.schemas.recipe import RecipeOutput 
from datetime import date, timedelta
from pydantic import BaseModel

router = APIRouter()

class RecipeGenerateRequest(BaseModel):
    chaos_level: int = 1 # Play it safe 
    days_expiring: int = 3 # default 


@router.post("/generate", response_model = RecipeOutput)
def generate_recipe(body: RecipeGenerateRequest, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_user)):
    pantry_items = db.query(PantryModel).filter(PantryModel.user_id == current_user.id).all()

    if not pantry_items:
        raise HTTPException(status_code = 400, detail = f"User's pantry is empty.")

    limit = date.today() + timedelta(days = body.days_expiring)
    expiring = [item for item in pantry_items if item.expiration_date and item.expiration_date <= limit]

    pantry_stuff = [
        {
            "name":item.ingredient.name, 
            "quantity_raw":item.quantity_raw, 
            "unit_raw":item.unit_raw, 
            "quantity_normalised": item.quantity_normalised
        }
        for item in pantry_items
    ]   

    expiring_stuff = [
        {
            "name": item.ingredient.name,
            "days_until_expiry": (item.expiration_date - date.today()).days
        }
        for item in expiring
    ] 

    prompt = build_recipe_prompt(pantry_stuff, expiring_stuff, body.chaos_level)

    recipe = generate_output(prompt)

    return recipe 