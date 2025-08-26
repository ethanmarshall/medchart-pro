import { type Patient, type InsertPatient, type Medicine, type InsertMedicine, type Prescription, type InsertPrescription, type Administration, type InsertAdministration, type AuditLog, type InsertAuditLog, type LabResult } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { patients, medicines, prescriptions, administrations, auditLogs, labResults } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

// Initial data for demonstration
const initialPatientsData = new Map<string, Patient>([
  ['112233445566', {
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
    },
    createdAt: new Date('2025-08-22')
  }],
  ['223344556677', {
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
    },
    createdAt: new Date('2025-08-20')
  }],
  ['334455667788', {
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
    },
    createdAt: new Date('2025-08-23')
  }],
  ['445566778899', {
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
    bed: 'NBN-201',
    allergies: 'None',
    status: 'Healthy',
    provider: 'Place holder',
    notes: 'Place holder',
    department: 'Newborn',
    chartData: {
      background: 'Place holder',
      summary: 'Place holder',
      discharge: 'Place holder',
      handoff: 'Place holder'
    },
    createdAt: new Date('2025-08-23')
  }],
  ['556677889900', {
    id: '556677889900',
    name: 'Ashley Thompson',
    dob: '1992-07-08',
    age: 32,
    doseWeight: '75 kg',
    sex: 'Female',
    mrn: 'Place holder',
    fin: 'Place holder',
    admitted: '2025-08-24',
    codeStatus: 'Full Code',
    isolation: 'None',
    bed: 'LD-105',
    allergies: 'Codeine',
    status: 'Active Labor',
    provider: 'Place holder',
    notes: 'Place holder',
    department: 'Labor & Delivery',
    chartData: {
      background: 'Place holder',
      summary: 'Place holder',
      discharge: 'Place holder',
      handoff: 'Place holder'
    },
    createdAt: new Date('2025-08-24')
  }]
]);

const medicinesData = new Map<string, Medicine>([
  ['31908432', { id: '31908432', name: 'Acetaminophen' }],
  ['36940245', { id: '36940245', name: 'Colace/Docusate Sodium' }],
  ['68439028', { id: '68439028', name: 'Dermoplast Spray' }],
  ['06134447', { id: '06134447', name: 'Dulcolax' }],
  ['19567398', { id: '19567398', name: 'Energix/Hepatitis (for mom)' }],
  ['95283134', { id: '95283134', name: 'Ephedrine' }],
  ['85967245', { id: '85967245', name: 'Fentanyl' }],
  ['35769341', { id: '35769341', name: 'Ibuprofen/Motrin' }],
  ['60329247', { id: '60329247', name: 'Toradol' }],
  ['09509828', { id: '09509828', name: 'Morphine' }],
  ['20944348', { id: '20944348', name: 'Labetalol' }],
]);

const prescriptionsData = new Map<string, Prescription[]>([
  ['112233445566', [
    { id: '1', patientId: '112233445566', medicineId: '35769341', dosage: '200mg', periodicity: 'Every 6 hours', duration: '7 days', startDate: new Date('2025-08-26'), endDate: new Date('2025-09-02') },
    { id: '2', patientId: '112233445566', medicineId: '95283134', dosage: '25mg', periodicity: 'Once daily', duration: '2 weeks', startDate: new Date('2025-08-26'), endDate: new Date('2025-09-09') },
    { id: '3', patientId: '112233445566', medicineId: '60329247', dosage: '30mg', periodicity: 'Every 8 hours as needed', duration: '5 days', startDate: new Date('2025-08-26'), endDate: new Date('2025-08-31') },
  ]],
  ['223344556677', [
    { id: '4', patientId: '223344556677', medicineId: '09509828', dosage: '1mg', periodicity: 'Every 4 hours as needed', duration: 'As needed', startDate: new Date('2025-08-20'), endDate: null },
    { id: '5', patientId: '223344556677', medicineId: '31908432', dosage: '500mg', periodicity: 'Every 6 hours', duration: '10 days', startDate: new Date('2025-08-26'), endDate: new Date('2025-09-05') },
    { id: '6', patientId: '223344556677', medicineId: '20944348', dosage: '5mg', periodicity: 'Twice daily', duration: 'Ongoing', startDate: new Date('2025-08-20'), endDate: null },
  ]]
]);

export interface IStorage {
  // Patient methods
  getPatient(id: string): Promise<Patient | undefined>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  getAllPatients(): Promise<Patient[]>;
  updatePatient(id: string, updates: Partial<InsertPatient>): Promise<Patient | undefined>;
  
  // Medicine methods
  getMedicine(id: string): Promise<Medicine | undefined>;
  getAllMedicines(): Promise<Medicine[]>;
  createMedicine(medicine: InsertMedicine): Promise<Medicine>;
  
  // Prescription methods
  getPrescriptionsByPatient(patientId: string): Promise<Prescription[]>;
  createPrescription(prescription: InsertPrescription): Promise<Prescription>;
  updatePrescription(prescriptionId: string, updates: Partial<Pick<Prescription, 'dosage' | 'periodicity' | 'duration' | 'startDate' | 'endDate'>>): Promise<Prescription | undefined>;
  deletePrescription(prescriptionId: string): Promise<boolean>;
  
  // Administration methods
  getAdministrationsByPatient(patientId: string): Promise<Administration[]>;
  createAdministration(administration: InsertAdministration): Promise<Administration>;
  
  // Audit log methods
  getAuditLogsByEntity(entityType: string, entityId: string): Promise<AuditLog[]>;
  createAuditLog(auditLog: InsertAuditLog): Promise<AuditLog>;
  
  // Lab result methods
  getLabResultsByPatient(patientId: string): Promise<LabResult[]>;
  createLabOrders(patientId: string, tests: string[], orderDate: string): Promise<number>;
  
  // Delete patient method
  deletePatient(patientId: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private patients: Map<string, Patient>;
  private medicines: Map<string, Medicine>;
  private prescriptions: Map<string, Prescription[]>;
  private administrations: Map<string, Administration[]>;
  private labResults: Map<string, LabResult[]>;

  constructor() {
    this.patients = new Map(initialPatientsData);
    this.medicines = new Map(medicinesData);
    this.prescriptions = new Map(prescriptionsData);
    this.administrations = new Map();
    this.labResults = new Map();
  }

  async getPatient(id: string): Promise<Patient | undefined> {
    return this.patients.get(id);
  }

  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    const patient: Patient = {
      ...insertPatient,
      chartData: insertPatient.chartData ?? null,
      createdAt: new Date(),
    };
    this.patients.set(patient.id, patient);
    return patient;
  }

  async getAllPatients(): Promise<Patient[]> {
    return Array.from(this.patients.values());
  }

  async getMedicine(id: string): Promise<Medicine | undefined> {
    return this.medicines.get(id);
  }

  async getAllMedicines(): Promise<Medicine[]> {
    return Array.from(this.medicines.values());
  }

  async createMedicine(insertMedicine: InsertMedicine): Promise<Medicine> {
    const medicine: Medicine = {
      ...insertMedicine,
    };
    this.medicines.set(medicine.id, medicine);
    return medicine;
  }

  async getPrescriptionsByPatient(patientId: string): Promise<Prescription[]> {
    return this.prescriptions.get(patientId) || [];
  }

  async createPrescription(insertPrescription: InsertPrescription): Promise<Prescription> {
    const prescription: Prescription = {
      ...insertPrescription,
      id: randomUUID(),
      duration: insertPrescription.duration ?? null,
      startDate: insertPrescription.startDate ?? null,
      endDate: insertPrescription.endDate ?? null,
    };
    
    const existing = this.prescriptions.get(prescription.patientId) || [];
    existing.push(prescription);
    this.prescriptions.set(prescription.patientId, existing);
    
    return prescription;
  }

  async updatePrescription(prescriptionId: string, updates: Partial<Pick<Prescription, 'dosage' | 'periodicity' | 'duration' | 'startDate' | 'endDate'>>): Promise<Prescription | undefined> {
    for (const [patientId, prescriptions] of Array.from(this.prescriptions.entries())) {
      const index = prescriptions.findIndex((p: Prescription) => p.id === prescriptionId);
      if (index !== -1) {
        const updatedPrescription = { ...prescriptions[index], ...updates };
        prescriptions[index] = updatedPrescription;
        this.prescriptions.set(patientId, prescriptions);
        return updatedPrescription;
      }
    }
    return undefined;
  }

  async deletePrescription(prescriptionId: string): Promise<boolean> {
    for (const [patientId, prescriptions] of Array.from(this.prescriptions.entries())) {
      const index = prescriptions.findIndex((p: Prescription) => p.id === prescriptionId);
      if (index !== -1) {
        prescriptions.splice(index, 1);
        this.prescriptions.set(patientId, prescriptions);
        return true;
      }
    }
    return false;
  }

  async getAdministrationsByPatient(patientId: string): Promise<Administration[]> {
    return this.administrations.get(patientId) || [];
  }

  async createAdministration(insertAdministration: InsertAdministration): Promise<Administration> {
    const administration: Administration = {
      ...insertAdministration,
      id: randomUUID(),
      administeredAt: new Date(),
    };
    
    const existing = this.administrations.get(administration.patientId) || [];
    existing.push(administration);
    this.administrations.set(administration.patientId, existing);
    
    return administration;
  }

  async getLabResultsByPatient(patientId: string): Promise<LabResult[]> {
    return this.labResults.get(patientId) || [];
  }

  async createLabOrders(patientId: string, tests: string[], orderDate: string): Promise<number> {
    // For MemStorage, return mock count
    return tests.length;
  }

  async deletePatient(patientId: string): Promise<boolean> {
    const deleted = this.patients.delete(patientId);
    if (deleted) {
      // Also clean up related data
      this.prescriptions.delete(patientId);
      this.administrations.delete(patientId);
      this.labResults.delete(patientId);
    }
    return deleted;
  }

  async updatePatient(id: string, updates: Partial<InsertPatient>): Promise<Patient | undefined> {
    const patient = this.patients.get(id);
    if (!patient) return undefined;
    
    const updatedPatient = { ...patient, ...updates, chartData: updates.chartData ?? patient.chartData };
    this.patients.set(id, updatedPatient);
    return updatedPatient;
  }

  async getAuditLogsByEntity(entityType: string, entityId: string): Promise<AuditLog[]> {
    // For MemStorage, return empty array since we don't store audit logs
    return [];
  }

  async createAuditLog(auditLog: InsertAuditLog): Promise<AuditLog> {
    // For MemStorage, return a mock audit log
    return {
      ...auditLog,
      id: randomUUID(),
      timestamp: new Date(),
      changes: auditLog.changes ?? null,
      userId: auditLog.userId ?? null,
    };
  }
}

// Database Storage Implementation
export class DatabaseStorage implements IStorage {
  async getPatient(id: string): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.id, id));
    return patient;
  }

  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    const [patient] = await db
      .insert(patients)
      .values(insertPatient)
      .returning();
    
    // Log patient creation
    await this.createAuditLog({
      entityType: 'patient',
      entityId: patient.id,
      action: 'create',
      changes: insertPatient as Record<string, any>,
    });
    
    return patient;
  }

  async getAllPatients(): Promise<Patient[]> {
    return await db.select().from(patients);
  }

  async updatePatient(id: string, updates: Partial<InsertPatient>): Promise<Patient | undefined> {
    const [patient] = await db
      .update(patients)
      .set(updates)
      .where(eq(patients.id, id))
      .returning();
    
    if (patient) {
      // Log patient update
      await this.createAuditLog({
        entityType: 'patient',
        entityId: id,
        action: 'update',
        changes: updates as Record<string, any>,
      });
    }
    
    return patient;
  }

  async getMedicine(id: string): Promise<Medicine | undefined> {
    const [medicine] = await db.select().from(medicines).where(eq(medicines.id, id));
    return medicine;
  }

  async getAllMedicines(): Promise<Medicine[]> {
    return await db.select().from(medicines);
  }

  async createMedicine(insertMedicine: InsertMedicine): Promise<Medicine> {
    const [medicine] = await db
      .insert(medicines)
      .values(insertMedicine)
      .returning();
    return medicine;
  }

  async getPrescriptionsByPatient(patientId: string): Promise<Prescription[]> {
    return await db.select().from(prescriptions).where(eq(prescriptions.patientId, patientId));
  }

  async createPrescription(insertPrescription: InsertPrescription): Promise<Prescription> {
    const [prescription] = await db
      .insert(prescriptions)
      .values(insertPrescription)
      .returning();
    
    // Log prescription creation
    await this.createAuditLog({
      entityType: 'prescription',
      entityId: prescription.id,
      action: 'create',
      changes: insertPrescription as Record<string, any>,
    });
    
    return prescription;
  }

  async updatePrescription(prescriptionId: string, updates: Partial<Pick<Prescription, 'dosage' | 'periodicity' | 'duration' | 'startDate' | 'endDate'>>): Promise<Prescription | undefined> {
    const [prescription] = await db
      .update(prescriptions)
      .set(updates)
      .where(eq(prescriptions.id, prescriptionId))
      .returning();
    
    // Log prescription update
    if (prescription) {
      await this.createAuditLog({
        entityType: 'prescription',
        entityId: prescription.id,
        action: 'update',
        changes: updates as Record<string, any>,
      });
    }
    
    return prescription;
  }

  async deletePrescription(prescriptionId: string): Promise<boolean> {
    const result = await db
      .delete(prescriptions)
      .where(eq(prescriptions.id, prescriptionId))
      .returning();
    
    return result.length > 0;
  }

  async getAdministrationsByPatient(patientId: string): Promise<Administration[]> {
    return await db.select().from(administrations).where(eq(administrations.patientId, patientId));
  }

  async createAdministration(insertAdministration: InsertAdministration): Promise<Administration> {
    const [administration] = await db
      .insert(administrations)
      .values(insertAdministration)
      .returning();
    
    // Log administration
    await this.createAuditLog({
      entityType: 'administration',
      entityId: administration.id,
      action: 'administer',
      changes: {
        patientId: insertAdministration.patientId,
        medicineId: insertAdministration.medicineId,
        status: insertAdministration.status,
        message: insertAdministration.message,
        administeredAt: administration.administeredAt?.toISOString() ?? null,
      } as Record<string, any>,
    });
    
    return administration;
  }

  async getAuditLogsByEntity(entityType: string, entityId: string): Promise<AuditLog[]> {
    return await db
      .select()
      .from(auditLogs)
      .where(and(
        eq(auditLogs.entityType, entityType),
        eq(auditLogs.entityId, entityId)
      ))
      .orderBy(desc(auditLogs.timestamp));
  }

  async createAuditLog(insertAuditLog: InsertAuditLog): Promise<AuditLog> {
    const [auditLog] = await db
      .insert(auditLogs)
      .values(insertAuditLog)
      .returning();
    
    return auditLog;
  }

  async getLabResultsByPatient(patientId: string): Promise<LabResult[]> {
    try {
      console.log('Fetching lab results for patient:', patientId);
      const results = await db.select().from(labResults).where(eq(labResults.patientId, patientId));
      console.log('Found lab results:', results.length);
      return results;
    } catch (error) {
      console.error('Error in getLabResultsByPatient:', error);
      throw error;
    }
  }

  async createLabOrders(patientId: string, tests: string[], orderDate: string): Promise<number> {
    try {
      const testDefinitions: Record<string, any> = {
        'CBC-HGB': { name: 'Complete Blood Count - Hemoglobin', unit: 'g/dL', referenceRange: '12.0-16.0 g/dL', normalRange: [12.0, 16.0] },
        'CBC-WBC': { name: 'Complete Blood Count - White Blood Cells', unit: 'cells/μL', referenceRange: '4500-11000 cells/μL', normalRange: [4500, 11000] },
        'BMP-GLU': { name: 'Basic Metabolic Panel - Glucose', unit: 'mg/dL', referenceRange: '70-100 mg/dL', normalRange: [70, 100] },
        'BMP-CREAT': { name: 'Basic Metabolic Panel - Creatinine', unit: 'mg/dL', referenceRange: '0.6-1.2 mg/dL', normalRange: [0.6, 1.2] },
        'HbA1c': { name: 'Hemoglobin A1C', unit: '%', referenceRange: '<7.0%', normalRange: [4.0, 6.5] },
        'LIPID-CHOL': { name: 'Lipid Panel - Total Cholesterol', unit: 'mg/dL', referenceRange: '<200 mg/dL', normalRange: [150, 220] },
        'LIPID-LDL': { name: 'Lipid Panel - LDL Cholesterol', unit: 'mg/dL', referenceRange: '<100 mg/dL', normalRange: [70, 130] },
        'LIPID-HDL': { name: 'Lipid Panel - HDL Cholesterol', unit: 'mg/dL', referenceRange: '>40 mg/dL (M), >50 mg/dL (F)', normalRange: [40, 80] },
        'TSH': { name: 'Thyroid Stimulating Hormone', unit: 'mIU/L', referenceRange: '0.4-4.0 mIU/L', normalRange: [0.4, 4.0] },
        'PSA': { name: 'Prostate Specific Antigen', unit: 'ng/mL', referenceRange: '<4.0 ng/mL', normalRange: [0.1, 4.0] }
      };

      const takenAt = new Date(orderDate + 'T08:00:00Z');
      const resultedAt = new Date(takenAt.getTime() + 2 * 60 * 60 * 1000); // 2 hours later
      let resultsCreated = 0;

      for (const testCode of tests) {
        const testDef = testDefinitions[testCode];
        if (!testDef) continue;

        // Generate realistic values with some variation
        const [min, max] = testDef.normalRange;
        let value = (Math.random() * (max - min) + min).toFixed(1);
        
        // Randomly make some results slightly abnormal (20% chance)
        if (Math.random() < 0.2) {
          if (Math.random() < 0.5) {
            value = (min * 0.8).toFixed(1); // Low
          } else {
            value = (max * 1.2).toFixed(1); // High
          }
        }

        const status = this.determineLabStatus(testCode, parseFloat(value), testDef.normalRange);
        const notes = this.generateLabNotes(testCode, status);

        await db.insert(labResults).values({
          patientId,
          testName: testDef.name,
          testCode,
          value,
          unit: testDef.unit,
          referenceRange: testDef.referenceRange,
          status,
          takenAt,
          resultedAt,
          notes
        });

        resultsCreated++;
      }

      return resultsCreated;
    } catch (error) {
      console.error('Error creating lab orders:', error);
      throw error;
    }
  }

  private determineLabStatus(testCode: string, value: number, normalRange: number[]): string {
    const [min, max] = normalRange;
    
    if (value < min * 0.7 || value > max * 1.5) {
      return 'critical';
    } else if (value < min || value > max) {
      return 'abnormal';
    } else {
      return 'normal';
    }
  }

  private generateLabNotes(testCode: string, status: string): string | null {
    if (status === 'normal') {
      return `${testCode} within normal limits`;
    } else if (status === 'abnormal') {
      const notes: Record<string, string> = {
        'CBC-HGB': 'Consider iron supplementation or further evaluation',
        'CBC-WBC': 'Monitor for infection or immune response',
        'BMP-GLU': 'Recommend dietary counseling and follow-up',
        'BMP-CREAT': 'Consider kidney function evaluation',
        'HbA1c': 'Diabetes management review recommended',
        'LIPID-CHOL': 'Dietary changes and lifestyle modification advised',
        'LIPID-LDL': 'Consider statin therapy',
        'LIPID-HDL': 'Exercise and omega-3 supplementation recommended',
        'TSH': 'Endocrine evaluation recommended',
        'PSA': 'Urology consultation recommended'
      };
      return notes[testCode] || 'Abnormal result - recommend follow-up';
    } else {
      return 'Critical result - immediate attention required';
    }
  }

  async deletePatient(patientId: string): Promise<boolean> {
    try {
      // Delete related records first (foreign key constraints)
      await db.delete(labResults).where(eq(labResults.patientId, patientId));
      await db.delete(administrations).where(eq(administrations.patientId, patientId));
      await db.delete(prescriptions).where(eq(prescriptions.patientId, patientId));
      
      // Delete the patient
      const result = await db.delete(patients).where(eq(patients.id, patientId));
      
      return (result.rowCount || 0) > 0;
    } catch (error) {
      console.error('Error deleting patient:', error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();
