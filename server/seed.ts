import { db } from "./db";
import { patients, medicines, prescriptions, labResults } from "@shared/schema";

const initialPatients = [
  {
    id: '112233445566',
    name: 'Olivia Chen',
    dob: '1988-05-21',
    age: 37,
    doseWeight: '68 kg',
    sex: 'Female',
    mrn: 'Place holder',
    fin: 'Place holder',
    admitted: '2025-08-22',
    codeStatus: 'Full Code',
    isolation: 'None',
    bed: 'LD-102',
    allergies: 'None',
    status: 'Stable',
    provider: 'Place holder',
    notes: 'Place holder',
    department: 'Labor & Delivery',
    chartData: {
      background: 'Place holder',
      summary: 'Place holder',
      discharge: 'Place holder',
      handoff: 'Place holder'
    }
  },
  {
    id: '223344556677',
    name: 'Benjamin Carter',
    dob: '1954-11-10',
    age: 70,
    doseWeight: '85 kg',
    sex: 'Male',
    mrn: 'Place holder',
    fin: 'Place holder',
    admitted: '2025-08-20',
    codeStatus: 'DNR/DNI',
    isolation: 'Contact Precautions (MRSA)',
    bed: 'ICU-205',
    allergies: 'Penicillin',
    status: 'Improving',
    provider: 'Place holder',
    notes: 'Place holder',
    department: 'Medical',
    chartData: {
      background: 'Place holder',
      summary: 'Place holder',
      discharge: 'Place holder',
      handoff: 'Place holder'
    }
  },
  {
    id: '334455667788',
    name: 'Maria Rodriguez',
    dob: '1995-03-15',
    age: 29,
    doseWeight: '62 kg',
    sex: 'Female',
    mrn: 'Place holder',
    fin: 'Place holder',
    admitted: '2025-08-23',
    codeStatus: 'Full Code',
    isolation: 'None',
    bed: 'PP-108',
    allergies: 'Latex, Shellfish',
    status: 'Good',
    provider: 'Place holder',
    notes: 'Place holder',
    department: 'Postpartum',
    chartData: {
      background: 'Place holder',
      summary: 'Place holder',
      discharge: 'Place holder',
      handoff: 'Place holder'
    }
  },
  {
    id: '445566778899',
    name: 'Baby Rodriguez',
    dob: '2025-08-23',
    age: 0,
    doseWeight: '3.2 kg',
    sex: 'Female',
    mrn: 'Place holder',
    fin: 'Place holder',
    admitted: '2025-08-23',
    codeStatus: 'Full Code',
    isolation: 'None',
    bed: 'NB-201',
    allergies: 'None known',
    status: 'Healthy',
    provider: 'Place holder',
    notes: 'Place holder',
    department: 'Newborn',
    chartData: {
      background: 'Place holder',
      summary: 'Place holder',
      discharge: 'Place holder',
      handoff: 'Place holder'
    }
  }
];

const initialMedicines = [
  { id: '31908432', name: 'Acetaminophen' },
  { id: '95283134', name: 'Ibuprofen' },
  { id: '60329247', name: 'Amoxicillin' },
  { id: '09509828', name: 'Metformin' },
  { id: '20944348', name: 'Lisinopril' }
];

const initialPrescriptions = [
  { id: '1', patientId: '112233445566', medicineId: '31908432', dosage: '500mg', periodicity: 'Every 6 hours', duration: '7 days', startDate: new Date('2025-08-26'), endDate: new Date('2025-09-02') },
  { id: '2', patientId: '112233445566', medicineId: '95283134', dosage: '25mg', periodicity: 'Once daily', duration: '2 weeks', startDate: new Date('2025-08-26'), endDate: new Date('2025-09-09') },
  { id: '3', patientId: '112233445566', medicineId: '60329247', dosage: '250mg', periodicity: 'Twice daily', duration: '10 days', startDate: new Date('2025-08-26'), endDate: new Date('2025-09-05') },
  { id: '4', patientId: '223344556677', medicineId: '09509828', dosage: '500mg', periodicity: 'Twice daily', duration: 'Ongoing', startDate: new Date('2025-08-20'), endDate: null },
  { id: '5', patientId: '223344556677', medicineId: '31908432', dosage: '1000mg', periodicity: 'Once daily', duration: '5 days', startDate: new Date('2025-08-26'), endDate: new Date('2025-08-31') },
  { id: '6', patientId: '223344556677', medicineId: '20944348', dosage: '10mg', periodicity: 'Once daily', duration: 'Ongoing', startDate: new Date('2025-08-20'), endDate: null }
];

const initialLabResults = [
  // Recent labs for Olivia Chen
  {
    patientId: '112233445566',
    testName: 'Complete Blood Count - Hemoglobin',
    testCode: 'CBC-HGB',
    value: '12.5',
    unit: 'g/dL',
    referenceRange: '12.0-16.0 g/dL',
    status: 'normal',
    takenAt: new Date('2025-08-25T08:00:00Z'),
    resultedAt: new Date('2025-08-25T10:30:00Z'),
    notes: 'Hemoglobin within normal limits'
  },
  {
    patientId: '112233445566',
    testName: 'Complete Blood Count - White Blood Cells',
    testCode: 'CBC-WBC',
    value: '7200',
    unit: 'cells/μL',
    referenceRange: '4500-11000 cells/μL',
    status: 'normal',
    takenAt: new Date('2025-08-25T08:00:00Z'),
    resultedAt: new Date('2025-08-25T10:30:00Z'),
    notes: null
  },
  {
    patientId: '112233445566',
    testName: 'Basic Metabolic Panel - Glucose',
    testCode: 'BMP-GLU',
    value: '95',
    unit: 'mg/dL',
    referenceRange: '70-100 mg/dL',
    status: 'normal',
    takenAt: new Date('2025-08-25T08:00:00Z'),
    resultedAt: new Date('2025-08-25T09:45:00Z'),
    notes: 'Fasting glucose normal'
  },
  {
    patientId: '112233445566',
    testName: 'Basic Metabolic Panel - Creatinine',
    testCode: 'BMP-CREAT',
    value: '0.9',
    unit: 'mg/dL',
    referenceRange: '0.6-1.2 mg/dL',
    status: 'normal',
    takenAt: new Date('2025-08-25T08:00:00Z'),
    resultedAt: new Date('2025-08-25T09:45:00Z'),
    notes: 'Kidney function normal'
  },
  {
    patientId: '112233445566',
    testName: 'Hemoglobin A1C',
    testCode: 'HbA1c',
    value: '5.8',
    unit: '%',
    referenceRange: '<7.0%',
    status: 'normal',
    takenAt: new Date('2025-08-20T09:00:00Z'),
    resultedAt: new Date('2025-08-21T14:00:00Z'),
    notes: 'Good diabetic control'
  },
  
  // Recent labs for Marcus Thompson
  {
    patientId: '223344556677',
    testName: 'Lipid Panel - Total Cholesterol',
    testCode: 'LIPID-CHOL',
    value: '220',
    unit: 'mg/dL',
    referenceRange: '<200 mg/dL',
    status: 'abnormal',
    takenAt: new Date('2025-08-24T10:30:00Z'),
    resultedAt: new Date('2025-08-24T15:00:00Z'),
    notes: 'Elevated cholesterol, recommend dietary changes'
  },
  {
    patientId: '223344556677',
    testName: 'Lipid Panel - LDL Cholesterol',
    testCode: 'LIPID-LDL',
    value: '145',
    unit: 'mg/dL',
    referenceRange: '<100 mg/dL',
    status: 'abnormal',
    takenAt: new Date('2025-08-24T10:30:00Z'),
    resultedAt: new Date('2025-08-24T15:00:00Z'),
    notes: 'LDL elevated'
  },
  {
    patientId: '223344556677',
    testName: 'Lipid Panel - HDL Cholesterol',
    testCode: 'LIPID-HDL',
    value: '38',
    unit: 'mg/dL',
    referenceRange: '>40 mg/dL (M), >50 mg/dL (F)',
    status: 'abnormal',
    takenAt: new Date('2025-08-24T10:30:00Z'),
    resultedAt: new Date('2025-08-24T15:00:00Z'),
    notes: 'HDL low, consider exercise'
  },
  {
    patientId: '223344556677',
    testName: 'Thyroid Stimulating Hormone',
    testCode: 'TSH',
    value: '2.1',
    unit: 'mIU/L',
    referenceRange: '0.4-4.0 mIU/L',
    status: 'normal',
    takenAt: new Date('2025-08-24T10:30:00Z'),
    resultedAt: new Date('2025-08-24T16:30:00Z'),
    notes: 'Thyroid function normal'
  },
  {
    patientId: '223344556677',
    testName: 'Prostate Specific Antigen',
    testCode: 'PSA',
    value: '1.8',
    unit: 'ng/mL',
    referenceRange: '<4.0 ng/mL',
    status: 'normal',
    takenAt: new Date('2025-08-22T08:00:00Z'),
    resultedAt: new Date('2025-08-22T14:00:00Z'),
    notes: 'Annual screening - normal'
  }
];

export async function seedDatabase() {
  try {
    console.log("🌱 Seeding database...");
    
    // Check if database is already seeded by looking for existing patients
    const existingPatients = await db.select().from(patients).limit(1);
    if (existingPatients.length > 0) {
      console.log("Database already seeded, skipping...");
      return;
    }
    
    // Insert patients
    for (const patient of initialPatients) {
      await db.insert(patients).values(patient).onConflictDoNothing();
    }
    
    // Insert medicines
    for (const medicine of initialMedicines) {
      await db.insert(medicines).values(medicine).onConflictDoNothing();
    }
    
    // Insert prescriptions
    for (const prescription of initialPrescriptions) {
      await db.insert(prescriptions).values(prescription).onConflictDoNothing();
    }
    
    // Insert lab results
    for (const labResult of initialLabResults) {
      await db.insert(labResults).values(labResult).onConflictDoNothing();
    }
    
    console.log("✅ Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  }
}