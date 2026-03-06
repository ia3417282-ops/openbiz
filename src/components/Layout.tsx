import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Truck, 
  RotateCcw, 
  CreditCard, 
  Trash2, 
  FileText, 
  ClipboardList, 
  Package, 
  Edit3, 
  Settings, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  Languages,
  Search,
  ChevronLeft,
  ChevronRight,
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Layout({ children, activeTab, setActiveTab }: LayoutProps) {
  const { t, i18n } = useTranslation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.classList.toggle('rtl', isRTL);
    document.documentElement.classList.toggle('ltr', !isRTL);
  }, [isRTL]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
  };

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: t('dashboard') },
    { id: 'sales', icon: ShoppingCart, label: t('sales_purchases') },
    { id: 'logistics', icon: Truck, label: t('import_export') },
    { id: 'returns', icon: RotateCcw, label: t('cancellations_returns') },
    { id: 'accounts', icon: CreditCard, label: t('accounts_billing') },
    { id: 'scrap', icon: Trash2, label: t('damaged_goods') },
    { id: 'invoices', icon: FileText, label: t('invoices') },
    { id: 'offers', icon: ClipboardList, label: t('offers_requests') },
    { id: 'inventory', icon: Package, label: t('inventory') },
    { id: 'workspace', icon: Edit3, label: t('smart_workspace') },
    { id: 'logs', icon: History, label: t('transaction_logs') },
    { id: 'settings', icon: Settings, label: t('settings') },
  ];

  return (
    <div className={cn("min-h-screen flex", isRTL ? "font-['Cairo']" : "font-['Inter']")}>
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className={cn(
          "fixed inset-y-0 z-50 bg-white dark:bg-slate-900 border-e border-slate-200 dark:border-slate-800 transition-colors duration-200",
          isRTL ? "right-0" : "left-0"
        )}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 flex items-center justify-between">
            {isSidebarOpen && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xl font-bold text-indigo-600 dark:text-indigo-400"
              >
                {t('app_name')}
              </motion.span>
            )}
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto p-2 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200",
                  activeTab === item.id 
                    ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-semibold shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                )}
              >
                <item.icon size={22} className={cn(activeTab === item.id ? "scale-110" : "")} />
                {isSidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </button>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <button
              onClick={toggleLanguage}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Languages size={20} />
              {isSidebarOpen && <span>{i18n.language === 'en' ? 'العربية' : 'English'}</span>}
            </button>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              {isSidebarOpen && <span>{isDarkMode ? t('light_mode') : t('dark_mode')}</span>}
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main 
        className={cn(
          "flex-1 transition-all duration-300",
          isSidebarOpen ? (isRTL ? "mr-[280px]" : "ml-[280px]") : (isRTL ? "mr-[80px]" : "ml-[80px]")
        )}
      >
        {/* Topbar */}
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder={t('search')}
                className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-2 pl-10 pr-4 focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-semibold">Johannes Youn</span>
              <span className="text-xs text-slate-500 uppercase tracking-wider">Admin</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
              JY
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6 max-w-7xl mx-auto min-h-[calc(100vh-160px)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Permanent Copyright Footer */}
        <footer className="px-6 py-8 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-xs">OB</div>
              <span className="font-black tracking-tighter text-slate-900 dark:text-white">OpenBiz PWA</span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                © {new Date().getFullYear()} All Rights Reserved
              </p>
              <p className="text-sm font-black text-indigo-600 dark:text-indigo-400 mt-1">
                Developed & Owned by: Johannes Youn (يوهانس يون)
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
