import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  UserRole,
  ThemeMode,
  Prescription,
  PrescriptionMedicine,
  Medicine,
  VerificationRecord,
  AuditLogEntry,
  ActiveSession,
  NotificationItem,
  OverrideRequest,
  TeamMemberStats,
  ESP32HardwareState,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_PRESCRIPTIONS,
  INITIAL_VERIFICATION_HISTORY,
  INITIAL_AUDIT_LOGS,
  INITIAL_ACTIVE_SESSIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_OVERRIDE_REQUESTS,
  INITIAL_TEAM_MEMBERS,
} from '../services/mockData';
import {
  HOSPITAL_FORMULARY,
  comparePrescriptionWithScannedMedicine,
  findMedicineByBarcode,
} from '../services/verificationEngine';
import { clinicalAudio } from '../services/audioFeedback';

export type PharmacistTab = 'home' | 'prescriptions' | 'history' | 'account';
export type SupervisorTab = 'overview' | 'verifications' | 'requests' | 'team' | 'account';
export type AdminTab = 'dashboard' | 'users' | 'medicines' | 'audit' | 'account';

export type DeepScreen =
  | 'prescription-detail'
  | 'new-prescription'
  | 'scan-prescription'
  | 'upload-prescription'
  | 'ocr-processing'
  | 'review-prescription'
  | 'edit-medicine'
  | 'verify-medicine'
  | 'barcode-scanner'
  | 'comparison'
  | 'verified'
  | 'mismatch'
  | 'verification-complete'
  | 'medicine-detail'
  | 'account-profile'
  | 'account-security'
  | 'account-sessions'
  | 'account-preferences'
  | 'account-notifications'
  | 'account-help'
  | 'account-privacy'
  | 'account-terms'
  | 'account-about'
  | 'admin-user-detail';

interface VerificationResultState {
  status: 'VERIFIED' | 'MISMATCH' | 'OVERRIDDEN';
  found: boolean;
  expected: {
    medicineName: string;
    strength: string;
    dosageForm: string;
  };
  scanned: Medicine | null;
  scannedBarcode: string;
  matchResult: {
    name: boolean;
    strength: boolean;
    dosageForm: boolean;
    expiryValid: boolean;
    allMatch: boolean;
  };
  allPrescriptionCompleted: boolean;
}

interface AppContextValue {
  currentUser: User | null;
  token: string | null;
  allUsers: User[];
  
  // Navigation State
  pharmacistTab: PharmacistTab;
  supervisorTab: SupervisorTab;
  adminTab: AdminTab;
  currentDeepScreen: DeepScreen | null;
  deepScreenReturnTab: string | null;

  // Domain Data
  prescriptions: Prescription[];
  activePrescription: Prescription | null;
  selectedPrescriptionMedicine: PrescriptionMedicine | null;
  editingMedicine: PrescriptionMedicine | null;
  lastVerificationResult: VerificationResultState | null;
  formulary: Medicine[];
  selectedMedicineForDetail: Medicine | null;
  selectedUserForDetail: User | null;
  verificationHistory: VerificationRecord[];
  auditLogs: AuditLogEntry[];
  sessions: ActiveSession[];
  notifications: NotificationItem[];
  overrideRequests: OverrideRequest[];
  teamMembers: TeamMemberStats[];
  esp32Status: ESP32HardwareState;

  // Preferences & Security
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  isOnline: boolean;
  canPerformAction: (action: string) => boolean;
  isSessionLocked: boolean;
  inactivityTimerMinutes: number;
  soundEnabled: boolean;
  hapticEnabled: boolean;
  reducedMotion: boolean;

  // Navigation Methods
  setPharmacistTab: (tab: PharmacistTab) => void;
  setSupervisorTab: (tab: SupervisorTab) => void;
  setAdminTab: (tab: AdminTab) => void;
  navigateToDeepScreen: (screen: DeepScreen) => void;
  navigateBackFromDeepScreen: () => void;
  switchRole: (role: UserRole) => void;

  // Auth & Profile Methods
  login: (orgId: string, staffId: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  lockSession: () => void;
  unlockSession: (pass: string) => boolean;
  updateUserProfile: (updates: Partial<User>) => void;
  updateProfilePhoto: (photoDataUrl: string) => void;
  removeProfilePhoto: () => void;

  // Domain Actions
  setActivePrescription: (rx: Prescription | null) => void;
  createDraftPrescription: (data: any) => Prescription;
  updatePrescriptionMedicine: (prescriptionId: string, medicineId: string, updates: Partial<PrescriptionMedicine>) => void;
  confirmPrescription: (prescriptionId: string) => void;
  startVerifyingMedicine: (medicine: PrescriptionMedicine) => void;
  setEditingMedicine: (medicine: PrescriptionMedicine | null) => void;
  setSelectedMedicineForDetail: (medicine: Medicine | null) => void;
  setSelectedUserForDetail: (user: User | null) => void;
  executeScanVerification: (barcode: string) => Promise<VerificationResultState>;
  authorizeSupervisorOverride: (supervisorStaffId: string, passwordOrPin: string, reason: string) => Promise<{ success: boolean; message?: string }>;
  rescanCurrentMedicine: () => void;
  
  // Supervisor Actions
  approveOverrideRequest: (requestId: string, supervisorReason: string) => void;
  rejectOverrideRequest: (requestId: string, supervisorReason: string) => void;

  // Admin Actions
  updateUserRole: (userId: string, newRole: UserRole) => void;
  toggleUserStatus: (userId: string) => void;

  // Session & Notification Actions
  terminateSession: (sessionId: string) => void;
  terminateAllOtherSessions: () => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // Settings & Audit
  toggleESP32: (connected?: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setHapticEnabled: (enabled: boolean) => void;
  setReducedMotion: (enabled: boolean) => void;
  setInactivityTimerMinutes: (min: number) => void;
  addAuditRecord: (action: AuditLogEntry['action'], entityType: AuditLogEntry['entityType'], entityId: string, details: string) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Current logged in user defaults to Sagar Patel (Pharmacist)
  const [currentUser, setCurrentUser] = useState<User | null>(INITIAL_USERS[0]);
  const [token, setToken] = useState<string | null>('token-sagar-patel-1025');
  const [allUsers, setAllUsers] = useState<User[]>(INITIAL_USERS);

  // Persistent Tab Navigation State per Role
  const [pharmacistTab, setPharmacistTabState] = useState<PharmacistTab>('home');
  const [supervisorTab, setSupervisorTabState] = useState<SupervisorTab>('overview');
  const [adminTab, setAdminTabState] = useState<AdminTab>('dashboard');

  // Secondary Deep Screen Stack (null means on a primary tab)
  const [currentDeepScreen, setCurrentDeepScreen] = useState<DeepScreen | null>(null);
  const [deepScreenReturnTab, setDeepScreenReturnTab] = useState<string | null>(null);

  // Domain Collections
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(INITIAL_PRESCRIPTIONS);
  const [activePrescription, setActivePrescriptionState] = useState<Prescription | null>(INITIAL_PRESCRIPTIONS[0]);
  const [selectedPrescriptionMedicine, setSelectedPrescriptionMedicine] = useState<PrescriptionMedicine | null>(null);
  const [editingMedicine, setEditingMedicine] = useState<PrescriptionMedicine | null>(null);
  const [lastVerificationResult, setLastVerificationResult] = useState<VerificationResultState | null>(null);
  const [formulary, setFormulary] = useState<Medicine[]>(HOSPITAL_FORMULARY);
  const [selectedMedicineForDetail, setSelectedMedicineForDetail] = useState<Medicine | null>(null);
  const [selectedUserForDetail, setSelectedUserForDetail] = useState<User | null>(null);
  const [verificationHistory, setVerificationHistory] = useState<VerificationRecord[]>(INITIAL_VERIFICATION_HISTORY);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [sessions, setSessions] = useState<ActiveSession[]>(INITIAL_ACTIVE_SESSIONS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [overrideRequests, setOverrideRequests] = useState<OverrideRequest[]>(INITIAL_OVERRIDE_REQUESTS);
  const [teamMembers, setTeamMembers] = useState<TeamMemberStats[]>(INITIAL_TEAM_MEMBERS);

  // Security & Preferences
  const [theme, setThemeState] = useState<ThemeMode>('light');
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [isSessionLocked, setIsSessionLocked] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [inactivityTimerMinutes, setInactivityTimerMinutes] = useState(5);

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    if (typeof document !== 'undefined') {
      const isDark =
        mode === 'dark' ||
        (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      document.documentElement.classList.toggle('dark', isDark);
    }
  };

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const canPerformAction = (action: string): boolean => {
    if (!currentUser) return false;
    const role = currentUser.role;
    switch (action) {
      case 'scan_prescription':
      case 'scan_medicine':
      case 'verify_medicine':
      case 'view_own_history':
        return true;
      case 'request_override':
        return role === 'PHARMACIST';
      case 'approve_override':
      case 'view_team_history':
        return role === 'SUPERVISOR' || role === 'ADMIN';
      case 'manage_users':
      case 'manage_medicines':
      case 'system_settings':
        return role === 'ADMIN';
      case 'view_audit_logs':
        return true;
      default:
        return false;
    }
  };
  const [esp32Status, setEsp32Status] = useState<ESP32HardwareState>({
    connected: true,
    ipAddress: '192.168.1.142',
    port: 8080,
    signalMode: 'IDLE',
    lastPing: new Date().toISOString(),
    rssi: -58,
  });

  // Navigation Handlers: Switching root tabs retains tab view and clears deep screen
  const setPharmacistTab = (tab: PharmacistTab) => {
    setPharmacistTabState(tab);
    setCurrentDeepScreen(null);
  };

  const setSupervisorTab = (tab: SupervisorTab) => {
    setSupervisorTabState(tab);
    setCurrentDeepScreen(null);
  };

  const setAdminTab = (tab: AdminTab) => {
    setAdminTabState(tab);
    setCurrentDeepScreen(null);
  };

  const navigateToDeepScreen = (screen: DeepScreen) => {
    setCurrentDeepScreen(screen);
  };

  const navigateBackFromDeepScreen = () => {
    // Hierarchical back resolution
    if (currentDeepScreen === 'edit-medicine') {
      setCurrentDeepScreen('review-prescription');
    } else if (currentDeepScreen === 'ocr-processing') {
      setCurrentDeepScreen('review-prescription');
    } else if (currentDeepScreen === 'comparison') {
      setCurrentDeepScreen('barcode-scanner');
    } else if (currentDeepScreen === 'verified' || currentDeepScreen === 'mismatch') {
      setCurrentDeepScreen('comparison');
    } else if (currentDeepScreen === 'barcode-scanner') {
      setCurrentDeepScreen('verify-medicine');
    } else if (currentDeepScreen === 'verify-medicine') {
      setCurrentDeepScreen('prescription-detail');
    } else {
      // Clears back to active root tab
      setCurrentDeepScreen(null);
    }
  };

  const switchRole = (role: UserRole) => {
    const targetUser = allUsers.find((u) => u.role === role) || allUsers[0];
    setCurrentUser(targetUser);
    setCurrentDeepScreen(null);
    if (role === 'PHARMACIST') setPharmacistTabState('home');
    if (role === 'SUPERVISOR') setSupervisorTabState('overview');
    if (role === 'ADMIN') setAdminTabState('dashboard');
  };

  const addAuditRecord = (
    action: AuditLogEntry['action'],
    entityType: AuditLogEntry['entityType'],
    entityId: string,
    details: string
  ) => {
    const entry: AuditLogEntry = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      staffId: currentUser?.staffId || 'SYSTEM',
      staffName: currentUser?.name || 'System Staff',
      role: currentUser?.role || 'PHARMACIST',
      action,
      entityType,
      entityId,
      details,
    };
    setAuditLogs((prev) => [entry, ...prev]);
  };

  const login = async (orgId: string, staffId: string, pass: string) => {
    const matched = allUsers.find(
      (u) =>
        u.organizationId.toLowerCase().includes(orgId.toLowerCase().trim()) &&
        (u.staffId.toLowerCase() === staffId.toLowerCase().trim() ||
          u.email.toLowerCase() === staffId.toLowerCase().trim())
    );

    const validPass =
      (matched?.staffId === 'PH-1025' && (pass === 'pharmacist123' || pass === 'sagar123')) ||
      (matched?.staffId === 'SUP-108' && (pass === 'supervisor123' || pass === '8899')) ||
      (matched?.staffId === 'ADM-001' && pass === 'admin123') ||
      pass === 'admin123' ||
      pass === 'pharmacy2026';

    if (matched && validPass) {
      setCurrentUser(matched);
      setToken(`token-${matched.id}-${Date.now()}`);
      setIsSessionLocked(false);
      setCurrentDeepScreen(null);

      if (matched.role === 'PHARMACIST') setPharmacistTabState('home');
      if (matched.role === 'SUPERVISOR') setSupervisorTabState('overview');
      if (matched.role === 'ADMIN') setAdminTabState('dashboard');

      addAuditRecord('LOGIN', 'SECURITY', matched.staffId, `Staff member ${matched.name} authenticated into terminal (${matched.role}).`);
      return { success: true };
    }

    return {
      success: false,
      message: 'Invalid credentials. Please verify Organization ID, Staff ID, and Password.',
    };
  };

  const logout = () => {
    if (currentUser) {
      addAuditRecord('LOGOUT', 'SECURITY', currentUser.staffId, `Staff member ${currentUser.name} logged out.`);
    }
    setCurrentUser(null);
    setToken(null);
    setIsSessionLocked(false);
  };

  const lockSession = () => {
    setIsSessionLocked(true);
    if (currentUser) {
      addAuditRecord('SESSION_TIMEOUT', 'SECURITY', currentUser.staffId, `Terminal session locked due to inactivity policy (${inactivityTimerMinutes} min).`);
    }
  };

  const unlockSession = (pass: string) => {
    if (!currentUser) return false;
    const valid =
      (currentUser.staffId === 'PH-1025' && (pass === 'pharmacist123' || pass === 'sagar123')) ||
      (currentUser.staffId === 'SUP-108' && (pass === 'supervisor123' || pass === '8899')) ||
      (currentUser.staffId === 'ADM-001' && pass === 'admin123') ||
      pass === 'admin123' ||
      pass === 'pharmacy2026';

    if (valid) {
      setIsSessionLocked(false);
      return true;
    }
    return false;
  };

  const updateUserProfile = (updates: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates };
    setCurrentUser(updated);
    setAllUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    addAuditRecord('SETTINGS_UPDATED', 'USER', updated.staffId, `User profile updated for ${updated.name}.`);
  };

  const updateProfilePhoto = (photoDataUrl: string) => {
    if (!currentUser) return;
    updateUserProfile({ avatarUrl: photoDataUrl });
  };

  const removeProfilePhoto = () => {
    if (!currentUser) return;
    const updated = { ...currentUser };
    delete updated.avatarUrl;
    setCurrentUser(updated);
    setAllUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    addAuditRecord('SETTINGS_UPDATED', 'USER', updated.staffId, `Profile photo removed. Restored initials avatar (${updated.initials}).`);
  };

  const setActivePrescription = (rx: Prescription | null) => {
    setActivePrescriptionState(rx);
    if (rx) {
      const firstPending = rx.medicines.find((m) => m.confirmationStatus === 'PENDING');
      setSelectedPrescriptionMedicine(firstPending || rx.medicines[0] || null);
    }
  };

  const createDraftPrescription = (data: any) => {
    const newRx: Prescription = {
      id: `rx-${Date.now()}`,
      prescriptionNumber: data.prescriptionNumber || `${Math.floor(1000 + Math.random() * 9000)}`,
      hospitalId: currentUser?.organizationId || 'ABC Pharmacy - Central Hospital',
      patientRef: data.patientRef || 'PT-WARD-INP',
      prescriberName: data.prescriberName || 'Attending Physician, MD',
      prescriberRegNo: 'MD-55421',
      prescriptionDate: new Date().toISOString().split('T')[0],
      status: 'PENDING_REVIEW',
      sourceType: data.sourceType || 'CAMERA_SCAN',
      originalImageUrl: data.originalImageUrl || data.imageUrl,
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.staffId || 'PH-1025',
      medicines: (data.medicines || []).map((m: any, idx: number) => ({
        id: `pm-${Date.now()}-${idx}`,
        prescriptionId: `rx-${Date.now()}`,
        medicineName: m.medicineName,
        strength: m.strength,
        dosageForm: m.dosageForm,
        dose: m.dose || '1 unit',
        frequency: m.frequency || 'TID',
        route: m.route || 'Oral',
        duration: m.duration || '3 days',
        quantity: m.quantity || 1,
        confirmationStatus: 'PENDING',
      })),
    };

    setPrescriptions((prev) => [newRx, ...prev]);
    setActivePrescriptionState(newRx);

    addAuditRecord('PRESCRIPTION_CREATED', 'PRESCRIPTION', newRx.id, `Prescription #${newRx.prescriptionNumber} created with ${newRx.medicines.length} unconfirmed line items.`);
    return newRx;
  };

  const updatePrescriptionMedicine = (
    prescriptionId: string,
    medicineId: string,
    updates: Partial<PrescriptionMedicine>
  ) => {
    setPrescriptions((prev) =>
      prev.map((rx) => {
        if (rx.id !== prescriptionId) return rx;
        return {
          ...rx,
          medicines: rx.medicines.map((m) => (m.id === medicineId ? { ...m, ...updates } : m)),
        };
      })
    );

    if (activePrescription && activePrescription.id === prescriptionId) {
      setActivePrescriptionState((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          medicines: prev.medicines.map((m) => (m.id === medicineId ? { ...m, ...updates } : m)),
        };
      });
    }

    addAuditRecord('PRESCRIPTION_EDITED', 'PRESCRIPTION', prescriptionId, `Pharmacist modified medication details for line item ${medicineId}.`);
  };

  const confirmPrescription = (prescriptionId: string) => {
    setPrescriptions((prev) =>
      prev.map((rx) => {
        if (rx.id !== prescriptionId) return rx;
        return {
          ...rx,
          status: 'ACTIVE',
          confirmedAt: new Date().toISOString(),
          confirmedBy: currentUser?.staffId || 'PH-1025',
        };
      })
    );

    if (activePrescription && activePrescription.id === prescriptionId) {
      const updated = {
        ...activePrescription,
        status: 'ACTIVE' as const,
        confirmedAt: new Date().toISOString(),
        confirmedBy: currentUser?.staffId || 'PH-1025',
      };
      setActivePrescriptionState(updated);
      const firstPending = updated.medicines.find((m) => m.confirmationStatus === 'PENDING');
      setSelectedPrescriptionMedicine(firstPending || updated.medicines[0]);
    }

    addAuditRecord('PRESCRIPTION_CONFIRMED', 'PRESCRIPTION', prescriptionId, `Pharmacist ${currentUser?.name} verified OCR extraction and confirmed active prescription.`);
  };

  const startVerifyingMedicine = (medicine: PrescriptionMedicine) => {
    setSelectedPrescriptionMedicine(medicine);
    navigateToDeepScreen('verify-medicine');
  };

  const rescanCurrentMedicine = () => {
    if (selectedPrescriptionMedicine) {
      addAuditRecord('RESCAN_ATTEMPT', 'VERIFICATION', selectedPrescriptionMedicine.id, `Pharmacist initiated rescan on ${selectedPrescriptionMedicine.medicineName}.`);
    }
    navigateToDeepScreen('barcode-scanner');
  };

  const executeScanVerification = async (barcode: string): Promise<VerificationResultState> => {
    if (!selectedPrescriptionMedicine || !activePrescription) {
      throw new Error('No active prescription or medicine selected.');
    }

    const cleanedBarcode = barcode.trim();
    const scannedMed = findMedicineByBarcode(cleanedBarcode) || null;

    if (!scannedMed) {
      setEsp32Status((prev) => ({ ...prev, signalMode: 'MISMATCH_RED_BUZZER', lastPing: new Date().toISOString() }));
      if (soundEnabled) clinicalAudio.playMismatchAlert();

      const result: VerificationResultState = {
        status: 'MISMATCH',
        found: false,
        expected: {
          medicineName: selectedPrescriptionMedicine.medicineName,
          strength: selectedPrescriptionMedicine.strength,
          dosageForm: selectedPrescriptionMedicine.dosageForm,
        },
        scanned: null,
        scannedBarcode: cleanedBarcode,
        matchResult: {
          name: false,
          strength: false,
          dosageForm: false,
          expiryValid: false,
          allMatch: false,
        },
        allPrescriptionCompleted: false,
      };

      setLastVerificationResult(result);
      addAuditRecord('VERIFICATION_FAILED', 'VERIFICATION', selectedPrescriptionMedicine.id, `Barcode ${cleanedBarcode} not registered in formulary.`);
      return result;
    }

    const match = comparePrescriptionWithScannedMedicine(selectedPrescriptionMedicine, scannedMed);

    if (match.allMatch) {
      setEsp32Status((prev) => ({ ...prev, signalMode: 'VERIFIED_GREEN', lastPing: new Date().toISOString() }));
      if (soundEnabled) clinicalAudio.playVerifiedChime();
    } else {
      setEsp32Status((prev) => ({ ...prev, signalMode: 'MISMATCH_RED_BUZZER', lastPing: new Date().toISOString() }));
      if (soundEnabled) clinicalAudio.playMismatchAlert();
    }

    const newStatus = match.allMatch ? 'VERIFIED' : 'MISMATCH';

    const updatedMed: PrescriptionMedicine = {
      ...selectedPrescriptionMedicine,
      confirmationStatus: newStatus,
      verifiedAt: match.allMatch ? new Date().toISOString() : undefined,
      verifiedBy: match.allMatch ? `${currentUser?.name} (${currentUser?.staffId})` : undefined,
      scannedMedicineId: scannedMed.id,
      scannedBarcode: scannedMed.barcode,
    };

    setSelectedPrescriptionMedicine(updatedMed);

    let allCompleted = false;
    setPrescriptions((prev) =>
      prev.map((rx) => {
        if (rx.id !== activePrescription.id) return rx;
        const newMedicines = rx.medicines.map((m) => (m.id === updatedMed.id ? updatedMed : m));
        allCompleted = newMedicines.every((m) => m.confirmationStatus === 'VERIFIED' || m.confirmationStatus === 'OVERRIDDEN');
        return {
          ...rx,
          status: allCompleted ? 'COMPLETED' : rx.status,
          completedAt: allCompleted ? new Date().toISOString() : rx.completedAt,
          medicines: newMedicines,
        };
      })
    );

    setActivePrescriptionState((prev) => {
      if (!prev) return null;
      const newMedicines = prev.medicines.map((m) => (m.id === updatedMed.id ? updatedMed : m));
      const completed = newMedicines.every((m) => m.confirmationStatus === 'VERIFIED' || m.confirmationStatus === 'OVERRIDDEN');
      return {
        ...prev,
        status: completed ? 'COMPLETED' : prev.status,
        completedAt: completed ? new Date().toISOString() : prev.completedAt,
        medicines: newMedicines,
      };
    });

    // Record verification history
    const historyEntry: VerificationRecord = {
      id: `vr-${Date.now()}`,
      prescriptionId: activePrescription.id,
      prescriptionNumber: activePrescription.prescriptionNumber,
      prescriptionMedicineId: selectedPrescriptionMedicine.id,
      expectedMedicineName: selectedPrescriptionMedicine.medicineName,
      expectedStrength: selectedPrescriptionMedicine.strength,
      expectedDosageForm: selectedPrescriptionMedicine.dosageForm,
      scannedBarcode: scannedMed.barcode,
      scannedMedicineName: scannedMed.medicineName,
      scannedStrength: scannedMed.strength,
      scannedDosageForm: scannedMed.dosageForm,
      scannedManufacturer: scannedMed.manufacturer,
      scannedBatchNumber: scannedMed.batchNumber,
      scannedExpiryDate: scannedMed.expiryDate,
      matchResult: match,
      status: match.allMatch ? 'VERIFIED' : 'MISMATCH',
      rescanCount: 0,
      isRescannedAfterMismatch: false,
      staffId: currentUser?.staffId || 'PH-1025',
      staffName: currentUser?.name || 'Sagar Patel',
      timestamp: new Date().toISOString(),
    };

    setVerificationHistory((prev) => [historyEntry, ...prev]);

    addAuditRecord(
      match.allMatch ? 'VERIFICATION_PASSED' : 'VERIFICATION_FAILED',
      'VERIFICATION',
      selectedPrescriptionMedicine.id,
      match.allMatch
        ? `Field-by-field verification verified: ${selectedPrescriptionMedicine.medicineName} ${selectedPrescriptionMedicine.strength} (${selectedPrescriptionMedicine.dosageForm}) - Batch: ${scannedMed.batchNumber}.`
        : `MISMATCH on ${selectedPrescriptionMedicine.medicineName}: Expected [${selectedPrescriptionMedicine.medicineName} ${selectedPrescriptionMedicine.strength} ${selectedPrescriptionMedicine.dosageForm}] vs Scanned [${scannedMed.medicineName} ${scannedMed.strength} ${scannedMed.dosageForm}].`
    );

    const result: VerificationResultState = {
      status: match.allMatch ? 'VERIFIED' : 'MISMATCH',
      found: true,
      expected: {
        medicineName: selectedPrescriptionMedicine.medicineName,
        strength: selectedPrescriptionMedicine.strength,
        dosageForm: selectedPrescriptionMedicine.dosageForm,
      },
      scanned: scannedMed,
      scannedBarcode: cleanedBarcode,
      matchResult: match,
      allPrescriptionCompleted: allCompleted,
    };

    setLastVerificationResult(result);
    return result;
  };

  const authorizeSupervisorOverride = async (
    supervisorStaffId: string,
    passwordOrPin: string,
    reason: string
  ) => {
    if (!selectedPrescriptionMedicine || !activePrescription) {
      return { success: false, message: 'No active medicine selected.' };
    }

    const supervisor = allUsers.find(
      (u) =>
        (u.role === 'SUPERVISOR' || u.role === 'ADMIN') &&
        u.staffId.toLowerCase() === supervisorStaffId.trim().toLowerCase()
    );

    if (!supervisor) {
      return { success: false, message: 'Supervisor not recognized or unauthorized.' };
    }

    const isValid =
      passwordOrPin === 'supervisor123' ||
      passwordOrPin === '8899' ||
      passwordOrPin === 'admin123';

    if (!isValid) {
      return { success: false, message: 'Invalid supervisor password or PIN.' };
    }

    const updatedMed: PrescriptionMedicine = {
      ...selectedPrescriptionMedicine,
      confirmationStatus: 'OVERRIDDEN',
      overrideReason: reason.trim(),
      overrideSupervisorId: supervisor.staffId,
      overrideSupervisorName: supervisor.name,
      verifiedAt: new Date().toISOString(),
      verifiedBy: `${currentUser?.name} (Authorized by ${supervisor.name})`,
    };

    setSelectedPrescriptionMedicine(updatedMed);

    let allCompleted = false;
    setPrescriptions((prev) =>
      prev.map((rx) => {
        if (rx.id !== activePrescription.id) return rx;
        const newMedicines = rx.medicines.map((m) => (m.id === updatedMed.id ? updatedMed : m));
        allCompleted = newMedicines.every((m) => m.confirmationStatus === 'VERIFIED' || m.confirmationStatus === 'OVERRIDDEN');
        return {
          ...rx,
          status: allCompleted ? 'COMPLETED' : rx.status,
          completedAt: allCompleted ? new Date().toISOString() : rx.completedAt,
          medicines: newMedicines,
        };
      })
    );

    setActivePrescriptionState((prev) => {
      if (!prev) return null;
      const newMedicines = prev.medicines.map((m) => (m.id === updatedMed.id ? updatedMed : m));
      const completed = newMedicines.every((m) => m.confirmationStatus === 'VERIFIED' || m.confirmationStatus === 'OVERRIDDEN');
      return {
        ...prev,
        status: completed ? 'COMPLETED' : prev.status,
        completedAt: completed ? new Date().toISOString() : prev.completedAt,
        medicines: newMedicines,
      };
    });

    addAuditRecord('OVERRIDE_AUTHORIZED', 'VERIFICATION', selectedPrescriptionMedicine.id, `Supervisor ${supervisor.name} authorized clinical override for ${selectedPrescriptionMedicine.medicineName}. Reason: "${reason.trim()}".`);

    if (allCompleted) {
      navigateToDeepScreen('verification-complete');
    } else {
      navigateToDeepScreen('prescription-detail');
    }

    return { success: true };
  };

  const approveOverrideRequest = (requestId: string, supervisorReason: string) => {
    setOverrideRequests((prev) =>
      prev.map((req) =>
        req.id === requestId
          ? {
              ...req,
              status: 'APPROVED',
              reviewedBy: currentUser?.staffId,
              reviewedByName: currentUser?.name,
              supervisorDecisionReason: supervisorReason,
              reviewedAt: new Date().toISOString(),
            }
          : req
      )
    );
    addAuditRecord('OVERRIDE_AUTHORIZED', 'VERIFICATION', requestId, `Supervisor approved override request ${requestId}. Reason: "${supervisorReason}".`);
  };

  const rejectOverrideRequest = (requestId: string, supervisorReason: string) => {
    setOverrideRequests((prev) =>
      prev.map((req) =>
        req.id === requestId
          ? {
              ...req,
              status: 'REJECTED',
              reviewedBy: currentUser?.staffId,
              reviewedByName: currentUser?.name,
              supervisorDecisionReason: supervisorReason,
              reviewedAt: new Date().toISOString(),
            }
          : req
      )
    );
    addAuditRecord('OVERRIDE_REJECTED', 'VERIFICATION', requestId, `Supervisor rejected override request ${requestId}. Reason: "${supervisorReason}".`);
  };

  const updateUserRole = (userId: string, newRole: UserRole) => {
    setAllUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    addAuditRecord('USER_ROLE_CHANGED', 'USER', userId, `Admin changed user role to ${newRole}.`);
  };

  const toggleUserStatus = (userId: string) => {
    setAllUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;
        const newStatus = u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
        addAuditRecord('USER_STATUS_CHANGED', 'USER', userId, `User status updated to ${newStatus}.`);
        return { ...u, status: newStatus };
      })
    );
  };

  const terminateSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    addAuditRecord('LOGOUT', 'SECURITY', sessionId, `User terminated remote session ${sessionId}.`);
  };

  const terminateAllOtherSessions = () => {
    setSessions((prev) => prev.filter((s) => s.isCurrent));
    addAuditRecord('LOGOUT', 'SECURITY', currentUser?.staffId || 'ALL', `User terminated all other active sessions.`);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const toggleESP32 = (connected?: boolean) => {
    setEsp32Status((prev) => {
      const nextConn = typeof connected === 'boolean' ? connected : !prev.connected;
      return {
        ...prev,
        connected: nextConn,
        lastPing: new Date().toISOString(),
      };
    });
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        token,
        allUsers,
        pharmacistTab,
        supervisorTab,
        adminTab,
        currentDeepScreen,
        deepScreenReturnTab,
        prescriptions,
        activePrescription,
        selectedPrescriptionMedicine,
        editingMedicine,
        lastVerificationResult,
        formulary,
        selectedMedicineForDetail,
        selectedUserForDetail,
        verificationHistory,
        auditLogs,
        sessions,
        notifications,
        overrideRequests,
        teamMembers,
        esp32Status,
        isSessionLocked,
        inactivityTimerMinutes,
        soundEnabled,
        hapticEnabled,
        reducedMotion,
        setPharmacistTab,
        setSupervisorTab,
        setAdminTab,
        navigateToDeepScreen,
        navigateBackFromDeepScreen,
        switchRole,
        login,
        logout,
        lockSession,
        unlockSession,
        updateUserProfile,
        updateProfilePhoto,
        removeProfilePhoto,
        setActivePrescription,
        createDraftPrescription,
        updatePrescriptionMedicine,
        confirmPrescription,
        startVerifyingMedicine,
        setEditingMedicine,
        setSelectedMedicineForDetail,
        setSelectedUserForDetail,
        executeScanVerification,
        authorizeSupervisorOverride,
        rescanCurrentMedicine,
        approveOverrideRequest,
        rejectOverrideRequest,
        updateUserRole,
        toggleUserStatus,
        terminateSession,
        terminateAllOtherSessions,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        toggleESP32,
        theme,
        setTheme,
        isOnline,
        canPerformAction,
        setSoundEnabled,
        setHapticEnabled,
        setReducedMotion,
        setInactivityTimerMinutes,
        addAuditRecord,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
