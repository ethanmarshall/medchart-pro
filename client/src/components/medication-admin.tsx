import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { type Patient, type Medicine, type Prescription, type Administration } from "@shared/schema";

interface MedicationAdminProps {
  patient: Patient;
}

interface LogEntry {
  message: string;
  type: 'success' | 'warning' | 'error';
  timestamp: string;
}

export function MedicationAdmin({ patient }: MedicationAdminProps) {
  const [log, setLog] = useState<LogEntry[]>([]);
  const medScannerRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    medScannerRef.current?.focus();
  }, []);

  // Get prescriptions for this patient
  const { data: prescriptions = [] } = useQuery<Prescription[]>({
    queryKey: ['/api/patients', patient.id, 'prescriptions'],
  });

  // Get all medicines for lookup
  const { data: medicines = [] } = useQuery<Medicine[]>({
    queryKey: ['/api/medicines'],
  });

  // Get administrations for this patient
  const { data: administrations = [] } = useQuery<Administration[]>({
    queryKey: ['/api/patients', patient.id, 'administrations'],
  });

  const createAdministrationMutation = useMutation({
    mutationFn: async (data: { patientId: string; medicineId: string; status: string; message: string }) => {
      const response = await apiRequest('POST', '/api/administrations', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/patients', patient.id, 'administrations'] });
    },
  });

  const addLogEntry = (message: string, type: LogEntry['type']) => {
    const timestamp = new Date().toLocaleTimeString();
    setLog(prevLog => [{ message, type, timestamp }, ...prevLog]);
  };

  const handleMedKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const medId = e.currentTarget.value.trim();
      if (!medId) return;

      const medicine = medicines.find(m => m.id === medId);
      const prescribedIds = prescriptions.map(p => p.medicineId);

      if (!medicine) {
        const errorMessage = `ERROR: Scanned barcode ${medId} is not a known medicine.`;
        addLogEntry(errorMessage, 'error');
        createAdministrationMutation.mutate({
          patientId: patient.id,
          medicineId: medId,
          status: 'error',
          message: errorMessage
        });
      } else if (!prescribedIds.includes(medId)) {
        const errorMessage = `DANGER: Scanned medicine '${medicine.name}' is NOT prescribed for this patient.`;
        addLogEntry(errorMessage, 'error');
        createAdministrationMutation.mutate({
          patientId: patient.id,
          medicineId: medId,
          status: 'error',
          message: errorMessage
        });
      } else {
        // Check if medicine has been successfully administered before
        const alreadyAdministered = administrations.some(
          adm => adm.medicineId === medId && adm.status === 'success'
        );
        
        if (alreadyAdministered) {
          const warningMessage = `WARNING: '${medicine.name}' has already been administered.`;
          addLogEntry(warningMessage, 'warning');
          createAdministrationMutation.mutate({
            patientId: patient.id,
            medicineId: medId,
            status: 'warning',
            message: warningMessage
          });
        } else {
          const successMessage = `SUCCESS: Administered '${medicine.name}'.`;
          addLogEntry(successMessage, 'success');
          createAdministrationMutation.mutate({
            patientId: patient.id,
            medicineId: medId,
            status: 'success',
            message: successMessage
          });
        }
      }
      
      e.currentTarget.value = '';
    }
  };

  const prescribedMedicines = prescriptions.map(p => {
    const medicine = medicines.find(m => m.id === p.medicineId);
    return { ...p, medicine };
  }).filter(p => p.medicine);

  // Calculate progress based on successful administrations from database
  const successfulAdministrations = administrations.filter(adm => adm.status === 'success');
  const uniqueAdministeredMeds = new Set(successfulAdministrations.map(adm => adm.medicineId));
  const administeredCount = uniqueAdministeredMeds.size;
  const totalCount = prescribedMedicines.length;
  const progressPercentage = totalCount > 0 ? Math.round((administeredCount / totalCount) * 100) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Panel - Scanner & Log */}
      <div className="space-y-6">
        {/* Medicine Scanner */}
        <div className="bg-white rounded-xl shadow-medical border border-medical-border p-6">
          <h3 className="text-lg font-semibold text-medical-text-primary mb-4">
            <i className="fas fa-qrcode text-medical-primary mr-2"></i>Medicine Barcode Scanner
          </h3>
          
          <div className="space-y-4">
            <input 
              ref={medScannerRef}
              type="text" 
              placeholder="Scan or Enter Medicine ID..." 
              onKeyPress={handleMedKeyPress}
              className="w-full text-center text-lg p-4 border-2 border-medical-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary focus:border-transparent transition duration-200"
              data-testid="input-medicine-scanner"
            />
            
            <div className="bg-slate-50 p-4 rounded-lg">
              <h4 className="font-medium text-medical-text-primary mb-2">Scanning Instructions:</h4>
              <ul className="text-sm text-medical-text-muted space-y-1">
                <li>• Scan medicine package barcode</li>
                <li>• System will verify against prescribed medications</li>
                <li>• Confirmation will be logged automatically</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Verification Log */}
        <div className="bg-white rounded-xl shadow-medical border border-medical-border p-6">
          <h3 className="text-lg font-semibold text-medical-text-primary mb-4">
            <i className="fas fa-clipboard-list text-medical-primary mr-2"></i>Verification Log
          </h3>
          
          <div className="h-64 overflow-y-auto bg-slate-50 border border-medical-border rounded-lg p-4 space-y-3">
            {log.length === 0 ? (
              <div className="text-center py-8 text-medical-text-muted">
                <i className="fas fa-clipboard-list text-3xl mb-2 opacity-50"></i>
                <p className="text-sm">Scan history will appear here...</p>
              </div>
            ) : (
              log.map((entry, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    entry.type === 'success' ? 'bg-medical-success' : 
                    entry.type === 'warning' ? 'bg-medical-warning' : 'bg-medical-danger'
                  }`}></div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${
                      entry.type === 'success' ? 'text-medical-success' : 
                      entry.type === 'warning' ? 'text-medical-warning' : 'text-medical-danger font-bold'
                    }`}>
                      {entry.message}
                    </p>
                    <p className="text-xs text-medical-text-muted font-mono">[{entry.timestamp}]</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Prescribed Medicines & Summary */}
      <div className="space-y-6">
        {/* Prescribed Medicines */}
        <div className="bg-white rounded-xl shadow-medical border border-medical-border p-6">
          <h3 className="text-lg font-semibold text-medical-text-primary mb-4">
            <i className="fas fa-prescription-bottle-alt text-medical-primary mr-2"></i>Prescribed Medicines
          </h3>
          
          <div className="space-y-3">
            {prescribedMedicines.length === 0 ? (
              <p className="text-medical-text-muted italic text-center py-4">
                No medications prescribed for this patient.
              </p>
            ) : (
              prescribedMedicines.map((prescription) => {
                // Check if this medicine has been successfully administered
                const successfulAdmin = administrations.find(
                  adm => adm.medicineId === prescription.medicineId && adm.status === 'success'
                );
                const isAdministered = !!successfulAdmin;
                
                return (
                  <div 
                    key={prescription.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      isAdministered 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-amber-50 border-amber-200'
                    }`}
                    data-testid={`medicine-${prescription.medicineId}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        isAdministered ? 'bg-medical-success' : 'bg-medical-warning'
                      }`}></div>
                      <div>
                        <p className="font-medium text-medical-text-primary">{prescription.medicine?.name}</p>
                        <p className="text-xs text-medical-text-muted font-mono">ID: {prescription.medicineId}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${
                        isAdministered ? 'bg-medical-success' : 'bg-medical-warning'
                      }`}>
                        <i className={`fas ${isAdministered ? 'fa-check' : 'fa-clock'} mr-1`}></i>
                        {isAdministered ? 'Administered' : 'Pending'}
                      </span>
                      {isAdministered && successfulAdmin && (
                        <p className="text-xs text-medical-text-muted mt-1">
                          {successfulAdmin.administeredAt?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Administration Summary */}
        <div className="bg-white rounded-xl shadow-medical border border-medical-border p-6">
          <h3 className="text-lg font-semibold text-medical-text-primary mb-4">
            <i className="fas fa-chart-pie text-medical-primary mr-2"></i>Administration Summary
          </h3>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-medical-success" data-testid="count-administered">{administeredCount}</p>
              <p className="text-xs text-medical-text-muted font-medium">Administered</p>
            </div>
            <div className="text-center p-3 bg-amber-50 rounded-lg">
              <p className="text-2xl font-bold text-medical-warning" data-testid="count-pending">{totalCount - administeredCount}</p>
              <p className="text-xs text-medical-text-muted font-medium">Pending</p>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <p className="text-2xl font-bold text-medical-text-primary" data-testid="count-total">{totalCount}</p>
              <p className="text-xs text-medical-text-muted font-medium">Total</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div 
              className="bg-medical-success h-2 rounded-full transition-all duration-300" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <p className="text-center text-sm text-medical-text-muted">
            <span data-testid="progress-percentage">{progressPercentage}% Complete</span> • 
            Last updated: <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
