
import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, Sparkles, Link as LinkIcon, Cookie, FileText, ArrowRight, ImagePlus } from 'lucide-react';
import { extractTextFromImage } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
  onAnalyze: (text: string, cookie?: string) => void;
  isAnalyzing: boolean;
}

const AnalysisInput: React.FC<Props> = ({ onAnalyze, isAnalyzing }) => {
  const { t } = useLanguage();
  const [mode, setMode] = useState<'text' | 'url'>('text');
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [cookie, setCookie] = useState('');
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setIsOcrLoading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        const extractedText = await extractTextFromImage(base64Data);
        setText(prev => {
            const separator = prev.trim() ? '\n\n--- [Image Content] ---\n' : '';
            return prev + separator + extractedText;
        });
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      alert("Failed to read image");
    } finally {
      setIsOcrLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    // Check for image items in the clipboard
    const items = e.clipboardData.items;
    let imageFound = false;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
            e.preventDefault(); // Prevent default paste behavior if it's an image
            imageFound = true;
            processFile(file);
        }
      }
    }
  };

  const handleAnalyzeClick = () => {
    if (mode === 'text') {
      onAnalyze(text);
    } else {
      onAnalyze(url, cookie);
    }
  };

  const handleUrlPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const urlMatch = pastedText.match(/(https?:\/\/[^\s]+)/);
    if (urlMatch) {
        setUrl(urlMatch[0]);
    } else {
        setUrl(pastedText);
    }
  };

  const isButtonDisabled = isAnalyzing || isOcrLoading || (mode === 'text' ? !text.trim() : !url.trim());

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white dark:border-slate-800 p-8 transition-all hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] relative overflow-hidden group">
      
      {/* Decorative gradient blob */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-900/20 dark:to-orange-900/20 rounded-full blur-3xl opacity-50 -z-10 translate-x-1/3 -translate-y-1/3"></div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
         <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold shadow-lg shadow-slate-900/20 dark:shadow-white/10">1</span>
            {t('input_source')}
         </h2>
         
         {/* Segmented Control */}
         <div className="bg-slate-100/80 dark:bg-slate-800 p-1.5 rounded-xl flex items-center gap-1 w-full md:w-auto">
            <button
                onClick={() => setMode('text')}
                className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2
                    ${mode === 'text' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
                <FileText className="w-4 h-4" />
                {t('tab_text')}
            </button>
            <button
                onClick={() => setMode('url')}
                className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2
                    ${mode === 'url' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
                <LinkIcon className="w-4 h-4" />
                {t('tab_url')}
            </button>
         </div>
      </div>
      
      {mode === 'text' ? (
        <div className="animate-fade-in space-y-4">
          <div className="relative group/textarea">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onPaste={handlePaste}
              placeholder={t('placeholder_text')}
              className="w-full h-56 p-6 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 focus:bg-white dark:focus:bg-slate-800 resize-none text-base text-slate-700 dark:text-slate-200 leading-relaxed transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-inner"
            />
            
            {/* OCR Loading Overlay */}
            {isOcrLoading && (
              <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm flex items-center justify-center rounded-2xl z-10">
                <div className="bg-white dark:bg-slate-800 px-6 py-4 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 flex flex-col items-center animate-float">
                  <Loader2 className="w-8 h-8 text-rose-500 animate-spin mb-3" />
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{t('ocr_loading')}</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-1 gap-4">
             <div className="text-xs text-slate-400 dark:text-slate-500 font-medium flex items-center gap-2">
                <ImagePlus className="w-3 h-3" />
                Tip: Paste (Ctrl+V) images directly to auto-extract text.
             </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl text-sm font-bold transition-all shadow-sm"
              >
                <Upload className="w-4 h-4" />
                {t('upload_btn')}
              </button>
              
              {text && (
                <button
                  onClick={() => setText('')}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl text-sm font-bold transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="animate-fade-in space-y-6">
          <div>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center text-rose-500 dark:text-rose-400">
                <LinkIcon className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onPaste={handleUrlPaste}
                placeholder={t('placeholder_url')}
                className="w-full pl-16 pr-12 py-5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 focus:bg-white dark:focus:bg-slate-800 text-base text-slate-700 dark:text-slate-200 transition-all font-medium"
              />
              {url && (
                <button
                  onClick={() => setUrl('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl border border-dashed border-slate-300 dark:border-slate-600">
            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Cookie className="w-3 h-3" />
                {t('cookie_label')}
            </label>
            <textarea
                value={cookie}
                onChange={(e) => setCookie(e.target.value)}
                placeholder={t('placeholder_cookie')}
                className="w-full h-20 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-700 outline-none resize-none text-slate-600 dark:text-slate-300"
            />
          </div>
        </div>
      )}

      {/* Main Action Button */}
      <div className="flex justify-end mt-8">
        <button
          onClick={handleAnalyzeClick}
          disabled={isButtonDisabled}
          className={`
            relative overflow-hidden group/btn flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-white shadow-xl transition-all duration-300
            ${isButtonDisabled
              ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none' 
              : 'bg-gradient-to-r from-rose-500 to-orange-500 hover:shadow-rose-500/30 hover:-translate-y-1 active:scale-95'}
          `}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{mode === 'url' ? t('fetching_btn') : t('analyzing_btn')}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 group-hover/btn:animate-pulse" />
              <span>{mode === 'url' ? t('fetch_analyze_btn') : t('analyze_btn')}</span>
              <ArrowRight className="w-4 h-4 opacity-50 group-hover/btn:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AnalysisInput;
