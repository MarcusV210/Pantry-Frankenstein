import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getRecipeHistory } from '../api/recipes';
import type { RecipeHistoryItem } from '../types';
import { RecipeCard } from '../components/RecipeCard';
import {
  History,
  Loader2,
  AlertCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Utensils,
  Layers,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const HistoryPage: React.FC = () => {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data: recipes, isLoading, error } = useQuery<RecipeHistoryItem[]>({
    queryKey: ['recipe-history'],
    queryFn: getRecipeHistory,
  });

  const getChaosBadge = (level: number) => {
    const colors = [
      '',
      'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      'bg-lime-500/20 text-lime-400 border-lime-500/30',
      'bg-amber-500/20 text-amber-400 border-amber-500/30',
      'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'bg-rose-500/20 text-rose-400 border-rose-500/30',
    ];
    return (
      <span
        className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${
          colors[level] || colors[3]
        }`}
      >
        Chaos {level}/5
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="glass-panel p-12 rounded-2xl border border-franken-border text-center flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
        <p className="text-sm text-slate-400">Loading recipe archives from the vault...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel p-6 rounded-2xl border border-rose-500/30 bg-rose-950/20 text-center text-rose-300">
        <AlertCircle className="w-6 h-6 mx-auto mb-2 text-rose-400" />
        <p className="text-sm font-semibold">Failed to load recipe history.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-franken-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Recipe Vault & Archive
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Browse previously synthesized culinary creations from your lab
            </p>
          </div>
        </div>

        <Link
          to="/generate"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-500 hover:from-emerald-400 hover:to-lime-400 text-franken-dark font-bold text-xs shadow-glow-emerald transition-all hover:scale-105 shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>New Synthesis</span>
        </Link>
      </div>

      {recipes && recipes.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl border border-dashed border-slate-700 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-950/40 text-purple-400 border border-purple-500/30 flex items-center justify-center mx-auto">
            <Utensils className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white mb-1">Vault is Empty</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You haven't generated any AI recipes yet. Visit the Synthesizer Lab to create your first Frankenstein masterpiece!
            </p>
          </div>
          <Link
            to="/generate"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all"
          >
            <span>Open Synthesizer Lab</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {recipes?.map((recipe) => {
            const isExpanded = expandedId === recipe.id;
            return (
              <div
                key={recipe.id}
                className="glass-panel rounded-2xl border border-franken-border overflow-hidden transition-all"
              >
                {/* Accordion Summary Header */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : recipe.id)}
                  className="p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-800/40 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-lg font-bold text-white hover:text-franken-neon transition-colors">
                        {recipe.recipe_name}
                      </h3>
                      {getChaosBadge(recipe.chaos_level)}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-emerald-400" />
                        {recipe.pantry_items_used?.length || 0} pantry ingredients
                      </span>
                      <span>•</span>
                      <span>
                        {recipe.instructions?.length || 0} instruction steps
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="text-xs hidden sm:inline">
                      {isExpanded ? 'Hide Details' : 'View Full Recipe'}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-franken-neon" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                </div>

                {/* Expanded Recipe View */}
                {isExpanded && (
                  <div className="border-t border-franken-border p-5 bg-slate-950/40 animate-fade-in">
                    <RecipeCard
                      recipe={{
                        id: recipe.id,
                        recipe_name: recipe.recipe_name,
                        pantry_items_used: recipe.pantry_items_used || [],
                        missing_ingredients_needed:
                          recipe.missing_ingredients_needed || [],
                        instructions: recipe.instructions || [],
                        estimated_cook_time_minutes: 25,
                        chaos_level: recipe.chaos_level,
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
