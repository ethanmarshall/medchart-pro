import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type InsertPatient } from "@shared/schema";

interface PatientFormProps {
  onPatientAdded: () => void;
}

const generateNewPatientId = () => {
  return Math.floor(100000000000 + Math.random() * 900000000000).toString();
};

export function PatientForm({ onPatientAdded }: PatientFormProps) {
  const [generatedId] = useState(() => generateNewPatientId());
  const [formData, setFormData] = useState<Omit<InsertPatient, 'id' | 'chartData'>>({
    name: '',
    dob: '',
    age: 0,
    doseWeight: '',
    sex: 'Female',
    mrn: '',
    fin: '',
    admitted: '',
    codeStatus: 'Full Code',
    isolation: 'None',
    bed: '',
    allergies: 'None',
    status: 'Stable',
    provider: '',
    notes: '',
    department: 'Labor & Delivery'
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createPatientMutation = useMutation({
    mutationFn: async (patient: InsertPatient) => {
      const response = await apiRequest('POST', '/api/patients', patient);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Patient registered successfully",
        description: `${data.name} has been added with ID: ${data.id}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/patients'] });
      onPatientAdded();
    },
    onError: () => {
      toast({
        title: "Registration failed",
        description: "Failed to register patient. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'age' ? parseInt(value, 10) || 0 : value 
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const patient: InsertPatient = {
      ...formData,
      id: generatedId,
      chartData: {
        background: '',
        summary: '',
        discharge: '',
        handoff: ''
      }
    };
    createPatientMutation.mutate(patient);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-medical-text-primary mb-2">Register New Patient</h3>
        <p className="text-medical-text-muted">Enter complete patient information for medical record creation</p>
      </div>

      {/* Generated Patient ID Display */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
        <p className="text-sm font-medium text-medical-text-secondary mb-1">Generated Patient ID (Barcode)</p>
        <p className="text-2xl font-mono font-bold text-medical-primary" data-testid="text-generated-id">{generatedId}</p>
        <p className="text-xs text-medical-text-muted mt-1">This ID will be printed on the patient wristband</p>
      </div>

      {/* Patient Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Personal Information */}
        <div className="space-y-4">
          <h4 className="font-semibold text-medical-text-primary border-b border-medical-border pb-2">Personal Information</h4>
          
          <div>
            <label className="block text-sm font-medium text-medical-text-secondary mb-2">Full Name *</label>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              required 
              className="w-full p-3 border border-medical-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary focus:border-transparent" 
              placeholder="Enter patient's full name"
              data-testid="input-patient-name"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-medical-text-secondary mb-2">Date of Birth *</label>
              <input 
                type="date" 
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                required 
                className="w-full p-3 border border-medical-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary focus:border-transparent"
                data-testid="input-patient-dob"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-medical-text-secondary mb-2">Age *</label>
              <input 
                type="number" 
                name="age"
                value={formData.age}
                onChange={handleChange}
                required 
                className="w-full p-3 border border-medical-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary focus:border-transparent" 
                placeholder="Age"
                data-testid="input-patient-age"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-medical-text-secondary mb-2">Sex *</label>
              <select 
                name="sex"
                value={formData.sex}
                onChange={handleChange}
                required 
                className="w-full p-3 border border-medical-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary focus:border-transparent bg-white"
                data-testid="select-patient-sex"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-medical-text-secondary mb-2">Dose Weight *</label>
              <input 
                type="text" 
                name="doseWeight"
                value={formData.doseWeight}
                onChange={handleChange}
                required 
                className="w-full p-3 border border-medical-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary focus:border-transparent" 
                placeholder="e.g., 70 kg"
                data-testid="input-patient-weight"
              />
            </div>
          </div>
        </div>

        {/* Medical Information */}
        <div className="space-y-4">
          <h4 className="font-semibold text-medical-text-primary border-b border-medical-border pb-2">Medical Information</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-medical-text-secondary mb-2">MRN *</label>
              <input 
                type="text" 
                name="mrn"
                value={formData.mrn}
                onChange={handleChange}
                required 
                className="w-full p-3 border border-medical-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary focus:border-transparent" 
                placeholder="Medical Record Number"
                data-testid="input-patient-mrn"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-medical-text-secondary mb-2">FIN *</label>
              <input 
                type="text" 
                name="fin"
                value={formData.fin}
                onChange={handleChange}
                required 
                className="w-full p-3 border border-medical-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary focus:border-transparent" 
                placeholder="Financial Number"
                data-testid="input-patient-fin"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-medical-text-secondary mb-2">Admission Date *</label>
            <input 
              type="date" 
              name="admitted"
              value={formData.admitted}
              onChange={handleChange}
              required 
              className="w-full p-3 border border-medical-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary focus:border-transparent"
              data-testid="input-patient-admitted"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-medical-text-secondary mb-2">Code Status *</label>
            <select 
              name="codeStatus"
              value={formData.codeStatus}
              onChange={handleChange}
              required 
              className="w-full p-3 border border-medical-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary focus:border-transparent bg-white"
              data-testid="select-patient-code-status"
            >
              <option value="Full Code">Full Code</option>
              <option value="DNR/DNI">DNR/DNI</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-medical-text-secondary mb-2">Isolation Precautions</label>
            <select 
              name="isolation"
              value={formData.isolation}
              onChange={handleChange}
              className="w-full p-3 border border-medical-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary focus:border-transparent bg-white"
              data-testid="select-patient-isolation"
            >
              <option value="None">None</option>
              <option value="Contact Precautions">Contact Precautions</option>
              <option value="Droplet Precautions">Droplet Precautions</option>
              <option value="Airborne Precautions">Airborne Precautions</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-medical-text-secondary mb-2">Department *</label>
            <select 
              name="department"
              value={formData.department}
              onChange={handleChange}
              required 
              className="w-full p-3 border border-medical-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary focus:border-transparent bg-white"
              data-testid="select-patient-department"
            >
              <option value="Labor & Delivery">Labor & Delivery</option>
              <option value="Postpartum">Postpartum</option>
              <option value="Newborn">Newborn</option>
              <option value="Medical">Medical</option>
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-medical-text-secondary mb-2">Bed Assignment *</label>
              <input 
                type="text" 
                name="bed"
                value={formData.bed}
                onChange={handleChange}
                required 
                className="w-full p-3 border border-medical-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary focus:border-transparent" 
                placeholder="e.g., LD-102"
                data-testid="input-patient-bed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-medical-text-secondary mb-2">Status *</label>
              <select 
                name="status"
                value={formData.status}
                onChange={handleChange}
                required 
                className="w-full p-3 border border-medical-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary focus:border-transparent bg-white"
                data-testid="select-patient-status"
              >
                <option value="Stable">Stable</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Critical">Critical</option>
                <option value="Active Labor">Active Labor</option>
                <option value="Recovering">Recovering</option>
                <option value="Improving">Improving</option>
                <option value="Healthy">Healthy</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-medical-text-secondary mb-2">Attending Provider *</label>
            <input 
              type="text" 
              name="provider"
              value={formData.provider}
              onChange={handleChange}
              required 
              className="w-full p-3 border border-medical-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary focus:border-transparent" 
              placeholder="e.g., Dr. Sarah Johnson"
              data-testid="input-patient-provider"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-medical-text-secondary mb-2">Allergies</label>
            <input 
              type="text" 
              name="allergies"
              value={formData.allergies}
              onChange={handleChange}
              className="w-full p-3 border border-medical-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary focus:border-transparent" 
              placeholder="e.g., Penicillin, None"
              data-testid="input-patient-allergies"
            />
          </div>
        </div>
      </div>
      
      {/* Additional Notes */}
      <div className="space-y-4">
        <h4 className="font-semibold text-medical-text-primary border-b border-medical-border pb-2">Clinical Notes</h4>
        <div>
          <label className="block text-sm font-medium text-medical-text-secondary mb-2">Notes</label>
          <textarea 
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="w-full p-3 border border-medical-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary focus:border-transparent resize-none" 
            placeholder="Clinical notes, care instructions, or observations..."
            data-testid="textarea-patient-notes"
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-center space-x-4 pt-6 border-t border-medical-border">
        <button 
          type="button" 
          onClick={onPatientAdded}
          className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
          data-testid="button-cancel-registration"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={createPatientMutation.isPending}
          className="px-6 py-3 bg-medical-primary hover:bg-teal-800 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50"
          data-testid="button-save-patient"
        >
          <i className="fas fa-save mr-2"></i>
          {createPatientMutation.isPending ? 'Saving...' : 'Save Patient'}
        </button>
      </div>
    </form>
  );
}
