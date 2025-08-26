import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPatientSchema, insertAdministrationSchema, insertPrescriptionSchema, insertMedicineSchema, insertLabTestTypeSchema } from "@shared/schema";
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

  // Get lab results for a patient
  app.get("/api/patients/:patientId/lab-results", async (req, res) => {
    try {
      const labResults = await storage.getLabResultsByPatient(req.params.patientId);
      // Sort by taken date descending (most recent first)
      if (labResults && labResults.length > 0) {
        labResults.sort((a, b) => {
          const aDate = a.takenAt ? new Date(a.takenAt).getTime() : 0;
          const bDate = b.takenAt ? new Date(b.takenAt).getTime() : 0;
          return bDate - aDate;
        });
      }
      res.json(labResults);
    } catch (error) {
      console.error('Error fetching lab results:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Order lab tests (creates artificial lab results)
  app.post("/api/lab-orders", async (req, res) => {
    try {
      const { patientId, tests, orderDate } = req.body;
      
      if (!patientId || !tests || !Array.isArray(tests) || tests.length === 0) {
        return res.status(400).json({ message: "Invalid order data" });
      }

      // Verify patient exists
      const patient = await storage.getPatient(patientId);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      // Generate artificial lab results for each test
      const resultsCreated = await storage.createLabOrders(patientId, tests, orderDate);
      
      res.status(201).json({ 
        message: "Lab orders created successfully",
        patientId,
        testsOrdered: tests.length,
        resultsCreated,
        orderDate 
      });
    } catch (error) {
      console.error('Error creating lab orders:', error);
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
      const { medicineId, dosage, periodicity, duration, startDate, endDate, pin } = req.body;
      
      // Validate PIN
      if (pin !== "1234") {
        return res.status(401).json({ message: "Invalid PIN code" });
      }
      
      const validatedData = insertPrescriptionSchema.parse({
        patientId: req.params.patientId,
        medicineId,
        dosage,
        periodicity,
        duration,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null
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

  // Update prescription (requires PIN validation)
  app.patch("/api/patients/:patientId/prescriptions/:prescriptionId", async (req, res) => {
    try {
      const { dosage, periodicity, duration, startDate, endDate, pin } = req.body;
      
      // Validate PIN
      if (pin !== "1234") {
        return res.status(401).json({ message: "Invalid PIN code" });
      }
      
      const updates = { 
        dosage, 
        periodicity, 
        duration,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null
      };
      const updatedPrescription = await storage.updatePrescription(req.params.prescriptionId, updates);
      
      if (!updatedPrescription) {
        return res.status(404).json({ message: "Prescription not found" });
      }
      
      // Create audit log
      await storage.createAuditLog({
        entityType: 'prescription',
        entityId: req.params.prescriptionId,
        action: 'update',
        changes: {
          patient_id: req.params.patientId,
          prescription_id: req.params.prescriptionId,
          updates: updates,
          action: 'prescription_updated'
        } as any
      });
      
      res.json(updatedPrescription);
    } catch (error) {
      console.error('Error updating prescription:', error);
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

  // Delete patient (requires PIN validation)
  app.delete("/api/patients/:id", async (req, res) => {
    try {
      const { pin } = req.body;
      
      // Validate PIN
      if (pin !== "149500") {
        return res.status(401).json({ message: "Invalid PIN code" });
      }
      
      // Check if patient exists
      const patient = await storage.getPatient(req.params.id);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      
      const deleted = await storage.deletePatient(req.params.id);
      
      if (!deleted) {
        return res.status(500).json({ message: "Failed to delete patient" });
      }
      
      // Create audit log
      await storage.createAuditLog({
        entityType: 'patient',
        entityId: req.params.id,
        action: 'delete',
        changes: {
          patient_id: req.params.id,
          patient_name: patient.name,
          action: 'patient_deleted'
        } as any
      });
      
      res.json({ message: "Patient deleted successfully" });
    } catch (error) {
      console.error('Error deleting patient:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get all lab test types
  app.get("/api/lab-test-types", async (req, res) => {
    try {
      const labTestTypes = await storage.getAllLabTestTypes();
      res.json(labTestTypes);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create new lab test type
  app.post("/api/lab-test-types", async (req, res) => {
    try {
      const validatedData = insertLabTestTypeSchema.parse(req.body);
      const labTestType = await storage.createLabTestType(validatedData);
      res.status(201).json(labTestType);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid lab test type data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
