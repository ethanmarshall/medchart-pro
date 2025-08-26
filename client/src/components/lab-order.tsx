import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type Patient, type LabTestType } from "@shared/schema";

interface LabOrderProps {
  onOrderComplete: () => void;
}

export function LabOrder({ onOrderComplete }: LabOrderProps) {
  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: patients = [], isLoading: patientsLoading } = useQuery<Patient[]>({
    queryKey: ['/api/patients'],
  });

  const { data: availableTests = [], isLoading: testsLoading } = useQuery<LabTestType[]>({
    queryKey: ['/api/lab-test-types'],
  });

  const orderLabsMutation = useMutation({
    mutationFn: async (orderData: { patientId: string, tests: string[], orderDate: string }) => {
      const response = await apiRequest('POST', '/api/lab-orders', orderData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Lab Orders Submitted Successfully",
        description: `${data.resultsCreated} lab results generated for patient`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/patients'] });
      // Reset form
      setSelectedPatient("");
      setSelectedTests([]);
      setOrderDate(new Date().toISOString().split('T')[0]);
      setShowPinModal(false);
      setPin("");
      onOrderComplete();
    },
    onError: () => {
      toast({
        title: "Order Failed",
        description: "Failed to submit lab orders. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleTestToggle = (testCode: string) => {
    setSelectedTests(prev => 
      prev.includes(testCode) 
        ? prev.filter(code => code !== testCode)
        : [...prev, testCode]
    );
  };

  const handleOrderSubmit = () => {
    setError("");
    
    if (!selectedPatient) {
      setError("Please select a patient");
      return;
    }
    
    if (selectedTests.length === 0) {
      setError("Please select at least one test");
      return;
    }
    
    setShowPinModal(true);
  };

  const handlePinSubmit = () => {
    if (pin === "1234") {
      orderLabsMutation.mutate({
        patientId: selectedPatient,
        tests: selectedTests,
        orderDate: orderDate
      });
    } else {
      toast({
        title: "Invalid PIN",
        description: "Incorrect PIN. Lab order cancelled.",
        variant: "destructive",
      });
      setPin("");
    }
  };

  const selectedPatientData = patients.find(p => p.id === selectedPatient);

  return (
    <>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <i className="fas fa-vial text-6xl text-medical-primary mb-4"></i>
          <h3 className="text-2xl font-bold text-medical-text-primary mb-2">Order Laboratory Tests</h3>
          <p className="text-medical-text-muted">Select patient, tests, and date to generate lab results</p>
        </div>

        <div className="space-y-6">
          {/* Patient Selection */}
          <div className="bg-slate-50 rounded-lg p-6">
            <h4 className="font-semibold text-medical-text-primary mb-4">
              <i className="fas fa-user-injured mr-2"></i>Select Patient
            </h4>
            
            {patientsLoading ? (
              <div className="text-center py-4">
                <i className="fas fa-spinner fa-spin text-medical-primary"></i>
                <span className="ml-2">Loading patients...</span>
              </div>
            ) : (
              <select 
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                className="w-full p-3 border border-medical-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary"
                data-testid="select-patient"
              >
                <option value="">Choose a patient...</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name} (ID: {patient.id})
                  </option>
                ))}
              </select>
            )}
            
            {selectedPatientData && (
              <div className="mt-3 p-3 bg-white rounded border border-medical-border">
                <p className="text-sm">
                  <strong>{selectedPatientData.name}</strong> - {selectedPatientData.age} years old, {selectedPatientData.sex} - {selectedPatientData.department}
                </p>
              </div>
            )}
          </div>

          {/* Order Date */}
          <div className="bg-slate-50 rounded-lg p-6">
            <h4 className="font-semibold text-medical-text-primary mb-4">
              <i className="fas fa-calendar mr-2"></i>Order Date
            </h4>
            <input
              type="date"
              value={orderDate}
              onChange={(e) => setOrderDate(e.target.value)}
              className="w-full p-3 border border-medical-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary"
              data-testid="input-order-date"
            />
          </div>

          {/* Test Selection */}
          <div className="bg-slate-50 rounded-lg p-6">
            <h4 className="font-semibold text-medical-text-primary mb-4">
              <i className="fas fa-flask mr-2"></i>Select Laboratory Tests ({selectedTests.length} selected)
            </h4>
            
            {testsLoading ? (
              <div className="text-center py-4">
                <i className="fas fa-spinner fa-spin text-medical-primary"></i>
                <span className="ml-2">Loading test types...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableTests.map(test => (
                <label 
                  key={test.code} 
                  className={`flex items-start p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedTests.includes(test.code)
                      ? 'border-medical-primary bg-teal-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  data-testid={`test-option-${test.code}`}
                >
                  <input
                    type="checkbox"
                    checked={selectedTests.includes(test.code)}
                    onChange={() => handleTestToggle(test.code)}
                    className="mt-1 mr-3"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-medical-text-primary">{test.name}</div>
                    <div className="text-xs text-medical-text-muted mt-1">
                      Code: {test.code} | Reference: {test.referenceRange}
                    </div>
                  </div>
                </label>
                ))}
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700" data-testid="error-message">
              <i className="fas fa-exclamation-triangle mr-2"></i>
              {error}
            </div>
          )}

          {/* Order Button */}
          <div className="text-center">
            <button
              onClick={handleOrderSubmit}
              disabled={orderLabsMutation.isPending}
              className="px-8 py-3 bg-medical-primary hover:bg-teal-800 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50"
              data-testid="button-order-labs"
            >
              <i className="fas fa-vial mr-2"></i>
              {orderLabsMutation.isPending ? 'Processing Order...' : 'Order Laboratory Tests'}
            </button>
          </div>
        </div>
      </div>

      {/* PIN Confirmation Modal */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-medical-border p-6 max-w-md mx-4 w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-medical-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-lock text-white text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-medical-text-primary mb-2">Confirm Lab Order</h3>
              <p className="text-medical-text-secondary mb-4">
                Ordering {selectedTests.length} test{selectedTests.length !== 1 ? 's' : ''} for {selectedPatientData?.name}
              </p>
              <p className="text-medical-text-muted mb-6">Enter PIN to confirm order</p>
              
              <div className="mb-6">
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter PIN"
                  className="w-full p-4 text-center text-2xl font-mono border border-medical-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary"
                  maxLength={4}
                  data-testid="input-lab-pin"
                  onKeyPress={(e) => e.key === 'Enter' && handlePinSubmit()}
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {setShowPinModal(false); setPin("");}}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  data-testid="button-cancel-lab-pin"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePinSubmit}
                  disabled={!pin || orderLabsMutation.isPending}
                  className="flex-1 px-4 py-3 bg-medical-primary text-white rounded-lg hover:bg-medical-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  data-testid="button-confirm-lab-order"
                >
                  {orderLabsMutation.isPending ? 'Ordering...' : 'Confirm Order'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}