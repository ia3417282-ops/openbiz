import { db } from '../db';

export const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar', country: 'United States' },
  { code: 'EGP', symbol: 'ج.م', name: 'Egyptian Pound', country: 'Egypt' },
  { code: 'SAR', symbol: 'ر.س', name: 'Saudi Riyal', country: 'Saudi Arabia' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', country: 'United Arab Emirates' },
  { code: 'EUR', symbol: '€', name: 'Euro', country: 'European Union' },
  { code: 'GBP', symbol: '£', name: 'British Pound', country: 'United Kingdom' },
  { code: 'KWD', symbol: 'د.ك', name: 'Kuwaiti Dinar', country: 'Kuwait' },
  { code: 'QAR', symbol: 'ر.ق', name: 'Qatari Riyal', country: 'Qatar' },
];

export async function getCurrencyConfig() {
  const setting = await db.settings.get('currency');
  return setting?.value || currencies[0];
}

export function formatCurrency(amount: number, config: any) {
  if (!config) return `$${amount.toLocaleString()}`;
  
  if (config.code === 'EGP' || config.code === 'SAR' || config.code === 'AED' || config.code === 'KWD' || config.code === 'QAR') {
    return `${amount.toLocaleString()} ${config.symbol}`;
  }
  
  return `${config.symbol}${amount.toLocaleString()}`;
}
