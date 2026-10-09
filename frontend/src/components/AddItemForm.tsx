import React, { useState, useRef, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addPantryItem } from '../api/pantry';
import { PlusCircle, Loader2, Sparkles, AlertCircle, CheckCircle2, Search, ChevronDown } from 'lucide-react';

// ── Ingredient catalogue (frontend-only, keyed by name) ──────────────────────
const INGREDIENT_CATALOGUE: Record<
  string,
  { category: string; defaultUnit: string }
> = {
  // Grains & Flour
  'rice':              { category: 'Grains & Flour', defaultUnit: 'g' },
  'basmati rice':      { category: 'Grains & Flour', defaultUnit: 'g' },
  'whole wheat flour': { category: 'Grains & Flour', defaultUnit: 'g' },
  'semolina':          { category: 'Grains & Flour', defaultUnit: 'g' },
  'chickpea flour':    { category: 'Grains & Flour', defaultUnit: 'g' },
  // Legumes
  'red lentils':       { category: 'Legumes', defaultUnit: 'g' },
  'black lentils':     { category: 'Legumes', defaultUnit: 'g' },
  'yellow split peas': { category: 'Legumes', defaultUnit: 'g' },
  'chickpeas':         { category: 'Legumes', defaultUnit: 'g' },
  'kidney beans':      { category: 'Legumes', defaultUnit: 'g' },
  // Vegetables
  'onion':             { category: 'Vegetables', defaultUnit: 'piece' },
  'garlic':            { category: 'Vegetables', defaultUnit: 'piece' },
  'tomato':            { category: 'Vegetables', defaultUnit: 'piece' },
  'potato':            { category: 'Vegetables', defaultUnit: 'piece' },
  'ginger':            { category: 'Vegetables', defaultUnit: 'g' },
  'spinach':           { category: 'Vegetables', defaultUnit: 'g' },
  'cauliflower':       { category: 'Vegetables', defaultUnit: 'g' },
  // Proteins
  'eggs':              { category: 'Protein', defaultUnit: 'piece' },
  'chicken breast':    { category: 'Protein', defaultUnit: 'g' },
  'paneer':            { category: 'Protein', defaultUnit: 'g' },
  // Dairy
  'whole milk':        { category: 'Dairy', defaultUnit: 'ml' },
  'yogurt':            { category: 'Dairy', defaultUnit: 'g' },
  // Fats & Oils
  'mustard oil':       { category: 'Fats & Oils', defaultUnit: 'ml' },
  'ghee':              { category: 'Fats & Oils', defaultUnit: 'tbsp' },
  'coconut oil':       { category: 'Fats & Oils', defaultUnit: 'ml' },
  // Spices
  'turmeric powder':   { category: 'Spices', defaultUnit: 'tsp' },
  'cumin seeds':       { category: 'Spices', defaultUnit: 'tsp' },
  'coriander powder':  { category: 'Spices', defaultUnit: 'tsp' },
  'red chili powder':  { category: 'Spices', defaultUnit: 'tsp' },
  'garam masala':      { category: 'Spices', defaultUnit: 'tsp' },
};

const INGREDIENT_NAMES = Object.keys(INGREDIENT_CATALOGUE).sort();

const CATEGORIES = Array.from(
  new Set(Object.values(INGREDIENT_CATALOGUE).map((v) => v.category))
).sort();

const UNITS_BY_TYPE = [
  { label: 'Weight', options: [{ label: 'Grams (g)', value: 'g' }, { label: 'Kilograms (kg)', value: 'kg' }] },
  { label: 'Volume', options: [{ label: 'Milliliters (ml)', value: 'ml' }, { label: 'Liters (l)', value: 'l' }, { label: 'Cups', value: 'cup' }, { label: 'Tablespoons (tbsp)', value: 'tbsp' }, { label: 'Teaspoons (tsp)', value: 'tsp' }] },
  { label: 'Count', options: [{ label: 'Pieces (count)', value: 'piece' }] },
];

// ── Smart default quantity per unit ─────────────────────────────────────────
const DEFAULT_QTY: Record<string, number> = {
  g: 200, kg: 1, ml: 200, l: 1, cup: 2, tbsp: 4, tsp: 2, piece: 4,
};

export const AddItemForm: React.FC = () => {
  const queryClient = useQueryClient();

  const getDefaultExpiry = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  };

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState<number | ''>(200);
  const [unit, setUnit] = useState('g');
  const [expiry, setExpiry] = useState(getDefaultExpiry());
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Focus search when dropdown opens
  useEffect(() => {
    if (dropdownOpen && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [dropdownOpen]);

  const handleSelectIngredient = (ingredientName: string) => {
    setName(ingredientName);
    const meta = INGREDIENT_CATALOGUE[ingredientName];
    if (meta) {
      setUnit(meta.defaultUnit);
      setQuantity(DEFAULT_QTY[meta.defaultUnit] ?? 200);
    }
    setDropdownOpen(false);
    setSearchQuery('');
  };

  const filteredIngredients = INGREDIENT_NAMES.filter((n) => {
    const matchSearch = n.includes(searchQuery.toLowerCase());
    const matchCategory = activeCategory === 'All' || INGREDIENT_CATALOGUE[n]?.category === activeCategory;
    return matchSearch && matchCategory;
  });

  const addMutation = useMutation({
    mutationFn: addPantryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pantry-items'] });
      queryClient.invalidateQueries({ queryKey: ['expiring-items'] });
      setName('');
      setQuantity(200);
      setUnit('g');
      setExpiry(getDefaultExpiry());
      setError(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    },
    onError: (err: any) => {
      const msg =
        err.response?.data?.detail ||
        'Failed to add item. Make sure the ingredient name exactly matches a known ingredient.';
      setError(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please select or type an ingredient name.');
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

  const categoryMeta: Record<string, string> = {
    All: 'All', 'Grains & Flour': 'Grains', Legumes: 'Legumes', Vegetables: 'Vegetables',
    Protein: 'Protein', Dairy: 'Dairy', 'Fats & Oils': 'Fats', Spices: 'Spices',
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-franken-border shadow-xl mb-8 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-franken-neon border border-emerald-500/20">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Add Pantry Ingredient</h2>
            <p className="text-[11px] text-slate-500">
              Register provisions into your laboratory inventory
            </p>
          </div>
        </div>

        {success && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-semibold animate-scale-in border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Stocked!</span>
          </div>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-slide-down">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
        {/* ── Ingredient Picker ────────────────────────────────── */}
        <div className="lg:col-span-2 relative" ref={dropdownRef}>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Ingredient Name
          </label>

          {/* Trigger input */}
          <button
            type="button"
            onClick={() => setDropdownOpen((o) => !o)}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-900/90 border border-franken-border text-sm focus:outline-none focus:border-emerald-500 hover:border-slate-600 transition-colors"
          >
            <span className={name ? 'text-white capitalize' : 'text-slate-500'}>
              {name || 'Select or type an ingredient…'}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Dropdown panel */}
          {dropdownOpen && (
            <div className="absolute z-50 top-full mt-1.5 left-0 right-0 glass-panel rounded-xl border border-franken-border shadow-2xl shadow-black/60 overflow-hidden animate-slide-down">
              {/* Search */}
              <div className="p-2 border-b border-franken-border">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    ref={searchRef}
                    type="text"
                    placeholder="Search ingredients…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-900 rounded-lg text-xs text-white placeholder-slate-500 border border-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Category tabs */}
              <div className="flex gap-1 p-2 border-b border-franken-border overflow-x-auto no-scrollbar">
                {['All', ...CATEGORIES].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                      activeCategory === cat
                        ? 'bg-emerald-500/20 text-franken-neon border border-emerald-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <span>{categoryMeta[cat] ?? '•'}</span>
                    <span>{cat}</span>
                  </button>
                ))}
              </div>

              {/* Ingredient list */}
              <ul className="max-h-48 overflow-y-auto py-1">
                {filteredIngredients.length === 0 ? (
                  <li className="px-4 py-3 text-xs text-slate-500 text-center">
                    No matches. You can still type a custom name.
                  </li>
                ) : (
                  filteredIngredients.map((ing) => (
                    <li key={ing}>
                      <button
                        type="button"
                        onClick={() => handleSelectIngredient(ing)}
                        className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-emerald-500/10 hover:text-franken-neon transition-colors flex items-center justify-between"
                      >
                        <span className="capitalize">{ing}</span>
                        <span className="text-[10px] text-slate-500">
                          {INGREDIENT_CATALOGUE[ing]?.defaultUnit}
                        </span>
                      </button>
                    </li>
                  ))
                )}
              </ul>

              {/* Manual entry option */}
              {searchQuery && !INGREDIENT_NAMES.includes(searchQuery) && (
                <div className="border-t border-franken-border p-2">
                  <button
                    type="button"
                    onClick={() => {
                      setName(searchQuery);
                      setDropdownOpen(false);
                      setSearchQuery('');
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs text-amber-300 hover:bg-amber-500/10 transition-colors flex items-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Use custom name: "<strong>{searchQuery}</strong>"</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Quantity ─────────────────────────────────────────── */}
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
            className="w-full px-3.5 py-2 rounded-xl bg-slate-900/90 border border-franken-border text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 transition-colors"
          />
        </div>

        {/* ── Unit ─────────────────────────────────────────────── */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Unit
          </label>
          <select
            value={unit}
            onChange={(e) => {
              setUnit(e.target.value);
              setQuantity(DEFAULT_QTY[e.target.value] ?? 200);
            }}
            className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-franken-border text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 transition-colors"
          >
            {UNITS_BY_TYPE.map((group) => (
              <optgroup key={group.label} label={`── ${group.label} ──`}>
                {group.options.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* ── Expiry Date ───────────────────────────────────────── */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Expiration Date
          </label>
          <input
            type="date"
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
            required
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-franken-border text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 transition-colors"
          />
        </div>

        {/* ── Submit ───────────────────────────────────────────── */}
        <div className="sm:col-span-2 lg:col-span-5 flex justify-end mt-1">
          <button
            type="submit"
            disabled={addMutation.isPending}
            className="primary-action flex w-full items-center justify-center gap-2 rounded-lg px-6 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {addMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Storing in Pantry…</span>
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
