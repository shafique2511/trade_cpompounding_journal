import React, { useState } from 'react';
import { Trade, AppSettings } from '../types';
import { HelpCircle, BarChart3, TrendingUp, Info, ArrowUpRight } from 'lucide-react';

interface AnalyticsViewProps {
  trades: Trade[];
  settings: AppSettings;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ trades, settings }) => {
  const [compoundStepCount, setCompoundStepCount] = useState<number>(10);
  
  // Basic calculations
  const totalTrades = trades.length;
  const wins = trades.filter(t => t.pnl > 0);
  const losses = trades.filter(t => t.pnl <= 0);
  const winCount = wins.length;
  const winRate = totalTrades > 0 ? (winCount / totalTrades) * 100 : 0;
  
  // Total PnL
  const totalPnL = trades.reduce((sum, t) => sum + t.pnl, 0);
  
  // Average Win and Average Loss
  const avgWin = wins.length > 0 ? wins.reduce((sum, t) => sum + t.pnl, 0) / wins.length : 0;
  const avgLoss = losses.length > 0 ? losses.reduce((sum, t) => sum + t.pnl, 0) / losses.length : 0;
  
  // Sorted trades ending balance
  const sortedTrades = [...trades].sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
  const currentBalance = sortedTrades.length > 0 
    ? sortedTrades[sortedTrades.length - 1].endingBalance 
    : settings.initialBalance;

  // Simulator compounding generator: Project what future balance looks like based on current balance and settings.targetCompoundingRate
  const getSimulatedSteps = () => {
    const steps: { step: number; balance: number; interest: number }[] = [];
    let bal = currentBalance;
    const rate = settings.targetCompoundingRate / 100;
    
    for (let i = 1; i <= compoundStepCount; i++) {
      const interest = bal * rate;
      bal += interest;
      steps.push({
        step: i,
        balance: parseFloat(bal.toFixed(2)),
        interest: parseFloat(interest.toFixed(2)),
      });
    }
    return steps;
  };

  const simulatedSteps = getSimulatedSteps();

  // Render a responsive visual SVG bar chart of Win Ratio
  const winPortion = totalTrades > 0 ? (winCount / totalTrades) * 100 : 0;
  const lossPortion = totalTrades > 0 ? 100 - winPortion : 0;

  return (
    <div className="flex flex-col gap-4 p-4 animate-fade-in pb-12">
      
      {/* General Metrics Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
        <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2">
          <BarChart3 size={14} className="text-indigo-400" />
          <span className="text-xs font-bold text-slate-300">Journal Valuation Metrics</span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-slate-500 font-medium">Net Profit/Loss to Date</span>
            <span className={`font-mono font-bold text-sm ${totalPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {totalPnL >= 0 ? '+' : ''}${totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-slate-500 font-medium">Average Win Trade</span>
            <span className="font-mono font-bold text-sm text-emerald-400">
              +${avgWin.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-slate-500 font-medium">Average Loss Trade</span>
            <span className="font-mono font-bold text-sm text-rose-450 text-rose-400">
              -${Math.abs(avgLoss).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-slate-500 font-medium">Profit Factor Ratio</span>
            <span className="font-bold text-sm text-slate-200">
              {avgLoss !== 0 ? (Math.abs(avgWin * wins.length) / Math.abs(avgLoss * losses.length) || 0).toFixed(2) : 'Perfect (No losses)'}
            </span>
          </div>
        </div>
      </div>

      {/* Win/Loss visual breakdown donut bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2.5">
        <span className="text-xs font-bold text-slate-300">Discipline Win/Loss Ratio</span>
        
        {totalTrades === 0 ? (
          <span className="text-[10px] text-slate-500">Record compounding trade entries to calculate ratios.</span>
        ) : (
          <div className="flex flex-col gap-2 mt-1">
            {/* Split progression bar */}
            <div className="w-full h-4 bg-slate-850 rounded-full flex overflow-hidden border border-slate-800">
              {winPortion > 0 && (
                <div 
                  className="h-full bg-emerald-500 transition-all" 
                  style={{ width: `${winPortion}%` }}
                  title={`Wins: ${winPortion.toFixed(1)}%`}
                />
              )}
              {lossPortion > 0 && (
                <div 
                  className="h-full bg-rose-500 transition-all" 
                  style={{ width: `${lossPortion}%` }}
                  title={`Losses: ${lossPortion.toFixed(1)}%`}
                />
              )}
            </div>

            <div className="flex justify-between items-center text-[10px] font-semibold text-slate-400">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded bg-emerald-500" />
                Wins ({winCount} trades — {winRate.toFixed(0)}%)
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded bg-rose-500" />
                Losses ({losses.length} trades — {(100 - winRate).toFixed(0)}%)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Compounding Projection Calculator Simulator */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
          <div className="flex items-center gap-1.5">
            <TrendingUp size={14} className="text-emerald-400" />
            <span className="text-xs font-bold text-slate-300">Staged Compounding Target Simulator</span>
          </div>
          <select
            value={compoundStepCount}
            onChange={(e) => setCompoundStepCount(parseInt(e.target.value))}
            className="bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-[10px] font-extrabold text-slate-300 outline-none"
          >
            <option value={5}>5 Steps</option>
            <option value={10}>10 Steps</option>
            <option value={15}>15 Steps</option>
            <option value={20}>20 Steps</option>
          </select>
        </div>

        <p className="text-[10px] text-slate-400 leading-normal pl-0.5">
          Projects successive compounding targets starting from your current active ledger balance (<strong>${currentBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong>) at <strong>{settings.targetCompoundingRate}%</strong> per trade compound yield.
        </p>

        {/* Compound projection table rows */}
        <div className="flex flex-col gap-1.5 max-h-[178px] overflow-y-auto pr-1 no-scrollbar border border-slate-950 p-1.5 rounded-lg bg-slate-950/40">
          {simulatedSteps.map((step) => (
            <div 
              key={`comp-step-${step.step}`}
              className="flex justify-between items-center text-[10px] py-1.5 border-b border-slate-900/60 last:border-0 pl-1.5 pr-1.5"
            >
              <span className="font-bold text-slate-500">Step {step.step}</span>
              <div className="flex items-center gap-3">
                <span className="text-emerald-500/80 font-mono font-bold">
                  +${step.interest.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                <span className="font-mono font-extrabold text-slate-200">
                  ${step.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-lg p-2 flex items-start gap-1.5 text-[9px] text-indigo-400 leading-relaxed">
          <Info size={11} className="mt-0.5 flex-shrink-0" />
          <span>
            Compounding relies on preserving earned gains in consecutive trades, effectively compounding risk sizing over time. Ensure proper position sizing defaults.
          </span>
        </div>
      </div>

      <div className="h-6" />
    </div>
  );
};
