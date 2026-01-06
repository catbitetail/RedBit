
import React, { useState } from 'react';
import { MessageCircle, Sparkles, Send } from 'lucide-react';
import { generateSmartReplies } from '../services/geminiService';
import { ReplySuggestion } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
  contextSummary: string;
}

const SmartReply: React.FC<Props> = ({ contextSummary }) => {
  const { t, language } = useLanguage();
  const [comment, setComment] = useState('');
  const [suggestions, setSuggestions] = useState<ReplySuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!comment.trim()) return;
    setIsLoading(true);
    const results = await generateSmartReplies(comment, contextSummary, language);
    setSuggestions(results);
    setIsLoading(false);
  };

  return (
    <div className="pdf-exclude bg-gradient-to-br from-gray-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 mt-8">
      <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-pink-500" />
        {t('smart_reply_title')}
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        {t('smart_reply_desc')}
      </p>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={t('placeholder_reply')}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
          onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
        />
        <button
          onClick={handleGenerate}
          disabled={isLoading || !comment.trim()}
          className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 disabled:bg-gray-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? <Sparkles className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>

      {suggestions.length > 0 && (
        <div className="grid grid-cols-1 gap-3">
          {suggestions.map((s, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-gray-100 dark:border-slate-700 hover:border-pink-200 dark:hover:border-pink-900 transition-colors shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full
                    ${s.tone.includes('Gentle') ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 
                      s.tone.includes('Witty') ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'}
                `}>
                    {s.tone}
                </span>
                <button 
                    onClick={() => navigator.clipboard.writeText(s.reply)}
                    className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                    {t('copy')}
                </button>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">{s.reply}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SmartReply;
