import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { generateRecipe } from '../api/recipes';
import { getPantry } from '../api/pantry';
import { ChaosSlider } from '../components/ChaosSlider';
import { RecipeCard } from '../components/RecipeCard';
import type { Recipe } from '../types';
import {
  Sparkles,
  Loader2,
  AlertCircle,
  Clock,
  Layers,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const GeneratePage: React.FC = () => {
  const [chaosLevel, setChaosLevel] = useState<number>(3);
  const [daysExpiring, setDaysExpiring] = useState<number>(3);
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch pantry count to inform user
  const { data: pantryItems } = useQuery({
    queryKey: ['pantry-items'],
    queryFn: getPantry,
  });

  const generateMutation = useMutation({
    mutationFn: () => generateRecipe(chaosLevel, daysExpiring),
    onSuccess: (data) => {
      setCurrentRecipe({ ...data, chaos_level: chaosLevel });
      setError(null);
    },
    onError: (err: any) => {
      const msg =
        err.response?.data?.detail ||
        'Failed to generate recipe. Please ensure your pantry has ingredients.';
      setError(msg);
    },
  });

  const handleGenerate = () => {
    setError(null);
    generateMutation.mutate();
  };

  const hasPantryItems = pantryItems && pantryItems.length > 0;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="page-heading">
        <p className="eyebrow mb-3">Recipe generator</p>
        <h1 className="display-title text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Make something from what you have.</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Choose how adventurous to be and let your pantry guide the next meal.</p>
      </div>

      {!hasPantryItems && (
        <div className="glass-panel p-5 rounded-2xl border border-amber-500/30 bg-amber-950/20 text-amber-200 text-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            <span>
              Your pantry is currently empty! Add a few ingredients before synthesising a recipe.
            </span>
          </div>
          <Link
            to="/pantry"
            className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0"
          >
            Go to Pantry
          </Link>
        </div>
      )}

      {/* Control Panel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Chaos Slider (2 columns on md) */}
        <div className="md:col-span-2">
          <ChaosSlider value={chaosLevel} onChange={setChaosLevel} />
        </div>

        {/* Days Expiring & Quick Summary */}
          <div className="glass-panel flex flex-col justify-between space-y-6 rounded-2xl p-6">
          <div>
            <div className="flex items-center gap-2 mb-2 text-slate-300">
              <Clock className="w-4 h-4 text-emerald-400" />
              <label className="text-xs font-semibold uppercase tracking-wider">
                Expiring Horizon
              </label>
            </div>
            <select
              value={daysExpiring}
              onChange={(e) => setDaysExpiring(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900/90 border border-franken-border text-white text-sm focus:outline-none focus:border-emerald-500"
            >
              <option value={1}>Urgent: Expiring within 24 Hours</option>
              <option value={3}>Standard: Expiring within 3 Days</option>
              <option value={7}>Extended: Expiring within 7 Days</option>
              <option value={14}>Two Weeks: All Perishables (14 Days)</option>
            </select>
            <p className="text-[11px] text-slate-400 mt-2">
              The AI prioritizes using ingredients expiring inside this window.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-franken-neon" />
                <span>Pantry Provisions</span>
              </span>
              <span className="font-mono font-bold text-white">
                {pantryItems?.length || 0} items
              </span>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={generateMutation.isPending || !hasPantryItems}
            className="primary-action flex w-full items-center justify-center gap-2.5 rounded-lg px-4 py-3.5 text-sm font-extrabold transition disabled:cursor-not-allowed disabled:opacity-40"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Brewing Recipe...</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 text-franken-dark fill-franken-dark" />
                <span>Generate recipe</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Synthesis Failure:</span> {error}
          </div>
        </div>
      )}

      {/* Loading Animation during LLM Generation */}
      {generateMutation.isPending && (
        <div className="glass-panel flex flex-col items-center justify-center space-y-4 rounded-2xl border border-purple-500/30 p-12 text-center">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center animate-pulse">
              <Sparkles className="w-8 h-8 text-purple-400 animate-spin" />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white">
              Building your recipe...
            </h3>
            <p className="text-xs text-slate-400 max-w-md mt-1">
              Prioritizing ingredients expiring within {daysExpiring} days and matching them to your creativity setting.
            </p>
          </div>
        </div>
      )}

      {/* Resulting Recipe Card */}
      {currentRecipe && !generateMutation.isPending && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs uppercase font-bold tracking-widest text-franken-neon">
            <Sparkles className="w-4 h-4" />
            <span>Recipe ready</span>
          </div>
          <RecipeCard recipe={currentRecipe} />
        </div>
      )}
    </div>
  );
};
