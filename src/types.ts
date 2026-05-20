export interface Trade {
  id: string;
  symbol: string;
  type: 'LONG' | 'SHORT';
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
  pnlPercentage: number;
  dateTime: string; // ISO Local Date string (Android device time)
  startingBalance: number;
  endingBalance: number;
  notes?: string;
  rating?: number; // 1 to 5 stars
  stopLoss?: number;
  takeProfit?: number;
}

export interface AppSettings {
  initialBalance: number;
  targetCompoundingRate: number; // e.g., 2% per trade
  riskRateDefault: number; // e.g., 1% of account
  baseCurrency: string; // e.g., "USD", "BTC"
  themeMode: 'LIGHT' | 'DARK';
}

export type ScreenType = 
  | 'DASHBOARD'
  | 'JOURNAL'
  | 'ADD_TRADE'
  | 'EDIT_TRADE'
  | 'TRADE_DETAIL'
  | 'ANALYTICS'
  | 'SETTINGS'
  | 'EXPORT_BACKUP';
