
import React, { useState } from 'react';
import { Layers, ChevronDown, ChevronUp, Star, ThumbsUp, ThumbsDown, Minus } from 'lucide-react';
import { AnalysisResult, ViewpointCategory } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
  data: AnalysisResult;
  forceExpand?: boolean; // Add prop to control expansion externally (for PDF export)
}

const ViewpointAnalysis: React.FC<Props> = ({ data, forceExpand = false }) => {
  const { t } = useLanguage();
  const [expandedCategory, setExpandedCategory] = useState<number | null>(0);

  if (!data.comprehensive_viewpoints || data.comprehensive_viewpoints.length === 0) {
      return null;
  }

  const toggleCategory = (index: number) => {
    // If forced expanded, disable manual toggling or keep it interactive but default open?
    // Better to keep interactive but forceExpand overrides default rendering logic
    setExpandedCategory(expandedCategory === index ? null : index);
  };

  const getSentimentIcon = (sentiment: string) => {
      switch(sentiment) {
          case 'positive': return <ThumbsUp className="w-4 h-4 text-emerald-500" />;
          case 'negative': return <ThumbsDown className="w-4 h-4 text-rose-500" />;
          default: return <Minus className="w-4 h-4 text-slate-400" />;
      }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white dark:border-slate-800 overflow-hidden mb-10">
      <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center gap-4">
         <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-2xl text-indigo-500 dark:text-indigo-400">
             <Layers className="w-6 h-6" />
         </div>
         <div>
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">{t('viewpoint_title')}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t('viewpoint_desc')}</p>
         </div>
      </div>

      <div className="divide-y divide-slate-50 dark:divide-slate-800">
        {data.comprehensive_viewpoints.map((cat: ViewpointCategory, idx: number) => {
            // Logic: Expand if it's the active index OR if forceExpand (PDF mode) is true
            const isExpanded = forceExpand || expandedCategory === idx;
            const points = cat.viewpoints || [];
            const sortedPoints = [...points].sort((a, b) => b.value_score - a.value_score);

            return (
                <div key={idx} className={`bg-white dark:bg-slate-900 transition-colors duration-300 ${isExpanded ? 'bg-slate-50/50 dark:bg-slate-800/50' : ''}`}>
                    <button 
                        onClick={() => toggleCategory(idx)}
                        className="w-full flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                    >
                        <div className="flex items-center gap-4">
                            <span className={`text-sm font-bold px-4 py-1.5 rounded-full transition-colors
                                ${isExpanded 
                                    ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300' 
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'}
                            `}>
                                {cat.category_name}
                            </span>
                            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                                {points.length} points
                            </span>
                        </div>
                        <div className={`p-2 rounded-full transition-all duration-300 ${isExpanded ? 'bg-white dark:bg-slate-700 shadow-sm rotate-180 text-indigo-500 dark:text-indigo-400' : 'text-slate-400'}`}>
                            <ChevronDown className="w-4 h-4" />
                        </div>
                    </button>

                    <div 
                        className={`overflow-hidden transition-all duration-500 ease-in-out`}
                        style={{ 
                            // When generating PDF (forceExpand), use 'none' to ensure FULL content is visible/printed
                            // Otherwise use CSS transitions for smooth UI toggling
                            maxHeight: isExpanded ? 'none' : '0px',
                            opacity: isExpanded ? 1 : 0
                        }}
                    >
                        <div className="p-6 pt-0 space-y-3">
                            {sortedPoints.map((point, pIdx) => (
                                <div key={pIdx} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex gap-4 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex-shrink-0 mt-1 p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg h-fit">
                                        {getSentimentIcon(point.sentiment)}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                                            {point.content}
                                        </p>
                                        <div className="mt-3 flex items-center gap-3">
                                            {point.value_score >= 8 ? (
                                                <span className="flex items-center gap-1.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2.5 py-1 rounded-full border border-amber-100 dark:border-amber-900/50">
                                                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                                    {t('high_value')} • {point.value_score}/10
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                                    Score: {point.value_score}/10
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
};

export default ViewpointAnalysis;
