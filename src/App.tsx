import React, { useState, useEffect, useRef } from 'react';
import { HashRouter } from 'react-router-dom';
import {
    Sparkles, Globe, Save, Sidebar, Menu, Download,
    Moon, Sun, Snowflake, Flower, Printer, FilePenLine,
    ChevronDown, FileImage, FileText
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import AnalysisInput from './components/AnalysisInput';
import SentimentAnalysis from './components/SentimentAnalysis';
import ClassRep from './components/ClassRep';
import AudienceInsights from './components/AudienceInsights';
import ViewpointAnalysis from './components/ViewpointAnalysis';
import WordCloud from './components/WordCloud';
import SmartReply from './components/SmartReply';
import ArchiveList from './components/ArchiveList';
import ChatAndNotes from './components/ChatAndNotes';
import BackgroundEffect from './components/BackgroundEffect';
import { Logo } from './components/Logo';

import { analyzeComments } from './services/geminiService';
import { AnalysisResult, SavedReport } from './types';
import { useLanguage } from './contexts/LanguageContext';
import { useTheme } from './contexts/ThemeContext';
import { Language } from './translations';

const App: React.FC = () => {
    const { t, language, setLanguage } = useLanguage();
    const { theme, toggleTheme, showEffect, toggleEffect } = useTheme();

    // Analysis State
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [data, setData] = useState<AnalysisResult | null>(null);
    const [isPdfGenerating, setIsPdfGenerating] = useState(false);

    // Feature State
    const [notes, setNotes] = useState('');
    const [currentReportId, setCurrentReportId] = useState<string | null>(null); // To track if we are editing an existing save
    const [archives, setArchives] = useState<SavedReport[]>([]);

    // UI State
    const [showHistory, setShowHistory] = useState(false);
    const [showTools, setShowTools] = useState(false); // Right sidebar
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');
    const [showPdfMenu, setShowPdfMenu] = useState(false);
    const pdfMenuRef = useRef<HTMLDivElement>(null);

    // Load archives on mount
    useEffect(() => {
        const saved = localStorage.getItem('xhs_miner_archives');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    parsed.sort((a: SavedReport, b: SavedReport) => b.timestamp - a.timestamp);
                    setArchives(parsed);
                } else {
                    setArchives([]);
                }
            } catch (e) {
                console.error("Failed to load archives");
                setArchives([]);
            }
        }
    }, []);

    // Close PDF menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pdfMenuRef.current && !pdfMenuRef.current.contains(event.target as Node)) {
                setShowPdfMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleAnalyze = async (text: string, cookie?: string) => {
        setIsAnalyzing(true);
        setNotes('');
        setCurrentReportId(null);
        setSaveStatus('idle');

        try {
            const result = await analyzeComments(text, language, cookie);
            setData(result);

            // UX Improvement: 
            // 1. Only auto-open tools on large screens (>= 1024px) to avoid blocking the mobile view
            // 2. Scroll to the report content so the user knows something happened
            if (window.innerWidth >= 1024) {
                setShowTools(true);
            } else {
                setShowTools(false);
            }

            // Small delay to allow DOM to render
            setTimeout(() => {
                const reportElement = document.getElementById('report-anchor');
                if (reportElement) {
                    reportElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);

        } catch (err: any) {
            if (err.message === "URL_NOT_INDEXED") {
                alert(t('err_url_not_indexed'));
            } else {
                console.error(err);
                alert(t('err_generic'));
            }
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSave = () => {
        if (!data) return;

        const newReport: SavedReport = {
            id: currentReportId || Date.now().toString(),
            timestamp: Date.now(),
            title: data.short_title || data.summary.slice(0, 30) || "Report",
            data: data,
            notes: notes
        };

        let newArchives;
        if (currentReportId) {
            newArchives = archives.map(a => a.id === currentReportId ? newReport : a);
        } else {
            newArchives = [newReport, ...archives];
            setCurrentReportId(newReport.id);
        }

        newArchives.sort((a, b) => b.timestamp - a.timestamp);

        setArchives(newArchives);
        localStorage.setItem('xhs_miner_archives', JSON.stringify(newArchives));

        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
    };

    const handleLoadArchive = (report: SavedReport) => {
        setData(report.data);
        setNotes(report.notes || '');
        setCurrentReportId(report.id);
        setShowHistory(false);
        setShowTools(true);
    };

    const handleDeleteArchive = (id: string) => {
        const newArchives = archives.filter(a => a.id !== id);
        setArchives(newArchives);
        localStorage.setItem('xhs_miner_archives', JSON.stringify(newArchives));

        if (currentReportId === id) {
            setData(null);
            setNotes('');
            setCurrentReportId(null);
            setShowTools(false);
        }
    };

    // Handle data updates from ChatAndNotes component
    // When AI generates initial_chat_response, sync it to both state and archives
    const handleDataUpdate = (updatedData: AnalysisResult) => {
        setData(updatedData);

        // If this report is already saved (has currentReportId), update the archive too
        if (currentReportId) {
            const newArchives = archives.map(report => {
                if (report.id === currentReportId) {
                    return {
                        ...report,
                        data: updatedData,
                        timestamp: Date.now() // Update timestamp to reflect changes
                    };
                }
                return report;
            });

            newArchives.sort((a, b) => b.timestamp - a.timestamp);
            setArchives(newArchives);
            localStorage.setItem('xhs_miner_archives', JSON.stringify(newArchives));
        }
    };

    // --- Export / Import Logic ---

    const downloadJSON = (content: any, filename: string) => {
        const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleExportCurrent = () => {
        if (!data) return;
        const report: SavedReport = {
            id: currentReportId || Date.now().toString(),
            timestamp: Date.now(),
            title: data.short_title || data.summary.slice(0, 30) || "Report",
            data: data,
            notes: notes
        };

        const dateStr = new Date().toISOString().slice(0, 10);
        // Use short_title from AI if available, else summary slice, fallback to "Report"
        const rawTitle = data.short_title || data.summary.slice(0, 15) || "Report";
        const safeTitle = rawTitle.replace(/[\\/:*?"<>|]/g, "_").replace(/\s+/g, "").trim();

        // Updated format: Use full-width quotes “ ” instead of parentheses （ ）
        downloadJSON(report, `“${safeTitle}”挖掘数据${dateStr}.json`);
    };

    const handleExportPDF = async (quality: 'standard' | 'hd') => {
        const element = document.getElementById('report-content');
        if (!element) return;

        setShowPdfMenu(false);
        setIsPdfGenerating(true);

        // 临时保存当前滚动位置，并滚动到顶部，防止截图截断
        const scrollPos = window.scrollY;
        window.scrollTo(0, 0);

        // =========================================================================
        // [终极修复] Monkey Patch: createPattern
        // =========================================================================
        const originalCreatePattern = CanvasRenderingContext2D.prototype.createPattern;

        CanvasRenderingContext2D.prototype.createPattern = function (image: any, repetition: string | null): CanvasPattern | null {
            try {
                if (image instanceof HTMLCanvasElement) {
                    if (image.width === 0 || image.height === 0) {
                        const dummy = document.createElement('canvas');
                        dummy.width = 1;
                        dummy.height = 1;
                        return originalCreatePattern.call(this, dummy, repetition);
                    }
                }
                return originalCreatePattern.call(this, image, repetition);
            } catch (e) {
                console.warn("Intercepted createPattern error:", e);
                return null;
            }
        };

        try {
            // 1. 强制等待动画结束和渲染稳定
            // 这里的等待也非常重要，因为它要等待 React 重新渲染 (expanded Viewpoints + Notes)
            await new Promise(resolve => setTimeout(resolve, 1000));

            const { scrollWidth, scrollHeight } = element;

            // Config based on Quality Selection
            // Standard: Lower scale, higher compression. Target ~500KB-1MB
            // HD: Higher scale, low compression. Target ~3MB-8MB
            const scale = quality === 'hd' ? 3 : 1.5;
            const jpegQuality = quality === 'hd' ? 0.95 : 0.60;

            // 2. 调用 html2canvas
            const canvas = await html2canvas(element, {
                scale: scale,
                useCORS: true,
                logging: false,
                backgroundColor: theme === 'dark' ? '#0F172A' : '#FAFAFA',
                width: scrollWidth,
                height: scrollHeight,
                windowWidth: scrollWidth,
                windowHeight: scrollHeight,

                ignoreElements: (node) => {
                    const element = node as HTMLElement;
                    if (element.tagName === 'CANVAS') return true;
                    if (element.classList.contains('pdf-exclude')) return true;
                    return false;
                },

                onclone: (clonedDoc) => {
                    const clonedContent = clonedDoc.getElementById('report-content');
                    if (!clonedContent) return;

                    const originalCharts = element.querySelectorAll('.recharts-responsive-container');
                    const clonedCharts = clonedContent.querySelectorAll('.recharts-responsive-container');

                    originalCharts.forEach((orig, idx) => {
                        const clone = clonedCharts[idx] as HTMLElement;
                        if (clone && orig) {
                            const rect = orig.getBoundingClientRect();
                            clone.style.width = `${rect.width}px`;
                            clone.style.height = `${rect.height}px`;
                            clone.style.flex = 'none';
                            clone.style.display = 'block';
                            clone.style.position = 'relative';

                            const origSvg = orig.querySelector('svg');
                            const cloneSvg = clone.querySelector('svg');

                            if (origSvg && cloneSvg) {
                                const svgRect = origSvg.getBoundingClientRect();
                                cloneSvg.setAttribute('width', `${svgRect.width}`);
                                cloneSvg.setAttribute('height', `${svgRect.height}`);
                                cloneSvg.setAttribute('viewBox', `0 0 ${svgRect.width} ${svgRect.height}`);
                                cloneSvg.style.width = `${svgRect.width}px`;
                                cloneSvg.style.height = `${svgRect.height}px`;
                                cloneSvg.style.display = 'block';
                                cloneSvg.style.overflow = 'visible';
                            }
                        }
                    });
                }
            });

            const imgData = canvas.toDataURL('image/jpeg', jpegQuality);

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
                compress: true
            });

            const imgWidth = 210;
            const pageHeight = 297;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            // ==========================================
            // [Update] Customized Filename Format
            // 格式：“简要概括标题”挖掘说明+日期
            // ==========================================
            const dateStr = new Date().toISOString().slice(0, 10);

            // Use short_title from AI if available, else summary slice, fallback to "Report"
            const rawTitle = data?.short_title || data?.summary.slice(0, 15) || "Report";
            // Sanitize filename
            const safeTitle = rawTitle.replace(/[\\/:*?"<>|]/g, "_").replace(/\s+/g, "").trim();

            // Updated format: Use full-width quotes “ ” instead of parentheses （ ）
            const fileName = `“${safeTitle}”挖掘说明${dateStr}.pdf`;

            pdf.save(fileName);

        } catch (error) {
            console.error("PDF generation failed:", error);
            alert("PDF 生成失败。请联系开发者。\n错误详情: " + (error instanceof Error ? error.message : "未知错误"));
        } finally {
            CanvasRenderingContext2D.prototype.createPattern = originalCreatePattern;
            setIsPdfGenerating(false);
            window.scrollTo(0, scrollPos);
        }
    };

    const handleExportAll = () => {
        if (archives.length === 0) return;
        downloadJSON(archives, `xhs_miner_backup_${new Date().toISOString().slice(0, 10)}.json`);
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const readFile = (file: File): Promise<any> => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    try {
                        const json = JSON.parse(ev.target?.result as string);
                        resolve(json);
                    } catch (err) {
                        console.error(`Error parsing file ${file.name}`, err);
                        resolve(null);
                    }
                };
                reader.onerror = () => resolve(null);
                reader.readAsText(file);
            });
        };

        try {
            const loadedContents = await Promise.all(Array.from(files).map(readFile));
            let allNewItems: SavedReport[] = [];

            loadedContents.forEach(content => {
                if (!content) return;
                if (Array.isArray(content)) {
                    const validItems = content.filter((item: any) => item.id && item.data);
                    allNewItems.push(...validItems);
                } else if (content.id && content.data) {
                    allNewItems.push(content);
                } else if (content.summary && content.key_insights) {
                    const recoveredReport: SavedReport = {
                        id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
                        timestamp: Date.now(),
                        title: content.summary.slice(0, 30) || "Imported Report",
                        data: content,
                        notes: ''
                    };
                    allNewItems.push(recoveredReport);
                }
            });

            if (allNewItems.length > 0) {
                const existingIds = new Set(archives.map(a => a.id));
                const toAdd = allNewItems.filter(item => !existingIds.has(item.id));

                const uniqueToAdd: SavedReport[] = [];
                const seenIdsInBatch = new Set<string>();
                toAdd.forEach(item => {
                    if (!seenIdsInBatch.has(item.id)) {
                        seenIdsInBatch.add(item.id);
                        uniqueToAdd.push(item);
                    }
                });

                if (uniqueToAdd.length === 0) {
                    alert("没有发现新的唯一报告。");
                } else {
                    const updatedArchives = [...uniqueToAdd, ...archives];
                    updatedArchives.sort((a, b) => b.timestamp - a.timestamp);
                    setArchives(updatedArchives);
                    localStorage.setItem('xhs_miner_archives', JSON.stringify(updatedArchives));
                    alert(t('import_success'));
                    setShowHistory(true);
                }
            } else {
                alert(t('import_error'));
            }

        } catch (err) {
            console.error(err);
            alert(t('import_error'));
        } finally {
            if (e.target) e.target.value = '';
        }
    };


    return (
        <HashRouter>
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-rose-200 dark:selection:bg-rose-900 selection:text-rose-900 dark:selection:text-rose-100 transition-colors duration-500">

                <BackgroundEffect />

                {/* History Drawer with Blur Backdrop */}
                {showHistory && (
                    <>
                        <div className="fixed inset-0 bg-slate-900/20 dark:bg-slate-950/60 backdrop-blur-sm z-50 transition-opacity" onClick={() => setShowHistory(false)} />
                        <ArchiveList
                            archives={archives}
                            onLoad={handleLoadArchive}
                            onDelete={handleDeleteArchive}
                            onExportAll={handleExportAll}
                            onImport={handleImport}
                            onClose={() => setShowHistory(false)}
                        />
                    </>
                )}

                {/* Right Tools Drawer */}
                {showTools && data && (
                    <ChatAndNotes
                        analysisData={data}
                        notes={notes}
                        onNotesChange={setNotes}
                        onDataUpdate={handleDataUpdate} // Use handleDataUpdate to sync both state and archives
                        onClose={() => setShowTools(false)}
                    />
                )}

                {/* Floating Glass Header */}
                <header className="sticky top-0 z-40 w-full transition-all duration-300">
                    <div className="absolute inset-0 glass shadow-sm transition-colors duration-500"></div>
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">

                        {/* Logo Area */}
                        <div className="flex items-center gap-6">
                            <button
                                onClick={() => setShowHistory(true)}
                                className="p-2.5 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all duration-200"
                                title={t('history_btn')}
                            >
                                <Menu className="w-5 h-5" />
                            </button>

                            <div className="flex items-center gap-4 select-none group cursor-default">
                                <Logo />


                                <div className="hidden sm:flex items-baseline gap-3">
                                    <span className="font-['Noto_Serif_SC'] text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-wide transform translate-y-0.5">
                                        赤兔
                                    </span>
                                    <span className="font-edu text-xl md:text-2xl font-bold text-rose-600 dark:text-rose-400 transform origin-bottom-left pb-1 translate-y-0.5">
                                        RedBit
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Actions Area */}
                        <div className="flex items-center gap-3">

                            {/* Theme & Effect Toggles - 初始界面：位置不变 */}
                            {!data && (
                                <div className="flex items-center bg-white/50 dark:bg-slate-800/50 backdrop-blur rounded-full p-1 border border-slate-200/60 dark:border-slate-700/60 shadow-sm mr-2">
                                    <button
                                        onClick={toggleEffect}
                                        className={`p-1.5 rounded-full transition-all duration-300 ${showEffect ? 'text-pink-500 bg-pink-50 dark:bg-pink-900/30' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                                        title={theme === 'dark' ? "Let it snow" : "Scatter petals"}
                                    >
                                        {theme === 'dark' ? <Snowflake className="w-4 h-4" /> : <Flower className="w-4 h-4" />}
                                    </button>
                                    <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                                    <button
                                        onClick={toggleTheme}
                                        className={`p-1.5 rounded-full transition-all duration-300 ${theme === 'dark' ? 'text-amber-300 bg-slate-700' : 'text-orange-400 bg-orange-50'}`}
                                        title="Toggle Dark Mode"
                                    >
                                        {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                                    </button>
                                </div>
                            )}

                            {data && (
                                <div className="flex items-center gap-2 mr-2 animate-fade-in">
                                    {/* PDF Export Dropdown - 桌面端显示 */}
                                    <div className="relative" ref={pdfMenuRef}>
                                        <button
                                            onClick={() => setShowPdfMenu(!showPdfMenu)}
                                            disabled={isPdfGenerating}
                                            className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-all disabled:opacity-50 disabled:cursor-wait
                                ${showPdfMenu
                                                    ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-200 border-rose-300 dark:border-rose-700'
                                                    : 'text-rose-600 dark:text-rose-300 bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/40'}`}
                                            title={t('export_pdf')}
                                        >
                                            {isPdfGenerating ? (
                                                <span className="animate-spin w-4 h-4 border-2 border-rose-600 border-t-transparent rounded-full" />
                                            ) : (
                                                <Printer className="w-4 h-4" />
                                            )}
                                            <span>{t('export_pdf')}</span>
                                            <ChevronDown className={`w-3 h-3 transition-transform ${showPdfMenu ? 'rotate-180' : ''}`} />
                                        </button>

                                        {/* Dropdown Menu */}
                                        {showPdfMenu && !isPdfGenerating && (
                                            <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden z-50 animate-fade-in-up">
                                                <div className="p-2">
                                                    <button
                                                        onClick={() => handleExportPDF('standard')}
                                                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left group"
                                                    >
                                                        <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg group-hover:bg-white dark:group-hover:bg-slate-700 group-hover:shadow-sm transition-all text-slate-500 dark:text-slate-400">
                                                            <FileText className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-bold text-slate-700 dark:text-slate-200">Standard</div>
                                                            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">~1MB • Fast & Light</div>
                                                        </div>
                                                    </button>
                                                    <button
                                                        onClick={() => handleExportPDF('hd')}
                                                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left group"
                                                    >
                                                        <div className="bg-rose-50 dark:bg-rose-900/20 p-2 rounded-lg group-hover:bg-white dark:group-hover:bg-slate-700 group-hover:shadow-sm transition-all text-rose-500 dark:text-rose-400">
                                                            <FileImage className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-bold text-slate-700 dark:text-slate-200">HD / High Res</div>
                                                            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">~5MB • Best for Print</div>
                                                        </div>
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* 导出 JSON - 桌面端显示 */}
                                    <button
                                        onClick={handleExportCurrent}
                                        className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-all"
                                        title={t('export_btn')}
                                    >
                                        <Download className="w-4 h-4" />
                                        <span>{t('export_btn')}</span>
                                    </button>

                                    {/* 保存按钮 - 移动端简化显示 */}
                                    <button
                                        onClick={handleSave}
                                        className={`flex items-center gap-2 px-3 sm:px-5 py-2 rounded-full text-sm font-bold shadow-sm transition-all duration-300 transform active:scale-95
                                ${saveStatus === 'saved'
                                                ? 'bg-green-500 text-white shadow-green-500/30'
                                                : 'bg-slate-900 dark:bg-rose-600 text-white hover:bg-slate-800 dark:hover:bg-rose-700 hover:shadow-lg'}
                            `}
                                    >
                                        <Save className="w-4 h-4" />
                                        <span className="hidden sm:inline">{saveStatus === 'saved' ? t('saved_success') : t('save_btn')}</span>
                                    </button>
                                </div>
                            )}

                            {/* Theme & Effect Toggles - 有报告时：手机端移动到保存键附近，桌面端隐藏 */}
                            {data && (
                                <div className="md:hidden flex items-center bg-white/50 dark:bg-slate-800/50 backdrop-blur rounded-full p-1 border border-slate-200/60 dark:border-slate-700/60 shadow-sm mr-2">
                                    <button
                                        onClick={toggleEffect}
                                        className={`p-1.5 rounded-full transition-all duration-300 ${showEffect ? 'text-pink-500 bg-pink-50 dark:bg-pink-900/30' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                                        title={theme === 'dark' ? "Let it snow" : "Scatter petals"}
                                    >
                                        {theme === 'dark' ? <Snowflake className="w-4 h-4" /> : <Flower className="w-4 h-4" />}
                                    </button>
                                    <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                                    <button
                                        onClick={toggleTheme}
                                        className={`p-1.5 rounded-full transition-all duration-300 ${theme === 'dark' ? 'text-amber-300 bg-slate-700' : 'text-orange-400 bg-orange-50'}`}
                                        title="Toggle Dark Mode"
                                    >
                                        {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                                    </button>
                                </div>
                            )}

                            {/* Toggle Tools */}
                            {data && !showTools && (
                                <button
                                    onClick={() => setShowTools(true)}
                                    className="p-2.5 text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-full transition-colors border border-rose-100 dark:border-rose-900"
                                    title={t('tools_panel')}
                                >
                                    <Sidebar className="w-5 h-5" />
                                </button>
                            )}

                            {/* Language Switcher */}
                            <div className="flex items-center bg-white/50 dark:bg-slate-800/50 backdrop-blur rounded-full px-3 py-1.5 border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
                                <Globe className="w-4 h-4 text-slate-400 dark:text-slate-500 mr-2" />
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value as Language)}
                                    className="bg-transparent border-none text-sm text-slate-600 dark:text-slate-300 font-semibold focus:ring-0 cursor-pointer py-0 pr-6 pl-0 dark:bg-slate-800"
                                >
                                    <option value="en">English</option>
                                    <option value="zh">中文</option>
                                    <option value="ja">日本語</option>
                                    <option value="ko">한국어</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </header>

                <main className={`relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 transition-all duration-500 ${showTools ? 'lg:pr-[26rem]' : ''}`}>

                    {/* Hero Section (Only show if no data) */}
                    {!data && (
                        <div className="text-center py-20 animate-fade-in-up">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 dark:bg-rose-900/30 border border-rose-100 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-xs font-bold tracking-wide uppercase mb-8 backdrop-blur-sm">
                                <Sparkles className="w-3 h-3" />
                                AI-Powered Insights
                            </div>

                            <h2 className="font-['Noto_Serif_SC'] text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight mb-8 leading-tight">
                                {t('hero_title_1')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-400 dark:from-pink-400 dark:to-indigo-400">{t('hero_title_2')}</span>
                            </h2>
                            <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed font-sans">
                                {/* Added <br> for better readability as requested */}
                                <span dangerouslySetInnerHTML={{ __html: t('hero_desc') }} />
                            </p>
                        </div>
                    )}

                    <div className="max-w-4xl mx-auto">
                        <AnalysisInput onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
                    </div>
                    {/* Anchor for auto-scroll */}
                    <div id="report-anchor" className="h-1" />

                    {data && (
                        <div id="report-content" className="space-y-8 animate-fade-in-up mt-12 bg-transparent">
                            <div className="flex items-center gap-4 py-4">
                                <div className="h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent flex-1"></div>
                                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{t('report_title')}</span>
                                <div className="h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent flex-1"></div>
                            </div>

                            {/* 1. Summary & TTS */}
                            <ClassRep data={data.class_rep} summary={data.summary} />

                            {/* 2. Comprehensive Viewpoints - Force Expand if PDF Generating */}
                            <ViewpointAnalysis data={data} forceExpand={isPdfGenerating} />

                            {/* 3. Sentiment Analysis */}
                            <SentimentAnalysis data={data} />

                            {/* 4. Word Cloud */}
                            <WordCloud insights={data.key_insights} />

                            {/* 5. Audience & Topics */}
                            <AudienceInsights data={data} />

                            {/* 6. Smart Reply (Excluded from PDF via CSS class 'pdf-exclude') */}
                            <SmartReply contextSummary={data.summary} />

                            {/* 7. Notes - Only Visible During PDF Generation */}
                            {isPdfGenerating && notes && (
                                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200 dark:border-slate-800 mt-8">
                                    <div className="flex items-center gap-3 mb-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                                        <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-xl text-amber-600 dark:text-amber-400">
                                            <FilePenLine className="w-5 h-5" />
                                        </div>
                                        <h2 className="text-lg font-black text-slate-800 dark:text-slate-100">{t('tab_notes')}</h2>
                                    </div>
                                    {/* Render Markdown for notes in PDF */}
                                    <div className="prose prose-sm max-w-none dark:prose-invert text-slate-700 dark:text-slate-300 font-medium whitespace-pre-wrap">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                a: ({ node, ...props }) => <span className="text-blue-500 underline" {...props} />
                                            }}
                                        >
                                            {notes}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            )}

                            <div className="h-20"></div> {/* Bottom Spacer */}
                        </div>
                    )}
                </main>
            </div>
        </HashRouter>
    );
};

export default App;