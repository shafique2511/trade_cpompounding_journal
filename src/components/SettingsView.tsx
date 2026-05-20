import React, { useState } from 'react';
import { AppSettings, ScreenType } from '../types';
import { Settings, Shield, Check } from 'lucide-react';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onQuickResetDemo: () => void;
  onNavigate: (screen: ScreenType) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onQuickResetDemo,
  onNavigate,
}) => {
  const [initialBalance, setInitialBalance] = useState(settings.initialBalance.toString());
  const [targetRate, setTargetRate] = useState(settings.targetCompoundingRate.toString());
  const [currency, setCurrency] = useState(settings.baseCurrency);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(false);

    const initVal = parseFloat(initialBalance) || 1200;
    const rateVal = parseFloat(targetRate) || 2.0;

    onUpdateSettings({
      ...settings,
      initialBalance: initVal,
      targetCompoundingRate: rateVal,
      baseCurrency: currency,
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="flex flex-col gap-4 p-4 animate-fade-in pb-12 text-xs">
      
      {/* Settings Form Card */}
      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-4">
        <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2">
          <Settings size={14} className="text-indigo-400" />
          <span className="text-xs font-bold text-slate-300">Journal Core Parameters</span>
        </div>

        {/* Initial Staged Balance */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase font-bold text-slate-500 pl-0.5">
            Initial Staged Balance ($)
          </label>
          <input 
            type="number"
            step="any"
            value={initialBalance}
            onChange={(e) => setInitialBalance(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-indigo-505 focus:border-indigo-500 transition"
          />
          <span className="text-[9px] text-slate-500 pl-0.5">
            Initial capital size before any compounding calculation traces.
          </span>
        </div>

        {/* Target compounding rate */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase font-bold text-slate-500 pl-0.5">
            Target Growth Compounding Rate (%) per Trade
          </label>
          <input 
            type="number"
            step="any"
            value={targetRate}
            onChange={(e) => setTargetRate(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-indigo-505 focus:border-indigo-500 transition"
          />
          <span className="text-[9px] text-slate-500 pl-0.5">
            Utilized for compiling Step Target Compounding projections.
          </span>
        </div>

        {/* Base Currency selection */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase font-bold text-slate-500 pl-0.5">
            Base Ledger Symbol
          </label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-indigo-505 focus:border-indigo-500 transition"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="BTC">BTC (₿)</option>
            <option value="USDT">USDT (₮)</option>
          </select>
        </div>

        {/* Save button */}
        <button
          type="submit"
          id="btn-settings-submit"
          className={`w-full py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 duration-150 ${
            saveSuccess 
              ? 'bg-emerald-600 text-white' 
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-950/20'
          }`}
        >
          {saveSuccess ? (
            <>
              <Check size={13} className="animate-bounce" /> Core Parameters Updated
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </form>

      {/* Navigation Shortcuts Card */}
      <div 
        onClick={() => onNavigate('EXPORT_BACKUP')}
        id="btn-shortcut-backup"
        className="bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:border-slate-700 rounded-xl p-3.5 flex justify-between items-center cursor-pointer transition active:scale-[0.99] duration-150"
      >
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] font-extrabold text-white">Export & Backup Database</span>
          <span className="text-[9px] text-slate-500">Extract ledger csv documents or reload JSON file logs</span>
        </div>
        <span className="text-xs text-indigo-400 font-bold">&#10142;</span>
      </div>

      {/* Safety Notice Card */}
      <div className="bg-slate-900/40 border border-slate-900/80 rounded-2xl p-4 flex flex-col gap-2">
        <div className="flex items-center gap-1.5">
          <Shield size={14} className="text-emerald-500" />
          <span className="text-xs font-bold text-slate-300">Local Privacy Architecture</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-normal pl-0.5">
          This app operates <strong>local-first</strong>. All calculations, trades, and preferences are committed directly to active browser space configurations (e.g. <code>localStorage</code>) to simulate local SQLite Tables.
        </p>
      </div>

      <div className="h-4" />
    </div>
  );
};
