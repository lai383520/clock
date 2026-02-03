import React, { useState } from 'react';
import { TimeConfig, AlertConfig } from '../types';
import { Plus, Trash2, Bell } from 'lucide-react';

interface ConfigPanelProps {
  duration: TimeConfig;
  setDuration: React.Dispatch<React.SetStateAction<TimeConfig>>;
  warningSeconds: number;
  setWarningSeconds: (val: number) => void;
  alerts: AlertConfig[];
  setAlerts: React.Dispatch<React.SetStateAction<AlertConfig[]>>;
  disabled: boolean;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({
  duration,
  setDuration,
  warningSeconds,
  setWarningSeconds,
  alerts,
  setAlerts,
  disabled,
}) => {
  const [newAlertSeconds, setNewAlertSeconds] = useState(30);
  const [newAlertCount, setNewAlertCount] = useState(2);

  const handleChange = (field: keyof TimeConfig, value: string) => {
    const numVal = Math.max(0, parseInt(value) || 0);
    setDuration((prev) => ({ ...prev, [field]: numVal }));
  };

  const addAlert = () => {
    if (newAlertSeconds > 0 && newAlertCount > 0) {
      setAlerts(prev => [
        ...prev, 
        { id: Date.now().toString(), remainingSeconds: newAlertSeconds, beepCount: newAlertCount }
      ].sort((a, b) => b.remainingSeconds - a.remainingSeconds)); // Sort descending by time
    }
  };

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const inputClass = "bg-gray-800 border border-gray-700 text-white text-center rounded-lg p-3 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-full font-mono transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const labelClass = "text-gray-400 text-xs uppercase tracking-wider mb-1 block text-center";

  return (
    <div className={`bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700 w-full max-w-md transition-opacity duration-300 ${disabled ? 'opacity-50 pointer-events-none grayscale' : 'opacity-100'}`}>
      
      {/* Duration Inputs */}
      <div className="mb-6 border-b border-gray-700 pb-6">
        <h3 className="text-blue-400 text-sm font-bold mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            設定倒數時間 (Duration)
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>時 (Hr)</label>
            <input
              type="number"
              value={duration.hours}
              onChange={(e) => handleChange('hours', e.target.value)}
              className={inputClass}
              min={0}
              max={99}
              disabled={disabled}
            />
          </div>
          <div>
            <label className={labelClass}>分 (Min)</label>
            <input
              type="number"
              value={duration.minutes}
              onChange={(e) => handleChange('minutes', e.target.value)}
              className={inputClass}
              min={0}
              max={59}
              disabled={disabled}
            />
          </div>
          <div>
            <label className={labelClass}>秒 (Sec)</label>
            <input
              type="number"
              value={duration.seconds}
              onChange={(e) => handleChange('seconds', e.target.value)}
              className={inputClass}
              min={0}
              max={59}
              disabled={disabled}
            />
          </div>
        </div>
      </div>

      {/* Visual Warning Input */}
      <div className="mb-6 border-b border-gray-700 pb-6">
        <h3 className="text-amber-400 text-sm font-bold mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            視覺警戒起始點 (Visual Warning)
        </h3>
        <div className="flex items-center gap-4">
            <div className="flex-1">
                 <input
                    type="range"
                    min="5"
                    max="60"
                    step="5"
                    value={warningSeconds}
                    onChange={(e) => setWarningSeconds(Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    disabled={disabled}
                />
            </div>
            <div className="w-24 text-right font-mono text-amber-500 font-bold text-xl">
                {warningSeconds}s
            </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">進入此秒數時，介面變色並持續發出滴答聲。</p>
      </div>

      {/* Custom Alerts */}
      <div>
        <h3 className="text-emerald-400 text-sm font-bold mb-4 flex items-center gap-2">
            <Bell size={16} />
            自訂聲音提醒 (Custom Alerts)
        </h3>
        
        {/* Add New Alert */}
        <div className="flex gap-2 mb-4 items-end">
            <div className="flex-1">
                <label className={labelClass}>剩餘秒數</label>
                <input 
                    type="number" 
                    min="1" 
                    value={newAlertSeconds}
                    onChange={(e) => setNewAlertSeconds(parseInt(e.target.value))}
                    className={`${inputClass} text-sm p-2`}
                    disabled={disabled}
                />
            </div>
            <div className="flex-1">
                <label className={labelClass}>警示音次數</label>
                <input 
                    type="number" 
                    min="1" 
                    max="10"
                    value={newAlertCount}
                    onChange={(e) => setNewAlertCount(parseInt(e.target.value))}
                    className={`${inputClass} text-sm p-2`}
                    disabled={disabled}
                />
            </div>
            <button 
                onClick={addAlert}
                disabled={disabled}
                className="h-[46px] w-[46px] flex items-center justify-center bg-blue-600 hover:bg-blue-500 rounded-lg text-white transition-colors disabled:opacity-50"
            >
                <Plus size={20} />
            </button>
        </div>

        {/* List */}
        <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
            {alerts.length === 0 && (
                <p className="text-center text-gray-600 text-xs py-2 italic">尚無自訂提醒 (No custom alerts)</p>
            )}
            {alerts.map(alert => (
                <div key={alert.id} className="flex items-center justify-between bg-gray-800 p-2 rounded px-3 border border-gray-700">
                    <div className="flex items-center gap-3">
                        <span className="font-mono text-emerald-400 font-bold">{alert.remainingSeconds}s</span>
                        <span className="text-gray-500 text-xs">剩餘</span>
                    </div>
                    <div className="flex items-center gap-3">
                         <span className="text-xs text-gray-400">{alert.beepCount} 次嗶聲</span>
                         <button 
                            onClick={() => removeAlert(alert.id)}
                            disabled={disabled}
                            className="text-gray-500 hover:text-red-400 transition-colors"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
      </div>

    </div>
  );
};

export default ConfigPanel;