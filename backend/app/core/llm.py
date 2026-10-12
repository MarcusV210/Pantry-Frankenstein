import os 
import json 
import hashlib
import time
import google.generativeai as genai
from google.api_core import retry   
from google.api_core.exceptions import ResourceExhausted
from app.schemas.recipe import RecipeOutput
from dotenv import load_dotenv, find_dotenv
from typing import List

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel(
    model_name = "models/gemini-3.6-flash", 
    generation_config={
        "response_mime_type" : "application/json", 
        "temperature" : 1.0
    }
)

def generate_output(prompt: str) -> RecipeOutput:
    for i in range(3):
        try:
            print(f"Gemini attempt {i + 1}/3")

            response = model.generate_content(
                prompt,
                request_options={"retry": None}
            )

            data = json.loads(response.text)
            return RecipeOutput(**data)

        except Exception as e:
            print(f"Attempt {i + 1} failed: {type(e).__name__}: {e}")

            # Don't retry if the daily quota is exhausted
            if isinstance(e, ResourceExhausted):
                print("Gemini quota/rate limit error.")
                raise

            if i == 2:
                raise RuntimeError(
                    "Gemini failed after 3 attempts."
                ) from e

            time.sleep(2 ** i)  # Wait 1s, then 2s

    raise RuntimeError("Gemini failed after 3 attempts.")