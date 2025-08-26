import { type Patient, type InsertPatient, type Medicine, type InsertMedicine, type Prescription, type InsertPrescription, type Administration, type InsertAdministration } from "@shared/schema";
import { randomUUID } from "crypto";

// Initial data for demonstration
const initialPatientsData = new Map<string, Patient>([
  ['112233445566', {
    id: '112233445566',
    name: 'Olivia Chen',
    dob: '1988-05-21',
    age: 37,
    doseWeight: '68 kg',
    sex: 'Female',
    mrn: 'MRN7384920',
    fin: 'FIN5839201',
    admitted: '2025-08-22',
    codeStatus: 'Full Code',
    isolation: 'None',
    bed: 'LD-102',
    allergies: 'None',
    status: 'Stable',
    provider: 'Dr. Sarah Johnson',
    notes: 'Responding well to treatment. Ready for discharge planning.',
    department: 'Labor & Delivery',
    chartData: {
      background: '<h3>Patient History</h3><p>Patient is a 37-year-old female with a history of hypertension and moderate persistent asthma, diagnosed 10 years ago. Well-managed on daily inhaled corticosteroids. No history of smoking. No known drug allergies.</p>',
      summary: '<h3>Admission Summary</h3><p>Admitted on 2025-08-22 for acute exacerbation of asthma, likely triggered by recent environmental allergens. Presented with shortness of breath, wheezing, and chest tightness. Currently stable on continuous nebulizer treatments and IV steroids.</p>',
      discharge: '<h3>Discharge Plan</h3><p>Plan for discharge in 2-3 days pending continued stability and successful wean from continuous nebulizers to PRN inhaler. Patient will need follow-up with PCP within 1 week of discharge. Education on inhaler technique and allergen avoidance to be reinforced.</p>',
      handoff: '<h3>SBAR Handoff</h3><p><strong>Situation:</strong> Olivia Chen is a 37 y/o female admitted for an asthma exacerbation, now stable.<br><strong>Background:</strong> History of HTN and asthma. No allergies.<br><strong>Assessment:</strong> Vitals stable, responding well to treatment, breath sounds improving.<br><strong>Recommendation:</strong> Continue current plan of care. Monitor for any signs of respiratory distress. Wean nebulizer treatments as tolerated.</p>'
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
    mrn: 'MRN2947561',
    fin: 'FIN8472019',
    admitted: '2025-08-20',
    codeStatus: 'DNR/DNI',
    isolation: 'Contact Precautions (MRSA)',
    bed: 'ICU-205',
    allergies: 'Penicillin',
    status: 'Improving',
    provider: 'Dr. Michael Torres',
    notes: 'Antibiotics showing good response. Monitor renal function.',
    department: 'Medical',
    chartData: {
      background: '<h3>Patient History</h3><p>70-year-old male with a significant history of Type 2 Diabetes, coronary artery disease (s/p CABG x3 in 2018), and chronic kidney disease stage 3. History of MRSA colonization.</p>',
      summary: '<h3>Admission Summary</h3><p>Admitted for community-acquired pneumonia. Presented with fever, productive cough, and hypoxia. Started on broad-spectrum antibiotics. Showing slow but steady improvement.</p>',
      discharge: '<h3>Discharge Plan</h3><p>Requires at least 5 more days of IV antibiotics. Plan for transition to oral antibiotics once clinically stable. Physical therapy consult initiated for deconditioning.</p>',
      handoff: '<h3>SBAR Handoff</h3><p><strong>Situation:</strong> Benjamin Carter, 70 y/o male with pneumonia.<br><strong>Background:</strong> Complicated PMH including CAD, DM2, CKD. Contact isolation for MRSA.<br><strong>Assessment:</strong> Responding to antibiotics, afebrile, O2 sats improving on 2L NC.<br><strong>Recommendation:</strong> Continue antibiotics, monitor renal function, encourage mobility.</p>'
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
    mrn: 'MRN8392745',
    fin: 'FIN6472831',
    admitted: '2025-08-23',
    codeStatus: 'Full Code',
    isolation: 'None',
    bed: 'PP-108',
    allergies: 'Latex, Shellfish',
    status: 'Good',
    provider: 'Dr. Jennifer Kim',
    notes: 'C-section recovery progressing well. Breastfeeding established.',
    department: 'Postpartum',
    chartData: {
      background: '<h3>Patient History</h3><p>29-year-old G2P2 female with history of gestational diabetes during first pregnancy. No other significant medical history.</p>',
      summary: '<h3>Admission Summary</h3><p>Admitted for elective repeat C-section at 39 weeks gestation. Surgery uncomplicated, healthy baby girl delivered.</p>',
      discharge: '<h3>Discharge Plan</h3><p>Plan for discharge POD#2 if meeting milestones. Staple removal scheduled for POD#7.</p>',
      handoff: '<h3>SBAR Handoff</h3><p><strong>Situation:</strong> Maria Rodriguez, 29 y/o s/p repeat C-section.<br><strong>Background:</strong> G2P2, previous GDM history.<br><strong>Assessment:</strong> Post-op recovery normal, breastfeeding established.<br><strong>Recommendation:</strong> Continue routine post-op care, encourage ambulation.</p>'
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
    mrn: 'MRN8392746',
    fin: 'FIN6472832',
    admitted: '2025-08-23',
    codeStatus: 'Full Code',
    isolation: 'None',
    bed: 'NBN-201',
    allergies: 'None',
    status: 'Healthy',
    provider: 'Dr. Robert Chen',
    notes: 'Term newborn, feeding well, normal newborn exam.',
    department: 'Newborn',
    chartData: {
      background: '<h3>Birth History</h3><p>Term female infant born via repeat C-section at 39 weeks to 29-year-old G2P2 mother. Birth weight 3.2 kg.</p>',
      summary: '<h3>Newborn Summary</h3><p>Vigorous newborn with Apgars 8/9. No resuscitation required. Normal transition to extrauterine life.</p>',
      discharge: '<h3>Discharge Plan</h3><p>Routine newborn care. Discharge with mother when ready.</p>',
      handoff: '<h3>SBAR Handoff</h3><p><strong>Situation:</strong> Healthy term newborn.<br><strong>Background:</strong> Born via repeat C-section, uncomplicated delivery.<br><strong>Assessment:</strong> Feeding well, vital signs stable.<br><strong>Recommendation:</strong> Continue routine newborn care.</p>'
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
    mrn: 'MRN5472839',
    fin: 'FIN9384720',
    admitted: '2025-08-24',
    codeStatus: 'Full Code',
    isolation: 'None',
    bed: 'LD-105',
    allergies: 'Codeine',
    status: 'Active Labor',
    provider: 'Dr. Sarah Johnson',
    notes: 'G1P0, 40 weeks, active labor. Epidural placed.',
    department: 'Labor & Delivery',
    chartData: {
      background: '<h3>Patient History</h3><p>32-year-old G1P0 at 40 weeks gestation. Prenatal course uncomplicated. No significant medical history.</p>',
      summary: '<h3>Admission Summary</h3><p>Admitted in active labor with regular contractions every 3-4 minutes. Cervix 6cm dilated.</p>',
      discharge: '<h3>Discharge Plan</h3><p>Awaiting delivery and postpartum recovery.</p>',
      handoff: '<h3>SBAR Handoff</h3><p><strong>Situation:</strong> Ashley Thompson, 32 y/o G1P0 in active labor.<br><strong>Background:</strong> Term pregnancy, uncomplicated course.<br><strong>Assessment:</strong> Active labor progressing normally, epidural in place.<br><strong>Recommendation:</strong> Continue labor support, monitor fetal heart rate.</p>'
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
  
  // Medicine methods
  getMedicine(id: string): Promise<Medicine | undefined>;
  getAllMedicines(): Promise<Medicine[]>;
  
  // Prescription methods
  getPrescriptionsByPatient(patientId: string): Promise<Prescription[]>;
  createPrescription(prescription: InsertPrescription): Promise<Prescription>;
  
  // Administration methods
  getAdministrationsByPatient(patientId: string): Promise<Administration[]>;
  createAdministration(administration: InsertAdministration): Promise<Administration>;
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
}

export const storage = new MemStorage();
