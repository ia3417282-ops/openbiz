import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Truck, 
  Package, 
  Globe, 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Ship, 
  Plane, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  MoreVertical
} from 'lucide-react';
import { motion } from 'framer-motion';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';

export default function Logistics() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  const shipments = useLiveQuery(() => db.shipments.toArray()) || [];

  const activeShipments = shipments.filter(s => s.status === 'in_transit').length;
  const pendingCustoms = shipments.filter(s => s.status === 'pending').length;
  const deliveredToday = shipments.filter(s => s.status === 'delivered').length;
  const delayedCount = shipments.filter(s => s.status === 'delayed').length;

  const stats = [
    { label: 'Active Shipments', value: activeShipments.toString(), icon: Truck, color: 'indigo' },
    { label: 'Pending Customs', value: pendingCustoms.toString(), icon: Globe, color: 'amber' },
    { label: 'Delivered Today', value: deliveredToday.toString(), icon: CheckCircle2, color: 'emerald' },
    { label: 'Delayed', value: delayedCount.toString(), icon: AlertCircle, color: 'rose' },
  ];

  const filteredShipments = shipments.filter(s => 
    s.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.destination.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('import_export')}</h1>
          <p className="text-slate-500 mt-1">Track international shipments, customs, and logistics operations.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none">
          <Plus size={18} />
          New Shipment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 dark:bg-${stat.color}-900/20 text-${stat.color}-600 dark:text-${stat.color}-400 flex items-center justify-center mb-4`}>
              <stat.icon size={24} />
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
                <th className="px-6 py-4 font-bold">Shipment ID</th>
                <th className="px-6 py-4 font-bold">Route</th>
                <th className="px-6 py-4 font-bold">Type</th>
                <th className="px-6 py-4 font-bold">Est. Delivery</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredShipments.map((shp) => (
                <tr key={shp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-5 font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400">{shp.trackingNumber}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">{shp.origin}</span>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase font-bold">
                          <MapPin size={10} />
                          <span>To</span>
                          <span className="text-slate-600 dark:text-slate-300">{shp.destination}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                      {shp.type === 'sea' ? <Ship size={16} /> : <Plane size={16} />}
                      <span className="capitalize">{shp.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                      <Clock size={14} />
                      {new Date(shp.estimatedDelivery).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={cn(
                      "px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full",
                      shp.status === 'delivered' ? "bg-emerald-100 text-emerald-600" :
                      shp.status === 'delayed' ? "bg-rose-100 text-rose-600" :
                      shp.status === 'in_transit' ? "bg-indigo-100 text-indigo-600" : "bg-amber-100 text-amber-600"
                    )}>
                      {shp.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button className="p-2 text-slate-400 hover:text-slate-600 transition-all opacity-0 group-hover:opacity-100">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredShipments.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400 font-bold">No shipments found.</td>
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
