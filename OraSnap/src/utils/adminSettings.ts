import { supabase } from '@/integrations/supabase/client';

export interface AdminSettings {
  commissionRate: number;
  minBookingAmount: number;
  processingFee: number;
  autoApprovePhotographers: boolean;
  emailVerificationRequired: boolean;
  profileVerificationRequired: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  twoFactorAuth: boolean;
  dataEncryption: boolean;
  autoModerateReviews: boolean;
  imageModeration: boolean;
  profanityFilterLevel: string;
  reviewQueueLimit: number;
  apiRateLimit: number;
  webhookNotifications: boolean;
  thirdPartyIntegrations: boolean;
  analyticsTracking: boolean;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  autoBackup: boolean;
  backupRetention: number;
}

export const defaultSettings: AdminSettings = {
  commissionRate: 5,
  minBookingAmount: 50,
  processingFee: 2.9,
  autoApprovePhotographers: false,
  emailVerificationRequired: true,
  profileVerificationRequired: true,
  emailNotifications: true,
  smsNotifications: false,
  pushNotifications: true,
  sessionTimeout: 30,
  maxLoginAttempts: 5,
  twoFactorAuth: true,
  dataEncryption: true,
  autoModerateReviews: true,
  imageModeration: true,
  profanityFilterLevel: 'strict',
  reviewQueueLimit: 100,
  apiRateLimit: 1000,
  webhookNotifications: true,
  thirdPartyIntegrations: true,
  analyticsTracking: true,
  maintenanceMode: false,
  maintenanceMessage: "We're currently performing maintenance...",
  autoBackup: true,
  backupRetention: 30
};

const SETTINGS_KEY = 'admin_settings';

export const getSettings = (): AdminSettings => {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      return { ...defaultSettings, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
  return defaultSettings;
};

export const updateSettings = (settings: Partial<AdminSettings>): boolean => {
  try {
    const current = getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
};

export const isMaintenanceMode = (): boolean => {
  const settings = getSettings();
  return settings.maintenanceMode;
};

export const getCommissionRate = (): number => {
  const settings = getSettings();
  return settings.commissionRate;
};

export const getMinBookingAmount = (): number => {
  const settings = getSettings();
  return settings.minBookingAmount;
};