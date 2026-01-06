
import React, { useRef } from 'react';
import { Trash2, FileText, X, Download, Upload, Archive, Calendar } from 'lucide-react';
import { SavedReport } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
  archives: SavedReport[];
  onLoad: (report: SavedReport) => void;
  onDelete: (id: string) => void;
  onExportAll: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClose: () => void;
}

const ArchiveList: React.FC<Props> = ({ archives, onLoad, onDelete, onExportAll, onImport, onClose }) => {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="fixed inset-y-0 left-0 w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl z-[60] animate-slide-in-left flex flex-col border-r border-white/50 dark:border-slate-700/50">
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white/50 dark:bg-slate-900/50">
        <h2 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Archive className="w-4 h-4 text-slate-400" />
            {t('load_archive_title')}
        </h2>
        <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
      
      {/* Backup & Restore Controls */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex gap-2">
             <button 
                onClick={onExportAll}
                className="flex-1 flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 py-2.5 px-3 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-800 transition-all shadow-sm"
             >
                <Download className="w-3 h-3" />
                {t('export_all')}
             </button>
             
             <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 py-2.5 px-3 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-green-600 dark:hover:text-green-400 hover:border-green-200 dark:hover:border-green-800 transition-all shadow-sm"
             >
                <Upload className="w-3 h-3" />
                {t('import_json')}
             </button>
             <input 
                type="file" 
                ref={fileInputRef} 
                onChange={onImport} 
                className="hidden" 
                accept="application/json" 
                multiple
             />
          </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {archives.length === 0 ? (
          <div className="text-center py-20 text-slate-400 dark:text-slate-500 text-sm flex flex-col items-center gap-3">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-full">
                <Archive className="w-8 h-8 opacity-20" />
            </div>
            {t('no_archives')}
          </div>
        ) : (
          archives.map((report) => (
            <div 
              key={report.id}
              className="group bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-4 hover:shadow-lg hover:border-rose-100 dark:hover:border-rose-900 hover:-translate-y-0.5 transition-all duration-300 relative cursor-pointer"
              onClick={() => onLoad(report)}
            >
              <div className="flex items-start gap-3">
                 <div className="mt-1 p-2 bg-rose-50 dark:bg-rose-900/20 rounded-lg text-rose-500 dark:text-rose-400">
                    <FileText className="w-4 h-4" />
                 </div>
                 <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 line-clamp-2 leading-snug mb-2 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                        {report.title}
                    </h3>
                    <div className="flex items-center gap-2">
                         <Calendar className="w-3 h-3 text-slate-300 dark:text-slate-500" />
                         <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                            {new Date(report.timestamp).toLocaleDateString()}
                        </span>
                    </div>
                 </div>
              </div>
              
              <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(report.id);
                  }}
                  className="absolute bottom-3 right-3 p-1.5 text-slate-300 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  title={t('delete')}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ArchiveList;
