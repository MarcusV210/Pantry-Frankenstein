from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.ingredients import IngredientModel
from app.models.pantry import PantryModel
from app.schemas.pantry import PantryItemOut, PantryItemCreate
from app.core.unit_engine import normalise
from app.core.security import get_current_user
from app.models.users import UserModel
from datetime import date
from typing import List

router = APIRouter() 

@router.post("/items", response_model = PantryItemOut)
def add_pantry_item(body: PantryItemCreate, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_user)):
    ingredient = db.query(IngredientModel).filter(IngredientModel.name == body.name.lower()).first()

    if not ingredient:
        raise HTTPException(status_code = 400, detail = f"Ingredient : {body.name} not found." )

    quantity_normalised = normalise(quantity=body.quantity_raw, unit=body.unit_raw, density=ingredient.density_g_per_ml)

    item = PantryModel( 
        user_id = current_user.id, 
        ingredient_id = ingredient.id, 
        quantity_raw = body.quantity_raw, 
        unit_raw = body.unit_raw, 
        quantity_normalised = quantity_normalised, 
        expiration_date = body.expiry
    )

    db.add(item)
    db.commit() 
    db.refresh(item)

    return { 
        "id" : item.id, 
        "name" : item.ingredient.name, 
        "quantity_raw" : item.quantity_raw, 
        "unit_raw" : item.unit_raw, 
        "quantity_normalised" : item.quantity_normalised, 
        "expiration_date" : item.expiration_date, 
        "days_until_expiry" : (item.expiration_date - date.today()).days # Diff between current date and expiration date in integers
    } # Matched PantryItemOut


@router.get("/", response_model = List[PantryItemOut])
def get_pantry(db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_user)):
    items = db.query(PantryModel).filter(PantryModel.user_id == current_user.id).all()

    return [
        { 
        "id" : item.id, 
        "name" : item.ingredient.name, 
        "quantity_raw" : item.quantity_raw, 
        "unit_raw" : item.unit_raw, 
        "quantity_normalised" : item.quantity_normalised, 
        "expiration_date" : item.expiration_date, 
        "days_until_expiry" : (item.expiration_date - date.today()).days # Diff between current date and expiration date in integers
        }
        for item in items
    ]

@router.delete("/items/{item_id}")
def delete_pantry_item(item_id : int, db: Session = Depends(get_db), current_user : UserModel = Depends(get_current_user)):
    item_to_delete = db.query(PantryModel).filter(PantryModel.user_id == current_user.id, PantryModel.id == item_id).first()

    if not item_to_delete:
        raise HTTPException(status_code = 400, detail = "Item not found")
    
    db.delete(item_to_delete)
    db.commit()

    return {"message": "Item deleted."}