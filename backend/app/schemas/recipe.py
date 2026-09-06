from pydantic import BaseModel 
from typing import List 

class IngredientUsed(BaseModel):
    name : str 
    quantity : str 
    unit: str

class RecipeOutput(BaseModel):
    recipe_name: str
    pantry_items_used: List[IngredientUsed]
    missing_ingredients_needed: List[IngredientUsed]
    instructions: List[str]
    estimated_cook_time_minutes: int