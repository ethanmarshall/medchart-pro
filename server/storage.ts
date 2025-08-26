import { type Patient, type InsertPatient, type Medicine, type InsertMedicine, type Prescription, type InsertPrescription, type Administration, type InsertAdministration, type AuditLog, type InsertAuditLog } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { patients, medicines, prescriptions, administrations, auditLogs } from "@shared/schema";
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
  ['319084', { id: '319084', name: 'Acetaminophen' }],
  ['369402', { id: '369402', name: 'Colace/Docusate Sodium' }],
  ['6843902', { id: '6843902', name: 'Dermoplast Spray' }],
  ['0613444', { id: '0613444', name: 'Dulcolax' }],
  ['195673', { id: '195673', name: 'Energix/Hepatitis (for mom)' }],
  ['95283134', { id: '95283134', name: 'Ephedrine' }],
  ['859672', { id: '859672', name: 'Fentanyl' }],
  ['3576934', { id: '3576934', name: 'Ibuprofen/Motrin' }],
  ['6032924', { id: '6032924', name: 'Toradol' }],
  ['09509828942', { id: '09509828942', name: 'Morphine' }],
  ['2094434849303', { id: '2094434849303', name: 'Labetalol' }],
]);

const prescriptionsData = new Map<string, Prescription[]>([
  ['112233445566', [
    { id: '1', patientId: '112233445566', medicineId: '3576934' },
    { id: '2', patientId: '112233445566', medicineId: '95283134' },
    { id: '3', patientId: '112233445566', medicineId: '6032924' },
  ]],
  ['223344556677', [
    { id: '4', patientId: '223344556677', medicineId: '09509828942' },
    { id: '5', patientId: '223344556677', medicineId: '319084' },
    { id: '6', patientId: '223344556677', medicineId: '2094434849303' },
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
  
  // Prescription methods
  getPrescriptionsByPatient(patientId: string): Promise<Prescription[]>;
  createPrescription(prescription: InsertPrescription): Promise<Prescription>;
  deletePrescription(prescriptionId: string): Promise<boolean>;
  
  // Administration methods
  getAdministrationsByPatient(patientId: string): Promise<Administration[]>;
  createAdministration(administration: InsertAdministration): Promise<Administration>;
  
  // Audit log methods
  getAuditLogsByEntity(entityType: string, entityId: string): Promise<AuditLog[]>;
  createAuditLog(auditLog: InsertAuditLog): Promise<AuditLog>;
}

export class MemStorage implements IStorage {
  private patients: Map<string, Patient>;
  private medicines: Map<string, Medicine>;
  private prescriptions: Map<string, Prescription[]>;
  private administrations: Map<string, Administration[]>;

  constructor() {
    this.patients = new Map(initialPatientsData);
    this.medicines = new Map(medicinesData);
    this.prescriptions = new Map(prescriptionsData);
    this.administrations = new Map();
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

  async getPrescriptionsByPatient(patientId: string): Promise<Prescription[]> {
    return this.prescriptions.get(patientId) || [];
  }

  async createPrescription(insertPrescription: InsertPrescription): Promise<Prescription> {
    const prescription: Prescription = {
      ...insertPrescription,
      id: randomUUID(),
    };
    
    const existing = this.prescriptions.get(prescription.patientId) || [];
    existing.push(prescription);
    this.prescriptions.set(prescription.patientId, existing);
    
    return prescription;
  }

  async deletePrescription(prescriptionId: string): Promise<boolean> {
    for (const [patientId, prescriptions] of this.prescriptions.entries()) {
      const index = prescriptions.findIndex(p => p.id === prescriptionId);
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
}

export const storage = new DatabaseStorage();
