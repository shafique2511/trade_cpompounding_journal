import React from 'react';
import { Trade, AppSettings } from '../types';
import { ArrowLeft, Trash2, Edit, Calendar, Star, DollarSign, TrendingUp, Compass } from 'lucide-react';

interface TradeDetailViewProps {
  tradeId: string;
  trades: Trade[];
  settings: AppSettings;
  onBack: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TradeDetailView: React.FC<TradeDetailViewProps> = ({
  tradeId,
  trades,
  settings,
  onBack,
  onEdit,
  onDelete,
}) => {
  const trade = trades.find((t) => t.id === tradeId);

  if (!trade) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center animate-fade-in text-slate-400 gap-2">
        <Compass size={32} className="text-slate-600 animate-spin" />
        <span className="text-xs font-bold text-slate-300">Evaluating Trade Stack...</span>
        <button onClick={onBack} className="text-xs text-indigo-400 mt-2 hover:underline">
          Go Back
        </button>
      </div>
    );
  }

  const isWin = trade.pnl > 0;

  return (
    <div className="flex flex-col gap-4 p-4 animate-fade-in pb-12">
      
      {/* Back & Editing Action Header controls */}
      <div className="flex justify-between items-center bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
        <button 
          onClick={onBack}
          id="btn-detail-back"
          className="text-xs text-slate-400 hover:text-slate-200 font-bold flex items-center gap-1"
        >
          <ArrowLeft size={13} /> Back to logs
        </button>
        <div className="flex gap-2">
          <button 
            onClick={() => onEdit(trade.id)}
            id="btn-detail-edit"
            className="text-[11px] text-indigo-400 hover:text-indigo-300 font-extrabold flex items-center gap-1 py-1 px-2.5 hover:bg-slate-800 rounded-lg transition"
          >
            <Edit size={11} /> Edit Code
          </button>
          <button 
            onClick={() => {
              if (confirm('Are you sure you want to delete this compounding trade? Your chronological compounding ledger path will be re-calculated.')) {
                onDelete(trade.id);
              }
            }}
            id="btn-detail-delete"
            className="text-[11px] text-rose-400 hover:text-rose-300 font-extrabold flex items-center gap-1 py-1 px-2.5 hover:bg-rose-500/5 rounded-lg transition"
          >
            <Trash2 size={11} /> Delete
          </button>
        </div>
      </div>

      {/* Main Asset Tag Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex justify-between items-center shadow-lg relative overflow-hidden">
        <div className="flex flex-col gap-1 z-10">
          <h2 className="text-lg font-black tracking-tight text-white font-display uppercase">{trade.symbol}</h2>
          <div className="flex items-center gap-1">
            <Calendar size={11} className="text-slate-500" />
            <span className="text-[9px] text-slate-500 font-mono font-medium">
              {new Date(trade.dateTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
            </span>
          </div>
        </div>
        
        <span className={`text-[10px] font-black tracking-wider uppercase px-2 py-1 rounded border z-15 ${
          trade.type === 'LONG' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
            : 'bg-rose-500/10 border-rose-500/30 text-rose-450 text-rose-405 text-rose-400'
        }`}>
          {trade.type === 'LONG' ? 'BUY / Long' : 'SELL / Short'}
        </span>
      </div>

      {/* Calculations Grid card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
        <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2">
          <TrendingUp size={14} className="text-indigo-400" />
          <span className="text-xs font-bold text-slate-300">Technical Calculation Matrix</span>
        </div>

        <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-slate-500 font-medium">Entry Position Price</span>
            <span className="font-bold text-slate-200 font-mono">${trade.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-slate-500 font-medium">Exit Ledger Price</span>
            <span className="font-bold text-slate-200 font-mono">${trade.exitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-slate-500 font-medium">Trade Volume Size</span>
            <span className="font-bold text-slate-200 font-mono">{trade.quantity.toLocaleString()} units</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-slate-500 font-medium">Notional Value size</span>
            <span className="font-bold text-slate-200 font-mono">${(trade.entryPrice * trade.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        {/* Realized Ledger PNL Compound Block */}
        <div className="mt-2 bg-slate-950/60 rounded-xl p-3 flex justify-between items-center">
          <span className="text-xs text-slate-400 font-medium">Compound Interest Earned / Retracted</span>
          <div className="flex flex-col items-end">
            <span className={`text-sm font-black font-mono ${isWin ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isWin ? '+' : ''}${trade.pnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <span className={`text-[10px] font-bold font-mono ${isWin ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isWin ? '+' : ''}{trade.pnlPercentage.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      {/* Balance progression trace */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2">
        <span className="text-xs font-bold text-slate-300">Chronological Balance Compound Ledger</span>
        
        <div className="flex justify-between items-center text-xs mt-1">
          <div className="flex flex-col">
            <span className="text-[9px] text-slate-500 uppercase font-medium">Account value pre-trade</span>
            <span className="font-bold text-slate-300 font-mono">${trade.startingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="w-8 h-0.5 bg-slate-800" />
          <div className="flex flex-col items-end">
            <span className="text-[9px] text-slate-500 uppercase font-medium">Account value post-trade</span>
            <span className={`font-black font-mono ${isWin ? 'text-emerald-400' : 'text-rose-400'}`}>
              ${trade.endingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Observations learning block */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2">
        <span className="text-xs font-bold text-slate-300">Observation Notes</span>
        <p className="text-xs text-slate-400 font-medium leading-relaxed italic bg-slate-950/20 p-2 rounded-lg border border-slate-900">
          {trade.notes ? `"${trade.notes}"` : 'No written observations or trade learnings recorded for this entry.'}
        </p>
      </div>

      {/* Rating display */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex justify-between items-center text-xs">
        <span className="font-bold text-slate-300">Discipline Score</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star 
              key={star} 
              size={13} 
              className={star <= (trade.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-slate-700'} 
            />
          ))}
        </div>
      </div>

      <div className="h-6" />
    </div>
  );
};
