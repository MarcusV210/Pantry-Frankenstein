def build_recipe_prompt(pantry_items: list, expiring_soon: list, chaos_level: int = 1) -> str:

    # Format all pantry items
    pantry_lines = "\n".join([
        f"- {item['name']}: {item['quantity_raw']} {item['unit_raw']} ({item['quantity_normalised']}g normalised)"
        for item in pantry_items
    ])

    # Format expiring items
    expiring_lines = "\n".join([
        f"- {item['name']} (expires in {item['days_until_expiry']} days)"
        for item in expiring_soon[:3]
    ])

    chaos_profiles = {
        1: {
            "persona": "a seasoned home cook with 20 years of experience cooking traditional Indian meals for family. You deeply respect classic techniques, balanced spices, and comforting flavors that feel like home.",
            "style": "Stick to traditional, time-tested recipes. Use familiar spice profiles, conventional cooking methods, and combinations that any Indian household would recognize and love. No surprises."
        },
        2: {
            "persona": "a professional chef with 15 years of experience across Indian regional cuisines. You have a deep understanding of how flavors interact and occasionally enjoy giving classic dishes a thoughtful modern twist.",
            "style": "Mostly traditional but with one or two subtle innovations — a different tempering technique, an unexpected spice pairing, or a regional variation the user may not have tried. Keep it approachable."
        },
        3: {
            "persona": "an executive chef with 12 years of experience in modern Indian cuisine, trained under Michelin-starred mentors. You treat cooking as a craft and love elevating everyday ingredients into something memorable.",
            "style": "Creative and confident. Blend techniques from different Indian regions, experiment with textures, and build layers of flavor. The dish should feel elevated but still rooted in Indian culinary tradition."
        },
        4: {
            "persona": "a culinary innovator with 10 years of experience in Indian fusion cuisine, having worked in kitchens across India, Southeast Asia, and the Middle East. You see ingredients as a canvas.",
            "style": "Bold and fusion-forward. Cross culinary borders freely — combine Indian spice profiles with techniques or ingredients from other cuisines. Unexpected pairings are welcome as long as the logic is sound and the result is delicious."
        },
        5: {
            "persona": "a rogue experimental chef with 8 years of experience deliberately breaking culinary rules. You have a deep technical understanding of food science and use it to create dishes that surprise, challenge, and delight.",
            "style": "Completely unconventional. Deconstruct familiar dishes, subvert expectations, combine ingredients that have no business being together but somehow work. Prioritize creativity and novelty above all else. The weirder the better — as long as it's edible."
        }
    }

    profile = chaos_profiles.get(chaos_level, chaos_profiles[1])

    prompt = f"""
        You are {profile['persona']}.

        A user has given you access to their pantry inventory and needs you to generate a recipe using what they have.

        FULL PANTRY INVENTORY:
        {pantry_lines}

        HARD CONSTRAINT — The following ingredients are expiring soon. You MUST use ALL of them in the recipe. This is non-negotiable:
        {expiring_lines}

        You may use other ingredients from the pantry as supporting elements, but the expiring items above must be the stars of the dish.

        RECIPE STYLE DIRECTIVE:
        {profile['style']}

        RULES:
        - If the pantry does not have enough of an ingredient, list it under missing_ingredients_needed
        - Be specific with quantities and units in instructions
        - Instructions should be clear enough for someone cooking at home to follow step by step
        - estimated_cook_time_minutes should include prep time
        - Only list an ingredient as missing if it does not appear in the pantry inventory above

        Return ONLY a valid JSON object with exactly this structure. No markdown, no code blocks, no explanation before or after:
        {{
            "recipe_name": "string",
            "pantry_items_used": [
                {{"name": "string", "quantity": "string", "unit": "string"}}
            ],
            "missing_ingredients_needed": [
                {{"name": "string", "quantity": "string", "unit": "string"}}
            ],
            "instructions": [
                "string"
            ],
            "estimated_cook_time_minutes": 0
        }}
        """
    return prompt.strip()

prompt = build_recipe_prompt(
    pantry_items=[
  {
    "id": 2,
    "name": "kidney beans",
    "quantity_raw": 2,
    "unit_raw": "cups",
    "quantity_normalised": 392.7364725899999,
    "expiration_date": "2026-09-15",
    "days_until_expiry": 9
  },
  {
    "id": 3,
    "name": "whole milk",
    "quantity_raw": 6,
    "unit_raw": "cups",
    "quantity_normalised": 1462.1153015699995,
    "expiration_date": "2026-09-07",
    "days_until_expiry": 1
  },
  {
    "id": 4,
    "name": "rice",
    "quantity_raw": 2,
    "unit_raw": "cups",
    "quantity_normalised": 402.2000020499999,
    "expiration_date": "2026-12-01",
    "days_until_expiry": 86
  },
  {
    "id": 5,
    "name": "rice",
    "quantity_raw": 1,
    "unit_raw": "cup",
    "quantity_normalised": 201.10000102499995,
    "expiration_date": "2026-12-01",
    "days_until_expiry": 86
  },
  {
    "id": 7,
    "name": "rice",
    "quantity_raw": 2,
    "unit_raw": "cups",
    "quantity_normalised": 402.2000020499999,
    "expiration_date": "2026-12-01",
    "days_until_expiry": 86
  },
  {
    "id": 8,
    "name": "rice",
    "quantity_raw": 1,
    "unit_raw": "cup",
    "quantity_normalised": 201.10000102499995,
    "expiration_date": "2026-12-01",
    "days_until_expiry": 86
  },
  {
    "id": 10,
    "name": "rice",
    "quantity_raw": 2,
    "unit_raw": "cups",
    "quantity_normalised": 402.2000020499999,
    "expiration_date": "2026-12-01",
    "days_until_expiry": 86
  },
  {
    "id": 11,
    "name": "rice",
    "quantity_raw": 1,
    "unit_raw": "cup",
    "quantity_normalised": 201.10000102499995,
    "expiration_date": "2026-12-01",
    "days_until_expiry": 86
  },
  {
    "id": 13,
    "name": "rice",
    "quantity_raw": 2,
    "unit_raw": "cups",
    "quantity_normalised": 402.2000020499999,
    "expiration_date": "2026-12-01",
    "days_until_expiry": 86
  },
  {
    "id": 14,
    "name": "rice",
    "quantity_raw": 3,
    "unit_raw": "cups",
    "quantity_normalised": 603.3000030749997,
    "expiration_date": "2026-12-01",
    "days_until_expiry": 86
  },
  {
    "id": 16,
    "name": "rice",
    "quantity_raw": 2,
    "unit_raw": "cups",
    "quantity_normalised": 402.2000020499999,
    "expiration_date": "2026-12-01",
    "days_until_expiry": 86
  },
  {
    "id": 17,
    "name": "rice",
    "quantity_raw": 3,
    "unit_raw": "cups",
    "quantity_normalised": 603.3000030749997,
    "expiration_date": "2026-12-01",
    "days_until_expiry": 86
  },
  {
    "id": 19,
    "name": "rice",
    "quantity_raw": 2,
    "unit_raw": "cups",
    "quantity_normalised": 402.2000020499999,
    "expiration_date": "2026-12-01",
    "days_until_expiry": 86
  },
  {
    "id": 20,
    "name": "rice",
    "quantity_raw": 3,
    "unit_raw": "cups",
    "quantity_normalised": 603.3000030749997,
    "expiration_date": "2026-12-01",
    "days_until_expiry": 86
  },
  {
    "id": 22,
    "name": "rice",
    "quantity_raw": 2,
    "unit_raw": "cups",
    "quantity_normalised": 402.2000020499999,
    "expiration_date": "2026-12-01",
    "days_until_expiry": 86
  },
  {
    "id": 23,
    "name": "rice",
    "quantity_raw": 3,
    "unit_raw": "cups",
    "quantity_normalised": 603.3000030749997,
    "expiration_date": "2026-12-01",
    "days_until_expiry": 86
  },
  {
    "id": 25,
    "name": "rice",
    "quantity_raw": 2,
    "unit_raw": "cups",
    "quantity_normalised": 402.2000020499999,
    "expiration_date": "2026-12-01",
    "days_until_expiry": 86
  },
  {
    "id": 26,
    "name": "rice",
    "quantity_raw": 3,
    "unit_raw": "cups",
    "quantity_normalised": 603.3000030749997,
    "expiration_date": "2026-12-01",
    "days_until_expiry": 86
  },
  {
    "id": 28,
    "name": "rice",
    "quantity_raw": 2,
    "unit_raw": "cups",
    "quantity_normalised": 402.2000020499999,
    "expiration_date": "2026-12-01",
    "days_until_expiry": 86
  },
  {
    "id": 29,
    "name": "rice",
    "quantity_raw": 3,
    "unit_raw": "cups",
    "quantity_normalised": 603.3000030749997,
    "expiration_date": "2026-12-01",
    "days_until_expiry": 86
  }
],
    expiring_soon=[
  {
    "id": 3,
    "name": "whole milk",
    "quantity_raw": 6,
    "unit_raw": "cups",
    "quantity_normalised": 1462.1153015699995,
    "expiration_date": "2026-09-07",
    "days_until_expiry": 1
  }
],
    chaos_level=3,
)
print(prompt)