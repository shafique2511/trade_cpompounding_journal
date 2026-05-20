import React, { useState, useEffect } from 'react';
import { Trade, AppSettings } from '../types';
import { Calendar, Save, Percent, DollarSign, Edit, AlertCircle } from 'lucide-react';

interface AddEditTradeViewProps {
  currentTradeId?: string | null;
  trades: Trade[];
  settings: AppSettings;
  onSave: (tradeData: Partial<Trade>) => void;
  onCancel: () => void;
}

export const AddEditTradeView: React.FC<AddEditTradeViewProps> = ({
  currentTradeId,
  trades,
  settings,
  onSave,
  onCancel,
}) => {
  const isEditMode = !!currentTradeId;
  const existingTrade = isEditMode ? trades.find(t => t.id === currentTradeId) : null;

  // Form Fields
  const [symbol, setSymbol] = useState(existingTrade?.symbol || '');
  const [type, setType] = useState<'LONG' | 'SHORT'>(existingTrade?.type || 'LONG');
  const [entryPrice, setEntryPrice] = useState(existingTrade?.entryPrice?.toString() || '');
  const [exitPrice, setExitPrice] = useState(existingTrade?.exitPrice?.toString() || '');
  const [quantity, setQuantity] = useState(existingTrade?.quantity?.toString() || '');
  const [notes, setNotes] = useState(existingTrade?.notes || '');
  const [rating, setRating] = useState<number>(existingTrade?.rating || 4);

  // Default to Device Local Date String
  const [dateTime, setDateTime] = useState<string>(
    existingTrade?.dateTime 
      ? new Date(existingTrade.dateTime).toISOString().slice(0, 16) 
      : new Date().toISOString().slice(0, 16)
  );

  const [formError, setFormError] = useState<string | null>(null);

  // Live compounding calculation estimation
  const entry = parseFloat(entryPrice) || 0;
  const exit = parseFloat(exitPrice) || 0;
  const qty = parseFloat(quantity) || 0;

  const calculatedPnl = (() => {
    if (entry <= 0 || exit <= 0 || qty <= 0) return 0;
    const entryVal = entry * qty;
    const exitVal = exit * qty;
    return type === 'LONG' ? (exitVal - entryVal) : (entryVal - exitVal);
  })();

  const calculatedPnlPct = (() => {
    if (entry <= 0 || qty <= 0) return 0;
    return (calculatedPnl / (entry * qty)) * 100;
  })();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!symbol.trim()) {
      setFormError('Please provide an asset symbol (e.g. BTCUSDT)');
      return;
    }
    if (entry <= 0) {
      setFormError('Entry Price must be greater than 0');
      return;
    }
    if (exit <= 0) {
      setFormError('Exit Price must be greater than 0');
      return;
    }
    if (qty <= 0) {
      setFormError('Position quantity / size is required');
      return;
    }

    onSave({
      id: existingTrade?.id,
      symbol: symbol.toUpperCase().trim(),
      type,
      entryPrice: entry,
      exitPrice: exit,
      quantity: qty,
      pnl: parseFloat(calculatedPnl.toFixed(2)),
      pnlPercentage: parseFloat(calculatedPnlPct.toFixed(2)),
      dateTime: new Date(dateTime).toISOString(),
      notes: notes.trim(),
      rating,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 animate-fade-in pb-12">
      
      {/* Alert Block */}
      {formError && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl flex items-start gap-2 text-[11px] animate-pulse">
          <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* Asset Symbol */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold pl-1">
          Asset Symbol
        </label>
        <input 
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          placeholder="e.g. BTCUSDT, EURUSD, AAPL"
          className="w-full bg-slate-900 border border-slate-850 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-505/30 focus:border-indigo-500 text-slate-100 placeholder-slate-600 transition"
        />
      </div>

      {/* Trade Direction Selector */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold pl-1">
          Direction Action
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setType('LONG')}
            id="btn-direction-long"
            className={`py-2 px-3 rounded-xl text-xs font-black uppercase border transition active:scale-95 duration-150 ${
              type === 'LONG'
                ? 'bg-emerald-500/12 border-emerald-500/40 text-emerald-400 font-extrabold shadow-sm'
                : 'bg-slate-900 border-slate-850 text-slate-500'
            }`}
          >
            BUY / LONG
          </button>
          
          <button
            type="button"
            onClick={() => setType('SHORT')}
            id="btn-direction-short"
            className={`py-2 px-3 rounded-xl text-xs font-black uppercase border transition active:scale-95 duration-150 ${
              type === 'SHORT'
                ? 'bg-rose-500/12 border-rose-500/40 text-rose-450 text-rose-450 text-rose-400 font-extrabold shadow-sm'
                : 'bg-slate-900 border-slate-850 text-slate-500'
            }`}
          >
            SELL / SHORT
          </button>
        </div>
      </div>

      {/* Prices Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold pl-1">
            Entry Price ($)
          </label>
          <input 
            type="number"
            step="any"
            value={entryPrice}
            onChange={(e) => setEntryPrice(e.target.value)}
            placeholder="entry price"
            className="w-full bg-slate-900 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-100 font-mono placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold pl-1">
            Exit Price ($)
          </label>
          <input 
            type="number"
            step="any"
            value={exitPrice}
            onChange={(e) => setExitPrice(e.target.value)}
            placeholder="exit price"
            className="w-full bg-slate-900 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-100 font-mono placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition"
          />
        </div>
      </div>

      {/* Position Quantity / Size */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold pl-1">
          Position Size Quantity
        </label>
        <input 
          type="number"
          step="any"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="e.g. 0.05 BTC or 50 shares"
          className="w-full bg-slate-900 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-100 font-mono placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition"
        />
      </div>

      {/* Date-time (Android Device local ONLY) */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between pl-1">
          <label className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold">
            Device Local Date-Time
          </label>
          <span className="text-[8px] font-bold text-indigo-400">DEVICE TIME STAMP</span>
        </div>
        <div className="relative">
          <input 
            type="datetime-local"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
            className="w-full bg-slate-900 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition"
          />
        </div>
      </div>

      {/* Observation Learning Notes */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold pl-1">
          Observations & Learnings
        </label>
        <textarea 
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="What market structure did you spot? What mistakes did you avoid?"
          className="w-full bg-slate-900 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-105 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-505/30 focus:border-indigo-500 text-slate-100 transition resize-none"
        />
      </div>

      {/* Rating Block */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold pl-1">
          Trade Discipline Execution Quality
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`w-9 h-9 rounded-lg text-xs font-bold transition duration-150 ${
                rating >= star
                  ? 'bg-amber-500 text-neutral-950 shadow-sm'
                  : 'bg-slate-900 hover:bg-slate-850 text-slate-500 border border-slate-850'
              }`}
            >
              {star}★
            </button>
          ))}
        </div>
      </div>

      {/* Live compounding estimation box */}
      {entry > 0 && qty > 0 && exit > 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col gap-1 mt-1">
          <span className="text-[10px] uppercase tracking-wider text-indigo-400 font-bold">
            Projected Journal Ledger Compounding
          </span>
          <div className="flex justify-between items-baseline mt-1.5">
            <span className="text-xs text-slate-405 text-slate-400">Position PnL amount:</span>
            <span className={`text-sm font-extrabold font-mono ${calculatedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {calculatedPnl >= 0 ? '+' : ''}${calculatedPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-xs text-slate-405 text-slate-400">Percentage gain / draw:</span>
            <span className={`text-sm font-extrabold font-mono ${calculatedPnlPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {calculatedPnlPct >= 0 ? '+' : ''}{calculatedPnlPct.toFixed(2)}%
            </span>
          </div>
        </div>
      )}

      {/* Action Buttons Block */}
      <div className="flex gap-3 mt-4">
        <button
          type="button"
          onClick={onCancel}
          id="btn-form-cancel"
          className="flex-1 bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-400 font-bold text-xs py-3 rounded-xl transition duration-150 active:scale-95"
        >
          Cancel
        </button>
        <button
          type="submit"
          id="btn-form-submit"
          className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs py-3 rounded-xl shadow-lg shadow-indigo-950/20 flex items-center justify-center gap-1.5 transition duration-150 active:scale-95"
        >
          <Save size={13} /> {isEditMode ? 'Update Entry' : 'Post to Ledger'}
        </button>
      </div>

    </form>
  );
};
