
import React from 'react';
import * as d3 from 'd3';
import { InsightPoint } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
  insights: InsightPoint[];
}

const WordCloud: React.FC<Props> = ({ insights }) => {
  const { t } = useLanguage();
  
  // Safe access
  const safeInsights = insights || [];

  if (safeInsights.length === 0) {
      return null;
  }

  // Use D3 scale for font size
  // Reduced range for smaller overall appearance while maintaining relative difference
  const maxCount = Math.max(...safeInsights.map(i => i.count), 1);
  const minCount = Math.min(...safeInsights.map(i => i.count), 0);
  
  const fontSizeScale = d3.scaleLinear()
    .domain([minCount, maxCount])
    .range([10, 22]); // Was [12, 28]

  const opacityScale = d3.scaleLinear()
    .domain([minCount, maxCount])
    .range([0.7, 1]);

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 mb-8">
      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">{t('keywords_title')}</h3>
      <div className="flex flex-wrap gap-3 justify-center items-center min-h-[150px]">
        {safeInsights.map((item, idx) => (
            <div 
                key={idx}
                className={`
                    px-3 py-1 rounded-full border transition-all hover:scale-105 cursor-default
                    ${item.sentiment === 'positive' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300' : 
                      item.sentiment === 'negative' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300' : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300'}
                `}
                style={{
                    fontSize: `${fontSizeScale(item.count)}px`,
                    opacity: opacityScale(item.count)
                }}
                title={`Mentioned ${item.count} times. Quote: "${item.quote}"`}
            >
                {item.point}
            </div>
        ))}
      </div>
      <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4">{t('size_indicates')}</p>
    </div>
  );
};

export default WordCloud;
