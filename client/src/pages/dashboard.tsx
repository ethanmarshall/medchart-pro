import { useState } from "react";
import { Link } from "wouter";
import { PatientDashboard } from "@/components/patient-dashboard";
import { PatientChart } from "@/components/patient-chart";
import { DatabaseManagement } from "@/components/database-management";
import { ThemeToggle } from "@/components/theme-toggle";
import { type Patient } from "@shared/schema";

export default function Dashboard() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showDbManagement, setShowDbManagement] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState("");

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
  };

  const handleClearPatient = () => {
    setSelectedPatient(null);
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
              <ThemeToggle />
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
          <h2 className="text-3xl font-bold text-medical-text-primary mb-2">Patient Dashboard</h2>
          <p className="text-medical-text-secondary max-w-2xl mx-auto">
            Monitor all patients at a glance with filtering by department and comprehensive patient information.
          </p>
        </div>

        <PatientDashboard onPatientSelect={handlePatientSelect} />
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