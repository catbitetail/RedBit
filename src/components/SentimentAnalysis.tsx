
import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { AnalysisResult } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

interface Props {
  data: AnalysisResult;
}

const SentimentAnalysis: React.FC<Props> = ({ data }) => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const emotions = data?.emotions || [];
  const sortedEmotions = [...emotions].sort((a, b) => b.score - a.score);

  const getEmotionColor = (type: string) => {
    switch (type) {
      case 'Anxiety': return '#EF4444';
      case 'Healing': return '#10B981';
      case 'Desire': return '#F59E0B';
      case 'Disappointment': return '#6B7280';
      case 'Humblebrag': return '#8B5CF6';
      case 'Resonance': return '#EC4899';
      default: return '#3B82F6';
    }
  };

  const axisColor = theme === 'dark' ? '#94a3b8' : '#6b7280';
  const gridColor = theme === 'dark' ? '#334155' : '#e5e7eb';
  const bgColor = theme === 'dark' ? '#1e293b' : '#ffffff';
  const tooltipStyle = {
      backgroundColor: bgColor,
      color: axisColor,
      borderRadius: '8px', 
      border: `1px solid ${gridColor}`, 
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Radar Chart */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">{t('radar_title')}</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={emotions}>
              <PolarGrid stroke={gridColor} />
              <PolarAngleAxis dataKey="label" tick={{ fill: axisColor, fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
              <Radar
                name="Intensity"
                dataKey="score"
                stroke="#ec4899"
                fill="#ec4899"
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 text-center">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('sentiment_score')} </span>
            <span className={`text-lg font-bold ${data.sentiment_score > 0.6 ? 'text-green-500' : data.sentiment_score < 0.4 ? 'text-red-500' : 'text-yellow-500'}`}>
                {(data.sentiment_score * 100).toFixed(0)}/100
            </span>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">{t('top_emotions')}</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={sortedEmotions.slice(0, 5)} margin={{ left: 20 }}>
              <XAxis type="number" hide />
              <YAxis 
                type="category" 
                dataKey="label" 
                width={80} 
                tick={{ fontSize: 12, fill: axisColor }} 
              />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={tooltipStyle}
              />
              <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={24}>
                {sortedEmotions.slice(0, 5).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getEmotionColor(entry.type)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-2 mt-4 justify-center">
            {sortedEmotions.slice(0, 5).map(e => (
                <span key={e.label} className="text-xs px-2 py-1 rounded-full bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-slate-700">
                    <span className="w-2 h-2 rounded-full inline-block mr-1" style={{backgroundColor: getEmotionColor(e.type)}}></span>
                    {e.label}
                </span>
            ))}
        </div>
      </div>
    </div>
  );
};

export default SentimentAnalysis;
