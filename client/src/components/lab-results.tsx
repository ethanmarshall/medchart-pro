import { useQuery } from "@tanstack/react-query";
import { type Patient, type LabResult } from "@shared/schema";

interface LabResultsProps {
  patient: Patient;
}

export function LabResults({ patient }: LabResultsProps) {
  const { data: labResults = [], isLoading } = useQuery<LabResult[]>({
    queryKey: ['/api/patients', patient.id, 'lab-results'],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical':
        return 'fas fa-exclamation-triangle';
      case 'high':
        return 'fas fa-arrow-up';
      case 'low':
        return 'fas fa-arrow-down';
      default:
        return 'fas fa-check-circle';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-medical border border-medical-border p-6">
        <div className="flex items-center space-x-2 mb-4">
          <i className="fas fa-spinner fa-spin text-medical-primary"></i>
          <span className="text-medical-text-primary">Loading lab results...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-medical border border-medical-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-medical-text-primary">
          <i className="fas fa-vial text-medical-primary mr-2"></i>Laboratory Results
        </h3>
        <div className="text-sm text-medical-text-muted">
          {labResults.length} result{labResults.length !== 1 ? 's' : ''}
        </div>
      </div>

      {labResults.length === 0 ? (
        <div className="text-center py-12 text-medical-text-muted">
          <i className="fas fa-vial text-6xl mb-4 opacity-20"></i>
          <p className="text-lg font-medium mb-2">No Lab Results</p>
          <p className="text-sm">No laboratory test results available for this patient.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {labResults
            .sort((a, b) => {
              const aDate = a.takenAt ? new Date(a.takenAt).getTime() : 0;
              const bDate = b.takenAt ? new Date(b.takenAt).getTime() : 0;
              return bDate - aDate;
            })
            .map((result) => (
              <div 
                key={result.id} 
                className="border border-medical-border rounded-lg p-4 hover:shadow-sm transition-shadow relative"
                data-testid={`lab-result-${result.id}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-20">
                    <div className="mb-2">
                      <h4 className="font-medium text-medical-text-primary" data-testid={`test-name-${result.id}`}>
                        {result.testName}
                      </h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-medical-text-secondary">Value:</span>
                        <span className="ml-2 text-medical-text-primary" data-testid={`test-value-${result.id}`}>
                          {result.value} {result.unit}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-medical-text-secondary">Reference:</span>
                        <span className="ml-2 text-medical-text-primary" data-testid={`test-reference-${result.id}`}>
                          {result.referenceRange || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-medical-text-secondary">Collected:</span>
                        <span className="ml-2 text-medical-text-primary" data-testid={`test-collected-${result.id}`}>
                          {result.takenAt 
                            ? `${new Date(result.takenAt).toLocaleDateString()} at ${new Date(result.takenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                            : 'Not specified'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(result.status)}`}>
                      <i className={`${getStatusIcon(result.status)} mr-1`}></i>
                      {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}