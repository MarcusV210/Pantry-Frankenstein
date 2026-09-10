from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session 
from app.core.prompt_builder import build_recipe_prompt 
from app.models.pantry import PantryModel 
from app.models.ingredients import IngredientModel
from app.models.recipes import RecipeModel
from app.models.users import UserModel
from app.database import get_db 
from app.core.security import get_current_user
from app.core.llm import generate_output 
from app.core.unit_engine import normalise
from app.schemas.recipe import RecipeOutput, IngredientUsed
from datetime import date, timedelta
from pydantic import BaseModel
from typing import List

router = APIRouter()

class RecipeGenerateRequest(BaseModel):
    chaos_level: int = 1 # Play it safe 
    days_expiring: int = 3 # default 

class CookedRequest(BaseModel):
    pantry_items_used: List[IngredientUsed]


@router.post("/generate", response_model = RecipeOutput)
def generate_recipe(body: RecipeGenerateRequest, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_user)):
    pantry_items = db.query(PantryModel).filter(PantryModel.user_id == current_user.id).all()

    if not pantry_items:
        raise HTTPException(status_code = 400, detail = "User's pantry is empty.")

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

    try:
        db_recipe = RecipeModel(
            user_id=current_user.id,
            ingredient_hash="",
            recipe_name=recipe.recipe_name,
            pantry_items_used=[i.model_dump() for i in recipe.pantry_items_used],
            missing_items=[i.model_dump() for i in recipe.missing_ingredients_needed],
            instructions=recipe.instructions,
            chaos_level=body.chaos_level
        )
        db.add(db_recipe)
        db.commit()
    except Exception as e:
        print(f"Warning: Failed to save recipe to history: {e}")
        db.rollback()

    return recipe 


@router.get("/")
def get_recipes_history(db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_user)):
    recipes = db.query(RecipeModel).filter(RecipeModel.user_id == current_user.id).order_by(RecipeModel.id.desc()).all()
    return [
        {
            "id": r.id,
            "recipe_name": r.recipe_name,
            "pantry_items_used": r.pantry_items_used,
            "missing_ingredients_needed": r.missing_items,
            "instructions": r.instructions,
            "chaos_level": r.chaos_level,
        }
        for r in recipes
    ]


@router.post("/cooked")
def mark_as_cooked(body: CookedRequest, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_user)):
    for item in body.pantry_items_used:
        pantry_items = db.query(PantryModel).join(IngredientModel).filter(
            PantryModel.user_id == current_user.id,
            IngredientModel.name == item.name.lower()
        ).all()

        try:
            qty_to_deduct = float(item.quantity)
        except (ValueError, TypeError):
            qty_to_deduct = 1.0

        for pi in pantry_items:
            if pi.quantity_raw <= qty_to_deduct:
                qty_to_deduct -= pi.quantity_raw
                db.delete(pi)
            else:
                pi.quantity_raw -= qty_to_deduct
                if pi.ingredient and pi.ingredient.density_g_per_ml:
                    try:
                        pi.quantity_normalised = normalise(pi.quantity_raw, pi.unit_raw, pi.ingredient.density_g_per_ml)
                    except Exception:
                        pass
                qty_to_deduct = 0
            if qty_to_deduct <= 0:
                break

    db.commit()
    return {"message": "Pantry updated successfully after cooking"}
 