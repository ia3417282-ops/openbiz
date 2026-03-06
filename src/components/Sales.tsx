import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { getCurrencyConfig, formatCurrency } from '../utils/currency';
import { logAction } from '../utils/logger';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  ShoppingCart, 
  ArrowUpRight, 
  ArrowDownRight,
  MoreVertical,
  Calendar,
  User
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

export default function Sales() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [currency, setCurrency] = useState<any>(null);

  React.useEffect(() => {
    getCurrencyConfig().then(setCurrency);
  }, []);

  const invoices = useLiveQuery(() => db.invoices.toArray()) || [];
  
  const totalSalesAmount = invoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
  const pendingInvoicesCount = invoices.filter(inv => inv.status === 'pending').length;
  const uniqueCustomers = new Set(invoices.map(inv => inv.customerName)).size;

  const stats = [
    { label: t('total_sales'), value: formatCurrency(totalSalesAmount, currency), trend: 12.5, icon: ArrowUpRight, color: 'emerald' },
    { label: 'Pending Invoices', value: pendingInvoicesCount.toString(), trend: -2.4, icon: Calendar, color: 'amber' },
    { label: 'Total Customers', value: uniqueCustomers.toString(), trend: 18.2, icon: User, color: 'indigo' },
  ];

  const filteredInvoices = invoices.filter(inv => 
    inv.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('sales_purchases')}</h1>
          <p className="text-slate-500 mt-1">Manage your sales pipeline and customer invoices.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none">
          <Plus size={18} />
          {t('new_transaction')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl bg-${stat.color}-50 dark:bg-${stat.color}-900/20 text-${stat.color}-600 dark:text-${stat.color}-400`}>
                <stat.icon size={24} />
              </div>
              <span className={cn(
                "text-xs font-bold px-2 py-1 rounded-full",
                stat.trend > 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
              )}>
                {stat.trend > 0 ? '+' : ''}{stat.trend}%
              </span>
            </div>
            <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
            <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder={t('search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          <div className="flex gap-2">
            <button className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-slate-100 transition-colors">
              <Filter size={20} />
            </button>
            <button className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-slate-100 transition-colors">
              <Download size={20} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-bold">Invoice</th>
                <th className="px-6 py-4 font-bold">Customer</th>
                <th className="px-6 py-4 font-bold">Date</th>
                <th className="px-6 py-4 font-bold">Amount</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-5 font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400">#INV-{inv.id}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold">
                        {inv.customerName.charAt(0)}
                      </div>
                      <span className="text-sm font-semibold">{inv.customerName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-500">{new Date(inv.date).toLocaleDateString()}</td>
                  <td className="px-6 py-5 text-sm font-bold">{formatCurrency(inv.totalAmount, currency)}</td>
                  <td className="px-6 py-5">
                    <span className={cn(
                      "px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full",
                      inv.status === 'paid' ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
                    )}>
                      {t(inv.status)}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 opacity-0 group-hover:opacity-100 transition-all">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400 font-bold">No invoices found.</td>
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
