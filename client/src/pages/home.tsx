import { useState } from "react";
import { Link } from "wouter";
import { PatientScanner } from "@/components/patient-scanner";
import { PatientForm } from "@/components/patient-form";
import { PatientChart } from "@/components/patient-chart";
import { DatabaseManagement } from "@/components/database-management";
import { type Patient } from "@shared/schema";

export default function Home() {
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);
  const [activeTab, setActiveTab] = useState<'scan' | 'add'>('scan');
  const [showDbManagement, setShowDbManagement] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState("");

  const handlePatientFound = (patient: Patient) => {
    setCurrentPatient(patient);
  };

  const handlePatientAdded = () => {
    setActiveTab('scan');
  };

  const handleClearPatient = () => {
    setCurrentPatient(null);
  };

  const handleProfileClick = () => {
    setShowPinModal(true);
    setPin("");
  };

  const handlePinSubmit = () => {
    if (pin === "149500") {
      setShowPinModal(false);
      setShowDbManagement(true);
    } else {
      alert("Incorrect PIN. Access denied.");
    }
    setPin("");
  };

  const handleCloseDbManagement = () => {
    setShowDbManagement(false);
  };

  if (currentPatient) {
    return <PatientChart patient={currentPatient} onClear={handleClearPatient} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-background to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-medical-border shadow-sm" data-testid="header-main">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-medical-primary rounded-lg flex items-center justify-center">
                <i className="fas fa-hospital-symbol text-white text-lg"></i>
              </div>
              <div>
                <h1 className="text-xl font-bold text-medical-text-primary">MedChart Pro</h1>
                <p className="text-sm text-medical-text-muted">Patient Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <button className="bg-medical-secondary hover:bg-cyan-900 text-white px-4 py-2 rounded-lg font-medium transition-colors" data-testid="link-dashboard">
                  <i className="fas fa-tachometer-alt mr-2"></i>Dashboard
                </button>
              </Link>
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-medical-text-primary">Dr. Sarah Johnson</p>
                <p className="text-xs text-medical-text-muted">Internal Medicine</p>
              </div>
              <button 
                onClick={handleProfileClick}
                className="w-8 h-8 bg-medical-secondary rounded-full flex items-center justify-center hover:bg-medical-secondary/90 transition-colors"
                data-testid="button-profile"
              >
                <i className="fas fa-user text-white text-sm"></i>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-medical-text-primary mb-2">Patient Chart System</h2>
          <p className="text-medical-text-secondary max-w-2xl mx-auto">
            Securely manage patient records, verify medications, and track administration with our comprehensive healthcare platform.
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-medical border border-medical-border p-6 hover:shadow-medical-lg transition-shadow duration-200">
            <div className="flex items-center justify-center w-12 h-12 bg-medical-primary rounded-lg mb-4 mx-auto">
              <i className="fas fa-qrcode text-white text-xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-medical-text-primary text-center mb-2">Scan Patient</h3>
            <p className="text-medical-text-muted text-center text-sm mb-4">Quickly access patient records using barcode scanner</p>
            <button 
              onClick={() => setActiveTab('scan')}
              className="w-full bg-medical-primary hover:bg-teal-800 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              data-testid="button-scan-patient"
            >
              Start Scanning
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-medical border border-medical-border p-6 hover:shadow-medical-lg transition-shadow duration-200">
            <div className="flex items-center justify-center w-12 h-12 bg-medical-secondary rounded-lg mb-4 mx-auto">
              <i className="fas fa-user-plus text-white text-xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-medical-text-primary text-center mb-2">New Patient</h3>
            <p className="text-medical-text-muted text-center text-sm mb-4">Register a new patient in the system</p>
            <button 
              onClick={() => setActiveTab('add')}
              className="w-full bg-medical-secondary hover:bg-cyan-900 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              data-testid="button-add-patient"
            >
              Add Patient
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-medical border border-medical-border p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-slate-600 rounded-lg mb-4 mx-auto">
              <i className="fas fa-tachometer-alt text-white text-xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-medical-text-primary text-center mb-2">Patient Dashboard</h3>
            <p className="text-medical-text-muted text-center text-sm mb-4">View all patients with filtering options</p>
            <Link href="/dashboard">
              <button className="w-full bg-slate-600 hover:bg-slate-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200" data-testid="button-view-dashboard">
                View Dashboard
              </button>
            </Link>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-white rounded-xl shadow-medical border border-medical-border">
          {/* Tab Navigation */}
          <div className="border-b border-medical-border">
            <nav className="flex justify-center" aria-label="Tabs">
              <button 
                onClick={() => setActiveTab('scan')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'scan' 
                    ? 'border-medical-primary text-medical-primary' 
                    : 'border-transparent text-medical-text-muted hover:text-medical-text-primary hover:border-gray-300'
                }`}
                data-testid="tab-scan"
              >
                <i className="fas fa-qrcode mr-2"></i>Scan Patient
              </button>
              <button 
                onClick={() => setActiveTab('add')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'add' 
                    ? 'border-medical-primary text-medical-primary' 
                    : 'border-transparent text-medical-text-muted hover:text-medical-text-primary hover:border-gray-300'
                }`}
                data-testid="tab-add"
              >
                <i className="fas fa-user-plus mr-2"></i>Register Patient
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'scan' ? (
              <PatientScanner onPatientFound={handlePatientFound} />
            ) : (
              <PatientForm onPatientAdded={handlePatientAdded} />
            )}
          </div>
        </div>
      </div>

      {/* PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-medical-border p-6 max-w-md mx-4 w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-medical-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-lock text-white text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-medical-text-primary mb-2">Database Management Access</h3>
              <p className="text-medical-text-secondary mb-6">Enter PIN to access database management</p>
              
              <div className="mb-6">
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter PIN"
                  className="w-full p-4 text-center text-2xl font-mono border border-medical-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary"
                  maxLength={6}
                  data-testid="input-pin"
                  onKeyPress={(e) => e.key === 'Enter' && handlePinSubmit()}
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {setShowPinModal(false); setPin("");}}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  data-testid="button-cancel-pin"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePinSubmit}
                  disabled={!pin}
                  className="flex-1 px-4 py-3 bg-medical-primary text-white rounded-lg hover:bg-medical-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  data-testid="button-submit-pin"
                >
                  Access
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Database Management Modal */}
      <DatabaseManagement 
        isOpen={showDbManagement} 
        onClose={handleCloseDbManagement} 
      />
    </div>
  );
}
