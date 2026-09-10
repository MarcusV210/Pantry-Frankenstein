import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getExpiringItems } from '../api/pantry';
import { AlertTriangle, Clock, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ExpiringAlert: React.FC = () => {
  const { data: expiringItems, isLoading } = useQuery({
    queryKey: ['expiring-items'],
    queryFn: () => getExpiringItems(3),
    refetchInterval: 60000,
  });

  if (isLoading || !expiringItems || expiringItems.length === 0) {
    return null;
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-slate-900/60 p-5 shadow-lg shadow-amber-950/20 mb-8 backdrop-blur-sm">
      {/* Glow highlight */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 shrink-0">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-amber-300">
                Critical Perishables Alert ({expiringItems.length} {expiringItems.length === 1 ? 'item' : 'items'} expiring soon)
              </h3>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono border border-amber-500/30">
                ≤ 3 Days
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              These ingredients are approaching expiration. Synthesize them into an epic meal before they perish!
            </p>

            {/* Badges of expiring items */}
            <div className="flex flex-wrap gap-2 mt-3">
              {expiringItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-600/30 text-xs text-amber-200"
                >
                  <span className="font-semibold capitalize">{item.name}</span>
                  <span className="text-slate-400">({item.quantity_raw} {item.unit_raw})</span>
                  <span className="flex items-center gap-0.5 text-[11px] font-mono font-bold text-amber-400 bg-amber-500/10 px-1 rounded">
                    <Clock className="w-3 h-3" />
                    {item.days_until_expiry <= 0
                      ? 'TODAY'
                      : `${item.days_until_expiry}d left`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="shrink-0 flex items-center">
          <Link
            to="/generate"
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs tracking-wide shadow-md transition-all hover:scale-105"
          >
            <Sparkles className="w-4 h-4 text-black" />
            <span>Revive in AI Lab</span>
            <ArrowRight className="w-3.5 h-3.5 text-black" />
          </Link>
        </div>
      </div>
    </div>
  );
};
