export interface User {
  email: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface PantryItem {
  id: number;
  name: string;
  quantity_raw: number;
  unit_raw: string;
  quantity_normalised: number;
  expiration_date: string;
  days_until_expiry: number;
}

export interface PantryItemCreate {
  name: string;
  quantity_raw: number;
  unit_raw: string;
  expiry: string;
}

export interface PantryItemUpdate {
  quantity_raw: number;
  unit_raw: string;
}

export interface IngredientUsed {
  name: string;
  quantity: string;
  unit: string;
}

export interface Recipe {
  id?: number;
  recipe_name: string;
  pantry_items_used: IngredientUsed[];
  missing_ingredients_needed: IngredientUsed[];
  instructions: string[];
  estimated_cook_time_minutes: number;
  chaos_level?: number;
}

export interface RecipeHistoryItem {
  id: number;
  recipe_name: string;
  pantry_items_used: IngredientUsed[];
  missing_ingredients_needed: IngredientUsed[];
  instructions: string[];
  chaos_level: number;
}
