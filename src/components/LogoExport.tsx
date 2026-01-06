
import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { Download, Loader2 } from 'lucide-react';
import { Logo } from './Logo';

export const LogoExport: React.FC = () => {
   const [generating, setGenerating] = useState<string | null>(null);

   const iconLightRef = useRef<HTMLDivElement>(null);
   const iconDarkRef = useRef<HTMLDivElement>(null);
   const fullLightRef = useRef<HTMLDivElement>(null);
   const fullDarkRef = useRef<HTMLDivElement>(null);

   const handleDownload = async (ref: React.RefObject<HTMLDivElement | null>, filename: string) => {
      const element = ref.current;
      if (!element) return;
      setGenerating(filename);

      try {
         // Wait a moment for fonts/styles to settle
         await new Promise(resolve => setTimeout(resolve, 100));

         const canvas = await html2canvas(element, {
            backgroundColor: null, // Transparent background
            scale: 4, // 4x Resolution (High Quality)
            logging: false,
            useCORS: true
         });

         const link = document.createElement('a');
         link.download = filename;
         link.href = canvas.toDataURL('image/png');
         link.click();
      } catch (e) {
         console.error("Export failed", e);
         alert("Export failed");
      } finally {
         setGenerating(null);
      }
   };

   // Reusable Typography Component for consistency with App.tsx
   const LogoText = ({ isDark = false }: { isDark?: boolean }) => (
      <div className="flex items-baseline gap-3 select-none">
         <span className={`font-['Noto_Serif_SC'] text-4xl font-bold tracking-wide transform translate-y-0.5 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
            赤兔
         </span>
         <span className={`font-edu text-4xl font-bold transform origin-bottom-left pb-1 translate-y-0.5 ${isDark ? 'text-rose-400' : 'text-rose-600'}`}>
            RedBit
         </span>
      </div>
   );

   return (
      <div className="w-full bg-slate-100 dark:bg-slate-900 border-t-4 border-rose-500 p-8 mt-20">
         <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">🎨 Logo 资产生成器 (Logo Asset Generator)</h2>
            <p className="text-slate-500 mb-8">此面板仅用于开发阶段导出 Logo 图片。导出完成后，请在 App.tsx 中移除此组件。</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

               {/* 1. Icon Only - Light */}
               <div className="flex flex-col gap-4">
                  <div className="bg-transparent border border-dashed border-slate-300 rounded-xl p-8 flex items-center justify-center relative">
                     <span className="absolute top-2 left-2 text-xs font-mono text-slate-400">Icon (Light)</span>
                     {/* Capture Target */}
                     <div ref={iconLightRef} className="p-4 rounded-xl">
                        <Logo />
                     </div>
                  </div>
                  <button
                     onClick={() => handleDownload(iconLightRef, 'redbit-icon-light.png')}
                     className="btn-export bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
                  >
                     {generating === 'redbit-icon-light.png' ? <Loader2 className="animate-spin w-4 h-4" /> : <Download className="w-4 h-4" />}
                     Download PNG
                  </button>
               </div>

               {/* 2. Icon Only - Dark */}
               <div className="flex flex-col gap-4">
                  <div className="bg-slate-950 border border-dashed border-slate-700 rounded-xl p-8 flex items-center justify-center relative">
                     <span className="absolute top-2 left-2 text-xs font-mono text-slate-500">Icon (Dark)</span>
                     {/* Capture Target: Force Dark Mode Wrapper */}
                     <div className="dark">
                        <div ref={iconDarkRef} className="p-4 rounded-xl">
                           <Logo />
                        </div>
                     </div>
                  </div>
                  <button
                     onClick={() => handleDownload(iconDarkRef, 'redbit-icon-dark.png')}
                     className="btn-export bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700"
                  >
                     {generating === 'redbit-icon-dark.png' ? <Loader2 className="animate-spin w-4 h-4" /> : <Download className="w-4 h-4" />}
                     Download PNG
                  </button>
               </div>

               {/* 3. Full Lockup - Light */}
               <div className="flex flex-col gap-4">
                  <div className="bg-transparent border border-dashed border-slate-300 rounded-xl p-8 flex items-center justify-center relative">
                     <span className="absolute top-2 left-2 text-xs font-mono text-slate-400">Full (Light)</span>
                     {/* Capture Target */}
                     <div ref={fullLightRef} className="p-6 rounded-xl flex items-center gap-4">
                        <Logo />
                        <LogoText isDark={false} />
                     </div>
                  </div>
                  <button
                     onClick={() => handleDownload(fullLightRef, 'redbit-full-light.png')}
                     className="btn-export bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
                  >
                     {generating === 'redbit-full-light.png' ? <Loader2 className="animate-spin w-4 h-4" /> : <Download className="w-4 h-4" />}
                     Download PNG
                  </button>
               </div>

               {/* 4. Full Lockup - Dark */}
               <div className="flex flex-col gap-4">
                  <div className="bg-slate-950 border border-dashed border-slate-700 rounded-xl p-8 flex items-center justify-center relative">
                     <span className="absolute top-2 left-2 text-xs font-mono text-slate-500">Full (Dark)</span>
                     {/* Capture Target */}
                     <div className="dark">
                        <div ref={fullDarkRef} className="p-6 rounded-xl flex items-center gap-4">
                           <Logo />
                           <LogoText isDark={true} />
                        </div>
                     </div>
                  </div>
                  <button
                     onClick={() => handleDownload(fullDarkRef, 'redbit-full-dark.png')}
                     className="btn-export bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700"
                  >
                     {generating === 'redbit-full-dark.png' ? <Loader2 className="animate-spin w-4 h-4" /> : <Download className="w-4 h-4" />}
                     Download PNG
                  </button>
               </div>

            </div>

            <style>{`
            .btn-export {
                @apply flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-bold text-sm shadow-sm transition-all active:scale-95;
            }
        `}</style>
         </div>
      </div>
   );
};
