import Dexie, { type Table } from 'dexie';

export interface Item {
  id?: number;
  name: string;
  category: string;
  quantity: number;
  price: number;
  sku: string;
  createdAt: number;
}

export interface Transaction {
  id?: number;
  type: 'sale' | 'purchase' | 'return' | 'scrap';
  itemId: number;
  quantity: number;
  totalPrice: number;
  date: number;
  description?: string;
}

export interface Invoice {
  id?: number;
  customerName: string;
  date: number;
  items: { itemId: number; quantity: number; price: number }[];
  totalAmount: number;
  status: 'paid' | 'pending' | 'cancelled';
}

export interface Shipment {
  id?: number;
  trackingNumber: string;
  origin: string;
  destination: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'delayed';
  type: 'sea' | 'air' | 'land';
  estimatedDelivery: number;
}

export interface Setting {
  id?: string;
  value: any;
}

export interface Log {
  id?: number;
  action: string;
  details: string;
  timestamp: number;
  type: 'info' | 'warning' | 'error' | 'success';
}

export class MyDatabase extends Dexie {
  items!: Table<Item>;
  transactions!: Table<Transaction>;
  invoices!: Table<Invoice>;
  shipments!: Table<Shipment>;
  settings!: Table<Setting>;
  logs!: Table<Log>;

  constructor() {
    super('OpenBizDB');
    this.version(4).stores({
      items: '++id, name, category, sku',
      transactions: '++id, type, itemId, date',
      invoices: '++id, customerName, date, status',
      shipments: '++id, trackingNumber, status',
      settings: 'id',
      logs: '++id, type, timestamp'
    });
  }
}

export const db = new MyDatabase();
