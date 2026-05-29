export const QUEUE_OCR = 'process-ocr';
export const QUEUE_EMAIL = 'process-email';
export const QUEUE_RECONCILE = 'reconcile-trip';
export const QUEUE_ALERT = 'send-alert';

export interface OcrJobData {
  tripId: string;     // DB id of the Trip record
  companyId: string;
  blobPath: string;   // Azure Blob path — e.g. "screenshots/{companyId}/{uuid}.jpg"
                      // The processor uses MSI to generate a SAS URL for Document Intelligence
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
