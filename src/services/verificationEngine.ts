import { Medicine, PrescriptionMedicine, VerificationFieldMatch, ExpiryStatus } from '../types';

/**
 * Normalizes text for clinical comparison:
 * Lowercases, removes extra spacing, standardizes common pharmaceutical abbreviations.
 */
export function normalizeMedicineName(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Normalizes clinical strength:
 * e.g., "500mg" -> "500 mg", removes internal spaces.
 */
export function normalizeStrength(strength: string): string {
  if (!strength) return '';
  return strength
    .toLowerCase()
    .replace(/\s+/g, '')
    .trim();
}

/**
 * Normalizes dosage form:
 * e.g. "Tab", "Tablet", "Tablets" -> "tablet"
 * "Cap", "Capsule", "Capsules" -> "capsule"
 */
export function normalizeDosageForm(form: string): string {
  if (!form) return '';
  const cleaned = form.toLowerCase().trim();
  if (cleaned.startsWith('tab')) return 'tablet';
  if (cleaned.startsWith('cap')) return 'capsule';
  if (cleaned.startsWith('syr') || cleaned.includes('liquid') || cleaned.includes('susp')) return 'syrup';
  if (cleaned.startsWith('inj') || cleaned.includes('vial') || cleaned.includes('amp')) return 'injection';
  if (cleaned.startsWith('oint') || cleaned.startsWith('crea')) return 'ointment';
  if (cleaned.startsWith('drop')) return 'drops';
  return cleaned;
}

/**
 * Evaluates pharmaceutical expiration date against the current reference date (Oct 3, 2026).
 * Handles MM/YYYY, MM/YY, DD/MM/YYYY, YYYY-MM, YYYY-MM-DD.
 * Classifies: VALID, EXPIRING_SOON (<= 90 days), EXPIRED, UNKNOWN.
 */
export function classifyExpiryDate(expiryDateStr: string): {
  status: ExpiryStatus;
  label: string;
  formatted: string;
  remainingDays: number | null;
} {
  if (!expiryDateStr) {
    return { status: 'UNKNOWN', label: 'Unknown Expiry', formatted: 'N/A', remainingDays: null };
  }

  const clean = expiryDateStr.trim();
  const refDate = new Date(2026, 9, 3); // Oct 3, 2026
  let expDate: Date | null = null;

  try {
    if (clean.includes('/')) {
      const parts = clean.split('/');
      if (parts.length === 2) {
        const month = parseInt(parts[0], 10);
        let year = parseInt(parts[1], 10);
        if (year < 100) year += 2000;
        expDate = new Date(year, month, 0); // Last day of month
      } else if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        let year = parseInt(parts[2], 10);
        if (year < 100) year += 2000;
        expDate = new Date(year, month - 1, day);
      }
    } else if (clean.includes('-')) {
      const parts = clean.split('-');
      if (parts.length === 2) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        expDate = new Date(year, month, 0);
      } else if (parts.length === 3) {
        expDate = new Date(clean);
      }
    } else {
      expDate = new Date(clean);
    }
  } catch {
    return { status: 'UNKNOWN', label: 'Unparseable Format', formatted: clean, remainingDays: null };
  }

  if (!expDate || isNaN(expDate.getTime())) {
    return { status: 'UNKNOWN', label: 'Unknown', formatted: clean, remainingDays: null };
  }

  const diffTime = expDate.getTime() - refDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { status: 'EXPIRED', label: 'Expired Product', formatted: clean, remainingDays: diffDays };
  } else if (diffDays <= 90) {
    return { status: 'EXPIRING_SOON', label: `Expiring Soon (${diffDays} days)`, formatted: clean, remainingDays: diffDays };
  } else {
    return { status: 'VALID', label: 'Valid Shelf Life', formatted: clean, remainingDays: diffDays };
  }
}

/**
 * Validates expiration date against current reference date.
 */
export function isMedicineExpired(expiryDateStr: string): boolean {
  const result = classifyExpiryDate(expiryDateStr);
  return result.status === 'EXPIRED';
}

/**
 * Deterministic field-by-field verification engine.
 * Compares:
 * 1. MEDICINE NAME
 * 2. STRENGTH
 * 3. DOSAGE FORM
 * 4. EXPIRY DATE
 */
export function comparePrescriptionWithScannedMedicine(
  expected: PrescriptionMedicine,
  scanned: Medicine
): VerificationFieldMatch {
  const normExpectedName = normalizeMedicineName(expected.medicineName);
  const normScannedName = normalizeMedicineName(scanned.medicineName);
  const normScannedGeneric = normalizeMedicineName(scanned.genericName);
  const normScannedBrand = normalizeMedicineName(scanned.brandName);

  const nameMatch = 
    normExpectedName === normScannedName ||
    normExpectedName === normScannedGeneric ||
    normExpectedName === normScannedBrand ||
    normScannedName.includes(normExpectedName) ||
    normExpectedName.includes(normScannedName);

  const normExpectedStrength = normalizeStrength(expected.strength);
  const normScannedStrength = normalizeStrength(scanned.strength);
  const strengthMatch = normExpectedStrength === normScannedStrength;

  const normExpectedForm = normalizeDosageForm(expected.dosageForm);
  const normScannedForm = normalizeDosageForm(scanned.dosageForm);
  const dosageFormMatch = normExpectedForm === normScannedForm;

  const expired = isMedicineExpired(scanned.expiryDate);
  const expiryValid = !expired;

  const allMatch = Boolean(nameMatch && strengthMatch && dosageFormMatch && expiryValid);

  return {
    name: nameMatch,
    strength: strengthMatch,
    dosageForm: dosageFormMatch,
    expiryValid,
    allMatch,
  };
}

/**
 * Default Hospital Formulary Database V3
 * Complete with structured Composition, Manufacturer, Batch, Expiry, Storage, and Packaging
 */
export const HOSPITAL_FORMULARY: Medicine[] = [
  {
    id: 'med-001',
    barcode: '8901112223334',
    genericName: 'Paracetamol',
    brandName: 'Calpol / Crocin 500',
    medicineName: 'Paracetamol',
    strength: '500 mg',
    dosageForm: 'Tablet',
    route: 'Oral',
    manufacturer: 'GSK Healthcare Ltd',
    manufacturingSite: 'Nashik Plant - Unit II, MH',
    licenseNumber: 'MH/DRUG/28A-9941',
    packSize: '10x10 Tablets Blister',
    status: 'ACTIVE',
    description: 'Analgesic and antipyretic for mild to moderate pain and fever.',
    activeIngredients: 'Paracetamol IP 500 mg',
    excipients: 'Maize Starch, Povidone K30, Magnesium Stearate, Talc',
    batchNumber: 'CAL-2608B',
    mfgDate: '01/2026',
    expiryDate: '12/2028',
    storageTemp: 'Store below 25°C',
    storageCondition: 'Protect from direct sunlight and moisture',
    mrp: '₹34.50 / strip',
    sources: {
      expiry: 'Package 2D barcode scan',
      manufacturer: 'Formulary directory verified',
      composition: 'National pharmacopeia specification',
    },
    createdDate: '2026-01-10T08:00:00Z',
    updatedDate: '2026-09-15T12:00:00Z',
  },
  {
    id: 'med-002',
    barcode: '8901112223335', // TEST CASE 2: WRONG STRENGTH
    genericName: 'Paracetamol',
    brandName: 'Dolo 650',
    medicineName: 'Paracetamol',
    strength: '650 mg',
    dosageForm: 'Tablet',
    route: 'Oral',
    manufacturer: 'Micro Labs Ltd',
    manufacturingSite: 'Peenya Industrial Area, Bengaluru, KA',
    licenseNumber: 'KA/DRUG/14B-4412',
    packSize: '15 Tablets Strip',
    status: 'ACTIVE',
    description: 'High strength antipyretic / analgesic tablet.',
    activeIngredients: 'Paracetamol IP 650 mg',
    excipients: 'Microcrystalline Cellulose, Croscarmellose Sodium, Colloidal Silicon Dioxide',
    batchNumber: 'DLO-2611A',
    mfgDate: '02/2026',
    expiryDate: '01/2029',
    storageTemp: 'Store below 30°C',
    storageCondition: 'Store in dry place',
    mrp: '₹38.20 / strip',
    sources: {
      expiry: 'Package 2D barcode scan',
      manufacturer: 'Formulary directory verified',
      composition: 'National pharmacopeia specification',
    },
    createdDate: '2026-01-10T08:00:00Z',
    updatedDate: '2026-09-15T12:00:00Z',
  },
  {
    id: 'med-003',
    barcode: '8901112223336', // TEST CASE 3: WRONG DOSAGE FORM
    genericName: 'Paracetamol',
    brandName: 'Panadol Rapid',
    medicineName: 'Paracetamol',
    strength: '500 mg',
    dosageForm: 'Capsule',
    route: 'Oral',
    manufacturer: 'Haleon Consumer Health',
    manufacturingSite: 'Baddi Industrial Estate, Solan, HP',
    licenseNumber: 'HP/DRUG/08A-7731',
    packSize: '24 Capsules Box',
    status: 'ACTIVE',
    description: 'Rapid absorption gelatin capsule formulation.',
    activeIngredients: 'Paracetamol IP 500 mg (Solubilized format)',
    excipients: 'Hard Gelatin Shell, Titanium Dioxide, Purified Water',
    batchNumber: 'PAN-2604C',
    mfgDate: '03/2026',
    expiryDate: '02/2028',
    storageTemp: 'Store below 25°C',
    storageCondition: 'Keep container tightly closed',
    mrp: '₹75.00 / box',
    sources: {
      expiry: 'Package scan',
      manufacturer: 'Formulary directory verified',
      composition: 'Manufacturer package insert',
    },
    createdDate: '2026-01-10T08:00:00Z',
    updatedDate: '2026-09-15T12:00:00Z',
  },
  {
    id: 'med-004',
    barcode: '8902223334441', // TEST CASE 4: WRONG MEDICINE
    genericName: 'Amoxicillin Trihydrate',
    brandName: 'Mox 500 / Novamox',
    medicineName: 'Amoxicillin',
    strength: '500 mg',
    dosageForm: 'Capsule',
    route: 'Oral',
    manufacturer: 'Sun Pharma Industries Ltd',
    manufacturingSite: 'Halol Plant, Gujarat',
    licenseNumber: 'GJ/DRUG/25B-1290',
    packSize: '10 Capsules Strip',
    status: 'ACTIVE',
    description: 'Beta-lactam broad spectrum antibiotic for bacterial infections.',
    activeIngredients: 'Amoxicillin Trihydrate IP eq. to Amoxicillin anhydrous 500 mg',
    excipients: 'Magnesium Stearate, Sodium Lauryl Sulfate, Gelatin capsule shell',
    batchNumber: 'MOX-2609X',
    mfgDate: '04/2026',
    expiryDate: '03/2028',
    storageTemp: 'Store below 25°C',
    storageCondition: 'Protect from moisture and heat',
    mrp: '₹88.40 / strip',
    sources: {
      expiry: 'Package 2D barcode scan',
      manufacturer: 'Formulary directory verified',
      composition: 'National pharmacopeia specification',
    },
    createdDate: '2026-01-12T09:00:00Z',
    updatedDate: '2026-09-20T10:00:00Z',
  },
  {
    id: 'med-005',
    barcode: '8903334445551',
    genericName: 'Pantoprazole Sodium',
    brandName: 'Pan 40 / Pantocid',
    medicineName: 'Pantoprazole',
    strength: '40 mg',
    dosageForm: 'Tablet',
    route: 'Oral',
    manufacturer: 'Alkem Laboratories Ltd',
    manufacturingSite: 'Daman Facility - Unit I',
    licenseNumber: 'DD/DRUG/33A-5510',
    packSize: '15 Enteric-Coated Tablets',
    status: 'ACTIVE',
    description: 'Proton pump inhibitor (PPI) for gastric hyperacidity and GERD.',
    activeIngredients: 'Pantoprazole Sodium Sesquihydrate IP eq. to Pantoprazole 40 mg',
    excipients: 'Enteric Polymer Coating, Mannitol, Calcium Stearate',
    batchNumber: 'PAN-2601K',
    mfgDate: '01/2026',
    expiryDate: '12/2027',
    storageTemp: 'Store below 25°C',
    storageCondition: 'Protect from moisture',
    mrp: '₹142.00 / strip',
    sources: {
      expiry: 'Package 2D barcode scan',
      manufacturer: 'Formulary directory verified',
      composition: 'National pharmacopeia specification',
    },
    createdDate: '2026-01-15T09:30:00Z',
    updatedDate: '2026-09-22T14:00:00Z',
  },
  {
    id: 'med-006',
    barcode: '8904445556661',
    genericName: 'Cetirizine Dihydrochloride',
    brandName: 'Zyrtec / Cetzine',
    medicineName: 'Cetirizine',
    strength: '10 mg',
    dosageForm: 'Tablet',
    route: 'Oral',
    manufacturer: 'Dr. Reddy Laboratories',
    manufacturingSite: 'Bachupally, Hyderabad, TS',
    licenseNumber: 'TS/DRUG/18B-8821',
    packSize: '10 Film-Coated Tablets',
    status: 'ACTIVE',
    description: 'Second-generation non-sedating H1-antihistamine.',
    activeIngredients: 'Cetirizine Dihydrochloride IP 10 mg',
    excipients: 'Lactose Monohydrate, Hypromellose, Titanium Dioxide',
    batchNumber: 'CET-2607E',
    mfgDate: '02/2026',
    expiryDate: '01/2028',
    storageTemp: 'Store below 30°C',
    storageCondition: 'Protect from light',
    mrp: '₹22.50 / strip',
    sources: {
      expiry: 'Package scan',
      manufacturer: 'Formulary directory verified',
      composition: 'National pharmacopeia specification',
    },
    createdDate: '2026-02-01T10:00:00Z',
    updatedDate: '2026-09-22T14:00:00Z',
  },
  {
    id: 'med-007',
    barcode: '8905556667771',
    genericName: 'Ibuprofen',
    brandName: 'Brufen / Advil',
    medicineName: 'Ibuprofen',
    strength: '400 mg',
    dosageForm: 'Tablet',
    route: 'Oral',
    manufacturer: 'Abbott Healthcare Pvt Ltd',
    manufacturingSite: 'Baddi Plant, Solan, HP',
    licenseNumber: 'HP/DRUG/21A-3329',
    packSize: '15 Tablets Strip',
    status: 'ACTIVE',
    description: 'Non-steroidal anti-inflammatory drug (NSAID).',
    activeIngredients: 'Ibuprofen IP 400 mg',
    excipients: 'Microcrystalline Cellulose, Croscarmellose, Opaglos',
    batchNumber: 'BRU-2603H',
    mfgDate: '03/2026',
    expiryDate: '02/2029',
    storageTemp: 'Store below 25°C',
    storageCondition: 'Store in airtight container',
    mrp: '₹31.10 / strip',
    sources: {
      expiry: 'Package scan',
      manufacturer: 'Formulary directory verified',
      composition: 'National pharmacopeia specification',
    },
    createdDate: '2026-02-05T11:00:00Z',
    updatedDate: '2026-09-25T11:00:00Z',
  },
  {
    id: 'med-008',
    barcode: '8906667778881',
    genericName: 'Metformin Hydrochloride',
    brandName: 'Glucophage / Glycomet',
    medicineName: 'Metformin',
    strength: '500 mg',
    dosageForm: 'Tablet',
    route: 'Oral',
    manufacturer: 'USV Private Ltd',
    manufacturingSite: 'Daman Unit - II',
    licenseNumber: 'DD/DRUG/12B-6601',
    packSize: '20 Extended-Release Tablets',
    status: 'ACTIVE',
    description: 'Biguanide oral hypoglycemic agent for glycemic control.',
    activeIngredients: 'Metformin Hydrochloride IP 500 mg',
    excipients: 'Sodium Carboxymethylcellulose, Hydroxypropyl Methylcellulose',
    batchNumber: 'MET-2610A',
    mfgDate: '04/2026',
    expiryDate: '03/2028',
    storageTemp: 'Store below 25°C',
    storageCondition: 'Keep away from humidity',
    mrp: '₹46.00 / strip',
    sources: {
      expiry: 'Package scan',
      manufacturer: 'Formulary directory verified',
      composition: 'National pharmacopeia specification',
    },
    createdDate: '2026-02-10T12:00:00Z',
    updatedDate: '2026-09-28T16:00:00Z',
  },
  {
    id: 'med-009',
    barcode: '8907778889991',
    genericName: 'Atorvastatin Calcium',
    brandName: 'Lipitor / Atorva',
    medicineName: 'Atorvastatin',
    strength: '20 mg',
    dosageForm: 'Tablet',
    route: 'Oral',
    manufacturer: 'Zydus Cadila',
    manufacturingSite: 'Moraiya, Ahmedabad, GJ',
    licenseNumber: 'GJ/DRUG/09B-1140',
    packSize: '10 Film-Coated Tablets',
    status: 'ACTIVE',
    description: 'Statin lipid-lowering agent for cardiovascular risk reduction.',
    activeIngredients: 'Atorvastatin Calcium Trihydrate IP eq. to Atorvastatin 20 mg',
    excipients: 'Calcium Carbonate, Lactose, Candelilla Wax',
    batchNumber: 'ATV-2605P',
    mfgDate: '05/2026',
    expiryDate: '04/2028',
    storageTemp: 'Store below 25°C',
    storageCondition: 'Protect from moisture',
    mrp: '₹125.00 / strip',
    sources: {
      expiry: 'Package scan',
      manufacturer: 'Formulary directory verified',
      composition: 'National pharmacopeia specification',
    },
    createdDate: '2026-02-15T12:00:00Z',
    updatedDate: '2026-09-28T16:00:00Z',
  },
  {
    id: 'med-010',
    barcode: '8908889990001',
    genericName: 'Azithromycin',
    brandName: 'Zithromax / Azithral',
    medicineName: 'Azithromycin',
    strength: '500 mg',
    dosageForm: 'Tablet',
    route: 'Oral',
    manufacturer: 'Alembic Pharmaceuticals Ltd',
    manufacturingSite: 'Panelav, Vadodara, GJ',
    licenseNumber: 'GJ/DRUG/17A-4432',
    packSize: '3 Tablets Blister',
    status: 'ACTIVE',
    description: 'Macrolide antibiotic for acute respiratory infections.',
    activeIngredients: 'Azithromycin Dihydrate IP eq. to Azithromycin 500 mg',
    excipients: 'Anhydrous Calcium Phosphate, Pregelatinized Starch',
    batchNumber: 'AZI-2602M',
    mfgDate: '02/2026',
    expiryDate: '01/2028',
    storageTemp: 'Store below 30°C',
    storageCondition: 'Store in original container',
    mrp: '₹71.50 / pack',
    sources: {
      expiry: 'Package scan',
      manufacturer: 'Formulary directory verified',
      composition: 'National pharmacopeia specification',
    },
    createdDate: '2026-03-01T12:00:00Z',
    updatedDate: '2026-09-29T11:00:00Z',
  }
];

export function findMedicineByBarcode(barcode: string): Medicine | undefined {
  if (!barcode) return undefined;
  const cleaned = barcode.trim();
  return HOSPITAL_FORMULARY.find(
    (m) => m.barcode === cleaned || m.id === cleaned
  );
}

export function searchFormulary(query: string): Medicine[] {
  if (!query) return HOSPITAL_FORMULARY;
  const q = query.toLowerCase().trim();
  return HOSPITAL_FORMULARY.filter(
    (m) =>
      m.medicineName.toLowerCase().includes(q) ||
      m.genericName.toLowerCase().includes(q) ||
      m.brandName.toLowerCase().includes(q) ||
      m.barcode.includes(q) ||
      m.manufacturer.toLowerCase().includes(q) ||
      m.strength.toLowerCase().includes(q)
  );
}
