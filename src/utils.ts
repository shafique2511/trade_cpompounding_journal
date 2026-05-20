import { Trade, AppSettings } from './types';

const STORAGE_KEY_TRADES = 'trade_compounding_journal_trades';
const STORAGE_KEY_SETTINGS = 'trade_compounding_journal_settings';

export const DEFAULT_SETTINGS: AppSettings = {
  initialBalance: 1000,
  targetCompoundingRate: 2.0, // 2% per trade
  riskRateDefault: 1.0, // 1% default risk
  baseCurrency: 'USD',
  themeMode: 'DARK',
};

// Generates some high-quality initial mock trades so the user sees compounding in action immediately
export const GET_INITIAL_TRADES = (startingBalance: number): Trade[] => {
  const now = new Date();
  const tradesData = [
    { symbol: 'BTCUSDT', type: 'LONG' as const, entry: 64200, exit: 65484, qty: 0.05, notes: 'Broke out of bull flag. Clean retest of 4h EMA.', rating: 5, hoursOffset: 48 },
    { symbol: 'ETHUSDT', type: 'SHORT' as const, entry: 3450, exit: 3415, qty: 1.2, notes: 'Double top at resistance. Perfect rejection.', rating: 4, hoursOffset: 40 },
    { symbol: 'SOLUSDT', type: 'LONG' as const, entry: 142.5, exit: 141.2, qty: 15, notes: 'Tried to catch higher low, but got stopped out early.', rating: 2, hoursOffset: 30 },
    { symbol: 'BTCUSDT', type: 'LONG' as const, entry: 65100, exit: 66400, qty: 0.04, notes: 'Compounding trade. Target hit on weekend squeeze.', rating: 5, hoursOffset: 20 },
    { symbol: 'AVAXUSDT', type: 'LONG' as const, entry: 28.4, exit: 29.54, qty: 50, notes: 'Breakout of ascending triangle. Set exit at local peak.', rating: 4, hoursOffset: 12 },
  ];

  let currentBalance = startingBalance;
  return tradesData.map((t, idx) => {
    const tradeTime = new Date();
    tradeTime.setHours(now.getHours() - t.hoursOffset);

    const entryValue = t.entry * t.qty;
    const exitValue = t.exit * t.qty;
    const pnl = t.type === 'LONG' ? (exitValue - entryValue) : (entryValue - exitValue);
    const pnlPercentage = (pnl / entryValue) * 100;
    
    const startObj = currentBalance;
    currentBalance += pnl;

    return {
      id: `mock-trade-${idx + 1}`,
      symbol: t.symbol,
      type: t.type,
      entryPrice: t.entry,
      exitPrice: t.exit,
      quantity: t.qty,
      pnl: parseFloat(pnl.toFixed(2)),
      pnlPercentage: parseFloat(pnlPercentage.toFixed(2)),
      dateTime: tradeTime.toISOString(),
      startingBalance: parseFloat(startObj.toFixed(2)),
      endingBalance: parseFloat(currentBalance.toFixed(2)),
      notes: t.notes,
      rating: t.rating,
    };
  });
};

export function getAppSettings(): AppSettings {
  const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
  if (!saved) return DEFAULT_SETTINGS;
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveAppSettings(settings: AppSettings): void {
  localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
}

export function getStoredTrades(initialBalance: number): Trade[] {
  const saved = localStorage.getItem(STORAGE_KEY_TRADES);
  if (!saved) {
    const initialTrades = GET_INITIAL_TRADES(initialBalance);
    saveTrades(initialTrades);
    return initialTrades;
  }
  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
}

export function saveTrades(trades: Trade[]): void {
  localStorage.setItem(STORAGE_KEY_TRADES, JSON.stringify(trades));
}

// Recalculates starting and ending balances chronologically for all trades based on initial balance
export function recalculateCompoundingChain(trades: Trade[], initialBalance: number): Trade[] {
  // Sort trades chronologically (ascending date-time)
  const sortedTrades = [...trades].sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
  
  let currentBalance = initialBalance;
  
  return sortedTrades.map((trade) => {
    const start = currentBalance;
    const end = currentBalance + trade.pnl;
    currentBalance = end;
    
    return {
      ...trade,
      startingBalance: parseFloat(start.toFixed(2)),
      endingBalance: parseFloat(end.toFixed(2)),
    };
  });
}

// Formats a local ISO string to readable device date-time
export function formatLocalDateTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return isoString;
  }
}

// Generate CSV string from trades
export function exportTradesToCSV(trades: Trade[]): string {
  const headers = ['ID', 'Date/Time (Local)', 'Symbol', 'Type', 'Entry Price', 'Exit Price', 'Quantity', 'Profit/Loss', 'Gain %', 'Start Balance', 'End Balance', 'Notes', 'Rating'];
  const rows = trades.map(t => [
    t.id,
    t.dateTime,
    t.symbol,
    t.type,
    t.entryPrice,
    t.exitPrice,
    t.quantity,
    t.pnl,
    t.pnlPercentage,
    t.startingBalance,
    t.endingBalance,
    t.notes || '',
    t.rating || ''
  ]);
  
  return [headers.join(','), ...rows.map(row => row.map(val => {
    const str = String(val).replace(/"/g, '""');
    return str.includes(',') ? `"${str}"` : str;
  }).join(','))].join('\n');
}
