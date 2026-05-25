export const QUEUE_OCR = 'process-ocr';
export const QUEUE_EMAIL = 'process-email';
export const QUEUE_RECONCILE = 'reconcile-trip';
export const QUEUE_ALERT = 'send-alert';

export interface OcrJobData {
  tripId: string;
  companyId: string;
  screenshotUrl: string;
}

export interface ReconcileJobData {
  relayEmailLogId: string;
  companyId: string;
  relayTripId: string;
}

export interface AlertJobData {
  companyId: string;
  tripId: string;
  alertType: 'missing_trip' | 'duplicate_trip' | 'suspicious_activity';
}
