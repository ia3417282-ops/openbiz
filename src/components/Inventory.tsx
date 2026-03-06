import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Item } from '../db';
import { getCurrencyConfig, formatCurrency } from '../utils/currency';
import { logAction } from '../utils/logger';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Edit2, 
  Package, 
  QrCode, 
  X as XIcon,
  MoreVertical,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Scanner from './Scanner';
import { motion, AnimatePresence } from 'framer-motion';

export default function Inventory() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [currency, setCurrency] = useState<any>(null);

  React.useEffect(() => {
    getCurrencyConfig().then(setCurrency);
  }, []);

  const [newItem, setNewItem] = useState<Partial<Item>>({
    name: '',
    category: '',
    quantity: 0,
    price: 0,
    sku: ''
  });

  const items = useLiveQuery(
    () => db.items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase())
    ).toArray(),
    [searchTerm]
  );

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    await db.items.add({
      ...newItem as Item,
      createdAt: Date.now()
    });
    logAction('Item Added', `Added new item: ${newItem.name} (SKU: ${newItem.sku})`, 'success');
    setIsAdding(false);
    setNewItem({ name: '', category: '', quantity: 0, price: 0, sku: '' });
  };

  const handleScan = (sku: string) => {
    setSearchTerm(sku);
  };

  const deleteItem = async (id: number) => {
    const item = await db.items.get(id);
    if (confirm('Are you sure you want to delete this item?')) {
      await db.items.delete(id);
      logAction('Item Deleted', `Deleted item: ${item?.name} (SKU: ${item?.sku})`, 'warning');
    }
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(items || []);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventory");
    XLSX.writeFile(wb, "inventory.xlsx");
  };

  const lowStockItems = items?.filter(i => i.quantity < 10) || [];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight">{t('inventory')}</h1>
          <p className="text-slate-500 mt-1 font-medium">Manage your products, stock levels and warehouse operations.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={exportToExcel}
            className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
          >
            <Download size={20} />
          </button>
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
          >
            <Plus size={18} />
            {t('add_item')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
              <Package size={24} />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+4.5%</span>
          </div>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Total Items</p>
          <h3 className="text-3xl font-black mt-1">{items?.length || 0}</h3>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400">
              <AlertTriangle size={24} />
            </div>
            {lowStockItems.length > 0 && (
              <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-full">Action Required</span>
            )}
          </div>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Low Stock</p>
          <h3 className="text-3xl font-black mt-1">{lowStockItems.length}</h3>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
              <TrendingUp size={24} />
            </div>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">Healthy</span>
          </div>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Inventory Value</p>
          <h3 className="text-3xl font-black mt-1">
            {formatCurrency(items?.reduce((acc, item) => acc + (item.price * item.quantity), 0) || 0, currency)}
          </h3>
        </motion.div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder={t('search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-5 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
            <Filter size={18} />
            Filter
          </button>
          <button 
            onClick={() => setIsScanning(true)}
            className="flex items-center gap-2 px-5 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
          >
            <QrCode size={18} />
            Scan
          </button>
        </div>
      </div>

      {isScanning && <Scanner onScan={handleScan} onClose={() => setIsScanning(false)} />}

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <div className="p-8 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <h2 className="text-2xl font-black tracking-tight">{t('add_item')}</h2>
                <button onClick={() => setIsAdding(false)} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                  <XIcon size={24} />
                </button>
              </div>
              <form onSubmit={handleAddItem} className="p-8 space-y-6">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Item Name</label>
                  <input 
                    required
                    type="text" 
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 font-bold"
                    value={newItem.name}
                    onChange={e => setNewItem({...newItem, name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Category</label>
                    <input 
                      required
                      type="text" 
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 font-bold"
                      value={newItem.category}
                      onChange={e => setNewItem({...newItem, category: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">SKU</label>
                    <input 
                      required
                      type="text" 
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 font-bold"
                      value={newItem.sku}
                      onChange={e => setNewItem({...newItem, sku: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Quantity</label>
                    <input 
                      required
                      type="number" 
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 font-bold"
                      value={newItem.quantity}
                      onChange={e => setNewItem({...newItem, quantity: Number(e.target.value)})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Price</label>
                    <input 
                      required
                      type="number" 
                      step="0.01"
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 font-bold"
                      value={newItem.price}
                      onChange={e => setNewItem({...newItem, price: Number(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="pt-6 flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 dark:shadow-none"
                  >
                    Save Item
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-500 text-[10px] uppercase font-black tracking-[0.2em]">
                <th className="px-8 py-5">SKU</th>
                <th className="px-8 py-5">Name</th>
                <th className="px-8 py-5">Category</th>
                <th className="px-8 py-5">Stock</th>
                <th className="px-8 py-5">Price</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {items?.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all group">
                  <td className="px-8 py-6 font-mono text-sm font-black text-indigo-600 dark:text-indigo-400">{item.sku}</td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-black group-hover:scale-110 transition-transform">
                        {item.name.charAt(0)}
                      </div>
                      <span className="text-sm font-black">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase tracking-wider rounded-full">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] rounded-xl",
                      item.quantity < 10 
                        ? "bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400" 
                        : "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                    )}>
                      {item.quantity} units
                    </span>
                  </td>
                  <td className="px-8 py-6 text-lg font-black tracking-tight">{formatCurrency(item.price, currency)}</td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => deleteItem(item.id!)}
                        className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {items?.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center max-w-xs mx-auto">
                      <div className="w-20 h-20 rounded-[2rem] bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6">
                        <Package className="text-slate-200" size={40} />
                      </div>
                      <h4 className="text-xl font-black mb-2">No items found</h4>
                      <p className="text-slate-500 text-sm font-medium">Start by adding your first product to the inventory.</p>
                      <button 
                        onClick={() => setIsAdding(true)}
                        className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all"
                      >
                        Add First Item
                      </button>
                    </div>
                  </td>
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
