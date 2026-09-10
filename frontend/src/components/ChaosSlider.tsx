import React from 'react';
import { Flame, Zap, ShieldCheck, Sparkles, Skull } from 'lucide-react';

interface ChaosSliderProps {
  value: number;
  onChange: (value: number) => void;
}

const CHAOS_LEVELS = [
  {
    level: 1,
    title: 'Safe Classical',
    subtitle: 'Play it safe. Traditional flavor pairings and foolproof culinary harmony.',
    icon: ShieldCheck,
    color: 'text-emerald-400',
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-950/20',
    accent: 'accent-emerald-500',
  },
  {
    level: 2,
    title: 'Creative Chef',
    subtitle: 'Comfort zone expanded. Familiar tastes with subtle elevated twists.',
    icon: Sparkles,
    color: 'text-lime-400',
    border: 'border-lime-500/30',
    bg: 'bg-lime-950/20',
    accent: 'accent-lime-500',
  },
  {
    level: 3,
    title: 'Playful Fusion',
    subtitle: 'Cross-cuisine experimentation. Distinct textures and unexpected blends.',
    icon: Zap,
    color: 'text-amber-400',
    border: 'border-amber-500/30',
    bg: 'bg-amber-950/20',
    accent: 'accent-amber-500',
  },
  {
    level: 4,
    title: 'Mad Scientist',
    subtitle: 'Aggressive culinary laboratory chemistry. Wild but delicious.',
    icon: Flame,
    color: 'text-purple-400',
    border: 'border-purple-500/30',
    bg: 'bg-purple-950/20',
    accent: 'accent-purple-500',
  },
  {
    level: 5,
    title: 'Frankenstein Chaos',
    subtitle: 'Maximum monster voltage! Unhinged ingredient fusion created for the brave.',
    icon: Skull,
    color: 'text-rose-400',
    border: 'border-rose-500/30',
    bg: 'bg-rose-950/20',
    accent: 'accent-rose-500',
  },
];

export const ChaosSlider: React.FC<ChaosSliderProps> = ({ value, onChange }) => {
  const current = CHAOS_LEVELS.find((l) => l.level === value) || CHAOS_LEVELS[0];
  const Icon = current.icon;

  return (
    <div className="glass-panel p-6 rounded-2xl border border-franken-border shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Alchemical Parameter
          </span>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Chaos Level</span>
            <span className={`text-base font-extrabold ${current.color}`}>
              {value}/5
            </span>
          </h3>
        </div>

        <div className={`p-2.5 rounded-xl ${current.bg} ${current.border} border ${current.color} shadow-sm`}>
          <Icon className="w-6 h-6 animate-pulse" />
        </div>
      </div>

      {/* Slider Input */}
      <div className="space-y-3">
        <input
          type="range"
          min="1"
          max="5"
          step="1"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={`w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer ${current.accent}`}
        />

        {/* Step ticks */}
        <div className="flex justify-between px-1">
          {CHAOS_LEVELS.map((level) => (
            <button
              key={level.level}
              type="button"
              onClick={() => onChange(level.level)}
              className={`text-xs font-mono font-bold transition-colors ${
                value === level.level ? `${level.color} scale-110` : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {level.level}
            </button>
          ))}
        </div>
      </div>

      {/* Description Box */}
      <div className={`mt-4 p-3.5 rounded-xl ${current.bg} border ${current.border} transition-all`}>
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-sm font-bold ${current.color}`}>{current.title}</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">{current.subtitle}</p>
      </div>
    </div>
  );
};
