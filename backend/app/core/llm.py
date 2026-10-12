import json
import os
import time

from dotenv import load_dotenv
# pyrefly: ignore [missing-import]
from groq import BadRequestError, Groq, RateLimitError
from pydantic import ValidationError

from app.schemas.recipe import RecipeOutput

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

MODEL = "openai/gpt-oss-20b"

SYSTEM_PROMPT = """
You are a recipe generation assistant.

Return only a valid JSON object with exactly these fields:
{
    "recipe_name": "string",
    "pantry_items_used": [
        {"name": "string", "quantity": "string", "unit": "string"}
    ],
    "missing_ingredients_needed": [
        {"name": "string", "quantity": "string", "unit": "string"}
    ],
    "instructions": ["string"],
    "estimated_cook_time_minutes": 0
}

Requirements:
- Include every required field.
- Both ingredient fields must be lists of objects.
- Every ingredient object must contain name, quantity, and unit.
- instructions must be a list of cooking steps.
- estimated_cook_time_minutes must be an integer.
- Use empty lists when there are no ingredients in a category.
- Do not add extra fields.
- Do not include Markdown or code fences.
"""


def generate_output(prompt: str) -> RecipeOutput:
    current_prompt = prompt

    for attempt in range(1, 4):
        try:
            print(f"Groq attempt {attempt}/3")

            response = client.chat.completions.create(
                model=MODEL,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": current_prompt},
                ],
                response_format={"type": "json_object"},
                temperature=0.7,
                max_tokens=1500,
            )

            content = response.choices[0].message.content

            if not content:
                raise ValueError("Groq returned an empty response.")

            data = json.loads(content)
            return RecipeOutput.model_validate(data)

        except (BadRequestError, RateLimitError):
            raise

        except (json.JSONDecodeError, ValidationError, ValueError) as e:
            print(f"Attempt {attempt}/3: Invalid output: {e}")

            if attempt == 3:
                raise RuntimeError(
                    "Groq returned invalid output after 3 attempts."
                ) from e

            current_prompt = (
                f"{prompt}\n\n"
                "CORRECTION: Your previous response was invalid. "
                "Return a complete JSON object matching every field "
                "and type specified in the system instructions. "
                f"Validation error: {e}"
            )

            time.sleep(2 ** (attempt - 1))

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