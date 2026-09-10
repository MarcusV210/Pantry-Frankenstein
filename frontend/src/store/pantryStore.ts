import { create } from 'zustand';
import type { PantryItem } from '../types';

interface PantryState {
  items: PantryItem[];
  setItems: (items: PantryItem[]) => void;
  optimisticRemove: (id: number) => () => void;
  optimisticAdd: (item: PantryItem) => () => void;
  optimisticUpdate: (id: number, partial: Partial<PantryItem>) => () => void;
}

export const usePantryStore = create<PantryState>((set, get) => ({
  items: [],
  setItems: (items) => set({ items }),

  optimisticRemove: (id: number) => {
    const previousItems = get().items;
    set({ items: previousItems.filter((item) => item.id !== id) });
    // Returns rollback function
    return () => set({ items: previousItems });
  },

  optimisticAdd: (item: PantryItem) => {
    const previousItems = get().items;
    set({ items: [item, ...previousItems] });
    // Returns rollback function
    return () => set({ items: previousItems });
  },

  optimisticUpdate: (id: number, partial: Partial<PantryItem>) => {
    const previousItems = get().items;
    set({
      items: previousItems.map((item) => (item.id === id ? { ...item, ...partial } : item)),
    });
    // Returns rollback function
    return () => set({ items: previousItems });
  },
}));
