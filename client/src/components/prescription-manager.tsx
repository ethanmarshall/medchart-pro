import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type Patient, type Prescription, type Medicine } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface PrescriptionManagerProps {
  patient: Patient;
}

export function PrescriptionManager({ patient }: PrescriptionManagerProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const queryClient = useQueryClient();

  // Get prescriptions for this patient
  const { data: prescriptions = [] } = useQuery<Prescription[]>({
    queryKey: ['/api/patients', patient.id, 'prescriptions'],
  });

  // Get all medicines for lookup
  const { data: medicines = [] } = useQuery<Medicine[]>({
    queryKey: ['/api/medicines'],
  });

  const addPrescriptionMutation = useMutation({
    mutationFn: async ({ medicineId, pin }: { medicineId: string, pin: string }) => {
      const response = await apiRequest('POST', `/api/patients/${patient.id}/prescriptions`, {
        medicineId,
        pin
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/patients', patient.id, 'prescriptions'] });
      setShowAddModal(false);
      setPin("");
      setError("");
    },
    onError: (error: any) => {
      if (error.message.includes("401")) {
        setError("Invalid PIN code");
      } else {
        setError("Failed to add prescription");
      }
    },
  });

  const removePrescriptionMutation = useMutation({
    mutationFn: async ({ prescriptionId, pin }: { prescriptionId: string, pin: string }) => {
      const response = await apiRequest('DELETE', `/api/patients/${patient.id}/prescriptions/${prescriptionId}`, {
        pin
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/patients', patient.id, 'prescriptions'] });
      setShowRemoveModal(false);
      setSelectedPrescription(null);
      setPin("");
      setError("");
    },
    onError: (error: any) => {
      if (error.message.includes("401")) {
        setError("Invalid PIN code");
      } else {
        setError("Failed to remove prescription");
      }
    },
  });

  const handleAddPrescription = () => {
    if (!selectedMedicine || !pin) {
      setError("Please select a medicine and enter PIN");
      return;
    }
    addPrescriptionMutation.mutate({ medicineId: selectedMedicine.id, pin });
  };

  const handleRemovePrescription = () => {
    if (!selectedPrescription || !pin) {
      setError("Please enter PIN");
      return;
    }
    removePrescriptionMutation.mutate({ prescriptionId: selectedPrescription.id, pin });
  };

  const prescribedMedicines = prescriptions.map(p => {
    const medicine = medicines.find(m => m.id === p.medicineId);
    return { ...p, medicine };
  }).filter(p => p.medicine);

  const unprescribedMedicines = medicines.filter(m => 
    !prescriptions.some(p => p.medicineId === m.id)
  );

  return (
    <div className="bg-white rounded-xl shadow-medical border border-medical-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-medical-text-primary">
          <i className="fas fa-prescription-bottle text-medical-primary mr-2"></i>Prescription Management
        </h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-medical-primary text-white rounded-lg hover:bg-medical-primary/90 transition-colors font-medium"
          data-testid="button-add-prescription"
        >
          <i className="fas fa-plus mr-2"></i>Add Medicine
        </button>
      </div>

      {/* Current Prescriptions */}
      <div className="space-y-3">
        {prescribedMedicines.length === 0 ? (
          <div className="text-center py-8 text-medical-text-muted">
            <i className="fas fa-prescription-bottle text-4xl mb-4 opacity-30"></i>
            <p className="text-lg font-medium mb-2">No Prescriptions</p>
            <p className="text-sm">Add medicines to this patient's prescription list.</p>
          </div>
        ) : (
          prescribedMedicines.map((prescription) => (
            <div 
              key={prescription.id} 
              className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border"
              data-testid={`prescription-${prescription.id}`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-medical-primary/10 rounded-full flex items-center justify-center">
                  <i className="fas fa-pills text-medical-primary"></i>
                </div>
                <div>
                  <h4 className="font-medium text-medical-text-primary">
                    {prescription.medicine?.name}
                  </h4>
                  <p className="text-xs text-medical-text-muted font-mono">
                    ID: {prescription.medicineId}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedPrescription(prescription);
                  setShowRemoveModal(true);
                }}
                className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                data-testid={`button-remove-${prescription.id}`}
              >
                <i className="fas fa-trash mr-1"></i>Remove
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add Prescription Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-medical-border p-6 max-w-md mx-4 w-full">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-plus text-green-600 text-xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-medical-text-primary">Add Prescription</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-medical-text-primary mb-2">
                  Select Medicine
                </label>
                <select
                  value={selectedMedicine?.id || ''}
                  onChange={(e) => {
                    const medicine = unprescribedMedicines.find(m => m.id === e.target.value);
                    setSelectedMedicine(medicine || null);
                  }}
                  className="w-full p-3 border border-medical-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary"
                  data-testid="select-add-medicine"
                >
                  <option value="">Choose a medicine...</option>
                  {unprescribedMedicines.map(medicine => (
                    <option key={medicine.id} value={medicine.id}>
                      {medicine.name} ({medicine.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-medical-text-primary mb-2">
                  PIN Code
                </label>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter 4-digit PIN"
                  className="w-full p-3 border border-medical-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary text-center tracking-widest"
                  maxLength={4}
                  data-testid="input-add-pin"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm font-medium">{error}</p>
                </div>
              )}
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedMedicine(null);
                  setPin("");
                  setError("");
                }}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                data-testid="button-cancel-add"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPrescription}
                disabled={addPrescriptionMutation.isPending}
                className="flex-1 px-4 py-2 bg-medical-primary text-white rounded-lg hover:bg-medical-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                data-testid="button-confirm-add"
              >
                {addPrescriptionMutation.isPending ? (
                  <><i className="fas fa-spinner fa-spin mr-2"></i>Adding...</>
                ) : (
                  <><i className="fas fa-plus mr-2"></i>Add Prescription</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Prescription Modal */}
      {showRemoveModal && selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-medical-border p-6 max-w-md mx-4 w-full">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-trash text-red-600 text-xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-medical-text-primary">Remove Prescription</h3>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-800 mb-2">
                Are you sure you want to remove <strong>{selectedPrescription.medicine?.name}</strong> from this patient's prescriptions?
              </p>
              <p className="text-xs text-gray-600">
                This action cannot be undone.
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-medical-text-primary mb-2">
                PIN Code Required
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter 4-digit PIN"
                className="w-full p-3 border border-medical-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary text-center tracking-widest"
                maxLength={4}
                data-testid="input-remove-pin"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowRemoveModal(false);
                  setSelectedPrescription(null);
                  setPin("");
                  setError("");
                }}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                data-testid="button-cancel-remove"
              >
                Cancel
              </button>
              <button
                onClick={handleRemovePrescription}
                disabled={removePrescriptionMutation.isPending}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                data-testid="button-confirm-remove"
              >
                {removePrescriptionMutation.isPending ? (
                  <><i className="fas fa-spinner fa-spin mr-2"></i>Removing...</>
                ) : (
                  <><i className="fas fa-trash mr-2"></i>Remove Prescription</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}