import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { type Medicine, type Patient } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface DatabaseManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DatabaseManagement({ isOpen, onClose }: DatabaseManagementProps) {
  const [activeTab, setActiveTab] = useState<'medicines' | 'patients'>('medicines');
  const [newMedicine, setNewMedicine] = useState({ id: '', name: '' });
  const [newPatient, setNewPatient] = useState({
    id: '',
    name: '',
    dob: '',
    age: 0,
    sex: '',
    bed: '',
    department: '',
    status: 'Stable'
  });
  
  // Generate random 12-digit ID
  const generatePatientId = () => {
    return Math.floor(100000000000 + Math.random() * 900000000000).toString();
  };
  
  // Handle tab switching
  const handleTabSwitch = (tab: 'medicines' | 'patients') => {
    setActiveTab(tab);
    if (tab === 'patients') {
      setNewPatient(prev => ({
        ...prev,
        id: generatePatientId()
      }));
    }
  };
  
  const queryClient = useQueryClient();
  
  // Get existing medicines and patients
  const { data: medicines = [] } = useQuery<Medicine[]>({
    queryKey: ['/api/medicines'],
  });
  
  const { data: patients = [] } = useQuery<Patient[]>({
    queryKey: ['/api/patients'],
  });

  const addMedicineMutation = useMutation({
    mutationFn: async (medicine: { id: string, name: string }) => {
      const response = await apiRequest('POST', '/api/medicines', medicine);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/medicines'] });
      setNewMedicine({ id: '', name: '' });
    },
  });

  const addPatientMutation = useMutation({
    mutationFn: async (patient: any) => {
      const response = await apiRequest('POST', '/api/patients', patient);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/patients'] });
      setNewPatient({
        id: '',
        name: '',
        dob: '',
        age: 0,
        sex: '',
        bed: '',
        department: '',
        status: 'Stable'
      });
    },
  });

  const handleAddMedicine = () => {
    if (!newMedicine.id || !newMedicine.name) return;
    addMedicineMutation.mutate(newMedicine);
  };

  const handleAddPatient = () => {
    if (!newPatient.id || !newPatient.name) return;
    addPatientMutation.mutate({
      ...newPatient,
      doseWeight: '70 kg', // Default weight
      mrn: 'Generated',
      fin: 'Generated',
      admitted: new Date().toISOString().split('T')[0],
      codeStatus: 'Full Code',
      isolation: 'None',
      allergies: 'None',
      provider: 'System Admin',
      notes: 'Added via database management',
      chartData: {
        background: 'Patient added via admin interface',
        summary: 'New patient entry',
        discharge: 'TBD',
        handoff: 'TBD'
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl border border-medical-border max-w-4xl mx-4 w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-medical-primary text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <i className="fas fa-database text-2xl"></i>
              <div>
                <h2 className="text-xl font-semibold">Database Management</h2>
                <p className="text-medical-primary-light text-sm">Add new medicines and patients</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
              data-testid="button-close-db-management"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-medical-border">
          <div className="flex">
            <button
              onClick={() => handleTabSwitch('medicines')}
              className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'medicines'
                  ? 'border-medical-primary text-medical-primary bg-medical-primary/5'
                  : 'border-transparent text-medical-text-muted hover:text-medical-text-primary'
              }`}
              data-testid="tab-medicines"
            >
              <i className="fas fa-pills mr-2"></i>Medicines ({medicines.length})
            </button>
            <button
              onClick={() => handleTabSwitch('patients')}
              className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'patients'
                  ? 'border-medical-primary text-medical-primary bg-medical-primary/5'
                  : 'border-transparent text-medical-text-muted hover:text-medical-text-primary'
              }`}
              data-testid="tab-patients"
            >
              <i className="fas fa-user-plus mr-2"></i>Patients ({patients.length})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === 'medicines' && (
            <div className="space-y-6">
              {/* Add New Medicine Form */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-medical-text-primary mb-4">
                  <i className="fas fa-plus text-medical-primary mr-2"></i>Add New Medicine
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-medical-text-primary mb-2">
                      Medicine ID/Barcode
                    </label>
                    <input
                      type="text"
                      value={newMedicine.id}
                      onChange={(e) => setNewMedicine(prev => ({ ...prev, id: e.target.value }))}
                      placeholder="e.g., 123456789"
                      className="w-full p-3 border border-medical-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary"
                      data-testid="input-medicine-id"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-medical-text-primary mb-2">
                      Medicine Name
                    </label>
                    <input
                      type="text"
                      value={newMedicine.name}
                      onChange={(e) => setNewMedicine(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Amoxicillin"
                      className="w-full p-3 border border-medical-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary"
                      data-testid="input-medicine-name"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={handleAddMedicine}
                      disabled={!newMedicine.id || !newMedicine.name || addMedicineMutation.isPending}
                      className="w-full px-4 py-3 bg-medical-primary text-white rounded-lg hover:bg-medical-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                      data-testid="button-add-medicine"
                    >
                      {addMedicineMutation.isPending ? (
                        <><i className="fas fa-spinner fa-spin mr-2"></i>Adding...</>
                      ) : (
                        <><i className="fas fa-plus mr-2"></i>Add Medicine</>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Existing Medicines List */}
              <div>
                <h3 className="text-lg font-semibold text-medical-text-primary mb-4">
                  Existing Medicines
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                  {medicines.map(medicine => (
                    <div key={medicine.id} className="bg-white border border-medical-border rounded-lg p-3">
                      <h4 className="font-medium text-medical-text-primary">{medicine.name}</h4>
                      <p className="text-xs text-medical-text-muted font-mono">ID: {medicine.id}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'patients' && (
            <div className="space-y-6">
              {/* Add New Patient Form */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-medical-text-primary mb-4">
                  <i className="fas fa-plus text-medical-primary mr-2"></i>Add New Patient
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-medical-text-primary mb-2">
                      Patient ID/MRN
                    </label>
                    <input
                      type="text"
                      value={newPatient.id}
                      onChange={(e) => setNewPatient(prev => ({ ...prev, id: e.target.value }))}
                      placeholder="e.g., 112233445566"
                      className="w-full p-3 border border-medical-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary"
                      data-testid="input-patient-id"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-medical-text-primary mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={newPatient.name}
                      onChange={(e) => setNewPatient(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., John Smith"
                      className="w-full p-3 border border-medical-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary"
                      data-testid="input-patient-name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-medical-text-primary mb-2">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={newPatient.dob}
                      onChange={(e) => setNewPatient(prev => ({ ...prev, dob: e.target.value }))}
                      className="w-full p-3 border border-medical-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary"
                      data-testid="input-patient-dob"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-medical-text-primary mb-2">
                      Age
                    </label>
                    <input
                      type="number"
                      value={newPatient.age || ''}
                      onChange={(e) => setNewPatient(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                      placeholder="e.g., 45"
                      className="w-full p-3 border border-medical-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary"
                      data-testid="input-patient-age"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-medical-text-primary mb-2">
                      Sex
                    </label>
                    <select
                      value={newPatient.sex}
                      onChange={(e) => setNewPatient(prev => ({ ...prev, sex: e.target.value }))}
                      className="w-full p-3 border border-medical-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary"
                      data-testid="select-patient-sex"
                    >
                      <option value="">Select sex...</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-medical-text-primary mb-2">
                      Bed/Room
                    </label>
                    <input
                      type="text"
                      value={newPatient.bed}
                      onChange={(e) => setNewPatient(prev => ({ ...prev, bed: e.target.value }))}
                      placeholder="e.g., ICU-205"
                      className="w-full p-3 border border-medical-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary"
                      data-testid="input-patient-bed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-medical-text-primary mb-2">
                      Department
                    </label>
                    <input
                      type="text"
                      value={newPatient.department}
                      onChange={(e) => setNewPatient(prev => ({ ...prev, department: e.target.value }))}
                      placeholder="e.g., Emergency"
                      className="w-full p-3 border border-medical-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary"
                      data-testid="input-patient-department"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-medical-text-primary mb-2">
                      Status
                    </label>
                    <select
                      value={newPatient.status}
                      onChange={(e) => setNewPatient(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full p-3 border border-medical-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary"
                      data-testid="select-patient-status"
                    >
                      <option value="Stable">Stable</option>
                      <option value="Critical">Critical</option>
                      <option value="Good">Good</option>
                      <option value="Improving">Improving</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    onClick={handleAddPatient}
                    disabled={!newPatient.id || !newPatient.name || addPatientMutation.isPending}
                    className="px-6 py-3 bg-medical-primary text-white rounded-lg hover:bg-medical-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                    data-testid="button-add-patient"
                  >
                    {addPatientMutation.isPending ? (
                      <><i className="fas fa-spinner fa-spin mr-2"></i>Adding Patient...</>
                    ) : (
                      <><i className="fas fa-user-plus mr-2"></i>Add Patient</>
                    )}
                  </button>
                </div>
              </div>

              {/* Existing Patients List */}
              <div>
                <h3 className="text-lg font-semibold text-medical-text-primary mb-4">
                  Existing Patients
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                  {patients.map(patient => (
                    <div key={patient.id} className="bg-white border border-medical-border rounded-lg p-3">
                      <h4 className="font-medium text-medical-text-primary">{patient.name}</h4>
                      <p className="text-sm text-medical-text-secondary">{patient.department} - {patient.bed}</p>
                      <p className="text-xs text-medical-text-muted font-mono">ID: {patient.id}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}