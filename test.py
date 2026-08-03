# pyrefly: ignore [missing-import]
import google.generativeai as genai

import os
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

for model in genai.list_models():
    print(model.name, "|", model.supported_generation_methods)