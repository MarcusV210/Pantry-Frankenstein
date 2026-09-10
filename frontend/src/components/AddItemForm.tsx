import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addPantryItem } from '../api/pantry';
import { PlusCircle, Loader2, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

const COMMON_INGREDIENTS = [
  'rice', 'basmati rice', 'whole wheat flour', 'semolina', 'chickpea flour',
  'red lentils', 'black lentils', 'yellow split peas', 'chickpeas', 'kidney beans',
  'onion', 'garlic', 'tomato', 'potato', 'ginger', 'spinach', 'cauliflower',
  'eggs', 'chicken breast', 'paneer', 'whole milk', 'yogurt',
  'mustard oil', 'ghee', 'coconut oil',
  'turmeric powder', 'cumin seeds', 'coriander powder', 'red chili powder', 'garam masala'
];

const COMMON_UNITS = [
  { label: 'Grams (g)', value: 'g' },
  { label: 'Kilograms (kg)', value: 'kg' },
  { label: 'Milliliters (ml)', value: 'ml' },
  { label: 'Liters (l)', value: 'l' },
  { label: 'Cups', value: 'cup' },
  { label: 'Tablespoons (tbsp)', value: 'tbsp' },
  { label: 'Teaspoons (tsp)', value: 'tsp' },
  { label: 'Pieces (count)', value: 'piece' },
];

export const AddItemForm: React.FC = () => {
  const queryClient = useQueryClient();

  // Default expiry date: 7 days from now formatted YYYY-MM-DD
  const getDefaultExpiry = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  };

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState<number | ''>(500);
  const [unit, setUnit] = useState('g');
  const [expiry, setExpiry] = useState(getDefaultExpiry());
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const addMutation = useMutation({
    mutationFn: addPantryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pantry-items'] });
      queryClient.invalidateQueries({ queryKey: ['expiring-items'] });
      setName('');
      setQuantity(500);
      setUnit('g');
      setExpiry(getDefaultExpiry());
      setError(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.detail || 'Failed to add item. Check ingredient name and units.';
      setError(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please provide an ingredient name.');
      return;
    }

    if (!quantity || Number(quantity) <= 0) {
      setError('Quantity must be greater than 0.');
      return;
    }

    addMutation.mutate({
      name: name.trim().toLowerCase(),
      quantity_raw: Number(quantity),
      unit_raw: unit,
      expiry,
    });
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-franken-border shadow-xl mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-franken-neon">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Add Pantry Ingredient</h2>
            <p className="text-xs text-slate-400">
              Register provisions into your laboratory inventory
            </p>
          </div>
        </div>

        {success && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-semibold animate-fade-in border border-emerald-500/30">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Stocked!</span>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Name input with suggestions */}
        <div className="lg:col-span-2">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Ingredient Name
          </label>
          <input
            type="text"
            list="ingredient-suggestions"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. rice, onion, paneer..."
            required
            className="w-full px-3.5 py-2 rounded-xl bg-slate-900/90 border border-franken-border text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
          <datalist id="ingredient-suggestions">
            {COMMON_INGREDIENTS.map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
        </div>

        {/* Quantity input */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Quantity
          </label>
          <input
            type="number"
            step="any"
            min="0.01"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="e.g. 500"
            required
            className="w-full px-3.5 py-2 rounded-xl bg-slate-900/90 border border-franken-border text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* Unit selector */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Unit
          </label>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-franken-border text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          >
            {COMMON_UNITS.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>
        </div>

        {/* Expiry Date */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Expiration Date
          </label>
          <input
            type="date"
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-franken-border text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* Submit button */}
        <div className="sm:col-span-2 lg:col-span-5 flex justify-end mt-1">
          <button
            type="submit"
            disabled={addMutation.isPending}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-500 hover:from-emerald-400 hover:to-lime-400 text-franken-dark font-bold text-sm flex items-center justify-center gap-2 shadow-glow-emerald hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
          >
            {addMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Storing in Pantry...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Add to Pantry</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
