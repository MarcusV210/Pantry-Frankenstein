import React from 'react';
import { ExpiringAlert } from '../components/ExpiringAlert';
import { AddItemForm } from '../components/AddItemForm';
import { PantryList } from '../components/PantryList';
import { Refrigerator } from 'lucide-react';

export const PantryPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-franken-border">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-franken-neon border border-emerald-500/30">
              <Refrigerator className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                Pantry Vault & Inventory
              </h1>
              <p className="text-xs text-slate-400">
                Manage your food stock and keep perishables from being discarded
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Perishables Alert */}
      <ExpiringAlert />

      {/* Add Item Form */}
      <AddItemForm />

      {/* Current Pantry Items */}
      <PantryList />
    </div>
  );
};
