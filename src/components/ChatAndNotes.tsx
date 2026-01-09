import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Rabbit, FilePenLine, MessageSquare, Loader2, Copy, Check, Bold, Italic, List, Heading, Code, Link as LinkIcon, Image as ImageIcon, Paperclip, Download, ChevronDown, FileText } from 'lucide-react';
import { AnalysisResult, ChatMessage } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { createChatSession } from '../services/geminiService';
import MDEditor from '@uiw/react-md-editor';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import ReactMarkdown from 'react-markdown';

interface Props {
    analysisData: AnalysisResult;
    notes: string;
    onNotesChange: (val: string) => void;
    onDataUpdate: (data: AnalysisResult) => void; // New prop to save the generated report
    onClose: () => void;
}

const ChatAndNotes: React.FC<Props> = ({ analysisData, notes, onNotesChange, onDataUpdate, onClose }) => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<'chat' | 'notes'>('chat');
    const [sidebarWidth, setSidebarWidth] = useState(416); // 26rem = 416px
    const [isResizing, setIsResizing] = useState(false);

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [pendingImages, setPendingImages] = useState<string[]>([]); // Base64 strings for chat
    const [isSending, setIsSending] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true); // New: Track initial report generation
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const chatSessionRef = useRef<any>(null); // Changed from Chat to any due to custom proxy implementation
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatFileInputRef = useRef<HTMLInputElement>(null);
    const sidebarRef = useRef<HTMLDivElement>(null);

    // Track the latest analysisData to avoid stale closures
    const analysisDataRef = useRef(analysisData);
    useEffect(() => {
        analysisDataRef.current = analysisData;
    }, [analysisData]);

    const [showExportMenu, setShowExportMenu] = useState(false); // Export format dropdown
    const exportMenuRef = useRef<HTMLDivElement>(null);

    // Close export menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
                setShowExportMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle sidebar resize
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing) return;
            const newWidth = window.innerWidth - e.clientX;
            // Constrain width between 300px and 80% of window width
            const minWidth = 300;
            const maxWidth = window.innerWidth * 0.8;
            setSidebarWidth(Math.max(minWidth, Math.min(newWidth, maxWidth)));
        };

        const handleMouseUp = () => {
            setIsResizing(false);
        };

        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'ew-resize';
            document.body.style.userSelect = 'none';
        } else {
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing]);

    // Export notes as Markdown file
    const handleExportMarkdown = () => {
        if (!notes.trim()) {
            alert('没有笔记可以导出');
            return;
        }

        const blob = new Blob([notes], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;

        // Generate filename with date
        const dateStr = new Date().toISOString().slice(0, 10);
        const title = analysisData.short_title || 'Notes';
        const safeTitle = title.replace(/[\\/:*?"<>|]/g, '_').slice(0, 20);
        a.download = `${safeTitle}_随手记_${dateStr}.md`;

        a.click();
        URL.revokeObjectURL(url);
        setShowExportMenu(false);
    };

    // Export notes as PDF (render markdown to HTML then convert)
    const handleExportPDF = async () => {
        if (!notes.trim()) {
            alert('没有笔记可以导出');
            return;
        }

        setShowExportMenu(false);

        // Create a hidden container to render markdown
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.width = '800px';
        container.style.padding = '40px';
        container.style.backgroundColor = 'white';
        container.style.color = '#1e293b';
        container.style.fontFamily = 'system-ui, -apple-system, sans-serif';
        container.style.fontSize = '14px';
        container.style.lineHeight = '1.6';

        // Import ReactMarkdown and remark plugins dynamically
        const ReactMarkdown = (await import('react-markdown')).default;
        const remarkGfm = (await import('remark-gfm')).default;
        const remarkMath = (await import('remark-math')).default;
        const rehypeKatex = (await import('rehype-katex')).default;
        const { createRoot } = await import('react-dom/client');

        document.body.appendChild(container);
        const root = createRoot(container);

        // Wait for render with plugins
        await new Promise<void>((resolve) => {
            root.render(
                React.createElement(ReactMarkdown, { 
                    children: notes,
                    remarkPlugins: [remarkGfm, remarkMath],
                    rehypePlugins: [rehypeKatex]
                })
            );
            setTimeout(resolve, 1000); // Increase timeout for KaTeX rendering
        });

        try {
            const html2pdf = (await import('html2pdf.js')).default;
            const dateStr = new Date().toISOString().slice(0, 10);
            const title = analysisData.short_title || 'Notes';
            const safeTitle = title.replace(/[\\/:*?"<>|]/g, '_').slice(0, 20);

            await html2pdf()
                .set({
                    margin: 15,
                    filename: `${safeTitle}_随手记_${dateStr}.pdf`,
                    html2canvas: { scale: 2, useCORS: true },
                    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                })
                .from(container)
                .save();
        } catch (error) {
            console.error('PDF export error:', error);
            alert('PDF 导出失败，请尝试使用 Markdown 格式');
        } finally {
            root.unmount();
            document.body.removeChild(container);
        }
    };

    // Initialize Session and Report
    useEffect(() => {
        // Always initialize the chat session context so the user can ask follow-up questions
        chatSessionRef.current = createChatSession(analysisData);

        const initChat = async () => {
            setIsInitializing(true);

            // Check if we already have a saved report in the data
            if (analysisData.initial_chat_response) {
                setMessages([{ role: 'model', text: analysisData.initial_chat_response }]);
                setIsInitializing(false);
                return;
            }

            // If not, generate it
            try {
                // We send a hidden prompt to trigger the Persona's output format
                const triggerPrompt = "开始输出报告";
                if (chatSessionRef.current) {
                    const response = await chatSessionRef.current.sendMessage({ message: triggerPrompt });
                    const text = response.text || "Report generation failed.";

                    setMessages([{ role: 'model', text: text }]);

                    // Save this to the parent data structure so we don't regenerate next time
                    // Use ref to get the latest data, avoiding stale closure
                    const currentData = analysisDataRef.current;
                    onDataUpdate({
                        ...currentData,
                        initial_chat_response: text
                    });
                }
            } catch (error) {
                console.error("Failed to generate initial report:", error);
                setMessages([{ role: 'model', text: t('chat_welcome') }]); // Fallback to simple welcome
            } finally {
                setIsInitializing(false);
            }
        };

        initChat();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [analysisData.raw_content, analysisData.summary]); // Only re-run if underlying content changes drastically, ignore onDataUpdate loop

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, activeTab, pendingImages, isInitializing]);

    // --- CHAT LOGIC ---

    const handleChatImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                // Store raw base64 data without prefix for API, but we need full data URI for preview
                const base64Data = base64String.split(',')[1];
                setPendingImages(prev => [...prev, base64Data]);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleChatPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                e.preventDefault();
                const file = items[i].getAsFile();
                if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const base64String = reader.result as string;
                        const base64Data = base64String.split(',')[1];
                        setPendingImages(prev => [...prev, base64Data]);
                    };
                    reader.readAsDataURL(file);
                }
            }
        }
    };

    const removePendingImage = (index: number) => {
        setPendingImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSend = async () => {
        if ((!input.trim() && pendingImages.length === 0) || !chatSessionRef.current || isSending || isInitializing) return;

        const userMsg = input;
        const userImages = [...pendingImages];

        setInput('');
        setPendingImages([]);

        // Optimistic Update
        setMessages(prev => [...prev, { role: 'user', text: userMsg, images: userImages }]);
        setIsSending(true);

        try {
            let response: any; // Changed to any due to custom proxy implementation

            if (userImages.length > 0) {
                // TODO: 修复 Gemini SDK 多模态 API 调用
                // 当前 SDK 版本可能不支持 content 格式，需要查阅文档
                alert("图片功能暂时不可用，正在修复中...");
                setIsSending(false);
                return;
                // const content = {
                //   parts: [
                //     { text: userMsg },
                //     ...userImages.map(img => ({
                //         inlineData: {
                //             mimeType: 'image/jpeg',
                //             data: img
                //         }
                //     }))
                //   ]
                // };
                // response = await chatSessionRef.current.sendMessage({ content });
            } else {
                // Text Only Request
                response = await chatSessionRef.current.sendMessage({ message: userMsg });
            }

            const text = response.text || "I'm sorry, I couldn't generate a response.";
            setMessages(prev => [...prev, { role: 'model', text }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'model', text: "Error connecting to AI." }]);
        } finally {
            setIsSending(false);
        }
    };

    const handleCopyMessage = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    // --- NOTES LOGIC ---
    // MDEditor handles its own toolbar and paste events

    const markdownStyles = `
    text-sm leading-relaxed overflow-x-hidden text-slate-700 dark:text-slate-300
    [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-3
    [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:mb-3
    [&>h1]:text-lg [&>h1]:font-bold [&>h1]:mb-2 [&>h1]:text-slate-900 dark:[&>h1]:text-white
    [&>h2]:text-base [&>h2]:font-bold [&>h2]:mb-2 [&>h2]:text-slate-900 dark:[&>h2]:text-white
    [&>h3]:text-sm [&>h3]:font-bold [&>h3]:mb-1 [&>h3]:text-slate-800 dark:[&>h3]:text-slate-200
    [&>p]:mb-3 [&>p]:last:mb-0
    [&>a]:text-blue-500 [&>a]:underline hover:[&>a]:text-blue-600
    [&>blockquote]:border-l-4 [&>blockquote]:border-slate-200 dark:[&>blockquote]:border-slate-700 [&>blockquote]:pl-3 [&>blockquote]:italic [&>blockquote]:text-slate-500 dark:[&>blockquote]:text-slate-400
    [&>pre]:bg-slate-100 dark:[&>pre]:bg-slate-800 [&>pre]:p-3 [&>pre]:rounded-xl [&>pre]:overflow-x-auto [&>pre]:my-3
    [&>code]:bg-slate-100 dark:[&>code]:bg-slate-800 [&>code]:px-1.5 [&>code]:py-0.5 [&>code]:rounded [&>code]:font-mono [&>code]:text-xs [&>code]:text-rose-600 dark:[&>code]:text-rose-400
    [&_strong]:font-bold [&_strong]:text-slate-900 dark:[&_strong]:text-white
    [&_img]:rounded-lg [&_img]:shadow-sm [&_img]:max-h-64 [&_img]:w-auto [&_img]:my-2
    [&_table]:w-full [&_table]:border-collapse [&_table]:my-4 [&_table]:text-xs
    [&_th]:border [&_th]:border-slate-200 dark:[&_th]:border-slate-700 [&_th]:bg-slate-50 dark:[&_th]:bg-slate-800 [&_th]:p-2 [&_th]:font-bold [&_th]:text-left
    [&_td]:border [&_td]:border-slate-200 dark:[&_td]:border-slate-700 [&_td]:p-2
    [&_.katex]:text-base
  `;

    return (
        <div 
            ref={sidebarRef}
            className="fixed inset-y-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-2xl z-[60] flex flex-col animate-slide-in-right border-l border-white/50 dark:border-slate-700/50"
            style={{ width: `${sidebarWidth}px` }}
        >
            {/* Resize Handle */}
            <div
                className="absolute left-0 top-0 bottom-0 w-1 hover:w-1.5 bg-transparent hover:bg-rose-400/50 cursor-ew-resize transition-all group z-10"
                onMouseDown={() => setIsResizing(true)}
            >
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-slate-300 dark:bg-slate-600 rounded-r group-hover:bg-rose-400 transition-colors" />
            </div>

            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white/50 dark:bg-slate-900/50">
                <h2 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    {t('tools_panel')}
                </h2>
                <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex p-2 gap-2 bg-slate-50/50 dark:bg-slate-800/50">
                <button
                    onClick={() => setActiveTab('chat')}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all
            ${activeTab === 'chat'
                            ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-700/50'}`}
                >
                    <MessageSquare className="w-4 h-4" />
                    {t('tab_chat')}
                </button>
                <button
                    onClick={() => setActiveTab('notes')}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all
            ${activeTab === 'notes'
                            ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-700/50'}`}
                >
                    <FilePenLine className="w-4 h-4" />
                    {t('tab_notes')}
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative">

                {/* Chat Tab */}
                {activeTab === 'chat' && (
                    <div className="absolute inset-0 flex flex-col">
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">

                            {/* Initial Loading State for Report */}
                            {isInitializing && (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 space-y-3 animate-pulse">
                                    <Rabbit className="w-10 h-10 text-rose-500/50" />
                                    <div className="text-sm font-medium">Generating Expert Insight Report...</div>
                                    <div className="text-xs">Based on provided persona & data</div>
                                </div>
                            )}

                            {!isInitializing && messages.map((msg, idx) => (
                                <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div className={`max-w-[90%] rounded-2xl p-4 shadow-sm relative group
                                ${msg.role === 'user'
                                            ? 'bg-rose-500 text-white rounded-tr-none shadow-rose-500/20'
                                            : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-none'}`}
                                    >
                                        {msg.role === 'model' && <Rabbit className="w-4 h-4 text-rose-500 dark:text-rose-400 mb-2" />}

                                        {/* Image Display in Chat History */}
                                        {msg.images && msg.images.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {msg.images.map((img, i) => (
                                                    <img
                                                        key={i}
                                                        src={`data:image/jpeg;base64,${img}`}
                                                        alt="User upload"
                                                        className="rounded-lg max-h-32 w-auto border border-white/20"
                                                    />
                                                ))}
                                            </div>
                                        )}

                                        {msg.role === 'model' ? (
                                            <>
                                                <div className={`prose prose-sm max-w-none ${markdownStyles}`}>
                                                    <ReactMarkdown
                                                        remarkPlugins={[remarkGfm]}
                                                        components={{
                                                            a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />
                                                        }}
                                                    >
                                                        {msg.text}
                                                    </ReactMarkdown>
                                                </div>

                                                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleCopyMessage(msg.text, idx)}
                                                        className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
                                                    >
                                                        {copiedIndex === idx ? (
                                                            <><Check className="w-3 h-3" /> Copied</>
                                                        ) : (
                                                            <><Copy className="w-3 h-3" /> Copy MD</>
                                                        )}
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-sm whitespace-pre-wrap leading-relaxed font-medium">{msg.text}</div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {isSending && (
                                <div className="flex justify-start">
                                    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl rounded-tl-none p-4 shadow-sm">
                                        <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Pending Images Preview */}
                        {pendingImages.length > 0 && (
                            <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 flex gap-2 overflow-x-auto border-t border-slate-100 dark:border-slate-700">
                                {pendingImages.map((img, i) => (
                                    <div key={i} className="relative group/preview flex-shrink-0">
                                        <img src={`data:image/jpeg;base64,${img}`} className="h-12 w-12 rounded-lg object-cover border border-slate-300 dark:border-slate-600" />
                                        <button
                                            onClick={() => removePendingImage(i)}
                                            className="absolute -top-1 -right-1 bg-slate-900 text-white rounded-full p-0.5 hover:bg-red-500 transition-colors"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-t border-slate-100 dark:border-slate-800">
                            <div className="flex gap-2 relative">
                                <button
                                    onClick={() => chatFileInputRef.current?.click()}
                                    className="p-3 text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors"
                                    title="Upload Image"
                                >
                                    <ImageIcon className="w-5 h-5" />
                                </button>
                                <input
                                    type="file"
                                    ref={chatFileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleChatImageUpload}
                                />

                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    onPaste={handleChatPaste}
                                    placeholder={pendingImages.length > 0 ? t('chat_placeholder') : t('chat_placeholder') + " (or Paste Image)"}
                                    disabled={isSending || isInitializing}
                                    className="flex-1 pl-4 pr-12 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 outline-none transition-all shadow-inner text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={(!input.trim() && pendingImages.length === 0) || isSending || isInitializing}
                                    className="absolute right-2 top-2 p-1.5 bg-rose-500 text-white rounded-xl hover:bg-rose-600 disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-400 dark:disabled:text-slate-500 transition-colors shadow-lg shadow-rose-500/20 disabled:shadow-none"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Notes Tab */}
                {activeTab === 'notes' && (
                    <div className="absolute inset-0 flex flex-col bg-slate-50/30 dark:bg-slate-900/30">
                        {/* Export button header */}
                        <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 p-2 flex justify-end items-center">
                            {/* 导出按钮 */}
                            <div className="relative" ref={exportMenuRef}>
                                <button
                                    onClick={() => setShowExportMenu(!showExportMenu)}
                                    disabled={!notes.trim()}
                                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 disabled:opacity-40 disabled:cursor-not-allowed"
                                    title="导出随手记"
                                >
                                    <Download className="w-3 h-3" /> 导出 <ChevronDown className={`w-3 h-3 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
                                </button>

                                {/* 导出格式下拉菜单 */}
                                {showExportMenu && notes.trim() && (
                                    <div className="absolute top-full right-0 mt-1 w-40 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50 animate-fade-in-up">
                                        <button
                                            onClick={handleExportMarkdown}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors text-left"
                                        >
                                            <FileText className="w-4 h-4" />
                                            <div>
                                                <div className="font-bold">Markdown</div>
                                                <div className="text-[10px] text-slate-400">.md 文件</div>
                                            </div>
                                        </button>
                                        <button
                                            onClick={handleExportPDF}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors text-left"
                                        >
                                            <Download className="w-4 h-4" />
                                            <div>
                                                <div className="font-bold">PDF</div>
                                                <div className="text-[10px] text-slate-400">.pdf 文件</div>
                                            </div>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* WYSIWYG Markdown Editor - Typora style */}
                        <div className="flex-1 overflow-hidden" data-color-mode="light">
                            <MDEditor
                                value={notes}
                                onChange={(val) => onNotesChange(val || '')}
                                preview="live"
                                hideToolbar={false}
                                visibleDragbar={true}
                                height="100%"
                                previewOptions={{
                                    remarkPlugins: [remarkGfm, remarkMath],
                                    rehypePlugins: [rehypeKatex],
                                }}
                                textareaProps={{
                                    placeholder: t('notes_placeholder') + ' (Markdown, LaTeX & Images Supported)',
                                }}
                            />
                        </div>

                        <p className="text-[10px] text-slate-400 dark:text-slate-600 pb-2 text-center">
                            Auto-saved to current report
                        </p>
                    </div>
                )}

            </div>
        </div>
    );
};

export default ChatAndNotes;