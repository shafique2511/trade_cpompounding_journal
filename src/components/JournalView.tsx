import React, { useState } from 'react';
import { Search, Filter, ArrowUpRight, ArrowDownRight, Edit, Calendar } from 'lucide-react';
import { Trade, ScreenType } from '../types';

interface JournalViewProps {
  trades: Trade[];
  onNavigate: (screen: ScreenType, arg?: string) => void;
}

type FilterType = 'ALL' | 'LONG' | 'SHORT' | 'WINS' | 'LOSSES';

export const JournalView: React.FC<JournalViewProps> = ({ trades, onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('ALL');

  const filteredTrades = trades.filter((trade) => {
    const matchesSearch = trade.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = (() => {
      switch (selectedFilter) {
        case 'ALL': return true;
        case 'LONG': return trade.type === 'LONG';
        case 'SHORT': return trade.type === 'SHORT';
        case 'WINS': return trade.pnl > 0;
        case 'LOSSES': return trade.pnl <= 0;
        default: return true;
      }
    })();

    return matchesSearch && matchesFilter;
  });

  // Sort reverse chronologically for easy scrolling on latest journals
  const sortedTrades = [...filteredTrades].sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());

  return (
    <div className="flex flex-col gap-4 p-4 animate-fade-in pb-12">
      
      {/* Search Input block */}
      <div className="relative w-full">
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search compounding logs by symbol..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-xs font-medium placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-slate-100 transition"
        />
        <Search size={14} className="absolute left-3.5 top-3.5 text-slate-500 pointer-events-none" />
      </div>

      {/* Filter Tabs / Row */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar select-none">
        <Filter size={12} className="text-slate-500 flex-shrink-0" />
        
        {(['ALL', 'LONG', 'SHORT', 'WINS', 'LOSSES'] as FilterType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedFilter(tab)}
            id={`btn-filter-${tab.toLowerCase()}`}
            className={`px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wide uppercase flex-shrink-0 border transition active:scale-95 duration-150 ${
              selectedFilter === tab
                ? 'bg-indigo-500 text-white border-indigo-400/30 shadow-sm shadow-indigo-950'
                : 'bg-slate-950 text-slate-400 border-slate-890 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Trades Journal Lists */}
      {sortedTrades.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-slate-900/10 border border-dashed border-slate-900 rounded-2xl text-center">
          <Calendar size={28} className="text-slate-700 mb-2" />
          <span className="text-xs text-slate-400 font-bold">No match found</span>
          <p className="text-[10px] text-slate-500 mt-1">
            No entries correspond to "{searchQuery || selectedFilter}". Create or expand filters.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {sortedTrades.map((trade) => {
            const isWin = trade.pnl > 0;
            return (
              <div 
                key={trade.id}
                onClick={() => onNavigate('TRADE_DETAIL', trade.id)}
                className="bg-slate-900 hover:bg-slate-850 border border-slate-900/80 hover:border-slate-800 rounded-xl p-4 flex flex-col gap-2.5 cursor-pointer transition relative overflow-hidden group active:scale-[0.99] duration-150"
              >
                {/* Thin side bar color code */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${isWin ? 'bg-emerald-500' : 'bg-rose-500'}`} />

                {/* Main Header Block */}
                <div className="flex justify-between items-start pl-1">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-extrabold text-white tracking-tight">{trade.symbol}</span>
                      <span className={`text-[8px] font-black px-1.5 py-[1px] rounded border ${
                        trade.type === 'LONG' 
                          ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' 
                          : 'bg-rose-500/10 border-rose-500/25 text-rose-400'
                      }`}>
                        {trade.type}
                      </span>
                    </div>
                    <span className="text-[9px] text-slate-500 font-medium">
                      {new Date(trade.dateTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="flex flex-col items-end gap-0.5">
                    <span className={`text-xs font-black font-mono ${isWin ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isWin ? '+' : ''}${trade.pnl.toFixed(2)}
                    </span>
                    <span className={`text-[9px] font-black font-mono ${isWin ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isWin ? '+' : ''}{trade.pnlPercentage.toFixed(2)}%
                    </span>
                  </div>
                </div>

                {/* Technical Trade Info Row */}
                <div className="bg-slate-950/40 rounded-lg p-2 flex justify-between items-center text-[10px] text-slate-400 pl-3">
                  <div className="flex gap-4">
                    <span>
                      Entry: <strong className="text-slate-300">${trade.entryPrice.toLocaleString()}</strong>
                    </span>
                    <span>
                      Exit: <strong className="text-slate-300">${trade.exitPrice.toLocaleString()}</strong>
                    </span>
                  </div>
                  <span>
                    Size: <strong className="text-slate-300">{trade.quantity} units</strong>
                  </span>
                </div>

                {/* Notes truncation (if exist) */}
                {trade.notes && (
                  <p className="text-[10px] text-slate-400 line-clamp-1 italic pl-1">
                    "{trade.notes}"
                  </p>
                )}

                {/* Edit Button overlay corner */}
                <div className="flex justify-end pr-1 pt-1 border-t border-slate-900/70">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate('EDIT_TRADE', trade.id);
                    }}
                    id={`btn-edit-trade-${trade.id}`}
                    className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 py-0.5 px-2 hover:bg-indigo-500/5 rounded transition"
                  >
                    <Edit size={10} /> Edit Trade
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Extra helper padding */}
      <div className="h-6" />
    </div>
  );
};
