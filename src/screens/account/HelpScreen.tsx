import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, ShieldCheck, QrCode, AlertTriangle } from 'lucide-react';

export const HelpScreen: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const FAQS = [
    {
      q: 'How does the field-by-field verification engine work?',
      a: 'SMART-MED SAFE compares three mandatory clinical fields: Medicine Name (generic and commercial brand matching), Strength (e.g., 500 mg vs 650 mg), and Dosage Form (Tablet vs Capsule vs Syrup). In V3, batch expiration dates are also evaluated against the current date.',
    },
    {
      q: 'What should I do when a "MEDICINE MISMATCH" occurs?',
      a: 'Dispensing is immediately halted. Do not dispense the item. Check the red highlighted discrepancy, retrieve the correct medication pack from the dispensary shelf, and tap [Scan Again]. If a doctor-signed clinical amendment or approved generic substitution is required, request a Supervisor Override.',
    },
    {
      q: 'What does "Information Unavailable" or "Review Required" mean?',
      a: 'If OCR extraction cannot determine a field with certainty, it marks it as "Review Required" without guessing. The pharmacist must manually review and confirm or edit the line item before it becomes an active prescription.',
    },
    {
      q: 'How does Supervisor Clinical Override work?',
      a: 'Overrides cannot be bypassed with a simple ignore button. A pharmacy supervisor (PharmD) must authenticate with their staff credentials/PIN and supply a clinical reason (e.g. formulary generic substitution or physician verbal amendment). The override is permanently recorded in the audit trail.',
    },
    {
      q: 'What does the ESP32 status indicator show?',
      a: 'The ESP32 module provides physical bedside/counter strobe alerts: a green LED strobe indicates a successful verified match, and a red LED strobe accompanied by an audible buzzer indicates a safety mismatch.',
    },
  ];

  return (
    <div className="flex-1 bg-slate-100 p-4 overflow-y-auto space-y-4">
      <div>
        <h1 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
          Help & Operational Guidance
        </h1>
        <p className="text-[11px] text-slate-500">
          Standard operating procedures for medication safety verification
        </p>
      </div>

      <div className="space-y-2.5">
        {FAQS.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={i}
              className="bg-white border border-slate-200 rounded-sm shadow-2xs overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
              >
                <span className="text-xs font-bold text-slate-900 pr-2">{faq.q}</span>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>
              {isOpen && (
                <div className="px-3.5 pb-3.5 pt-1 text-xs text-slate-600 border-t border-slate-100 leading-relaxed bg-slate-50/50">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Support Box */}
      <div className="bg-white border border-slate-200 rounded-sm p-4 text-xs text-slate-600 space-y-1 shadow-2xs">
        <div className="font-bold text-slate-800 text-xs">Hospital Clinical Informatics Support</div>
        <p className="text-[11px] text-slate-500">
          For technical discrepancies, barcode registry additions, or system administration:
        </p>
        <div className="text-[11px] font-mono text-slate-800 pt-1">
          Internal Extension: 4099 · Email: support@abcpharmacy.org
        </div>
      </div>
    </div>
  );
};
