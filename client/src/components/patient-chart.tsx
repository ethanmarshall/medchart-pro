import { useState } from "react";
import { type Patient, type Administration, type Medicine } from "@shared/schema";
import { MedicationAdmin } from "./medication-admin";
import { AuditLogComponent } from "./audit-log";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface PatientChartProps {
  patient: Patient;
  onClear: () => void;
}

export function PatientChart({ patient, onClear }: PatientChartProps) {
  const [activeTab, setActiveTab] = useState<'medication' | 'chart' | 'history' | 'audit'>('medication');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    notes: patient.notes,
    status: patient.status,
    provider: patient.provider,
    allergies: patient.allergies,
    codeStatus: patient.codeStatus,
    isolation: patient.isolation
  });

  // Get administrations and medicines for history tab
  const { data: administrations = [] } = useQuery<Administration[]>({
    queryKey: ['/api/patients', patient.id, 'administrations'],
  });
  
  const { data: medicines = [] } = useQuery<Medicine[]>({
    queryKey: ['/api/medicines'],
  });
  
  const queryClient = useQueryClient();
  
  const updatePatientMutation = useMutation({
    mutationFn: async (updates: any) => {
      const response = await apiRequest('PATCH', `/api/patients/${patient.id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/patients', patient.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/patients'] });
      setIsEditing(false);
    },
  });
  
  const handleSaveEdit = () => {
    updatePatientMutation.mutate(editData);
  };
  
  const handleCancelEdit = () => {
    setEditData({
      notes: patient.notes,
      status: patient.status,
      provider: patient.provider,
      allergies: patient.allergies,
      codeStatus: patient.codeStatus,
      isolation: patient.isolation
    });
    setIsEditing(false);
  };
  
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'stable': return 'bg-green-100 text-green-800 border-green-200';
      case 'good': return 'bg-green-100 text-green-800 border-green-200';
      case 'improving': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-background to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Patient Header Card */}
        <div className="bg-white rounded-xl shadow-medical border border-medical-border">
          <div className="p-6 border-b border-medical-border">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-medical-primary to-teal-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {getInitials(patient.name)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-medical-text-primary" data-testid="text-patient-name">{patient.name}</h2>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-medical-text-muted">{patient.age} years old</span>
                    <span className="text-medical-text-muted">•</span>
                    <span className="text-medical-text-muted">{patient.sex}</span>
                    <span className="text-medical-text-muted">•</span>
                    <span className="text-medical-text-muted">{patient.doseWeight}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isEditing 
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                      : 'bg-medical-primary text-white hover:bg-medical-primary/90'
                  }`}
                  data-testid="button-edit-patient"
                >
                  <i className={`fas ${isEditing ? 'fa-times' : 'fa-edit'} mr-2`}></i>
                  {isEditing ? 'Cancel' : 'Edit'}
                </button>
                <button 
                  onClick={onClear}
                  className="text-medical-text-muted hover:text-medical-text-primary p-2"
                  data-testid="button-close-patient"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
            </div>
            
            {/* Patient Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-xs font-medium text-medical-text-muted uppercase tracking-wide">MRN</p>
                <p className="font-mono font-semibold text-medical-text-primary" data-testid="text-patient-mrn">{patient.mrn}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-xs font-medium text-medical-text-muted uppercase tracking-wide">Admitted</p>
                <p className="font-semibold text-medical-text-primary" data-testid="text-patient-admitted">{formatDate(patient.admitted)}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-xs font-medium text-medical-text-muted uppercase tracking-wide">Code Status</p>
                {isEditing ? (
                  <select 
                    value={editData.codeStatus}
                    onChange={(e) => setEditData({...editData, codeStatus: e.target.value})}
                    className="w-full mt-1 p-1 border rounded text-sm"
                    data-testid="select-code-status"
                  >
                    <option value="Full Code">Full Code</option>
                    <option value="DNR">DNR</option>
                    <option value="DNR/DNI">DNR/DNI</option>
                    <option value="Comfort Care">Comfort Care</option>
                  </select>
                ) : (
                  <p className="font-semibold text-medical-text-primary" data-testid="text-patient-code-status">{patient.codeStatus}</p>
                )}
              </div>
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-xs font-medium text-medical-text-muted uppercase tracking-wide">Status</p>
                {isEditing ? (
                  <select 
                    value={editData.status}
                    onChange={(e) => setEditData({...editData, status: e.target.value})}
                    className="w-full mt-1 p-1 border rounded text-sm"
                    data-testid="select-status"
                  >
                    <option value="Stable">Stable</option>
                    <option value="Critical">Critical</option>
                    <option value="Good">Good</option>
                    <option value="Improving">Improving</option>
                    <option value="Fair">Fair</option>
                    <option value="Healthy">Healthy</option>
                  </select>
                ) : (
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(patient.status)}`} data-testid="text-patient-status">
                    {patient.status}
                  </span>
                )}
              </div>
            </div>
            
            {/* Extended Patient Info - Editable */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-xs font-medium text-medical-text-muted uppercase tracking-wide mb-2">Provider</p>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={editData.provider}
                    onChange={(e) => setEditData({...editData, provider: e.target.value})}
                    className="w-full p-2 border rounded text-sm"
                    placeholder="Enter provider name"
                    data-testid="input-provider"
                  />
                ) : (
                  <p className="text-sm text-medical-text-primary" data-testid="text-patient-provider">{patient.provider}</p>
                )}
              </div>
              
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-xs font-medium text-medical-text-muted uppercase tracking-wide mb-2">Allergies</p>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={editData.allergies}
                    onChange={(e) => setEditData({...editData, allergies: e.target.value})}
                    className="w-full p-2 border rounded text-sm"
                    placeholder="Enter known allergies"
                    data-testid="input-allergies"
                  />
                ) : (
                  <p className={`text-sm ${
                    patient.allergies && patient.allergies.toLowerCase() !== 'none' 
                      ? 'text-red-600 font-medium' 
                      : 'text-medical-text-primary'
                  }`} data-testid="text-patient-allergies">
                    {patient.allergies}
                  </p>
                )}
              </div>
              
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-xs font-medium text-medical-text-muted uppercase tracking-wide mb-2">Isolation</p>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={editData.isolation}
                    onChange={(e) => setEditData({...editData, isolation: e.target.value})}
                    className="w-full p-2 border rounded text-sm"
                    placeholder="Isolation precautions"
                    data-testid="input-isolation"
                  />
                ) : (
                  <p className="text-sm text-medical-text-primary" data-testid="text-patient-isolation">{patient.isolation}</p>
                )}
              </div>
              
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-xs font-medium text-medical-text-muted uppercase tracking-wide mb-2">Notes</p>
                {isEditing ? (
                  <textarea 
                    value={editData.notes}
                    onChange={(e) => setEditData({...editData, notes: e.target.value})}
                    className="w-full p-2 border rounded text-sm h-20 resize-none"
                    placeholder="Add clinical notes..."
                    data-testid="textarea-notes"
                  />
                ) : (
                  <p className="text-sm text-medical-text-primary" data-testid="text-patient-notes">{patient.notes}</p>
                )}
              </div>
            </div>
            
            {/* Save/Cancel Buttons */}
            {isEditing && (
              <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-medical-border">
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                  data-testid="button-cancel-edit"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={updatePatientMutation.isPending}
                  className="px-6 py-2 bg-medical-primary text-white text-sm font-medium rounded-lg hover:bg-medical-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  data-testid="button-save-edit"
                >
                  {updatePatientMutation.isPending ? (
                    <><i className="fas fa-spinner fa-spin mr-2"></i>Saving...</>
                  ) : (
                    <><i className="fas fa-save mr-2"></i>Save Changes</>
                  )}
                </button>
              </div>
            )}
          </div>
          
          {/* Patient Navigation Tabs */}
          <div className="px-6">
            <nav className="flex space-x-8" aria-label="Patient Tabs">
              <button 
                onClick={() => setActiveTab('medication')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'medication'
                    ? 'border-medical-primary text-medical-primary'
                    : 'border-transparent text-medical-text-muted hover:text-medical-text-primary'
                }`}
                data-testid="tab-medication"
              >
                <i className="fas fa-pills mr-2"></i>Medication Administration
              </button>
              <button 
                onClick={() => setActiveTab('chart')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'chart'
                    ? 'border-medical-primary text-medical-primary'
                    : 'border-transparent text-medical-text-muted hover:text-medical-text-primary'
                }`}
                data-testid="tab-chart"
              >
                <i className="fas fa-file-medical mr-2"></i>Chart Data
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'history'
                    ? 'border-medical-primary text-medical-primary'
                    : 'border-transparent text-medical-text-muted hover:text-medical-text-primary'
                }`}
                data-testid="tab-history"
              >
                <i className="fas fa-history mr-2"></i>Administration History
              </button>
              <button 
                onClick={() => setActiveTab('audit')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'audit'
                    ? 'border-medical-primary text-medical-primary'
                    : 'border-transparent text-medical-text-muted hover:text-medical-text-primary'
                }`}
                data-testid="tab-audit-log"
              >
                <i className="fas fa-clipboard-list mr-2"></i>Change Log
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'medication' && <MedicationAdmin patient={patient} />}
        
        {activeTab === 'chart' && (
          <div className="bg-white rounded-xl shadow-medical border border-medical-border p-6">
            <h3 className="text-lg font-semibold text-medical-text-primary mb-4">Chart Data</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-medical-text-primary mb-2">Background</h4>
                <div className="prose max-w-none text-sm" dangerouslySetInnerHTML={{ __html: patient.chartData?.background || '<p>No background information available.</p>' }}></div>
              </div>
              <div>
                <h4 className="font-medium text-medical-text-primary mb-2">Summary</h4>
                <div className="prose max-w-none text-sm" dangerouslySetInnerHTML={{ __html: patient.chartData?.summary || '<p>No summary available.</p>' }}></div>
              </div>
              <div>
                <h4 className="font-medium text-medical-text-primary mb-2">Discharge Plan</h4>
                <div className="prose max-w-none text-sm" dangerouslySetInnerHTML={{ __html: patient.chartData?.discharge || '<p>No discharge plan available.</p>' }}></div>
              </div>
              <div>
                <h4 className="font-medium text-medical-text-primary mb-2">Handoff</h4>
                <div className="prose max-w-none text-sm" dangerouslySetInnerHTML={{ __html: patient.chartData?.handoff || '<p>No handoff information available.</p>' }}></div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-xl shadow-medical border border-medical-border p-6">
            <h3 className="text-lg font-semibold text-medical-text-primary mb-4">
              <i className="fas fa-history text-medical-primary mr-2"></i>Administration History
            </h3>
            
            {administrations.length === 0 ? (
              <div className="text-center py-8 text-medical-text-muted">
                <i className="fas fa-history text-4xl mb-4 opacity-30"></i>
                <p className="text-lg font-medium mb-2">No Administrations Yet</p>
                <p className="text-sm">Medication administrations will appear here once medicines are scanned.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {administrations
                  .sort((a, b) => new Date(b.administeredAt || 0).getTime() - new Date(a.administeredAt || 0).getTime())
                  .map((admin) => {
                    const medicine = medicines.find(m => m.id === admin.medicineId);
                    const statusColor = admin.status === 'success' ? 'text-green-600' : 
                                       admin.status === 'warning' ? 'text-yellow-600' : 'text-red-600';
                    const bgColor = admin.status === 'success' ? 'bg-green-50 border-green-200' : 
                                   admin.status === 'warning' ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200';
                    
                    return (
                      <div 
                        key={admin.id} 
                        className={`p-4 rounded-lg border ${bgColor}`}
                        data-testid={`admin-history-${admin.id}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${statusColor.replace('text-', 'bg-')}`}></div>
                            <div>
                              <h4 className="font-medium text-medical-text-primary">
                                {medicine?.name || `Medicine ID: ${admin.medicineId}`}
                              </h4>
                              <p className="text-xs text-medical-text-muted font-mono">ID: {admin.medicineId}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColor} ${bgColor}`}>
                              <i className={`fas ${admin.status === 'success' ? 'fa-check' : admin.status === 'warning' ? 'fa-exclamation-triangle' : 'fa-times'} mr-1`}></i>
                              {admin.status.toUpperCase()}
                            </span>
                            {admin.administeredAt && (
                              <p className="text-xs text-medical-text-muted mt-1">
                                {new Date(admin.administeredAt).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                        <p className={`text-sm ${statusColor} font-medium`}>{admin.message}</p>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'audit' && (
          <AuditLogComponent 
            entityType="patient" 
            entityId={patient.id} 
            title="Patient Change Log" 
          />
        )}
      </div>
    </div>
  );
}
