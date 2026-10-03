export type UserRole = 'PHARMACIST' | 'SUPERVISOR' | 'ADMIN';
export type ThemeMode = 'light' | 'dark' | 'system';
export type ExpiryStatus = 'VALID' | 'EXPIRING_SOON' | 'EXPIRED' | 'UNKNOWN';

export interface MedicineBatch {
  id: string;
  medicineId: string;
  batchNumber: string;
  mfgDate: string;
  expiryDate: string;
  status: ExpiryStatus;
  packSize: string;
  storageRequirement?: string;
  provenance: {
    expirySource: string;
    batchSource: string;
    manufacturerSource: string;
  };
}

export interface User {
  id: string;
  organizationId: string;
  staffId: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'ACTIVE' | 'SUSPENDED';
  department: string;
  avatarUrl?: string; // Optional custom photo; falls back to initials
  initials: string;
  title?: string;
  phone?: string;
  lastLogin?: string;
}

export interface ActiveSession {
  id: string;
  device: string;
  platform: 'Android' | 'Web' | 'Terminal';
  browser?: string;
  ipAddress: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'OVERRIDE_REQUEST' | 'VERIFICATION_COMPLETE' | 'REVIEW_REQUIRED' | 'SECURITY' | 'SYSTEM';
  timestamp: string;
  isRead: boolean;
  targetRole?: UserRole;
  relatedId?: string;
}

export interface Medicine {
  id: string;
  barcode: string; // Barcode / GTIN
  genericName: string;
  brandName: string;
  medicineName: string; // standard display name
  strength: string;
  dosageForm: string; // Tablet, Capsule, Syrup, Injection, etc.
  route: string; // Oral, IV, Topical, etc.
  manufacturer: string;
  manufacturingSite?: string;
  licenseNumber?: string;
  packSize: string;
  status: 'ACTIVE' | 'RESTRICTED' | 'DISCONTINUED';
  description?: string;
  activeIngredients: string;
  excipients?: string;
  batchNumber: string;
  mfgDate: string;
  expiryDate: string;
  storageTemp: string;
  storageCondition: string;
  mrp: string;
  batches?: MedicineBatch[];
  sources?: {
    expiry?: string;
    manufacturer?: string;
    composition?: string;
  };
  createdDate: string;
  updatedDate: string;
}

export type MedicineVerificationStatus = 'PENDING' | 'VERIFIED' | 'MISMATCH' | 'OVERRIDDEN';

export interface PrescriptionMedicine {
  id: string;
  prescriptionId: string;
  medicineName: string;
  strength: string;
  dosageForm: string;
  dose: string;
  frequency: string;
  route: string;
  duration: string;
  quantity: number;
  confirmationStatus: MedicineVerificationStatus;
  originalOcrName?: string;
  originalOcrStrength?: string;
  manualCorrectionNote?: string;
  correctedBy?: string;
  correctedAt?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  scannedMedicineId?: string;
  scannedBarcode?: string;
  overrideReason?: string;
  overrideSupervisorId?: string;
  overrideSupervisorName?: string;
}

export type PrescriptionStatus = 
  | 'DRAFT_OCR'
  | 'PENDING_REVIEW'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'ARCHIVED';

export interface Prescription {
  id: string;
  prescriptionNumber: string; // e.g. #1025
  hospitalId: string;
  patientRef: string; // e.g. PT-88219 (Bed 302-B)
  prescriberName: string;
  prescriberRegNo: string;
  prescriptionDate: string;
  medicines: PrescriptionMedicine[];
  status: PrescriptionStatus;
  sourceType: 'CAMERA_SCAN' | 'FILE_UPLOAD' | 'MANUAL_ENTRY';
  originalImageUrl?: string;
  ocrConfidence?: number;
  createdAt: string;
  createdBy: string; // staff ID
  confirmedAt?: string;
  confirmedBy?: string;
  completedAt?: string;
}

export interface VerificationFieldMatch {
  name: boolean;
  strength: boolean;
  dosageForm: boolean;
  expiryValid: boolean;
  allMatch: boolean;
}

export interface VerificationRecord {
  id: string;
  prescriptionId: string;
  prescriptionNumber: string;
  prescriptionMedicineId: string;
  expectedMedicineName: string;
  expectedStrength: string;
  expectedDosageForm: string;
  scannedBarcode: string;
  scannedMedicineName: string;
  scannedStrength: string;
  scannedDosageForm: string;
  scannedManufacturer?: string;
  scannedBatchNumber?: string;
  scannedExpiryDate?: string;
  matchResult: VerificationFieldMatch;
  status: 'VERIFIED' | 'MISMATCH' | 'OVERRIDDEN';
  rescanCount: number;
  isRescannedAfterMismatch: boolean;
  overrideDetails?: {
    supervisorStaffId: string;
    supervisorName: string;
    reason: string;
    authorizedAt: string;
  };
  staffId: string;
  staffName: string;
  timestamp: string;
}

export interface OverrideRequest {
  id: string;
  prescriptionId: string;
  prescriptionNumber: string;
  medicineId: string;
  medicineName: string;
  expectedStrength: string;
  expectedForm: string;
  scannedMedicineName: string;
  scannedStrength: string;
  scannedForm: string;
  pharmacistId: string;
  pharmacistName: string;
  pharmacistNote: string;
  requestedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedBy?: string;
  reviewedByName?: string;
  supervisorDecisionReason?: string;
  reviewedAt?: string;
}

export interface TeamMemberStats {
  staffId: string;
  name: string;
  role: UserRole;
  department: string;
  todayVerifications: number;
  mismatchesDetected: number;
  status: 'ACTIVE' | 'ON_BREAK' | 'OFFLINE';
  lastActiveTime: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  staffId: string;
  staffName: string;
  role: UserRole;
  action: 
    | 'LOGIN'
    | 'LOGOUT'
    | 'SESSION_TIMEOUT'
    | 'PRESCRIPTION_CREATED'
    | 'PRESCRIPTION_EDITED'
    | 'PRESCRIPTION_CONFIRMED'
    | 'MEDICINE_SCANNED'
    | 'VERIFICATION_PASSED'
    | 'VERIFICATION_FAILED'
    | 'RESCAN_ATTEMPT'
    | 'OVERRIDE_REQUESTED'
    | 'OVERRIDE_AUTHORIZED'
    | 'OVERRIDE_REJECTED'
    | 'MEDICINE_DATABASE_ACCESSED'
    | 'MEDICINE_DATABASE_MODIFIED'
    | 'USER_ROLE_CHANGED'
    | 'USER_STATUS_CHANGED'
    | 'SETTINGS_UPDATED';
  entityType: 'PRESCRIPTION' | 'MEDICINE' | 'VERIFICATION' | 'USER' | 'SYSTEM' | 'SECURITY';
  entityId: string;
  details: string;
}

export interface ESP32HardwareState {
  connected: boolean;
  ipAddress: string;
  port: number;
  signalMode: 'IDLE' | 'VERIFIED_GREEN' | 'MISMATCH_RED_BUZZER';
  lastPing: string;
  rssi?: number;
}
