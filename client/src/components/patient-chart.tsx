import { useState } from "react";
import { type Patient } from "@shared/schema";
import { MedicationAdmin } from "./medication-admin";

interface PatientChartProps {
  patient: Patient;
  onClear: () => void;
}

export function PatientChart({ patient, onClear }: PatientChartProps) {
  const [activeTab, setActiveTab] = useState<'medication' | 'chart' | 'history'>('medication');

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
              <button 
                onClick={onClear}
                className="text-medical-text-muted hover:text-medical-text-primary"
                data-testid="button-close-patient"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
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
                <p className="font-semibold text-medical-text-primary" data-testid="text-patient-code-status">{patient.codeStatus}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-xs font-medium text-medical-text-muted uppercase tracking-wide">Isolation</p>
                <p className={`font-semibold ${patient.isolation === 'None' ? 'text-medical-success' : 'text-medical-warning'}`} data-testid="text-patient-isolation">{patient.isolation}</p>
              </div>
            </div>
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
            <h3 className="text-lg font-semibold text-medical-text-primary mb-4">Administration History</h3>
            <div className="text-center py-8 text-medical-text-muted">
              <i className="fas fa-history text-3xl mb-2 opacity-50"></i>
              <p className="text-sm">Administration history will be displayed here.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
