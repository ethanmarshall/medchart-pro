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
});

export const administrations = pgTable("administrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull().references(() => patients.id),
  medicineId: varchar("medicine_id").notNull().references(() => medicines.id),
  administeredAt: timestamp("administered_at").default(sql`now()`),
  status: text("status").notNull(), // 'success', 'warning', 'error'
  message: text("message").notNull(),
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

export type Patient = typeof patients.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type Medicine = typeof medicines.$inferSelect;
export type InsertMedicine = z.infer<typeof insertMedicineSchema>;
export type Prescription = typeof prescriptions.$inferSelect;
export type InsertPrescription = z.infer<typeof insertPrescriptionSchema>;
export type Administration = typeof administrations.$inferSelect;
export type InsertAdministration = z.infer<typeof insertAdministrationSchema>;
