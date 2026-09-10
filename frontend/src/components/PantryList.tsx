import React, { useState } from 'react';
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
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const PantryList: React.FC = () => {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editQty, setEditQty] = useState<number>(0);
  const [editUnit, setEditUnit] = useState<string>('g');
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { data: items, isLoading, error } = useQuery<PantryItem[]>({
    queryKey: ['pantry-items'],
    queryFn: getPantry,
  });

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
        <p className="text-sm text-slate-400">Scanning pantry inventory...</p>
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-franken-neon" />
          <h3 className="text-lg font-bold text-white">
            Current Stock ({items?.length || 0})
          </h3>
        </div>

        {items && items.length > 0 && (
          <Link
            to="/generate"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold transition-all hover:scale-105"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Cook with these</span>
          </Link>
        )}
      </div>

      {deleteError && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{deleteError}</span>
        </div>
      )}

      {items && items.length === 0 ? (
        <div className="glass-panel p-10 rounded-2xl border border-dashed border-slate-700 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-500">
            <Layers className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-slate-300 mb-1">Your pantry is empty</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            Add ingredients above (or run backend seeder) so the Frankenstein generator can construct monster recipes.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items?.map((item) => (
            <div
              key={item.id}
              className="glass-panel p-4 rounded-xl border border-franken-border glass-panel-hover flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="text-base font-bold text-white capitalize tracking-tight">
                    {item.name}
                  </h4>
                  {getExpiryBadge(item.days_until_expiry)}
                </div>

                {editingId === item.id ? (
                  <div className="my-2 p-2 rounded-lg bg-slate-900 border border-emerald-500/40 space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="any"
                        value={editQty}
                        onChange={(e) => setEditQty(Number(e.target.value))}
                        className="w-20 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-white"
                      />
                      <input
                        type="text"
                        value={editUnit}
                        onChange={(e) => setEditUnit(e.target.value)}
                        className="w-16 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-white"
                      />
                    </div>
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => handleSaveEdit(item.id)}
                        disabled={updateMutation.isPending}
                        className="px-2 py-1 bg-emerald-500 text-slate-900 rounded text-xs font-bold flex items-center gap-1 hover:bg-emerald-400"
                      >
                        <Check className="w-3 h-3" /> Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-2 py-1 bg-slate-800 text-slate-400 rounded text-xs hover:text-white"
                      >
                        <X className="w-3 h-3" /> Cancel
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
                          (norm: {item.quantity_normalised.toFixed(1)})
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
                  title="Delete from pantry (Optimistic)"
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
