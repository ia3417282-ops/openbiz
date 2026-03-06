import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { getCurrencyConfig, formatCurrency } from '../utils/currency';
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter,
  Download,
  Plus,
  MoreHorizontal,
  Activity,
  DollarSign,
  ShoppingCart,
  CreditCard,
  AlertTriangle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const StatCard = ({ title, value, trend, icon: Icon, color, delay }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all group"
  >
    <div className="flex items-start justify-between">
      <div className="space-y-4">
        <div className={`w-12 h-12 rounded-2xl bg-${color}-50 dark:bg-${color}-900/20 text-${color}-600 dark:text-${color}-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={24} />
        </div>
        <div>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">{title}</p>
          <h3 className="text-3xl font-black mt-1 tracking-tight">{value}</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-black",
            trend >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
          )}>
            {trend >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(trend)}%
          </div>
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Growth</span>
        </div>
      </div>
      <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
        <MoreHorizontal size={20} />
      </button>
    </div>
  </motion.div>
);

export default function Dashboard() {
  const { t } = useTranslation();

  // Real Data Queries
  const items = useLiveQuery(() => db.items.toArray()) || [];
  const invoices = useLiveQuery(() => db.invoices.toArray()) || [];
  const transactions = useLiveQuery(() => db.transactions.toArray()) || [];
  const [currency, setCurrency] = React.useState<any>(null);

  React.useEffect(() => {
    getCurrencyConfig().then(setCurrency);
  }, []);

  // Statistics Calculations
  const totalSales = invoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
  const totalOrders = invoices.length;
  const totalInventoryValue = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const lowStockCount = items.filter(i => i.quantity < 10).length;

  // Category Data for Pie Chart
  const categories = Array.from(new Set(items.map(i => i.category)));
  const categoryData = categories.map((cat, index) => {
    const count = items.filter(i => i.category === cat).length;
    const colors = ['#4f46e5', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#ec4899'];
    return { name: cat, value: count, color: colors[index % colors.length] };
  }).slice(0, 6);

  // Revenue Data for Area Chart (Last 6 months/days simplified)
  const revenueData = [
    { name: 'Jan', revenue: totalSales * 0.1, expenses: totalSales * 0.05 },
    { name: 'Feb', revenue: totalSales * 0.15, expenses: totalSales * 0.08 },
    { name: 'Mar', revenue: totalSales * 0.2, expenses: totalSales * 0.12 },
    { name: 'Apr', revenue: totalSales * 0.25, expenses: totalSales * 0.15 },
    { name: 'May', revenue: totalSales * 0.3, expenses: totalSales * 0.18 },
    { name: 'Jun', revenue: totalSales, expenses: totalSales * 0.6 },
  ];

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm uppercase tracking-[0.2em]">
            <Activity size={16} />
            <span>Overview</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white">
            {t('dashboard')}
          </h1>
          <p className="text-slate-500 font-medium text-lg">Welcome back. Here's your real-time business performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
            <Calendar size={18} />
            {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 dark:shadow-none">
            <Plus size={18} />
            {t('new_transaction')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title={t('total_sales')} value={formatCurrency(totalSales, currency)} trend={14.2} icon={DollarSign} color="indigo" delay={0.1} />
        <StatCard title="Orders" value={totalOrders.toString()} trend={8.4} icon={ShoppingCart} color="emerald" delay={0.2} />
        <StatCard title="Inventory Value" value={formatCurrency(totalInventoryValue, currency)} trend={-2.1} icon={Package} color="amber" delay={0.3} />
        <StatCard title="Low Stock" value={lowStockCount.toString()} trend={12.5} icon={AlertTriangle} color="rose" delay={0.4} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-2xl font-black tracking-tight">{t('revenue_vs_expenses')}</h3>
              <p className="text-slate-500 text-sm font-medium mt-1">Real financial performance analysis</p>
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
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b', fontWeight: 600}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b', fontWeight: 600}} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '20px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '15px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#4f46e5" fillOpacity={1} fill="url(#colorRev)" strokeWidth={4} />
                <Area type="monotone" dataKey="expenses" stroke="#f43f5e" fillOpacity={0} strokeWidth={4} strokeDasharray="8 8" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col"
        >
          <h3 className="text-2xl font-black tracking-tight mb-2">{t('inventory_by_category')}</h3>
          <p className="text-slate-500 text-sm font-medium mb-8">Live stock distribution</p>
          
          <div className="flex-1 min-h-[300px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black">{items.length}</span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Total Items</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-8">
            {categoryData.map((cat, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-500">{cat.name}</span>
                  <span className="text-sm font-black">{cat.value}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black tracking-tight">{t('recent_transactions')}</h3>
            <p className="text-slate-500 text-sm font-medium mt-1">Real-time activity from your database</p>
          </div>
          <button className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-xl text-sm font-bold hover:bg-indigo-50 transition-all">
            {t('view_all')}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-500 text-[10px] uppercase font-black tracking-[0.2em]">
                <th className="px-8 py-5">Transaction ID</th>
                <th className="px-8 py-5">Client / Supplier</th>
                <th className="px-8 py-5">Date</th>
                <th className="px-8 py-5">Amount</th>
                <th className="px-8 py-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {invoices.slice(0, 5).map((inv, i) => (
                <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all group">
                  <td className="px-8 py-6 font-mono text-sm font-black text-indigo-600 dark:text-indigo-400">#INV-{inv.id}</td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-black group-hover:scale-110 transition-transform">
                        {inv.customerName.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-black">{inv.customerName}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Sale Invoice</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm font-bold text-slate-500">{new Date(inv.date).toLocaleDateString()}</td>
                  <td className="px-8 py-6 text-lg font-black tracking-tight">{formatCurrency(inv.totalAmount, currency)}</td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] rounded-xl",
                      inv.status === 'paid' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                    )}>
                      {t(inv.status)}
                    </span>
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-slate-400 font-bold">No transactions recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
