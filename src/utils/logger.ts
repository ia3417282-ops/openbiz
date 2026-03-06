import { db } from '../db';

export async function logAction(action: string, details: string, type: 'info' | 'warning' | 'error' | 'success' = 'info') {
  await db.logs.add({
    action,
    details,
    type,
    timestamp: Date.now()
  });
}
