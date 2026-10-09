import React from 'react';
import { ExpiringAlert } from '../components/ExpiringAlert';
import { AddItemForm } from '../components/AddItemForm';
import { PantryList } from '../components/PantryList';
import { PantryStatsBar } from '../components/PantryStatsBar';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PantryPage: React.FC = () => {
  return (
    <div className="space-y-7 animate-fade-in">
      <div className="page-heading flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow mb-3">Inventory overview</p>
          <h1 className="display-title text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Your pantry, at a glance.</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">Track what you have, use ingredients before they expire, and turn the rest into dinner.</p>
        </div>
        <Link to="/generate" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-franken-neon px-4 py-2.5 text-sm font-bold text-franken-dark transition hover:bg-white">
          Generate a recipe <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Stats Summary */}
      <PantryStatsBar />

      {/* Perishables Alert */}
      <ExpiringAlert />

      {/* Add Item Form */}
      <AddItemForm />

      {/* Current Pantry Items */}
      <PantryList />
    </div>
  );
};
