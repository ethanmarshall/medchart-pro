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
  { id: '1', patientId: '112233445566', medicineId: '31908432', dosage: '500mg', periodicity: 'Every 6 hours' },
  { id: '2', patientId: '112233445566', medicineId: '95283134', dosage: '25mg', periodicity: 'Once daily' },
  { id: '3', patientId: '112233445566', medicineId: '60329247', dosage: '250mg', periodicity: 'Twice daily' },
  { id: '4', patientId: '223344556677', medicineId: '09509828', dosage: '500mg', periodicity: 'Twice daily' },
  { id: '5', patientId: '223344556677', medicineId: '31908432', dosage: '1000mg', periodicity: 'Once daily' },
  { id: '6', patientId: '223344556677', medicineId: '20944348', dosage: '10mg', periodicity: 'Once daily' }
];

const initialLabResults = [
  {
    patientId: '112233445566',
    testName: 'Complete Blood Count (CBC)',
    value: '12.5',
    unit: 'g/dL',
    referenceRange: '11.6-15.0',
    status: 'normal',
    collectedAt: new Date('2024-12-20T08:30:00Z')
  },
  {
    patientId: '112233445566',
    testName: 'Glucose',
    value: '185',
    unit: 'mg/dL',
    referenceRange: '70-99',
    status: 'high',
    collectedAt: new Date('2024-12-20T08:30:00Z')
  },
  {
    patientId: '112233445566',
    testName: 'Creatinine',
    value: '0.9',
    unit: 'mg/dL',
    referenceRange: '0.6-1.2',
    status: 'normal',
    collectedAt: new Date('2024-12-19T14:15:00Z')
  },
  {
    patientId: '223344556677',
    testName: 'Hemoglobin A1C',
    value: '8.2',
    unit: '%',
    referenceRange: '<7.0',
    status: 'high',
    collectedAt: new Date('2024-12-18T10:00:00Z')
  },
  {
    patientId: '223344556677',
    testName: 'Total Cholesterol',
    value: '165',
    unit: 'mg/dL',
    referenceRange: '<200',
    status: 'normal',
    collectedAt: new Date('2024-12-18T10:00:00Z')
  }
];

export async function seedDatabase() {
  try {
    console.log("🌱 Seeding database...");
    
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