import hashlib 
import json 
from sqlalchemy.orm import Session
from app.models.recipes import RecipeModel
from app.schemas.recipe import RecipeOutput


def compute_hash(ingredient_id: list) -> str:
    ingredients = sorted(ingredient_id)
    hash_input = json.dumps(ingredients).encode("utf-8")
    return hashlib.sha256(hash_input).digest().hex()

def get_or_generate_recipe(
    ingredient_ids: list, 
    prompt: str, 
    user_id: int, 
    chaos_level: int, 
    db: Session, 
    generate_func   
) -> RecipeOutput:


    ingredient_hash = compute_hash(ingredient_ids)

    cached = db.query(RecipeModel).filter(RecipeModel.ingredient_hash == ingredient_hash).first() 

    if cached:
        print("------------ Recipe is cached. Retrieving ------------")
        recipe = RecipeOutput (
            recipe_name=cached.recipe_name, 
            pantry_items_used = cached.pantry_items_used, 
            missing_ingredients_needed=cached.missing_items, 
            instructions=cached.instructions, 
            estimated_cook_time_minutes=cached.estimated_cook_time_minutes 
        )
        return recipe

    print("------------ Cache missed, Calling API ------------")

    recipe = generate_func(prompt)

    db.add(RecipeModel(
        user_id=user_id,
        ingredient_hash=ingredient_hash,
        recipe_name=recipe.recipe_name,
        pantry_items_used=[i.model_dump() for i in recipe.pantry_items_used],
        missing_ingredients_needed=[i.model_dump() for i in recipe.missing_ingredients_needed],
        instructions=recipe.instructions,
        chaos_level=chaos_level
    ))

    db.commit()
    return recipe