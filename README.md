# SMART-MED SAFE

**Mobile-Assisted Medication Verification Application for Hospital Pharmacy Dispensing Safety**

---

## 1. Product Overview

**SMART-MED SAFE** is a mobile-assisted medication verification application designed to help hospital pharmacy staff perform a deterministic, field-by-field verification step before dispensing medicines.

The core mission of SMART-MED SAFE is to catch dispensing errors (wrong drug, wrong strength, wrong dosage form) before packages reach hospital wards or patients, eliminating human error during high-workload dispensing shifts.

---

## 2. Clinical Workflow

```
Prescription Order (Paper / EHR)
        ↓
Scan / Upload (Camera or File Import)
        ↓
OCR / Structured Extraction
        ↓
Pharmacist Review & Line Item Edit
        ↓
Pharmacist Confirmation (Mandatory Safety Gate)
        ↓
Active Prescription Verification List
        ↓
Select Medicine Line Item
        ↓
Barcode / QR Scanning (Pack 1D / 2D DataMatrix)
        ↓
Hospital Formulary Lookup
        ↓
Deterministic Field-by-Field Verification Engine
        ↓
[VERIFIED]  ──→  Next Medicine / Complete Dispense
    OR
[MISMATCH]  ──→  Dispensing Halted ──→ [Rescan / Correct Pack]
                                 └──→ [Supervisor Clinical Override]
        ↓
Immutable Compliance Audit Log & Verification History
```

---

## 3. Core Safety Architecture

### A. Deterministic Verification Engine (No AI Guesswork)
While OCR extracts text from prescription slips, **all verification decisions are strictly deterministic**:
- **Field 1:** Medicine Name (Generic & Brand matching)
- **Field 2:** Clinical Strength (e.g., 500 mg vs 650 mg)
- **Field 3:** Dosage Form (e.g., Tablet vs Capsule vs Syrup)

All 3 critical fields must match exactly. If any single field differs, the system halts dispensing with a hard `MISMATCH`.

### B. Verification Blocking
A mismatch **CANNOT** be marked as verified or bypassed with an "Ignore" button. The system enforces:
1. Physical rescan of the correct formulary pack, **OR**
2. Authorized supervisor credentials (PIN/Password) with mandatory clinical justification recorded permanently in the audit trail.

---

## 4. User Roles & Authorization

1. **PHARMACIST (RPh):**
   - Create prescription from scan or upload.
   - Review unconfirmed OCR extraction.
   - Edit extracted line items.
   - Confirm prescription to create active verification list.
   - Perform physical barcode scans.
   - View verification history.

2. **SUPERVISOR (PharmD):**
   - All Pharmacist capabilities.
   - Authorize controlled clinical overrides on mismatched scans with PIN/password authentication.
   - Review audit logs and formulary modifications.

3. **ADMIN:**
   - Manage formulary database.
   - Review system security logs and terminal session policies.
   - User account and role administration.

---

## 5. Built-in Critical Test Cases (Ready for Hackathon Demo)

The application provides instant evaluation buttons in the scanner interface:

| Test Case | Prescription Item | Scanned Item Barcode | Expected Result |
| :--- | :--- | :--- | :--- |
| **TEST 1: Correct Match** | Paracetamol 500 mg Tab | `8901112223334` (Paracetamol 500 mg Tab) | **`✓ VERIFIED`** (ESP32 Green Signal) |
| **TEST 2: Wrong Strength** | Paracetamol 500 mg Tab | `8901112223335` (Paracetamol 650 mg Tab) | **`✕ MISMATCH`** (ESP32 Red + Buzzer) |
| **TEST 3: Wrong Dosage Form** | Paracetamol 500 mg Tab | `8901112223336` (Paracetamol 500 mg Cap) | **`✕ MISMATCH`** (Dosage form mismatch) |
| **TEST 4: Wrong Medicine** | Paracetamol 500 mg Tab | `8902223334441` (Amoxicillin 500 mg Cap) | **`✕ MISMATCH`** (Name mismatch) |
| **TEST 5: Multi-Medicine Rx** | Rx #10025 (5 line items) | Sequential scanning of all items | **Completion screen appears ONLY when all 5 are verified** |

---

## 6. Physical Hardware Integration (ESP32)

SMART-MED SAFE connects to an optional physical ESP32 terminal module:
- **Verified Scan:** Triggers green LED confirmation strobe and clinical tone.
- **Mismatch:** Triggers red LED warning strobe and alert buzzer.
- **Fault-Tolerant:** If the physical module disconnects, the mobile application continues functioning smoothly, clearly displaying connection status in the app bar.

---

## 7. Security & Compliance Features

- **No Plaintext Passwords:** Controlled credential authentication.
- **Station Inactivity Timeout:** Terminal auto-locks after inactivity to protect patient records.
- **Immutable Audit Trail:** Logs logins, logouts, prescription confirmations, scan failures, and supervisor overrides.
- **Protected API Endpoints:** Role-based checks on backend operations.

---

## 8. Technology Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide Icons, Web Audio API.
- **Backend:** Node.js, Express, TypeScript (`tsx server.ts`).
- **AI / OCR Support:** `@google/genai` (Gemini 2.5 Flash server-side proxy) for clinical handwriting extraction.
- **Storage:** Hospital Formulary In-Memory DB with persistent audit ledger.

---

## 9. Known Limitations

- Real Bluetooth Web API requires HTTPS / Web Bluetooth supported hardware for direct serial pairing; simulated network socket endpoint is provided out of the box.
- Camera access in iframe environments depends on browser camera permissions (`requestFramePermissions: ["camera"]`). Optical simulation reticle and test barcode triggers are provided for instant evaluation without external barcodes.
