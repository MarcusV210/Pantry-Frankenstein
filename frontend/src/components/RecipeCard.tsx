import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { markRecipeCooked } from '../api/recipes';
import type { Recipe } from '../types';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Utensils,
  ChefHat,
  Loader2,
  Sparkles,
  Layers,
} from 'lucide-react';

interface RecipeCardProps {
  recipe: Recipe;
  onCookedSuccess?: () => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onCookedSuccess }) => {
  const queryClient = useQueryClient();
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isCooked, setIsCooked] = useState(false);

  const cookedMutation = useMutation({
    mutationFn: () => markRecipeCooked(recipe.pantry_items_used),
    onSuccess: () => {
      setIsCooked(true);
      queryClient.invalidateQueries({ queryKey: ['pantry-items'] });
      queryClient.invalidateQueries({ queryKey: ['expiring-items'] });
      if (onCookedSuccess) {
        onCookedSuccess();
      }
    },
  });

  const toggleStep = (index: number) => {
    setCompletedSteps((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <div className="glass-panel rounded-2xl border border-franken-border shadow-2xl overflow-hidden animate-fade-in">
      {/* Recipe Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-purple-950/40 to-slate-900 p-6 border-b border-franken-border">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-franken-neon border border-emerald-500/30">
                Synthesized Meal
              </span>
              {recipe.chaos_level && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Chaos Level {recipe.chaos_level}/5
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {recipe.recipe_name}
            </h2>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-franken-border text-slate-200">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold">
              {recipe.estimated_cook_time_minutes || 20} mins prep & cook
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Ingredients Grid: Pantry vs Missing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pantry Ingredients Used */}
          <div className="p-4 rounded-xl bg-emerald-950/15 border border-emerald-500/25">
            <div className="flex items-center gap-2 mb-3 text-emerald-400 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <h4>Pantry Provisions Used ({recipe.pantry_items_used?.length || 0})</h4>
            </div>
            <ul className="space-y-2">
              {recipe.pantry_items_used?.map((ing, idx) => (
                <li
                  key={idx}
                  className="flex items-center justify-between text-xs text-slate-300 bg-slate-900/60 px-3 py-2 rounded-lg border border-slate-800"
                >
                  <span className="capitalize font-medium text-white">{ing.name}</span>
                  <span className="font-mono text-emerald-400">
                    {ing.quantity} {ing.unit}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Missing Ingredients */}
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
            <div className="flex items-center gap-2 mb-3 text-amber-400 font-bold text-sm">
              <AlertTriangle className="w-4 h-4" />
              <h4>
                Extra Staples Needed (
                {recipe.missing_ingredients_needed?.length || 0})
              </h4>
            </div>
            {recipe.missing_ingredients_needed &&
            recipe.missing_ingredients_needed.length > 0 ? (
              <ul className="space-y-2">
                {recipe.missing_ingredients_needed.map((ing, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between text-xs text-slate-300 bg-slate-900/60 px-3 py-2 rounded-lg border border-slate-800"
                  >
                    <span className="capitalize font-medium text-slate-200">{ing.name}</span>
                    <span className="font-mono text-amber-400">
                      {ing.quantity} {ing.unit}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-3 rounded-lg bg-emerald-950/20 text-emerald-300 text-xs flex items-center gap-2 border border-emerald-500/20">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero extra staples needed — 100% pantry powered!</span>
              </div>
            )}
          </div>
        </div>

        {/* Step-by-Step Instructions */}
        <div>
          <div className="flex items-center gap-2 mb-3 text-white font-bold text-base">
            <Utensils className="w-4 h-4 text-franken-neon" />
            <h3>Alchemical Instructions</h3>
            <span className="text-xs font-normal text-slate-400">
              (Check off steps as you cook)
            </span>
          </div>

          <div className="space-y-2.5">
            {recipe.instructions?.map((step, idx) => {
              const isChecked = completedSteps.includes(idx);
              return (
                <div
                  key={idx}
                  onClick={() => toggleStep(idx)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    isChecked
                      ? 'bg-slate-900/40 border-slate-800 opacity-60 line-through text-slate-500'
                      : 'bg-slate-900/90 border-franken-border text-slate-200 hover:border-emerald-500/40'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border text-xs font-bold ${
                      isChecked
                        ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                        : 'border-slate-600 bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isChecked ? '✓' : idx + 1}
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed">{step}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mark as Cooked Button (Step 11) */}
        <div className="pt-4 border-t border-franken-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>
              Cooking this meal will automatically deduct used ingredients from your pantry inventory.
            </span>
          </div>

          <button
            onClick={() => cookedMutation.mutate()}
            disabled={cookedMutation.isPending || isCooked}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
              isCooked
                ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40 cursor-default'
                : 'bg-gradient-to-r from-emerald-500 to-lime-500 hover:from-emerald-400 hover:to-lime-400 text-franken-dark shadow-glow-emerald hover:shadow-lg'
            }`}
          >
            {cookedMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Updating Pantry Stock...</span>
              </>
            ) : isCooked ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Meal Cooked & Pantry Deducted!</span>
              </>
            ) : (
              <>
                <ChefHat className="w-4 h-4" />
                <span>Mark as Cooked 🍳</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
