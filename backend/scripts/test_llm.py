import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from dotenv import load_dotenv, find_dotenv
load_dotenv(find_dotenv())

from app.core.prompt_builder import build_recipe_prompt
from app.core.llm import generate_output

dummy_pantry = [
    {"name": "rice", "quantity_raw": 2, "unit_raw": "cups", "quantity_normalised": 402.0},
    {"name": "whole milk", "quantity_raw": 4, "unit_raw": "cups", "quantity_normalised": 976.0},
    {"name": "ghee", "quantity_raw": 4, "unit_raw": "tbsp", "quantity_normalised": 56.0},
    {"name": "chicken breast", "quantity_raw": 500, "unit_raw": "g", "quantity_normalised": 500.0},
    {"name": "spinach", "quantity_raw": 200, "unit_raw": "g", "quantity_normalised": 200.0},
    {"name": "cumin seeds", "quantity_raw": 2, "unit_raw": "tbsp", "quantity_normalised": 14.0},
]

dummy_expiring = [
    {"name": "whole milk", "days_until_expiry": 2},
    {"name": "chicken breast", "days_until_expiry": 1},
    {"name": "spinach", "days_until_expiry": 3},
]

prompt = build_recipe_prompt(dummy_pantry, dummy_expiring, chaos_level=3)
print("--- PROMPT ---")
print(prompt)
print("\n--- CALLING GEMINI ---")

recipe = generate_output(prompt)
print("\n--- RECIPE OUTPUT ---")
print(recipe.model_dump_json(indent=2))