import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { SessionLockModal } from './components/SessionLockModal';
import { LoginScreen } from './screens/LoginScreen';

// Pharmacist Screens
import { HomeScreen } from './screens/HomeScreen';
import { PrescriptionsListScreen } from './screens/pharmacist/PrescriptionsListScreen';
import { ActivePrescriptionScreen } from './screens/ActivePrescriptionScreen';
import { NewPrescriptionScreen } from './screens/NewPrescriptionScreen';
import { ScanPrescriptionScreen } from './screens/ScanPrescriptionScreen';
import { UploadPrescriptionScreen } from './screens/UploadPrescriptionScreen';
import { OcrProcessingScreen } from './screens/OcrProcessingScreen';
import { ReviewPrescriptionScreen } from './screens/ReviewPrescriptionScreen';
import { EditMedicineScreen } from './screens/EditMedicineScreen';
import { VerifyMedicineScreen } from './screens/VerifyMedicineScreen';
import { BarcodeScannerScreen } from './screens/BarcodeScannerScreen';
import { ComparisonScreen } from './screens/ComparisonScreen';
import { VerifiedScreen } from './screens/VerifiedScreen';
import { MismatchScreen } from './screens/MismatchScreen';
import { VerificationCompleteScreen } from './screens/VerificationCompleteScreen';
import { VerificationHistoryScreen } from './screens/VerificationHistoryScreen';
import { MedicineDatabaseScreen } from './screens/MedicineDatabaseScreen';
import { MedicineDetailScreen } from './screens/MedicineDetailScreen';

// Supervisor Screens
import { SupervisorOverviewScreen } from './screens/supervisor/SupervisorOverviewScreen';
import { SupervisorRequestsScreen } from './screens/supervisor/SupervisorRequestsScreen';
import { SupervisorTeamScreen } from './screens/supervisor/SupervisorTeamScreen';

// Admin Screens
import { AdminDashboardScreen } from './screens/admin/AdminDashboardScreen';
import { AdminUsersScreen } from './screens/admin/AdminUsersScreen';
import { AuditLogsScreen } from './screens/AuditLogsScreen';

// Account Screens
import { AccountRootScreen } from './screens/account/AccountRootScreen';
import { ProfileEditScreen } from './screens/account/ProfileEditScreen';
import { SecurityScreen } from './screens/account/SecurityScreen';
import { SessionsScreen } from './screens/account/SessionsScreen';
import { PreferencesScreen } from './screens/account/PreferencesScreen';
import { HelpScreen } from './screens/account/HelpScreen';
import { AboutScreen, PrivacyScreen, TermsScreen } from './screens/account/AboutScreen';

const MainScreenRouter: React.FC = () => {
  const {
    currentUser,
    currentDeepScreen,
    pharmacistTab,
    supervisorTab,
    adminTab,
  } = useApp();

  // If currently navigating a secondary deep screen
  if (currentDeepScreen) {
    switch (currentDeepScreen) {
      case 'prescription-detail':
        return <ActivePrescriptionScreen />;
      case 'new-prescription':
        return <NewPrescriptionScreen />;
      case 'scan-prescription':
        return <ScanPrescriptionScreen />;
      case 'upload-prescription':
        return <UploadPrescriptionScreen />;
      case 'ocr-processing':
        return <OcrProcessingScreen />;
      case 'review-prescription':
        return <ReviewPrescriptionScreen />;
      case 'edit-medicine':
        return <EditMedicineScreen />;
      case 'verify-medicine':
        return <VerifyMedicineScreen />;
      case 'barcode-scanner':
        return <BarcodeScannerScreen />;
      case 'comparison':
        return <ComparisonScreen />;
      case 'verified':
        return <VerifiedScreen />;
      case 'mismatch':
        return <MismatchScreen />;
      case 'verification-complete':
        return <VerificationCompleteScreen />;
      case 'medicine-detail':
        return <MedicineDetailScreen />;
      case 'account-profile':
        return <ProfileEditScreen />;
      case 'account-security':
        return <SecurityScreen />;
      case 'account-sessions':
        return <SessionsScreen />;
      case 'account-preferences':
        return <PreferencesScreen />;
      case 'account-help':
        return <HelpScreen />;
      case 'account-about':
        return <AboutScreen />;
      case 'account-privacy':
        return <PrivacyScreen />;
      case 'account-terms':
        return <TermsScreen />;
      default:
        break;
    }
  }

  // Primary Role Navigation Tabs
  if (currentUser?.role === 'PHARMACIST') {
    switch (pharmacistTab) {
      case 'home':
        return <HomeScreen />;
      case 'prescriptions':
        return <PrescriptionsListScreen />;
      case 'history':
        return <VerificationHistoryScreen />;
      case 'account':
        return <AccountRootScreen />;
      default:
        return <HomeScreen />;
    }
  }

  if (currentUser?.role === 'SUPERVISOR') {
    switch (supervisorTab) {
      case 'overview':
        return <SupervisorOverviewScreen />;
      case 'verifications':
        return <VerificationHistoryScreen />;
      case 'requests':
        return <SupervisorRequestsScreen />;
      case 'team':
        return <SupervisorTeamScreen />;
      case 'account':
        return <AccountRootScreen />;
      default:
        return <SupervisorOverviewScreen />;
    }
  }

  if (currentUser?.role === 'ADMIN') {
    switch (adminTab) {
      case 'dashboard':
        return <AdminDashboardScreen />;
      case 'users':
        return <AdminUsersScreen />;
      case 'medicines':
        return <MedicineDatabaseScreen />;
      case 'audit':
        return <AuditLogsScreen />;
      case 'account':
        return <AccountRootScreen />;
      default:
        return <AdminDashboardScreen />;
    }
  }

  return <HomeScreen />;
};

const AppShell: React.FC = () => {
  const { currentUser, currentDeepScreen } = useApp();

  if (!currentUser) {
    return <LoginScreen />;
  }

  // Hide persistent bottom bar only during full-screen optical camera scanning
  const hideBottomNav =
    currentDeepScreen === 'barcode-scanner' || currentDeepScreen === 'scan-prescription';

  return (
    <div className="min-h-screen bg-slate-900 text-slate-900 flex justify-center items-center p-0 sm:p-4">
      {/* Handheld Terminal Frame */}
      <div className="w-full max-w-md h-screen sm:h-[860px] sm:max-h-[95vh] bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 sm:rounded-md sm:shadow-2xl sm:border sm:border-slate-800 flex flex-col overflow-hidden relative transition-colors">
        <Header />
        <main className="flex-1 flex flex-col overflow-hidden relative">
          <MainScreenRouter />
        </main>
        {!hideBottomNav && <BottomNav />}
        <SessionLockModal />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
