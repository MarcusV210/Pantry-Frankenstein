import json
import os
import time
from dotenv import load_dotenv
# pyrefly: ignore [missing-import]
from groq import Groq
from app.schemas.recipe import RecipeOutput

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def generate_output(prompt: str) -> RecipeOutput:
    for attempt in range(1, 4):
        try:
            print(f"Groq attempt {attempt}/3")

            response = client.chat.completions.create(
                model="openai/gpt-oss-20b",
                messages=[
                    {
                        "role":"system",
                        "content":("You are a recipe generation assistant. "
                                    "Return only valid JSON. "
                                    "Do not include markdown, code fences, or explanations. "
                                    "The response must be a JSON object."
                                ),
                    },
                    {
                        "role":"user",
                        "content":prompt  
                    }
                ],
                response_format={"type": "json_object"},
                temperature=1.0,
                max_tokens=1500,
            )

            content = response.choices[0].message.content

            if not content:
                raise ValueError("Groq returned an empty response.")

            data = json.loads(content)
            return RecipeOutput(**data)

        except Exception as e:
            print(
                f"Attempt {attempt}/3 failed: "
                f"{type(e).__name__}: {e}"
            )

            if attempt == 3:
                raise RuntimeError(
                    "Groq failed after 3 attempts."
                ) from e

            time.sleep(2 ** (attempt - 1))

    raise RuntimeError("Groq failed after 3 attempts.")