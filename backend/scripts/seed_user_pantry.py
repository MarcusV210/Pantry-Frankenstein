import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.database import SessionLocal
from app.models.pantry import PantryModel
from app.models.ingredients import IngredientModel
from app.models.users import UserModel
from app.core.unit_engine import normalise
from datetime import date, timedelta

TARGET_EMAIL = "anamay@gmail.com"

pantry_items = [
    {"name": "rice", "quantity_raw": 5, "unit_raw": "cups", "days_until_expiry": 30},
    {"name": "whole wheat flour", "quantity_raw": 3, "unit_raw": "cups", "days_until_expiry": 60},
    {"name": "kidney beans", "quantity_raw": 2, "unit_raw": "cups", "days_until_expiry": 90},
    {"name": "whole milk", "quantity_raw": 4, "unit_raw": "cups", "days_until_expiry": 3},
    {"name": "ghee", "quantity_raw": 4, "unit_raw": "tbsp", "days_until_expiry": 120},
    {"name": "yogurt", "quantity_raw": 2, "unit_raw": "cups", "days_until_expiry": 5},
    {"name": "onion", "quantity_raw": 4, "unit_raw": "piece", "days_until_expiry": 14},
    {"name": "garlic", "quantity_raw": 10, "unit_raw": "piece", "days_until_expiry": 20},
    {"name": "tomato", "quantity_raw": 5, "unit_raw": "piece", "days_until_expiry": 7},
    {"name": "potato", "quantity_raw": 6, "unit_raw": "piece", "days_until_expiry": 25},
    {"name": "ginger", "quantity_raw": 50, "unit_raw": "g", "days_until_expiry": 10},
    {"name": "spinach", "quantity_raw": 200, "unit_raw": "g", "days_until_expiry": 4},
    {"name": "turmeric powder", "quantity_raw": 3, "unit_raw": "tbsp", "days_until_expiry": 180},
    {"name": "cumin seeds", "quantity_raw": 2, "unit_raw": "tbsp", "days_until_expiry": 180},
    {"name": "red chili powder", "quantity_raw": 2, "unit_raw": "tbsp", "days_until_expiry": 180},
    {"name": "eggs", "quantity_raw": 6, "unit_raw": "piece", "days_until_expiry": 14},
    {"name": "chicken breast", "quantity_raw": 500, "unit_raw": "g", "days_until_expiry": 2},
]

def seed():
    db = SessionLocal()
    try:
        user = db.query(UserModel).filter(UserModel.email == TARGET_EMAIL).first()
        if not user:
            print(f"User {TARGET_EMAIL} not found.")
            return

        seeded = 0
        skipped = 0

        for item in pantry_items:
            ingredient = db.query(IngredientModel).filter(
                IngredientModel.name == item["name"]
            ).first()

            if not ingredient:
                print(f"Skipping '{item['name']}' — not found in ingredients table.")
                skipped += 1
                continue

            quantity_normalised = normalise(
                quantity=item["quantity_raw"],
                unit=item["unit_raw"],
                density=ingredient.density_g_per_ml
            )

            expiration_date = date.today() + timedelta(days=item["days_until_expiry"])

            db.add(PantryModel(
                user_id=user.id,
                ingredient_id=ingredient.id,
                quantity_raw=item["quantity_raw"],
                unit_raw=item["unit_raw"],
                quantity_normalised=quantity_normalised,
                expiration_date=expiration_date
            ))
            seeded += 1

        db.commit()
        print(f"Seeded {seeded} pantry items for {TARGET_EMAIL}. Skipped {skipped}.")

    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
    finally:
        db.close()

seed()