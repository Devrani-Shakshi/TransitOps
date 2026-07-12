export interface Notification {
  id: string;
  type: 'LICENSE_EXPIRY' | 'INSURANCE_EXPIRY' | 'MAINTENANCE_DUE' | 'OVERLOAD_ATTEMPT' | 'ANOMALOUS_FUEL' | 'ANOMALOUS_EXPENSE' | 'IDLE_VEHICLE' | 'SYSTEM';
  message: string;
  isRead: boolean;
  createdAt: string;
}
