import { apiClient } from './client';
import type { PantryItem, PantryItemCreate, PantryItemUpdate } from '../types';

export const getPantry = async (): Promise<PantryItem[]> => {
  const response = await apiClient.get<PantryItem[]>('/pantry/');
  return response.data;
};

export const getExpiringItems = async (days: number = 3): Promise<PantryItem[]> => {
  const response = await apiClient.get<PantryItem[]>(`/pantry/expiring?days=${days}`);
  return response.data;
};

export const addPantryItem = async (item: PantryItemCreate): Promise<PantryItem> => {
  const response = await apiClient.post<PantryItem>('/pantry/items', item);
  return response.data;
};

export const updatePantryItem = async (
  itemId: number,
  body: PantryItemUpdate
): Promise<PantryItem> => {
  const response = await apiClient.patch<PantryItem>(`/pantry/items/${itemId}`, body);
  return response.data;
};

export const deletePantryItem = async (itemId: number): Promise<{ message: string }> => {
  const response = await apiClient.delete<{ message: string }>(`/pantry/items/${itemId}`);
  return response.data;
};
