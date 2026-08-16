import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.database import SessionLocal
from app.models.ingredients import IngredientModel

ingredients = [
    {"name": "rice", "category": "grain", "density_g_per_ml": 0.85, "standard_unit": "g"},
    {"name": "whole wheat flour", "category": "grain", "density_g_per_ml": 0.59, "standard_unit": "g"},
    {"name": "chickpea flour", "category": "grain", "density_g_per_ml": 0.69, "standard_unit": "g"},
    {"name": "semolina", "category": "grain", "density_g_per_ml": 0.67, "standard_unit": "g"},
    {"name": "basmati rice", "category": "grain", "density_g_per_ml": 0.84, "standard_unit": "g"},
    {"name": "red lentils", "category": "legume", "density_g_per_ml": 0.85, "standard_unit": "g"},
    {"name": "yellow split peas", "category": "legume", "density_g_per_ml": 0.84, "standard_unit": "g"},
    {"name": "black lentils", "category": "legume", "density_g_per_ml": 0.86, "standard_unit": "g"},
    {"name": "chickpeas", "category": "legume", "density_g_per_ml": 0.81, "standard_unit": "g"},
    {"name": "kidney beans", "category": "legume", "density_g_per_ml": 0.83, "standard_unit": "g"},
    {"name": "mustard oil", "category": "oil", "density_g_per_ml": 0.91, "standard_unit": "g"},
    {"name": "ghee", "category": "oil", "density_g_per_ml": 0.91, "standard_unit": "g"},
    {"name": "coconut oil", "category": "oil", "density_g_per_ml": 0.92, "standard_unit": "g"},
    {"name": "whole milk", "category": "dairy", "density_g_per_ml": 1.03, "standard_unit": "g"},
    {"name": "yogurt", "category": "dairy", "density_g_per_ml": 1.04, "standard_unit": "g"},
    {"name": "paneer", "category": "dairy", "density_g_per_ml": 1.08, "standard_unit": "g"},
    {"name": "onion", "category": "vegetable", "density_g_per_ml": None, "standard_unit": "piece"},
    {"name": "garlic", "category": "vegetable", "density_g_per_ml": None, "standard_unit": "piece"},
    {"name": "tomato", "category": "vegetable", "density_g_per_ml": 0.95, "standard_unit": "g"},
    {"name": "potato", "category": "vegetable", "density_g_per_ml": None, "standard_unit": "piece"},
    {"name": "ginger", "category": "vegetable", "density_g_per_ml": 0.88, "standard_unit": "g"},
    {"name": "spinach", "category": "vegetable", "density_g_per_ml": 0.28, "standard_unit": "g"},
    {"name": "cauliflower", "category": "vegetable", "density_g_per_ml": 0.27, "standard_unit": "g"},
    {"name": "turmeric powder", "category": "spice", "density_g_per_ml": 0.48, "standard_unit": "g"},
    {"name": "cumin seeds", "category": "spice", "density_g_per_ml": 0.53, "standard_unit": "g"},
    {"name": "coriander powder", "category": "spice", "density_g_per_ml": 0.51, "standard_unit": "g"},
    {"name": "red chili powder", "category": "spice", "density_g_per_ml": 0.46, "standard_unit": "g"},
    {"name": "garam masala", "category": "spice", "density_g_per_ml": 0.44, "standard_unit": "g"},
    {"name": "eggs", "category": "protein", "density_g_per_ml": None, "standard_unit": "piece"},
    {"name": "chicken breast", "category": "protein", "density_g_per_ml": 1.04, "standard_unit": "g"},
]

def seed():
    db = SessionLocal()
    try:
        for item in ingredients:
            exists = db.query(IngredientModel).filter(IngredientModel.name == item["name"]).first()
            if not exists:
                db.add(IngredientModel(**item))
        db.commit()
        print(f"Seeded {len(ingredients)} ingredients.")
    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed()