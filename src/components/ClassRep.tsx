
import React, { useState, useRef, useEffect } from 'react';
import { Volume2, Loader2, Quote, AlertCircle, Info, Pause, Sparkles } from 'lucide-react';
import { ClassRep as ClassRepType } from '../types';
import { generateSpeech } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
  data: ClassRepType;
  summary: string;
}

const ClassRep: React.FC<Props> = ({ data, summary }) => {
  const { t } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const decodePCM = (arrayBuffer: ArrayBuffer, ctx: AudioContext): AudioBuffer => {
    const pcmData = new Int16Array(arrayBuffer);
    const sampleRate = 24000;
    const channels = 1;
    const frameCount = pcmData.length;
    const audioBuffer = ctx.createBuffer(channels, frameCount, sampleRate);
    const channelData = audioBuffer.getChannelData(0);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = pcmData[i] / 32768.0;
    }
    return audioBuffer;
  };

  const handlePlaySummary = async () => {
    if (isPlaying) return; // Simple single play logic for now
    setIsAudioLoading(true);

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
            sampleRate: 24000, 
        });
      }
      const ctx = audioContextRef.current;
      const audioDataBuffer = await generateSpeech(summary);
      const audioBuffer = decodePCM(audioDataBuffer, ctx);
      
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      
      source.onended = () => setIsPlaying(false);
      source.start(0);
      setIsPlaying(true);

    } catch (error) {
      console.error("Failed to play audio", error);
      alert("Could not play audio.");
    } finally {
      setIsAudioLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const safeData = data || { controversies: [], info_gains: [], god_replies: [] };
  const controversies = safeData.controversies || [];
  const infoGains = safeData.info_gains || [];
  const godReplies = safeData.god_replies || [];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white dark:border-slate-800 overflow-hidden mb-10 transition-transform hover:scale-[1.005] duration-500">
      
      {/* Header / Main Summary */}
      <div className="p-8 bg-gradient-to-br from-rose-50 via-white to-white dark:from-rose-950 dark:via-slate-900 dark:to-slate-900 relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-100 dark:bg-rose-900/30 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 relative z-10">
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-3">
                <span className="bg-rose-500 text-white p-1.5 rounded-lg">
                    <Quote className="w-5 h-5 fill-white" />
                </span>
                {t('class_rep_title')}
            </h2>
            <button
                onClick={handlePlaySummary}
                disabled={isAudioLoading || isPlaying}
                className={`
                    flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all shadow-sm
                    ${isPlaying 
                        ? 'bg-rose-100 dark:bg-rose-900 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800' 
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'}
                `}
            >
                {isAudioLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : isPlaying ? (
                    <Pause className="w-4 h-4 animate-pulse" />
                ) : (
                    <Volume2 className="w-4 h-4" />
                )}
                {isPlaying ? t('playing_btn') : t('listen_btn')}
            </button>
        </div>
        
        <div className="relative z-10">
            <Quote className="w-10 h-10 text-rose-100 dark:text-rose-900/50 absolute -top-4 -left-4 -z-10" />
            <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {summary}
            </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-1 p-1 bg-slate-50 dark:bg-slate-800">
          
          {/* Card: Controversies */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl md:rounded-l-2xl md:rounded-r-none h-full">
             <h3 className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 text-sm mb-4 uppercase tracking-wide">
                <AlertCircle className="w-4 h-4 text-orange-500" />
                {t('controversies')}
             </h3>
             <ul className="space-y-3">
                 {controversies.length > 0 ? controversies.map((c, i) => (
                     <li key={i} className="text-sm text-slate-600 dark:text-slate-400 bg-orange-50/50 dark:bg-orange-900/20 p-3 rounded-xl border border-orange-100 dark:border-orange-900/30 leading-snug">
                         {c}
                     </li>
                 )) : <span className="text-sm text-slate-400 italic">{t('no_controversies')}</span>}
             </ul>
          </div>

          {/* Card: Info Gains */}
          <div className="bg-white dark:bg-slate-900 p-6 h-full">
             <h3 className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 text-sm mb-4 uppercase tracking-wide">
                <Info className="w-4 h-4 text-blue-500" />
                {t('info_gains')}
             </h3>
             <ul className="space-y-3">
                 {infoGains.length > 0 ? infoGains.map((c, i) => (
                     <li key={i} className="text-sm text-slate-600 dark:text-slate-400 bg-blue-50/50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-100 dark:border-blue-900/30 leading-snug">
                         {c}
                     </li>
                 )) : <span className="text-sm text-slate-400 italic">{t('no_info_gains')}</span>}
             </ul>
          </div>

          {/* Card: God Replies */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl md:rounded-r-2xl md:rounded-l-none h-full">
             <h3 className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 text-sm mb-4 uppercase tracking-wide">
                <Sparkles className="w-4 h-4 text-rose-500" />
                {t('god_replies')}
             </h3>
             <ul className="space-y-3">
                 {godReplies.length > 0 ? godReplies.map((c, i) => (
                     <li key={i} className="text-sm text-slate-700 dark:text-slate-300 bg-rose-50/50 dark:bg-rose-900/20 p-3 rounded-xl border border-rose-100 dark:border-rose-900/30 italic font-medium">
                         "{c}"
                     </li>
                 )) : <span className="text-sm text-slate-400 italic">{t('no_god_replies')}</span>}
             </ul>
          </div>
      </div>
    </div>
  );
};

export default ClassRep;
