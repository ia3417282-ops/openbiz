import React, { useState } from 'react';
import './i18n';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import SmartWorkspace from './components/SmartWorkspace';
import Sales from './components/Sales';
import Accounts from './components/Accounts';
import Logistics from './components/Logistics';
import TransactionLogs from './components/TransactionLogs';
import { useTranslation } from 'react-i18next';
import { db } from './db';
import { currencies } from './utils/currency';
import { logAction } from './utils/logger';
import { Globe, Coins } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { t } = useTranslation();

  const handleBackup = async () => {
    const items = await db.items.toArray();
    const transactions = await db.transactions.toArray();
    const invoices = await db.invoices.toArray();
    
    const data = { items, transactions, invoices };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `openbiz-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRestore = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = async (event: any) => {
        try {
          const data = JSON.parse(event.target.result);
          
          await db.transaction('rw', db.items, db.transactions, db.invoices, async () => {
            await db.items.clear();
            await db.transactions.clear();
            await db.invoices.clear();
            
            if (data.items) await db.items.bulkAdd(data.items);
            if (data.transactions) await db.transactions.bulkAdd(data.transactions);
            if (data.invoices) await db.invoices.bulkAdd(data.invoices);
          });
          
          alert('Data restored successfully!');
          window.location.reload();
        } catch (err) {
          alert('Failed to restore data. Invalid file format.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'inventory':
        return <Inventory />;
      case 'workspace':
        return <SmartWorkspace />;
      case 'sales':
        return <Sales />;
      case 'accounts':
        return <Accounts />;
      case 'logistics':
        return <Logistics />;
      case 'logs':
        return <TransactionLogs />;
      case 'settings':
        const [selectedCurrency, setSelectedCurrency] = useState('USD');
        
        React.useEffect(() => {
          db.settings.get('currency').then(s => {
            if (s) setSelectedCurrency(s.value.code);
          });
        }, []);

        const handleCurrencyChange = async (code: string) => {
          const currency = currencies.find(c => c.code === code);
          if (currency) {
            await db.settings.put({ id: 'currency', value: currency });
            setSelectedCurrency(code);
            logAction('Settings Updated', `Currency changed to ${currency.name} (${code})`, 'success');
          }
        };

        return (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h1 className="text-2xl font-bold mb-6">{t('settings')}</h1>
            <div className="space-y-8">
              <section>
                <div className="flex items-center gap-2 mb-4 text-indigo-600">
                  <Globe size={20} />
                  <h3 className="text-lg font-semibold">Localization & Currency</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Select Currency / Country</label>
                    <div className="relative">
                      <Coins className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <select 
                        value={selectedCurrency}
                        onChange={(e) => handleCurrencyChange(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-indigo-500 font-bold appearance-none"
                      >
                        {currencies.map(c => (
                          <option key={c.code} value={c.code}>{c.country} - {c.name} ({c.symbol})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </section>

              <section className="pt-8 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-lg font-semibold mb-4">Data Management</h3>
                <div className="flex gap-4">
                  <button 
                    onClick={handleBackup}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
                  >
                    {t('backup')}
                  </button>
                  <button 
                    onClick={handleRestore}
                    className="px-6 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    {t('restore')}
                  </button>
                </div>
              </section>
              <section className="pt-8 border-t border-slate-200 dark:border-slate-800">
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-8 rounded-[2rem] border border-indigo-100 dark:border-indigo-800/50">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black">OB</div>
                    <div>
                      <h3 className="text-xl font-black tracking-tight">OpenBiz PWA v1.0.0</h3>
                      <p className="text-indigo-600 dark:text-indigo-400 text-sm font-bold uppercase tracking-widest">Enterprise Edition</p>
                    </div>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                    This software is a proprietary enterprise resource planning solution. 
                    All rights, title, and interest in and to the software, including all intellectual property rights, 
                    are owned exclusively by the developer.
                  </p>
                  <div className="mt-6 pt-6 border-t border-indigo-100 dark:border-indigo-800/30">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Developer & Owner</p>
                    <p className="text-xl font-black text-slate-900 dark:text-white">Johannes Youn (يوهانس يون)</p>
                    <p className="text-sm text-slate-500 font-medium mt-1">Open Source Community Contributor</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <span className="text-4xl">🚧</span>
            </div>
            <h2 className="text-xl font-bold text-slate-600 dark:text-slate-300">Module Under Construction</h2>
            <p className="mt-2">The {activeTab} module is coming soon in the next update.</p>
          </div>
        );
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
}

