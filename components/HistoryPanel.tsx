import React from 'react';
import { HistoryItem } from '../types';
import { HistoryIcon } from './icons/HistoryIcon';
import { ReloadIcon } from './icons/ReloadIcon';
import { TrashIcon } from './icons/TrashIcon';

interface HistoryPanelProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onSelect, onClear }) => {
  if (history.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <HistoryIcon />
          试穿历史
        </h2>
        <button
          onClick={onClear}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-400 bg-red-900/50 rounded-lg hover:bg-red-900/80 transition-colors"
          aria-label="清空历史"
        >
          <TrashIcon />
          清空历史
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {history.map((item) => (
          <div key={item.id} className="group relative aspect-square bg-gray-900 rounded-lg overflow-hidden shadow-lg">
            <img
              src={`data:image/png;base64,${item.resultImage}`}
              alt="History item"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center">
              <button
                onClick={() => onSelect(item)}
                className="flex items-center gap-2 px-4 py-2 bg-brand-secondary text-white font-bold rounded-lg shadow-md opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all duration-300"
                aria-label="使用此历史记录"
              >
                <ReloadIcon />
                使用
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryPanel;
