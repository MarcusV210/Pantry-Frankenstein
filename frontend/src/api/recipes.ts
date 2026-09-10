import { apiClient } from './client';
import type { IngredientUsed, Recipe, RecipeHistoryItem } from '../types';

export const generateRecipe = async (
  chaos_level: number = 1,
  days_expiring: number = 3
): Promise<Recipe> => {
  const response = await apiClient.post<Recipe>('/recipes/generate', {
    chaos_level,
    days_expiring,
  });
  return response.data;
};

export const markRecipeCooked = async (
  pantry_items_used: IngredientUsed[]
): Promise<{ message: string }> => {
  const response = await apiClient.post<{ message: string }>('/recipes/cooked', {
    pantry_items_used,
  });
  return response.data;
};

export const getRecipeHistory = async (): Promise<RecipeHistoryItem[]> => {
  const response = await apiClient.get<RecipeHistoryItem[]>('/recipes/');
  return response.data;
};
