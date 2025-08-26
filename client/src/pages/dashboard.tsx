import { useState } from "react";
import { Link } from "wouter";
import { PatientDashboard } from "@/components/patient-dashboard";
import { PatientChart } from "@/components/patient-chart";
import { type Patient } from "@shared/schema";

export default function Dashboard() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
  };

  const handleClearPatient = () => {
    setSelectedPatient(null);
  };

  if (selectedPatient) {
    return <PatientChart patient={selectedPatient} onClear={handleClearPatient} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-background to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-medical-border shadow-sm" data-testid="header-dashboard">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-medical-primary rounded-lg flex items-center justify-center">
                <i className="fas fa-hospital-symbol text-white text-lg"></i>
              </div>
              <div>
                <h1 className="text-xl font-bold text-medical-text-primary">MedChart Pro</h1>
                <p className="text-sm text-medical-text-muted">Patient Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/">
                <button className="bg-medical-secondary hover:bg-cyan-900 text-white px-4 py-2 rounded-lg font-medium transition-colors" data-testid="link-home">
                  <i className="fas fa-home mr-2"></i>Home
                </button>
              </Link>
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-medical-text-primary">Dr. Sarah Johnson</p>
                <p className="text-xs text-medical-text-muted">Internal Medicine</p>
              </div>
              <div className="w-8 h-8 bg-medical-secondary rounded-full flex items-center justify-center">
                <i className="fas fa-user text-white text-sm"></i>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-medical-text-primary mb-2">Patient Dashboard</h2>
          <p className="text-medical-text-secondary max-w-2xl mx-auto">
            Monitor all patients at a glance with filtering by department and comprehensive patient information.
          </p>
        </div>

        <PatientDashboard onPatientSelect={handlePatientSelect} />
      </div>
    </div>
  );
}