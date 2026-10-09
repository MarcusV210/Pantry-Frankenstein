import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPantry, getExpiringItems } from '../api/pantry';
import { Layers, AlertTriangle, Clock, TrendingUp } from 'lucide-react';

export const PantryStatsBar: React.FC = () => {
  const { data: items } = useQuery({
    queryKey: ['pantry-items'],
    queryFn: getPantry,
  });

  const { data: expiring } = useQuery({
    queryKey: ['expiring-items'],
    queryFn: () => getExpiringItems(3),
  });

  const totalItems = items?.length ?? 0;
  const expiringCount = expiring?.length ?? 0;
  const expiredCount = items?.filter((i) => i.days_until_expiry < 0).length ?? 0;
  const freshCount = items?.filter((i) => i.days_until_expiry > 7).length ?? 0;

  const stats = [
    {
      label: 'Total Provisions',
      value: totalItems,
      icon: Layers,
      color: 'text-franken-neon',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
    },
    {
      label: 'Expiring Soon',
      value: expiringCount,
      icon: Clock,
      color: expiringCount > 0 ? 'text-amber-400' : 'text-slate-500',
      bg: expiringCount > 0 ? 'bg-amber-500/10' : 'bg-slate-800/40',
      border: expiringCount > 0 ? 'border-amber-500/30' : 'border-slate-700/40',
    },
    {
      label: 'Expired',
      value: expiredCount,
      icon: AlertTriangle,
      color: expiredCount > 0 ? 'text-rose-400' : 'text-slate-500',
      bg: expiredCount > 0 ? 'bg-rose-500/10' : 'bg-slate-800/40',
      border: expiredCount > 0 ? 'border-rose-500/30' : 'border-slate-700/40',
    },
    {
      label: 'Plenty Fresh',
      value: freshCount,
      icon: TrendingUp,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
    },
  ];

  if (totalItems === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-franken-border bg-franken-border sm:grid-cols-4 animate-slide-up">
      {stats.map(({ label, value, icon: Icon, color, bg, border }) => (
        <div
          key={label}
          className="flex items-center gap-3 bg-franken-surface px-4 py-4 transition-colors hover:bg-franken-card"
        >
          <div className={`rounded-lg border p-2 ${bg} ${border}`}>
            <Icon className={`w-4 h-4 ${color}`} />
          </div>
          <div>
            <p className={`text-xl font-extrabold leading-none ${color}`}>{value}</p>
            <p className="text-[10px] text-slate-500 mt-0.5 font-medium">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
