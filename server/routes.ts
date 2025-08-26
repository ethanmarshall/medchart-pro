import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPatientSchema, insertAdministrationSchema, insertPrescriptionSchema, insertMedicineSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get patient by ID
  app.get("/api/patients/:id", async (req, res) => {
    try {
      const patient = await storage.getPatient(req.params.id);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      res.json(patient);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create new patient
  app.post("/api/patients", async (req, res) => {
    try {
      const validatedData = insertPatientSchema.parse(req.body);
      const patient = await storage.createPatient(validatedData);
      res.status(201).json(patient);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid patient data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get all patients
  app.get("/api/patients", async (req, res) => {
    try {
      const patients = await storage.getAllPatients();
      res.json(patients);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get medicine by ID
  app.get("/api/medicines/:id", async (req, res) => {
    try {
      const medicine = await storage.getMedicine(req.params.id);
      if (!medicine) {
        return res.status(404).json({ message: "Medicine not found" });
      }
      res.json(medicine);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get all medicines
  app.get("/api/medicines", async (req, res) => {
    try {
      const medicines = await storage.getAllMedicines();
      res.json(medicines);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get prescriptions for a patient
  app.get("/api/patients/:patientId/prescriptions", async (req, res) => {
    try {
      const prescriptions = await storage.getPrescriptionsByPatient(req.params.patientId);
      res.json(prescriptions);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get administrations for a patient
  app.get("/api/patients/:patientId/administrations", async (req, res) => {
    try {
      const administrations = await storage.getAdministrationsByPatient(req.params.patientId);
      res.json(administrations);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Record medication administration
  app.post("/api/administrations", async (req, res) => {
    try {
      const validatedData = insertAdministrationSchema.parse(req.body);
      const administration = await storage.createAdministration(validatedData);
      res.status(201).json(administration);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid administration data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get audit logs for a specific entity
  app.get("/api/audit/:entityType/:entityId", async (req, res) => {
    try {
      const { entityType, entityId } = req.params;
      const auditLogs = await storage.getAuditLogsByEntity(entityType, entityId);
      res.json(auditLogs);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get lab results for a patient
  app.get("/api/patients/:patientId/lab-results", async (req, res) => {
    try {
      const labResults = await storage.getLabResultsByPatient(req.params.patientId);
      res.json(labResults);
    } catch (error) {
      console.error('Error fetching lab results:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create new medicine
  app.post("/api/medicines", async (req, res) => {
    try {
      const validatedData = insertMedicineSchema.parse(req.body);
      const medicine = await storage.createMedicine(validatedData);
      res.status(201).json(medicine);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid medicine data", errors: error.errors });
      }
      console.error('Error creating medicine:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Add prescription (requires PIN validation)
  app.post("/api/patients/:patientId/prescriptions", async (req, res) => {
    try {
      const { medicineId, dosage, periodicity, pin } = req.body;
      
      // Validate PIN
      if (pin !== "1234") {
        return res.status(401).json({ message: "Invalid PIN code" });
      }
      
      const validatedData = insertPrescriptionSchema.parse({
        patientId: req.params.patientId,
        medicineId,
        dosage,
        periodicity
      });
      
      const prescription = await storage.createPrescription(validatedData);
      
      // Create audit log
      await storage.createAuditLog({
        entityType: 'prescription',
        entityId: prescription.id,
        action: 'create',
        changes: {
          patient_id: req.params.patientId,
          medicine_id: medicineId,
          action: 'prescription_added'
        } as any
      });
      
      res.status(201).json(prescription);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid prescription data", errors: error.errors });
      }
      console.error('Error adding prescription:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Remove prescription (requires PIN validation)
  app.delete("/api/patients/:patientId/prescriptions/:prescriptionId", async (req, res) => {
    try {
      const { pin } = req.body;
      
      // Validate PIN
      if (pin !== "1234") {
        return res.status(401).json({ message: "Invalid PIN code" });
      }
      
      const deleted = await storage.deletePrescription(req.params.prescriptionId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Prescription not found" });
      }
      
      // Create audit log
      await storage.createAuditLog({
        entityType: 'prescription',
        entityId: req.params.prescriptionId,
        action: 'delete',
        changes: {
          patient_id: req.params.patientId,
          prescription_id: req.params.prescriptionId,
          action: 'prescription_removed'
        } as any
      });
      
      res.json({ message: "Prescription removed successfully" });
    } catch (error) {
      console.error('Error removing prescription:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update patient data
  app.patch("/api/patients/:id", async (req, res) => {
    try {
      const updates = insertPatientSchema.partial().parse(req.body);
      
      // Get the original patient data for audit logging
      const originalPatient = await storage.getPatient(req.params.id);
      if (!originalPatient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      
      const updatedPatient = await storage.updatePatient(req.params.id, updates);
      
      // Create audit log for the patient update
      const changeDetails = {
        updated_fields: Object.keys(updates),
        changes: Object.keys(updates).reduce((acc, field) => {
          acc[field] = {
            from: (originalPatient as any)[field],
            to: (updatedPatient as any)[field]
          };
          return acc;
        }, {} as Record<string, any>)
      } as any;

      await storage.createAuditLog({
        entityType: 'patient',
        entityId: req.params.id,
        action: 'update',
        changes: changeDetails
      });
      
      res.json(updatedPatient);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid patient data", errors: error.errors });
      }
      console.error('Error updating patient:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
