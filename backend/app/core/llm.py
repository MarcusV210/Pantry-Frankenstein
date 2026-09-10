import os 
import json 
import hashlib
import google.generativeai as genai 
from app.schemas.recipe import RecipeOutput
from dotenv import load_dotenv, find_dotenv
from typing import List
from google.api_core import retry as api_retry

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel(
    model_name = "models/gemini-3.8-flash", 
    generation_config={
        "response_mime_type" : "application/json", 
        "temperature" : 1.0
    }
)

def generate_output(prompt: str) -> RecipeOutput:
    response = model.generate_content(
        prompt, 
        request_options={"retry" : api_retry.Retry(maximum=0)}
    )

    try: 
        data = json.loads(response.text)
        return RecipeOutput(**data)  # unpack data in recipe output class, pydantic auto-validates
    except json.JSONDecodeError as e:
        raise ValueError(f"Gemini returned invalid structure. Expected : JSON. Error : {e}")
    except Exception as e: 
        raise ValueError(f"Unknown error : {e}")
