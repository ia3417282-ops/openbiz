import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Calculator, 
  Square, 
  Grid, 
  Type, 
  Download, 
  Printer, 
  Copy, 
  Scissors, 
  Clipboard,
  Save,
  Trash2,
  Table as TableIcon,
  FileText,
  Undo2,
  Redo2,
  History,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { toast } from 'react-hot-toast';

export default function SmartWorkspace() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [viewMode, setViewMode] = useState<'document' | 'spreadsheet' | 'hybrid'>('hybrid');
  const [content, setContent] = useState('');
  const [calcResult, setCalcResult] = useState<string | number>('');
  const [formula, setFormula] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const quillRef = useRef<ReactQuill>(null);

  useEffect(() => {
    // Initial history
    if (content && history.length === 0) {
      setHistory([content]);
      setHistoryIndex(0);
    }
  }, []);

  const handleContentChange = (value: string) => {
    setContent(value);
    // Add to history if it's a significant change (debounced or on blur would be better, but let's keep it simple)
    // For now, let's just update the content. Real undo/redo is handled by Quill itself, 
    // but we can expose the buttons.
  };

  const handleUndo = () => {
    const quill = quillRef.current?.getEditor();
    if (quill) {
      (quill as any).history.undo();
    }
  };

  const handleRedo = () => {
    const quill = quillRef.current?.getEditor();
    if (quill) {
      (quill as any).history.redo();
    }
  };

  const handleCalculate = () => {
    try {
      const sanitized = formula.replace(/[^-()\d/*+.]/g, '');
      const result = Function(`"use strict"; return (${sanitized})`)();
      setCalcResult(result);
      toast.success(`${t('save')}: ${result}`);
    } catch (e) {
      setCalcResult('Error');
      toast.error('Invalid Formula');
    }
  };

  const handleCopy = () => {
    const quill = quillRef.current?.getEditor();
    if (quill) {
      const text = quill.getText();
      navigator.clipboard.writeText(text);
      toast.success(t('copy'));
    }
  };

  const handleSave = () => {
    toast.success(t('save'));
    // In a real app, we'd save to IndexedDB here
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'direction': 'rtl' }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ],
    history: {
      delay: 1000,
      maxStack: 100,
      userOnly: true
    }
  };

  return (
    <div className={cn(
      "space-y-6 flex flex-col transition-all duration-300",
      isFullscreen ? "fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950 p-6" : "h-[calc(100vh-180px)]"
    )}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => window.history.back()}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"
            title={t('back')}
          >
            {isRTL ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('smart_workspace')}</h1>
            <p className="text-slate-500 mt-1">Professional Rich Text & Data Editor</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button 
              onClick={() => setViewMode('document')}
              className={cn("p-2 rounded-lg transition-all", viewMode === 'document' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600' : 'text-slate-500')}
              title="Document Mode"
            >
              <FileText size={20} />
            </button>
            <button 
              onClick={() => setViewMode('spreadsheet')}
              className={cn("p-2 rounded-lg transition-all", viewMode === 'spreadsheet' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600' : 'text-slate-500')}
              title="Spreadsheet Mode"
            >
              <TableIcon size={20} />
            </button>
            <button 
              onClick={() => setViewMode('hybrid')}
              className={cn("p-2 rounded-lg transition-all", viewMode === 'hybrid' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600' : 'text-slate-500')}
              title="Hybrid Mode"
            >
              <Grid size={20} />
            </button>
          </div>
          <button 
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 overflow-hidden">
        {/* Main Editor Area */}
        <div className="lg:col-span-3 flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto bg-slate-50/50 dark:bg-slate-800/50">
            <div className="flex gap-1">
              <button onClick={handleUndo} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400" title={t('undo')}><Undo2 size={18} /></button>
              <button onClick={handleRedo} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400" title={t('redo')}><Redo2 size={18} /></button>
            </div>
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />
            <div className="flex gap-1">
              <button onClick={handleCopy} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400" title={t('copy')}><Copy size={18} /></button>
              <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400" title={t('cut')}><Scissors size={18} /></button>
              <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400" title={t('paste')}><Clipboard size={18} /></button>
            </div>
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />
            <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400" title={t('history')}><History size={18} /></button>
            
            <button 
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-bold ml-auto hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200 dark:shadow-none"
            >
              <Save size={16} />
              {t('save')}
            </button>
          </div>
          
          <div className="flex-1 overflow-auto custom-quill">
            {viewMode === 'document' || viewMode === 'hybrid' ? (
              <ReactQuill
                ref={quillRef}
                theme="snow"
                value={content}
                onChange={handleContentChange}
                modules={modules}
                className="h-full border-none"
                placeholder="Start typing your document..."
              />
            ) : (
              <div className="p-4 grid grid-cols-12 gap-px bg-slate-200 dark:bg-slate-800 h-full overflow-auto">
                {Array.from({ length: 200 }).map((_, i) => (
                  <div key={i} className="bg-white dark:bg-slate-900 p-2 min-h-[45px] flex items-center justify-center text-xs border border-transparent hover:border-indigo-500 cursor-text transition-colors">
                    {i % 12 === 0 ? <span className="text-slate-400 font-bold">{Math.floor(i / 12) + 1}</span> : ''}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tools Sidebar */}
        <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
          {/* Calculator Tool */}
          <motion.div 
            whileHover={{ y: -2 }}
            className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-4 text-indigo-600 dark:text-indigo-400">
              <Calculator size={20} />
              <h3 className="font-bold">Smart Calc</h3>
            </div>
            <div className="space-y-3">
              <input 
                type="text" 
                placeholder="e.g. 10 * 5 + 16"
                value={formula}
                onChange={(e) => setFormula(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-2.5 px-3 text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
              />
              <button 
                onClick={handleCalculate}
                className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none"
              >
                Calculate
              </button>
              <AnimatePresence>
                {calcResult !== '' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-center font-mono font-bold border border-emerald-100 dark:border-emerald-900/30"
                  >
                    Result: {calcResult}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Geometry Tool */}
          <motion.div 
            whileHover={{ y: -2 }}
            className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-4 text-amber-600 dark:text-amber-400">
              <Square size={20} />
              <h3 className="font-bold">Geometry</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Width</label>
                <input type="number" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg py-2 px-2 text-xs focus:ring-2 focus:ring-amber-500" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Height</label>
                <input type="number" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg py-2 px-2 text-xs focus:ring-2 focus:ring-amber-500" />
              </div>
            </div>
            <button className="w-full mt-4 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
              Calculate Area
            </button>
          </motion.div>

          {/* Export Actions */}
          <div className="bg-slate-900 dark:bg-indigo-600 p-6 rounded-2xl shadow-2xl text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500" />
            <h3 className="font-bold mb-5 flex items-center gap-2 relative z-10">
              <Download size={18} />
              {t('download_report')}
            </h3>
            <div className="space-y-3 relative z-10">
              <button className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/10 transition-all text-sm group/btn">
                <span className="group-hover/btn:translate-x-1 transition-transform">{t('export_pdf')}</span>
                <FileText size={16} />
              </button>
              <button className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/10 transition-all text-sm group/btn">
                <span className="group-hover/btn:translate-x-1 transition-transform">{t('export_excel')}</span>
                <TableIcon size={16} />
              </button>
              <button className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/10 transition-all text-sm group/btn">
                <span className="group-hover/btn:translate-x-1 transition-transform">{t('export_word')}</span>
                <Type size={16} />
              </button>
              <div className="h-px bg-white/10 my-2" />
              <button className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/10 transition-all text-sm group/btn">
                <span className="group-hover/btn:translate-x-1 transition-transform">{t('print')}</span>
                <Printer size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
