import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPantry, deletePantryItem, updatePantryItem } from '../api/pantry';
import type { PantryItem } from '../types';
import {
  Trash2,
  Edit2,
  Calendar,
  Layers,
  Scale,
  Loader2,
  AlertCircle,
  Sparkles,
  Check,
  X,
  Search,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';
import { Link } from 'react-router-dom';

type SortKey = 'name' | 'expiry_asc' | 'expiry_desc' | 'qty_desc';
type FilterKey = 'all' | 'expiring' | 'expired' | 'fresh';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'expiry_asc', label: 'Expiry: Soonest first' },
  { value: 'expiry_desc', label: 'Expiry: Latest first' },
  { value: 'name', label: 'Name: A → Z' },
  { value: 'qty_desc', label: 'Quantity: High → Low' },
];

const FILTER_OPTIONS: { value: FilterKey; label: string; color: string }[] = [
  { value: 'all', label: 'All', color: 'text-slate-300 border-slate-700 hover:border-slate-500' },
  { value: 'expiring', label: 'Expiring (≤3d)', color: 'text-amber-400 border-amber-500/30 hover:border-amber-500/60' },
  { value: 'expired', label: 'Expired', color: 'text-rose-400 border-rose-500/30 hover:border-rose-500/60' },
  { value: 'fresh', label: 'Fresh (>7d)', color: 'text-emerald-400 border-emerald-500/30 hover:border-emerald-500/60' },
];

const UNITS = ['g', 'kg', 'ml', 'l', 'cup', 'tbsp', 'tsp', 'piece'];

export const PantryList: React.FC = () => {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editQty, setEditQty] = useState<number>(0);
  const [editUnit, setEditUnit] = useState<string>('g');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('expiry_asc');
  const [filterKey, setFilterKey] = useState<FilterKey>('all');
  const [showControls, setShowControls] = useState(false);
  const [isClearingAll, setIsClearingAll] = useState(false);

  const { data: items, isLoading, error } = useQuery<PantryItem[]>({
    queryKey: ['pantry-items'],
    queryFn: getPantry,
  });

  // Derived + filtered + sorted list
  const displayedItems = useMemo(() => {
    if (!items) return [];
    let result = [...items];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((i) => i.name.toLowerCase().includes(q));
    }

    // Status filter
    result = result.filter((i) => {
      if (filterKey === 'expiring') return i.days_until_expiry >= 0 && i.days_until_expiry <= 3;
      if (filterKey === 'expired') return i.days_until_expiry < 0;
      if (filterKey === 'fresh') return i.days_until_expiry > 7;
      return true;
    });

    // Sort
    result.sort((a, b) => {
      if (sortKey === 'name') return a.name.localeCompare(b.name);
      if (sortKey === 'expiry_asc') return a.days_until_expiry - b.days_until_expiry;
      if (sortKey === 'expiry_desc') return b.days_until_expiry - a.days_until_expiry;
      if (sortKey === 'qty_desc') return b.quantity_raw - a.quantity_raw;
      return 0;
    });

    return result;
  }, [items, search, sortKey, filterKey]);

  // Optimistic Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deletePantryItem(id),
    onMutate: async (deletedId: number) => {
      setDeleteError(null);
      await queryClient.cancelQueries({ queryKey: ['pantry-items'] });
      const previousItems = queryClient.getQueryData<PantryItem[]>(['pantry-items']);
      queryClient.setQueryData<PantryItem[]>(['pantry-items'], (old) =>
        old ? old.filter((item) => item.id !== deletedId) : []
      );
      return { previousItems };
    },
    onError: (err: any, _variables, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(['pantry-items'], context.previousItems);
      }
      setDeleteError(err.response?.data?.detail || 'Failed to delete item. Rolled back.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['pantry-items'] });
      queryClient.invalidateQueries({ queryKey: ['expiring-items'] });
    },
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, qty, unit }: { id: number; qty: number; unit: string }) =>
      updatePantryItem(id, { quantity_raw: qty, unit_raw: unit }),
    onSuccess: () => {
      setEditingId(null);
      queryClient.invalidateQueries({ queryKey: ['pantry-items'] });
      queryClient.invalidateQueries({ queryKey: ['expiring-items'] });
    },
  });

  const handleStartEdit = (item: PantryItem) => {
    setEditingId(item.id);
    setEditQty(item.quantity_raw);
    setEditUnit(item.unit_raw);
  };

  const handleSaveEdit = (id: number) => {
    if (editQty <= 0) return;
    updateMutation.mutate({ id, qty: editQty, unit: editUnit });
  };

  const handleClearAll = async () => {
    if (!items?.length || isClearingAll) return;
    const confirmed = window.confirm(`Delete all ${items.length} pantry items? This cannot be undone.`);
    if (!confirmed) return;

    setIsClearingAll(true);
    setDeleteError(null);
    try {
      await Promise.all(items.map((item) => deletePantryItem(item.id)));
      queryClient.setQueryData<PantryItem[]>(['pantry-items'], []);
      queryClient.invalidateQueries({ queryKey: ['pantry-items'] });
      queryClient.invalidateQueries({ queryKey: ['expiring-items'] });
    } catch (err: any) {
      setDeleteError(err.response?.data?.detail || 'Some pantry items could not be deleted.');
      queryClient.invalidateQueries({ queryKey: ['pantry-items'] });
    } finally {
      setIsClearingAll(false);
    }
  };

  const getExpiryBadge = (days: number) => {
    if (days < 0) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
          Expired ({Math.abs(days)}d ago)
        </span>
      );
    }
    if (days === 0) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
          Expires TODAY
        </span>
      );
    }
    if (days <= 3) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
          {days} {days === 1 ? 'day' : 'days'} left
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        {days} days left
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="glass-panel p-12 rounded-2xl border border-franken-border text-center flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-franken-neon animate-spin" />
        <p className="text-sm text-slate-400">Scanning pantry inventory…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel p-6 rounded-2xl border border-rose-500/30 bg-rose-950/20 text-center text-rose-300">
        <AlertCircle className="w-6 h-6 mx-auto mb-2 text-rose-400" />
        <p className="text-sm font-semibold">Failed to load pantry inventory.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Toolbar ────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-franken-neon" />
            <h3 className="text-lg font-bold text-white">
              Current Stock{' '}
              <span className="text-slate-500 font-normal text-base">
                ({displayedItems.length}/{items?.length ?? 0})
              </span>
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {items && items.length > 0 && (
              <Link
                to="/generate"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold transition-all hover:scale-105"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Cook with these</span>
              </Link>
            )}
            {items && items.length > 0 && (
              <button
                onClick={handleClearAll}
                disabled={isClearingAll}
                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 px-3.5 py-1.5 text-xs font-semibold text-rose-300 transition-colors hover:border-rose-400/60 hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{isClearingAll ? 'Clearing...' : 'Clear all'}</span>
              </button>
            )}
            <button
              onClick={() => setShowControls((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                showControls
                  ? 'bg-emerald-500/20 text-franken-neon border-emerald-500/30'
                  : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filter &amp; Sort</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showControls ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Expandable controls panel */}
        {showControls && (
          <div className="glass-panel p-4 rounded-xl border border-franken-border animate-slide-down space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-900/90 border border-franken-border text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Filter tabs */}
              <div className="flex flex-wrap gap-1.5">
                {FILTER_OPTIONS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setFilterKey(f.value)}
                    className={`px-3 py-1 rounded-lg border text-xs font-semibold transition-all ${
                      filterKey === f.value
                        ? `bg-slate-800 ${f.color} scale-105`
                        : `bg-transparent text-slate-500 border-slate-800 hover:bg-slate-800/60`
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Sort select */}
              <div className="flex items-center gap-2 ml-auto shrink-0">
                <span className="text-xs text-slate-500 whitespace-nowrap">Sort by:</span>
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value as SortKey)}
                  className="text-xs bg-slate-900 border border-franken-border text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {deleteError && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-slide-down">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{deleteError}</span>
        </div>
      )}

      {/* ── Empty states ──────────────────────────────────────────── */}
      {items && items.length === 0 ? (
        <div className="glass-panel p-10 rounded-2xl border border-dashed border-slate-700 text-center animate-fade-in">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-500">
            <Layers className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-slate-300 mb-1">Your pantry is empty</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            Add a few ingredients above to start building your inventory.
          </p>
        </div>
      ) : displayedItems.length === 0 ? (
        <div className="glass-panel p-8 rounded-2xl border border-dashed border-slate-700 text-center animate-fade-in">
          <Search className="w-8 h-8 mx-auto mb-2 text-slate-600" />
          <p className="text-sm text-slate-400">No items match your filters.</p>
          <button
            onClick={() => { setSearch(''); setFilterKey('all'); }}
            className="mt-3 text-xs text-franken-neon hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        /* ── Grid ── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {displayedItems.map((item) => (
            <div
              key={item.id}
              className="glass-panel p-4 rounded-xl border border-franken-border glass-panel-hover flex flex-col justify-between animate-slide-up"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="text-base font-bold text-white capitalize tracking-tight">
                    {item.name}
                  </h4>
                  {getExpiryBadge(item.days_until_expiry)}
                </div>

                {editingId === item.id ? (
                  <div className="my-2 p-2.5 rounded-lg bg-slate-900 border border-emerald-500/40 space-y-2 animate-scale-in">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="any"
                        value={editQty}
                        onChange={(e) => setEditQty(Number(e.target.value))}
                        className="w-24 px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                      <select
                        value={editUnit}
                        onChange={(e) => setEditUnit(e.target.value)}
                        className="flex-1 px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                      >
                        {UNITS.map((u) => (
                          <option key={u} value={u}>{u}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => handleSaveEdit(item.id)}
                        disabled={updateMutation.isPending}
                        className="px-2.5 py-1 bg-emerald-500 text-slate-900 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-emerald-400 transition-colors"
                      >
                        {updateMutation.isPending ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Check className="w-3 h-3" />
                        )}
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-2.5 py-1 bg-slate-800 text-slate-400 rounded-lg text-xs hover:text-white transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5 my-3 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <Scale className="w-3.5 h-3.5 text-franken-neon shrink-0" />
                      <span className="font-semibold text-white">
                        {item.quantity_raw} {item.unit_raw}
                      </span>
                      {item.quantity_normalised > 0 && (
                        <span className="text-[11px] text-slate-500">
                          ({item.quantity_normalised.toFixed(1)} g norm.)
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>Expires: {item.expiration_date}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-3 mt-2 border-t border-slate-800/80 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleStartEdit(item)}
                  title="Edit quantity/unit"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteMutation.mutate(item.id)}
                  disabled={deleteMutation.isPending}
                  title="Delete from pantry"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
