import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const patients = pgTable("patients", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  dob: text("dob").notNull(),
  age: integer("age").notNull(),
  doseWeight: text("dose_weight").notNull(),
  sex: text("sex").notNull(),
  mrn: text("mrn").notNull(),
  fin: text("fin").notNull(),
  admitted: text("admitted").notNull(),
  codeStatus: text("code_status").notNull(),
  isolation: text("isolation").notNull(),
  bed: text("bed").notNull(),
  allergies: text("allergies").notNull(),
  status: text("status").notNull(),
  provider: text("provider").notNull(),
  notes: text("notes").notNull(),
  department: text("department").notNull(),
  chartData: json("chart_data").$type<{
    background: string;
    summary: string;
    discharge: string;
    handoff: string;
  }>(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const medicines = pgTable("medicines", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
});

export const prescriptions = pgTable("prescriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull().references(() => patients.id),
  medicineId: varchar("medicine_id").notNull().references(() => medicines.id),
  dosage: varchar("dosage").notNull(), // e.g., "10mg", "2 tablets", "5ml"
  periodicity: varchar("periodicity").notNull(), // e.g., "Every 4 hours", "Twice daily", "As needed"
  duration: varchar("duration"), // e.g., "5 days", "2 weeks", "1 month", "Ongoing"
  startDate: timestamp("start_date"), // When to start administering
  endDate: timestamp("end_date"), // When to stop administering
});

export const administrations = pgTable("administrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull().references(() => patients.id),
  medicineId: varchar("medicine_id").notNull().references(() => medicines.id),
  administeredAt: timestamp("administered_at").default(sql`now()`),
  status: text("status").notNull(), // 'success', 'warning', 'error'
  message: text("message").notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  entityType: text("entity_type").notNull(), // 'patient', 'administration', 'prescription'
  entityId: varchar("entity_id").notNull(),
  action: text("action").notNull(), // 'create', 'update', 'delete', 'administer'
  changes: json("changes").$type<Record<string, any>>(),
  timestamp: timestamp("timestamp").default(sql`now()`),
  userId: varchar("user_id"), // For future user tracking
});

export const labResults = pgTable("lab_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull().references(() => patients.id),
  testName: varchar("test_name").notNull(), // e.g., "Complete Blood Count", "Basic Metabolic Panel"
  testCode: varchar("test_code"), // e.g., "CBC", "BMP", "HbA1c"
  value: varchar("value").notNull(), // the test result value
  unit: varchar("unit"), // e.g., "mg/dL", "mmol/L", "%"
  referenceRange: varchar("reference_range"), // normal range for this test
  status: varchar("status").notNull(), // 'normal', 'abnormal', 'critical', 'pending'
  takenAt: timestamp("taken_at").notNull(), // when the lab was collected
  resultedAt: timestamp("resulted_at"), // when results were available
  notes: text("notes"), // additional notes from lab
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertPatientSchema = createInsertSchema(patients).omit({
  createdAt: true,
});

export const insertMedicineSchema = createInsertSchema(medicines);

export const insertPrescriptionSchema = createInsertSchema(prescriptions).omit({
  id: true,
});

export const insertAdministrationSchema = createInsertSchema(administrations).omit({
  id: true,
  administeredAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  timestamp: true,
});

export const insertLabResultSchema = createInsertSchema(labResults).omit({
  id: true,
  createdAt: true,
});

export type Patient = typeof patients.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type Medicine = typeof medicines.$inferSelect;
export type InsertMedicine = z.infer<typeof insertMedicineSchema>;
export type Prescription = typeof prescriptions.$inferSelect;
export type InsertPrescription = z.infer<typeof insertPrescriptionSchema>;
export type Administration = typeof administrations.$inferSelect;
export type InsertAdministration = z.infer<typeof insertAdministrationSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type LabResult = typeof labResults.$inferSelect;
export type InsertLabResult = z.infer<typeof insertLabResultSchema>;
