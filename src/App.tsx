import React, { useState, useEffect } from 'react';
import { Trade, AppSettings, ScreenType } from './types';
import { 
  getAppSettings, 
  saveAppSettings, 
  getStoredTrades, 
  saveTrades, 
  recalculateCompoundingChain, 
  GET_INITIAL_TRADES 
} from './utils';

// Core Subcomponents Imports
import { AndroidEmulatorFrame } from './components/AndroidEmulatorFrame';
import { DashboardView } from './components/DashboardView';
import { JournalView } from './components/JournalView';
import { AddEditTradeView } from './components/AddEditTradeView';
import { TradeDetailView } from './components/TradeDetailView';
import { AnalyticsView } from './components/AnalyticsView';
import { SettingsView } from './components/SettingsView';
import { ExportBackupView } from './components/ExportBackupView';

// Icons for M3 Bottom Navigation
import { Database, Book, BarChart3, Settings as SettingsIcon, Plus } from 'lucide-react';

export default function App() {
  // Load settings initially
  const [settings, setSettings] = useState<AppSettings>(() => getAppSettings());
  
  // Load trades initially using settings starting balance
  const [trades, setTrades] = useState<Trade[]>(() => getStoredTrades(settings.initialBalance));

  // Navigation state
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('DASHBOARD');
  const [selectedTradeId, setSelectedTradeId] = useState<string | null>(null);

  // Track if current screen needs a mobile-style back action
  const isFormOrDetailView = 
    currentScreen === 'ADD_TRADE' || 
    currentScreen === 'EDIT_TRADE' || 
    currentScreen === 'TRADE_DETAIL' ||
    currentScreen === 'EXPORT_BACKUP';

  // Navigate helper with potential arguments (e.g. trade ID specifiers)
  const handleNavigate = (screen: ScreenType, tradeId?: string) => {
    if (tradeId) {
      setSelectedTradeId(tradeId);
    }
    setCurrentScreen(screen);
  };

  const handleBackNavigation = () => {
    switch (currentScreen) {
      case 'ADD_TRADE':
        setCurrentScreen('DASHBOARD');
        break;
      case 'EDIT_TRADE':
        setCurrentScreen(selectedTradeId ? 'TRADE_DETAIL' : 'JOURNAL');
        break;
      case 'TRADE_DETAIL':
        setCurrentScreen('JOURNAL');
        setSelectedTradeId(null);
        break;
      case 'EXPORT_BACKUP':
        setCurrentScreen('SETTINGS');
        break;
      default:
        setCurrentScreen('DASHBOARD');
    }
  };

  // Re-calculate the active compounding chain when settings (e.g. Initial balance) change
  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveAppSettings(newSettings);

    const reCompounded = recalculateCompoundingChain(trades, newSettings.initialBalance);
    setTrades(reCompounded);
    saveTrades(reCompounded);
  };

  // Log or update trade
  const handleSaveTrade = (tradeData: Partial<Trade>) => {
    let updatedTrades: Trade[];

    if (tradeData.id) {
      // EDIT MODE
      updatedTrades = trades.map((t) => (t.id === tradeData.id ? { ...t, ...tradeData } as Trade : t));
    } else {
      // ADD MODE
      const newTrade: Trade = {
        id: `trade-${Date.now()}`,
        symbol: tradeData.symbol || 'BTCUSDT',
        type: tradeData.type || 'LONG',
        entryPrice: tradeData.entryPrice || 0,
        exitPrice: tradeData.exitPrice || 0,
        quantity: tradeData.quantity || 0,
        pnl: tradeData.pnl || 0,
        pnlPercentage: tradeData.pnlPercentage || 0,
        dateTime: tradeData.dateTime || new Date().toISOString(),
        startingBalance: 0, // calculated next
        endingBalance: 0,   // calculated next
        notes: tradeData.notes,
        rating: tradeData.rating,
      };
      updatedTrades = [...trades, newTrade];
    }

    // Recompiles and re-sorts sequential compound balances
    const chained = recalculateCompoundingChain(updatedTrades, settings.initialBalance);
    setTrades(chained);
    saveTrades(chained);

    // Redirect
    if (tradeData.id) {
      setCurrentScreen('TRADE_DETAIL');
    } else {
      setCurrentScreen('DASHBOARD');
    }
  };

  // Delete trade
  const handleDeleteTrade = (id: string) => {
    const remaining = trades.filter((t) => t.id !== id);
    const chained = recalculateCompoundingChain(remaining, settings.initialBalance);
    
    setTrades(chained);
    saveTrades(chained);
    
    setCurrentScreen('JOURNAL');
    setSelectedTradeId(null);
  };

  // RESTORE backup
  const handleRestoreImportedBackup = (importedTrades: Trade[]) => {
    const chained = recalculateCompoundingChain(importedTrades, settings.initialBalance);
    setTrades(chained);
    saveTrades(chained);
    setCurrentScreen('DASHBOARD');
  };

  // Reset back to mock data
  const handleDemoReset = () => {
    const defaultTrades = GET_INITIAL_TRADES(settings.initialBalance);
    setTrades(defaultTrades);
    saveTrades(defaultTrades);
    setCurrentScreen('DASHBOARD');
  };

  // Screen Selection Router
  const renderScreenContent = () => {
    switch (currentScreen) {
      case 'DASHBOARD':
        return (
          <DashboardView 
            trades={trades} 
            settings={settings} 
            onNavigate={handleNavigate}
            onQuickResetDemo={handleDemoReset}
          />
        );
      case 'JOURNAL':
        return (
          <JournalView 
            trades={trades} 
            onNavigate={handleNavigate} 
          />
        );
      case 'ADD_TRADE':
        return (
          <AddEditTradeView 
            trades={trades}
            settings={settings}
            onSave={handleSaveTrade}
            onCancel={handleBackNavigation}
          />
        );
      case 'EDIT_TRADE':
        return (
          <AddEditTradeView 
            currentTradeId={selectedTradeId}
            trades={trades}
            settings={settings}
            onSave={handleSaveTrade}
            onCancel={handleBackNavigation}
          />
        );
      case 'TRADE_DETAIL':
        return (
          <TradeDetailView 
            tradeId={selectedTradeId || ''} 
            trades={trades} 
            settings={settings}
            onBack={handleBackNavigation}
            onEdit={(id) => handleNavigate('EDIT_TRADE', id)}
            onDelete={handleDeleteTrade}
          />
        );
      case 'ANALYTICS':
        return (
          <AnalyticsView 
            trades={trades} 
            settings={settings} 
          />
        );
      case 'SETTINGS':
        return (
          <SettingsView 
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onQuickResetDemo={handleDemoReset}
            onNavigate={handleNavigate}
          />
        );
      case 'EXPORT_BACKUP':
        return (
          <ExportBackupView 
            trades={trades}
            settings={settings}
            onBack={handleBackNavigation}
            onImportBackup={handleRestoreImportedBackup}
          />
        );
      default:
        return (
          <DashboardView 
            trades={trades} 
            settings={settings} 
            onNavigate={handleNavigate}
            onQuickResetDemo={handleDemoReset}
          />
        );
    }
  };

  // Custom Emulator bar title Based on Context
  const getHeaderTitle = () => {
    switch (currentScreen) {
      case 'DASHBOARD': return 'Compounding Dashboard';
      case 'JOURNAL': return 'Compounded Ledger Jurnals';
      case 'ADD_TRADE': return 'New Compounding Trade';
      case 'EDIT_TRADE': return 'Edit Trade Log';
      case 'TRADE_DETAIL': return 'Trade Specifications';
      case 'ANALYTICS': return 'Performance Diagnostics';
      case 'SETTINGS': return 'Journal settings';
      case 'EXPORT_BACKUP': return 'Ledger Backup Center';
      default: return 'Trade Compounding Journal';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between font-sans overflow-x-hidden antialiased">
      
      {/* Centered Pixel Bezel Container */}
      <AndroidEmulatorFrame 
        title={getHeaderTitle()} 
        onBack={handleBackNavigation} 
        showBack={isFormOrDetailView}
      >
        <div className="flex-1 flex flex-col min-h-0 relative">
          
          {/* Active Screen Window */}
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {renderScreenContent()}
          </div>

          {/* Fab Trigger Floating Action Button */}
          {['DASHBOARD', 'JOURNAL'].includes(currentScreen) && (
            <button
              onClick={() => handleNavigate('ADD_TRADE')}
              id="fab-trigger-add-trade"
              className="absolute bottom-4 right-4 w-12 h-12 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-lg shadow-indigo-950 flex items-center justify-center cursor-pointer transition active:scale-90 hover:scale-105 duration-200 z-30 border border-indigo-400/25"
            >
              <Plus size={24} />
            </button>
          )}

          {/* Android Jetpack Mock Navigation Bar on main views */}
          {!isFormOrDetailView && (
            <div className="bg-slate-900 border-t border-slate-800/80 h-[58px] px-3 flex justify-around items-center select-none flex-shrink-0 z-20">
              {/* Dashboard */}
              <button
                onClick={() => handleNavigate('DASHBOARD')}
                id="tab-btn-dashboard"
                className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 px-1.5 rounded-xl transition ${
                  currentScreen === 'DASHBOARD' 
                    ? 'text-indigo-400 bg-indigo-500/5' 
                    : 'text-slate-500 hover:text-slate-400'
                }`}
              >
                <Database size={16} />
                <span className="text-[9px] font-black tracking-wide uppercase">Dashboard</span>
              </button>

              {/* Journal */}
              <button
                onClick={() => handleNavigate('JOURNAL')}
                id="tab-btn-journal"
                className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 px-1.5 rounded-xl transition ${
                  currentScreen === 'JOURNAL' 
                    ? 'text-indigo-400 bg-indigo-500/5' 
                    : 'text-slate-500 hover:text-slate-400'
                }`}
              >
                <Book size={16} />
                <span className="text-[9px] font-black tracking-wide uppercase">Journal</span>
              </button>

              {/* Analytics */}
              <button
                onClick={() => handleNavigate('ANALYTICS')}
                id="tab-btn-analytics"
                className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 px-1.5 rounded-xl transition ${
                  currentScreen === 'ANALYTICS' 
                    ? 'text-indigo-400 bg-indigo-500/5' 
                    : 'text-slate-500 hover:text-slate-400'
                }`}
              >
                <BarChart3 size={16} />
                <span className="text-[9px] font-black tracking-wide uppercase">Metrics</span>
              </button>

              {/* Settings */}
              <button
                onClick={() => handleNavigate('SETTINGS')}
                id="tab-btn-settings"
                className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 px-1.5 rounded-xl transition ${
                  currentScreen === 'SETTINGS' 
                    ? 'text-indigo-400 bg-indigo-500/5' 
                    : 'text-slate-500 hover:text-slate-400'
                }`}
              >
                <SettingsIcon size={16} />
                <span className="text-[9px] font-black tracking-wide uppercase">Settings</span>
              </button>
            </div>
          )}

        </div>
      </AndroidEmulatorFrame>

    </div>
  );
}
