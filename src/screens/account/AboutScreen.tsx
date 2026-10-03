import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

export const AboutScreen: React.FC = () => {
  return (
    <div className="flex-1 bg-slate-100 p-4 overflow-y-auto space-y-4">
      <div>
        <h1 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
          About SMART-MED SAFE V3
        </h1>
        <p className="text-[11px] text-slate-500">
          Hospital pharmacy dispensing verification system
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-sm p-5 shadow-2xs space-y-4 text-xs text-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-emerald-600 text-white rounded-xs flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="font-bold text-sm text-slate-900">SMART-MED SAFE</div>
            <div className="text-[11px] text-slate-500 font-mono">Version 3.0.4-PROD (Build 2026.10)</div>
          </div>
        </div>

        <p className="leading-relaxed text-slate-600">
          SMART-MED SAFE is a professional mobile-assisted clinical verification platform designed for hospital pharmacies. It enforces deterministic, field-by-field secondary safety checks on prescription medication orders prior to packaging and ward dispatch.
        </p>

        <div className="border-t border-slate-100 pt-3 space-y-2 text-[11px]">
          <div className="flex justify-between">
            <span className="text-slate-500">Architecture:</span>
            <span className="font-mono text-slate-800">React 19 / Express / TypeScript</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Verification Engine:</span>
            <span className="font-mono text-slate-800">Deterministic Triple-Field Validator</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Hardware Integration:</span>
            <span className="font-mono text-slate-800">ESP32 Dual-Color LED & Buzzer</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Hospital Organization:</span>
            <span className="font-medium text-slate-800">ABC Pharmacy - Central Hospital</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PrivacyScreen: React.FC = () => {
  return (
    <div className="flex-1 bg-slate-100 p-4 overflow-y-auto space-y-4">
      <div>
        <h1 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
          Healthcare Data Privacy
        </h1>
        <p className="text-[11px] text-slate-500">
          Information governance and patient confidentiality standards
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-2xs space-y-3 text-xs text-slate-700 leading-relaxed">
        <h2 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
          1. Data Minimization Principles
        </h2>
        <p>
          SMART-MED SAFE strictly minimizes patient personal identifiers. Prescriptions utilize ward and bed references (e.g. PT-88219 Bed 302-B) without storing personal demographic or financial records.
        </p>

        <h2 className="font-bold text-slate-900 text-xs uppercase tracking-wide pt-2 border-t border-slate-100">
          2. Access Logs & Security
        </h2>
        <p>
          All medication scans, pharmacist reviews, supervisor overrides, and terminal sessions are captured in an immutable compliance ledger with authenticated staff IDs and timestamps.
        </p>

        <h2 className="font-bold text-slate-900 text-xs uppercase tracking-wide pt-2 border-t border-slate-100">
          3. Prototype & Test Environment Notice
        </h2>
        <p className="bg-slate-50 p-2.5 rounded-xs border border-slate-200 text-slate-600 text-[11px]">
          <strong>Notice:</strong> Demonstration records provided within this evaluation build utilize fictional patient identifiers and standard clinical formulary records for testing and safety validation.
        </p>
      </div>
    </div>
  );
};

export const TermsScreen: React.FC = () => {
  return (
    <div className="flex-1 bg-slate-100 p-4 overflow-y-auto space-y-4">
      <div>
        <h1 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
          Terms of Use & Clinical Notice
        </h1>
        <p className="text-[11px] text-slate-500">
          Operational conditions for pharmacy verification software
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-2xs space-y-3 text-xs text-slate-700 leading-relaxed">
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-xs text-amber-900 text-[11px]">
          <strong>Clinical Verification Mandate: </strong>
          SMART-MED SAFE functions as an additional secondary verification safety tool. It does not replace the professional clinical judgment of licensed pharmacists.
        </div>

        <h2 className="font-bold text-slate-900 text-xs uppercase tracking-wide pt-2">
          1. Pharmacist Responsibility
        </h2>
        <p>
          Extracted OCR prescription data is unconfirmed until manually checked and confirmed by a licensed pharmacist. Physical package labels and expiry dates must be inspected alongside barcode verification.
        </p>

        <h2 className="font-bold text-slate-900 text-xs uppercase tracking-wide pt-2 border-t border-slate-100">
          2. Controlled Overrides
        </h2>
        <p>
          Overrides may only be authorized by credentialed pharmacy supervisors (PharmD) with signed justification on file.
        </p>
      </div>
    </div>
  );
};
