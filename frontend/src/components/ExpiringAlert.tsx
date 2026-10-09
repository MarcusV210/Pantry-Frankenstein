import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getExpiringItems } from '../api/pantry';
import { AlertTriangle, ArrowRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ExpiringAlert: React.FC = () => {
  const { data: expiringItems, isLoading } = useQuery({
    queryKey: ['expiring-items'],
    queryFn: () => getExpiringItems(3),
    refetchInterval: 60000,
  });

  if (isLoading || !expiringItems || expiringItems.length === 0) return null;

  return (
    <section className="relative mb-8 overflow-hidden rounded-2xl border border-amber-500/30 bg-amber-500/[.06] p-5">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-4">
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 text-amber-300">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold text-amber-100">Use these ingredients soon</h2>
              <span className="rounded-full border border-amber-500/30 px-2 py-0.5 text-[11px] font-semibold text-amber-300">Within 3 days</span>
            </div>
            <p className="mt-1 text-sm text-slate-400">Generate a recipe around the ingredients closest to expiry.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {expiringItems.map((item) => (
                <div key={item.id} className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-franken-dark/50 px-3 py-2 text-xs">
                  <span className="font-semibold capitalize text-slate-200">{item.name}</span>
                  <span className="text-slate-500">{item.quantity_raw} {item.unit_raw}</span>
                  <span className="flex items-center gap-1 font-semibold text-amber-300"><Clock className="h-3 w-3" />{item.days_until_expiry <= 0 ? 'Today' : `${item.days_until_expiry}d`}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Link to="/generate" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-amber-400 px-4 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-amber-300">
          Generate with these <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  );
};
