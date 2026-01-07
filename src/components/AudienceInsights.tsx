
import React, { useState } from 'react';
import { Users, Lightbulb, Target, TrendingUp, PenTool, X, Copy, Check, Rabbit } from 'lucide-react';
import { AnalysisResult } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { generateTopicDraft } from '../services/geminiService';

interface Props {
  data: AnalysisResult;
}

const AudienceInsights: React.FC<Props> = ({ data }) => {
  const { t, language } = useLanguage();
  const [draftingTopic, setDraftingTopic] = useState<string | null>(null);
  const [draftResult, setDraftResult] = useState<{ title: string, content: string } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerateDraft = async (topic: string) => {
    setDraftingTopic(topic);
    try {
      const result = await generateTopicDraft(topic, data.summary, language);
      setDraftResult(result);
      setShowModal(true);
    } catch (e) {
      alert("Failed to generate draft. Please try again.");
    } finally {
      setDraftingTopic(null);
    }
  };

  const handleCopy = () => {
    if (!draftResult) return;
    const fullText = `${draftResult.title}\n\n${draftResult.content}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Safety checks
  const audienceProfile = data?.audience_profile || { description: "N/A", tags: [] };
  const nextTopics = data?.next_topics || [];
  const questionsAsked = data?.questions_asked || [];
  const memeAlert = data?.meme_alert || [];
  const competitorWeaknesses = data?.competitor_weaknesses || [];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">

        {/* Audience Profile */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white dark:border-slate-800">
          <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
              <Users className="w-5 h-5" />
            </div>
            {t('audience_profile')}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6 text-sm font-medium">
            {audienceProfile.description}
          </p>
          <div className="flex flex-wrap gap-2">
            {audienceProfile.tags.map((tag, idx) => (
              <span key={idx} className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold border border-slate-100 dark:border-slate-700">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Next Topics */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white dark:border-slate-800">
          <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-3">
            <div className="p-2 bg-yellow-50 dark:bg-yellow-900/30 rounded-xl text-yellow-600 dark:text-yellow-400">
              <Lightbulb className="w-5 h-5" />
            </div>
            {t('next_topics')}
          </h3>
          <ul className="space-y-4">
            {nextTopics.map((topic, idx) => (
              <li key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm text-slate-700 dark:text-slate-300 bg-yellow-50/30 dark:bg-yellow-900/10 p-4 rounded-2xl border border-yellow-100/50 dark:border-yellow-900/20 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 shadow-sm">
                    {idx + 1}
                  </span>
                  <span className="font-bold">{topic}</span>
                </div>

                <button
                  onClick={() => handleGenerateDraft(topic)}
                  disabled={draftingTopic !== null}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shadow-sm
                    ${draftingTopic === topic
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-wait'
                      : 'bg-white dark:bg-slate-800 border border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900 hover:text-yellow-800 dark:hover:text-yellow-300 hover:shadow-md'}
                `}
                >
                  {draftingTopic === topic ? (
                    <>
                      <Rabbit className="w-3 h-3 animate-bounce" />
                      {t('generating_btn')}
                    </>
                  ) : (
                    <>
                      <PenTool className="w-3 h-3" />
                      {t('generate_draft_btn')}
                    </>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Unmet Needs / Questions */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white dark:border-slate-800">
          <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-3">
            <div className="p-2 bg-rose-50 dark:bg-rose-900/30 rounded-xl text-rose-500 dark:text-rose-400">
              <Target className="w-5 h-5" />
            </div>
            {t('questions_needs')}
          </h3>
          {questionsAsked.length > 0 ? (
            <ul className="space-y-3">
              {questionsAsked.map((q, idx) => (
                <li key={idx} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-3 bg-rose-50/20 dark:bg-rose-900/10 p-3 rounded-xl">
                  <span className="text-rose-400 mt-1 font-bold">•</span>
                  {q}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400 dark:text-slate-500 italic">{t('no_questions')}</p>
          )}
        </div>

        {/* Competitor / Meme */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white dark:border-slate-800">
          <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-3">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-xl text-purple-500 dark:text-purple-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            {t('trends_alerts')}
          </h3>

          <div className="mb-6">
            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">{t('meme_alert')}</h4>
            <div className="flex flex-wrap gap-2">
              {memeAlert.length > 0 ? memeAlert.map((m, i) => (
                <span key={i} className="px-3 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 rounded-lg text-xs font-bold border border-purple-100 dark:border-purple-800">
                  {m}
                </span>
              )) : <span className="text-xs text-slate-400 dark:text-slate-500">{t('none_detected')}</span>}
            </div>
          </div>

          {competitorWeaknesses && competitorWeaknesses.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">{t('competitor_weakness')}</h4>
              <ul className="space-y-2">
                {competitorWeaknesses.map((w, i) => (
                  <li key={i} className="text-xs text-slate-600 dark:text-slate-400 border-l-2 border-rose-200 dark:border-rose-900 pl-3 py-1 font-medium">
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Draft Modal */}
      {showModal && draftResult && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[85vh] border border-white/20 dark:border-slate-700">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 rounded-t-3xl">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <PenTool className="w-5 h-5 text-rose-500" />
                {t('draft_modal_title')}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors bg-white dark:bg-slate-800 p-2 rounded-full shadow-sm hover:shadow-md">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 overflow-y-auto">
              <div className="mb-6">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Title</label>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-2 leading-tight">{draftResult.title}</h2>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Content</label>
                <div className="mt-3 text-base text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 font-medium">
                  {draftResult.content}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 rounded-b-3xl bg-white dark:bg-slate-900">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2.5 text-slate-500 dark:text-slate-400 text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleCopy}
                className="px-6 py-2.5 bg-rose-500 text-white text-sm font-bold rounded-xl hover:bg-rose-600 hover:shadow-lg hover:shadow-rose-500/30 flex items-center gap-2 transition-all"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {t('copy_draft')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AudienceInsights;
