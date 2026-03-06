import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownRight, 
  Search, 
  Filter, 
  Download, 
  Plus, 
  DollarSign, 
  Wallet, 
  TrendingUp, 
  TrendingDown,
  ChevronRight,
  MoreVertical
} from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { getCurrencyConfig, formatCurrency } from '../utils/currency';
import { logAction } from '../utils/logger';

export default function Accounts() {
  const { t } = useTranslation();

  const invoices = useLiveQuery(() => db.invoices.toArray()) || [];
  const transactions = useLiveQuery(() => db.transactions.toArray()) || [];
  const [currency, setCurrency] = React.useState<any>(null);

  React.useEffect(() => {
    getCurrencyConfig().then(setCurrency);
  }, []);

  const totalBalance = invoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
  
  // Simplified weekly data for chart based on real invoices
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const chartData = days.map(day => {
    const dayInvoices = invoices.filter(inv => new Date(inv.date).getDay() === days.indexOf(day));
    const income = dayInvoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
    return { name: day, income, expenses: income * 0.4 }; // Mocking expenses for now as we don't have a dedicated expenses table
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('accounts_billing')}</h1>
          <p className="text-slate-500 mt-1">Monitor your cash flow, bank accounts, and financial health.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
            <Download size={18} />
            {t('export_pdf')}
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none">
            <Plus size={18} />
            Add Account
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold">Cash Flow Overview</h3>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button className="px-3 py-1.5 text-xs font-bold bg-white dark:bg-slate-700 rounded-lg shadow-sm">Weekly</button>
              <button className="px-3 py-1.5 text-xs font-bold text-slate-500">Monthly</button>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="income" stroke="#4f46e5" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={3} />
                <Area type="monotone" dataKey="expenses" stroke="#f43f5e" fillOpacity={1} fill="url(#colorExpenses)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-indigo-600 p-8 rounded-3xl shadow-2xl text-white relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                <Wallet size={24} />
              </div>
              <span className="text-sm font-bold uppercase tracking-widest opacity-80">Total Balance</span>
            </div>
            <h2 className="text-4xl font-bold mb-2">{formatCurrency(totalBalance, currency)}</h2>
            <div className="flex items-center gap-2 text-emerald-300 text-sm font-bold">
              <TrendingUp size={16} />
              <span>+14.2% from last month</span>
            </div>
          </motion.div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-bold mb-4">Bank Accounts</h3>
            <div className="space-y-4">
              {[
                { name: 'Business Checking', balance: `$${(totalBalance * 0.7).toLocaleString()}`, color: 'indigo' },
                { name: 'Savings Account', balance: `$${(totalBalance * 0.3).toLocaleString()}`, color: 'emerald' },
              ].map((acc, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-${acc.color}-50 dark:bg-${acc.color}-900/20 flex items-center justify-center text-${acc.color}-600 dark:text-${acc.color}-400`}>
                      <CreditCard size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{acc.name}</p>
                      <p className="text-xs text-slate-500">**** 4291</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{acc.balance}</span>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-600 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-xl font-bold">Recent Transactions</h3>
          <button className="text-sm text-indigo-600 font-bold hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-bold">Transaction</th>
                <th className="px-6 py-4 font-bold">Category</th>
                <th className="px-6 py-4 font-bold">Date</th>
                <th className="px-6 py-4 font-bold">Amount</th>
                <th className="px-6 py-4 font-bold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {invoices.slice(0, 10).map((inv, i) => (
                <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-50 text-emerald-600">
                        <ArrowUpRight size={16} />
                      </div>
                      <span className="text-sm font-semibold">Payment from {inv.customerName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider rounded-full">
                      Sales
                    </span>
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-500">{new Date(inv.date).toLocaleDateString()}</td>
                  <td className="px-6 py-5 text-sm font-bold text-emerald-600">
                    +{formatCurrency(inv.totalAmount, currency)}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button className="p-2 text-slate-400 hover:text-slate-600 transition-all opacity-0 group-hover:opacity-100">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-400 font-bold">No transactions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
