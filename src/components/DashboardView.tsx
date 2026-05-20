import React from 'react';
import { TrendingUp, ArrowUpRight, Plus, Activity, Zap, Shield, HelpCircle, ArrowRight } from 'lucide-react';
import { Trade, AppSettings, ScreenType } from '../types';

interface DashboardViewProps {
  trades: Trade[];
  settings: AppSettings;
  onNavigate: (screen: ScreenType, arg?: string) => void;
  onQuickResetDemo: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  trades,
  settings,
  onNavigate,
  onQuickResetDemo,
}) => {
  // Sort trades chronologically to calculate cumulative indicators
  const sortedTrades = [...trades].sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
  
  const currentBalance = sortedTrades.length > 0 
    ? sortedTrades[sortedTrades.length - 1].endingBalance 
    : settings.initialBalance;

  const totalGains = currentBalance - settings.initialBalance;
  const growthPercentage = settings.initialBalance > 0 
    ? (totalGains / settings.initialBalance) * 100 
    : 0;

  // Win rate
  const winsCount = trades.filter((t) => t.pnl > 0).length;
  const winRate = trades.length > 0 ? (winsCount / trades.length) * 100 : 0;

  // Multi-win streaks (only wins consecutively from the end)
  const getStreak = () => {
    let streak = 0;
    const revTrades = [...sortedTrades].reverse();
    for (const trade of revTrades) {
      if (trade.pnl > 0) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const currentStreak = getStreak();

  // Create SVG path for simple compounding line chart representation
  const generateChartPoints = (): { x: number; y: number }[] => {
    if (sortedTrades.length === 0) return [];
    const points: { x: number; y: number }[] = [];
    const balances = [settings.initialBalance, ...sortedTrades.map(t => t.endingBalance)];
    
    const minBal = Math.min(...balances) * 0.98;
    const maxBal = Math.max(...balances) * 1.02;
    const balRange = maxBal - minBal || 1;
    
    const totalSlots = balances.length - 1 || 1;
    
    balances.forEach((bal, idx) => {
      const x = (idx / totalSlots) * 310 + 20; // x fits between 20 and 330
      const normY = (bal - minBal) / balRange;
      const y = 110 - (normY * 85); // y fits between 25 and 110
      points.push({ x, y });
    });
    
    return points;
  };

  const chartPoints = generateChartPoints();
  const linePath = chartPoints.length > 0 ? `M ${chartPoints.map(p => `${p.x} ${p.y}`).join(' L ')}` : '';
  const areaPath = chartPoints.length > 0 ? `${linePath} L ${chartPoints[chartPoints.length - 1].x} 125 L ${chartPoints[0].x} 125 Z` : '';

  return (
    <div className="flex flex-col gap-5 p-4 animate-fade-in pb-12">
      {/* Starting Block Indicator */}
      <div className="flex justify-between items-center bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-emerald-500" />
          <span className="text-[11px] text-slate-400 font-medium">Local Database Connection Active</span>
        </div>
        <button 
          onClick={onQuickResetDemo}
          id="btn-quick-reset-demo"
          className="text-[10px] bg-slate-800 hover:bg-slate-700 hover:text-slate-200 text-slate-400 font-semibold px-2 py-1 rounded border border-slate-700/50 transition"
        >
          Reset Demo Logs
        </button>
      </div>

      {/* Main Core Ledger Card */}
      <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/15 rounded-3xl p-5 relative overflow-hidden shadow-lg shadow-indigo-950/20">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <span className="text-xs text-slate-400 font-sans font-medium">
          Compounded Account Value
        </span>
        
        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-[18px] font-mono text-indigo-400 font-bold">{settings.baseCurrency}</span>
          <span className="text-2xl font-display font-black tracking-tight text-white">
            {currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="flex items-center gap-1.5 mt-3">
          <div className="p-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <TrendingUp size={14} className="text-emerald-400" />
          </div>
          <span className="text-xs text-emerald-400 font-medium">
            +{growthPercentage.toFixed(2)}% Compound Gain
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            ({totalGains >= 0 ? `+$${totalGains.toFixed(2)}` : `-$${Math.abs(totalGains).toFixed(2)}`})
          </span>
        </div>
      </div>

      {/* Quick Visual Compounding Chart */}
      {sortedTrades.length > 0 && (
        <div className="bg-slate-900/40 border border-slate-900/80 rounded-2xl p-4 flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-300">Journal Compound Growth Stream</span>
            <button 
              onClick={() => onNavigate('ANALYTICS')}
              id="btn-nav-analytics"
              className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
            >
              Analyze <ArrowRight size={10} />
            </button>
          </div>

          <div className="relative w-full h-[135px] mt-2 select-none">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 350 135">
              {/* Grid Lines */}
              <line x1="20" y1="25" x2="330" y2="25" stroke="#1e293b" strokeDasharray="3,3" strokeWidth="1" />
              <line x1="20" y1="67.5" x2="330" y2="67.5" stroke="#1e293b" strokeDasharray="3,3" strokeWidth="1" />
              <line x1="20" y1="110" x2="330" y2="110" stroke="#1e293b" strokeDasharray="3,3" strokeWidth="1" />

              {/* Area Under Curve */}
              {areaPath && <path d={areaPath} fill="url(#compoundGlow)" className="opacity-15" />}
              
              {/* Trend line */}
              {linePath && (
                <path 
                  d={linePath} 
                  fill="none" 
                  stroke="#10b981" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              )}

              {/* Node Datapoints */}
              {chartPoints.map((point, index) => (
                <g key={`node-${index}`}>
                  <circle 
                    cx={point.x} 
                    cy={point.y} 
                    r="4" 
                    fill="#1e1b4b" 
                    stroke="#10b981" 
                    strokeWidth="1.5" 
                  />
                  <circle 
                    cx={point.x} 
                    cy={point.y} 
                    r="8" 
                    fill="#10b981" 
                    className="opacity-0 hover:opacity-10 transition-opacity cursor-pointer"
                  />
                </g>
              ))}

              <defs>
                <linearGradient id="compoundGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      )}

      {/* Grid Stats Block */}
      <div className="grid grid-cols-3 gap-3">
        {/* Win Rate */}
        <div className="bg-slate-900 border border-slate-900/60 rounded-xl p-3 flex flex-col justify-between min-h-[70px]">
          <span className="text-[10px] text-slate-400 font-medium leading-none">Win rate</span>
          <span className="text-base font-bold text-emerald-400 font-mono tracking-tight mt-1">
            {winRate.toFixed(1)}%
          </span>
          <span className="text-[9px] text-slate-500 font-medium">
            {winsCount}W - {trades.length - winsCount}L
          </span>
        </div>

        {/* Count */}
        <div className="bg-slate-900 border border-slate-900/60 rounded-xl p-3 flex flex-col justify-between min-h-[70px]">
          <span className="text-[10px] text-slate-400 font-medium leading-none">Trade span</span>
          <span className="text-base font-bold text-slate-100 font-mono tracking-tight mt-1">
            {trades.length}
          </span>
          <span className="text-[9px] text-slate-500 font-medium">Recorded logs</span>
        </div>

        {/* Streaks */}
        <div className="bg-slate-900 border border-slate-900/60 rounded-xl p-3 flex flex-col justify-between min-h-[70px]">
          <span className="text-[10px] text-slate-400 font-medium leading-none">Active streak</span>
          <span className="text-base font-bold text-amber-500 font-mono tracking-tight mt-1 flex items-center gap-0.5">
            {currentStreak}
            {currentStreak > 0 ? 'W 🔥' : '—'}
          </span>
          <span className="text-[9px] text-slate-500 font-medium">Consecutive wins</span>
        </div>
      </div>

      {/* Target Compounding Progress Card */}
      <div className="bg-slate-900/80 border border-slate-900 rounded-2xl p-4 flex flex-col gap-2">
        <div className="flex justify-between items-center text-xs">
          <span className="font-semibold text-slate-300">Target Scaling Tracker (2x Compound)</span>
          <span className="text-indigo-400 font-bold font-mono">
            {currentBalance >= settings.initialBalance * 2 ? '100%' : `${((totalGains / settings.initialBalance) * 100).toFixed(0)}%`}
          </span>
        </div>
        
        {/* ProgressBar */}
        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden mt-1">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${Math.max(0, Math.min(100, (totalGains / settings.initialBalance) * 100))}%` }}
          />
        </div>

        <div className="flex justify-between mt-1 text-[9px] font-mono text-slate-500">
          <span>Staged ($1,000)</span>
          <span>Goal Double ($2,000)</span>
        </div>
      </div>

      {/* Recent Activity List Header */}
      <div className="flex justify-between items-center mt-2">
        <h2 className="text-xs font-extrabold uppercase tracking-wide text-slate-400">
          Recent Compounded Trade Logs
        </h2>
        <button 
          onClick={() => onNavigate('JOURNAL')}
          id="btn-nav-journal"
          className="text-[11px] text-slate-400 hover:text-slate-300 font-medium flex items-center gap-0.5"
        >
          View all logs
        </button>
      </div>

      {/* Trade Rows */}
      {trades.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 bg-slate-900/30 rounded-2xl border border-dashed border-slate-800 text-center">
          <Activity size={24} className="text-slate-600 mb-2" />
          <span className="text-xs text-slate-400 font-semibold">Ready for ledger ledger</span>
          <p className="text-[10px] text-slate-500 max-w-[200px] mt-1">
            Toggle the Add button below to write your first compounding trade.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {sortedTrades.slice(-3).reverse().map((trade) => {
            const isWin = trade.pnl > 0;
            return (
              <div 
                key={trade.id}
                onClick={() => onNavigate('TRADE_DETAIL', trade.id)}
                className="bg-slate-900 hover:bg-slate-850 border border-slate-900 hover:border-slate-800 rounded-xl p-3.5 flex justify-between items-center cursor-pointer transition active:scale-[0.99]"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5ClassName">
                    <span className="text-xs font-bold text-white">{trade.symbol}</span>
                    <span className={`text-[8px] font-bold px-1 py-[1.5px] rounded border ${
                      trade.type === 'LONG' 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                        : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                    }`}>
                      {trade.type}
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-500">
                    {new Date(trade.dateTime).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="flex flex-col items-end gap-0.5">
                  <span className={`text-xs font-extrabold font-mono ${isWin ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isWin ? '+' : ''}${trade.pnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <span className={`text-[9px] font-bold ${isWin ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isWin ? '+' : ''}{trade.pnlPercentage.toFixed(2)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Float trigger Button layout spacer */}
      <div className="h-6" />
    </div>
  );
};
