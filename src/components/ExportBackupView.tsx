import React, { useRef, useState } from 'react';
import { Trade, AppSettings } from '../types';
import { ArrowLeft, Download, Upload, Check, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';
import { exportTradesToCSV, recalculateCompoundingChain } from '../utils';

interface ExportBackupViewProps {
  trades: Trade[];
  settings: AppSettings;
  onBack: () => void;
  onImportBackup: (importedTrades: Trade[]) => void;
}

export const ExportBackupView: React.FC<ExportBackupViewProps> = ({
  trades,
  settings,
  onBack,
  onImportBackup,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Download trade logs as standard readable CSV
  const handleCSVDownload = () => {
    try {
      const csvContent = exportTradesToCSV(trades);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `trade_compounding_journal_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSuccessMsg('CSV ledger downloaded successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch {
      setErrorMsg('Failed to export CSV. Please try again.');
    }
  };

  // Download entire settings and trade array as JSON backup file suitable for recovery
  const handleJSONDownload = () => {
    try {
      const backupData = {
        app: 'Trade Compounding Journal',
        exportDate: new Date().toISOString(),
        settings,
        trades,
      };

      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('download', `tc_journal_sqlite_backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSuccessMsg('JSON ledger backup file generated!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch {
      setErrorMsg('Failed to create JSON backup.');
    }
  };

  // Upload JSON file, parse, validate schema, update local storage, and trigger reload
  const handleJSONUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        // Simple validation checks on schema
        if (!parsed.trades || !Array.isArray(parsed.trades)) {
          throw new Error('Database backup is missing valid trades array logs.');
        }

        const rawTrades: Trade[] = parsed.trades;
        onImportBackup(rawTrades);

        setSuccessMsg(`Database restored! Imported ${rawTrades.length} trades.`);
        setTimeout(() => setSuccessMsg(null), 4000);
      } catch (err: any) {
        setErrorMsg(err?.message || 'Invalid journal json schema template uploaded.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col gap-4 p-4 animate-fade-in pb-12 text-xs">
      
      {/* Header operations back btn copy */}
      <button 
        onClick={onBack}
        id="btn-backup-back"
        className="text-xs text-slate-400 hover:text-slate-200 font-bold flex items-center gap-1 self-start"
      >
        <ArrowLeft size={13} /> Back to parameters
      </button>

      {/* Success Banner */}
      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 p-3.5 rounded-xl flex items-start gap-2 animate-fade-in">
          <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Error Banner */}
      {errorMsg && (
        <div className="bg-rose-500/10 border border-rose-500/25 text-rose-400 p-3.5 rounded-xl flex items-start gap-2 animate-fade-in">
          <AlertTriangle size={16} className="text-rose-400 flex-shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Export Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
        <span className="font-extrabold text-slate-300">Spreadsheet Exports</span>
        <p className="text-[10px] text-slate-500 leading-normal mb-1">
          Export your compiled compounds and chronological ledger lines as standard CSV formats. Useful for analysis in Excel or Google Sheets.
        </p>

        <button
          onClick={handleCSVDownload}
          id="btn-export-csv"
          className="w-full bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-505/20 border-indigo-500/30 text-indigo-400 font-extrabold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95 duration-150"
        >
          <Download size={13} /> Download CSV Spreadsheet
        </button>
      </div>

      {/* Backup recovery section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
        <span className="font-extrabold text-slate-300">SQLite Log Backups</span>
        <p className="text-[10px] text-slate-500 leading-normal mb-1">
          Operates native JSON archives representing individual trade collections and core parameters. Perfect to migrates details between devices.
        </p>

        <div className="flex flex-col gap-2">
          {/* Download JSON Backup file */}
          <button
            onClick={handleJSONDownload}
            id="btn-export-json"
            className="w-full bg-slate-950 border border-slate-800 hover:bg-slate-900 hover:text-slate-200 text-slate-400 font-extrabold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95 duration-150"
          >
            <Download size={13} /> Extract JSON backup
          </button>

          {/* Upload JSON Restore */}
          <button
            onClick={() => fileInputRef.current?.click()}
            id="btn-import-json-trigger"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-indigo-950/20 transition active:scale-95 duration-150"
          >
            <Upload size={13} /> Restore JSON backup
          </button>
          
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleJSONUploadFile}
            accept=".json"
            className="hidden"
          />
        </div>
      </div>

      {/* Database Warning */}
      <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-xl p-3 flex items-start gap-2.5 text-[10px] text-yellow-500/80 leading-normal">
        <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
        <span>
          Restoring database backups overwrites your existing trade ledger chronologies inside standard room SQL workspaces. Back up anything important beforehand.
        </span>
      </div>

      <div className="h-6" />
    </div>
  );
};
