import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { type Patient } from "@shared/schema";

interface PatientDashboardProps {
  onPatientSelect: (patient: Patient) => void;
}

type DepartmentFilter = 'All' | 'Labor & Delivery' | 'Newborn' | 'Postpartum';

export function PatientDashboard({ onPatientSelect }: PatientDashboardProps) {
  const [departmentFilter, setDepartmentFilter] = useState<DepartmentFilter>('All');

  const { data: patients = [], isLoading } = useQuery<Patient[]>({
    queryKey: ['/api/patients'],
  });

  const filteredPatients = departmentFilter === 'All' 
    ? patients 
    : patients.filter(patient => patient.department === departmentFilter);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'active labor': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'fair': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'good': 
      case 'stable': 
      case 'healthy': return 'bg-green-100 text-green-800 border-green-200';
      case 'improving':
      case 'recovering': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const hasAllergies = (allergies: string) => {
    return allergies && allergies.toLowerCase() !== 'none';
  };

  const getDepartmentStats = () => {
    const stats = patients.reduce((acc, patient) => {
      acc[patient.department] = (acc[patient.department] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      total: patients.length,
      'Labor & Delivery': stats['Labor & Delivery'] || 0,
      'Newborn': stats['Newborn'] || 0,
      'Postpartum': stats['Postpartum'] || 0,
      'Medical': stats['Medical'] || 0,
    };
  };

  const stats = getDepartmentStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Department Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg border border-medical-border text-center">
          <p className="text-2xl font-bold text-medical-text-primary">{stats.total}</p>
          <p className="text-sm text-medical-text-muted">Total Patients</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 text-center">
          <p className="text-2xl font-bold text-purple-700">{stats['Labor & Delivery']}</p>
          <p className="text-sm text-purple-600">Labor & Delivery</p>
        </div>
        <div className="bg-pink-50 p-4 rounded-lg border border-pink-200 text-center">
          <p className="text-2xl font-bold text-pink-700">{stats['Postpartum']}</p>
          <p className="text-sm text-pink-600">Postpartum</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-center">
          <p className="text-2xl font-bold text-blue-700">{stats['Newborn']}</p>
          <p className="text-sm text-blue-600">Newborn</p>
        </div>
        <div className="bg-teal-50 p-4 rounded-lg border border-teal-200 text-center">
          <p className="text-2xl font-bold text-teal-700">{stats['Medical']}</p>
          <p className="text-sm text-teal-600">Medical</p>
        </div>
      </div>

      {/* Department Filter */}
      <div className="bg-white rounded-xl shadow-medical border border-medical-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-medical-text-primary">
            <i className="fas fa-users text-medical-primary mr-2"></i>Patient Dashboard
          </h3>
          <div className="flex space-x-2">
            {(['All', 'Labor & Delivery', 'Newborn', 'Postpartum'] as DepartmentFilter[]).map((dept) => (
              <button
                key={dept}
                onClick={() => setDepartmentFilter(dept)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  departmentFilter === dept
                    ? 'bg-medical-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                data-testid={`filter-${dept.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        {/* Patient Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-medical-border">
                <th className="text-left py-3 px-4 font-medium text-medical-text-secondary">Name</th>
                <th className="text-left py-3 px-4 font-medium text-medical-text-secondary">Bed</th>
                <th className="text-left py-3 px-4 font-medium text-medical-text-secondary">Age</th>
                <th className="text-left py-3 px-4 font-medium text-medical-text-secondary">Allergies</th>
                <th className="text-left py-3 px-4 font-medium text-medical-text-secondary">Status</th>
                <th className="text-left py-3 px-4 font-medium text-medical-text-secondary">Provider</th>
                <th className="text-left py-3 px-4 font-medium text-medical-text-secondary">Notes</th>
                <th className="text-left py-3 px-4 font-medium text-medical-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-medical-text-muted">
                    {departmentFilter === 'All' ? 'No patients found' : `No patients in ${departmentFilter}`}
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => (
                  <tr 
                    key={patient.id} 
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    data-testid={`patient-row-${patient.id}`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-medical-primary to-teal-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {patient.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-medical-text-primary" data-testid={`name-${patient.id}`}>
                            {patient.name}
                          </p>
                          <p className="text-xs text-medical-text-muted">{patient.department}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-medical-text-primary font-medium" data-testid={`bed-${patient.id}`}>
                        {patient.bed}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-medical-text-primary" data-testid={`age-${patient.id}`}>
                        {patient.age}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {hasAllergies(patient.allergies) && (
                          <i className="fas fa-exclamation-triangle text-red-500" title="Has allergies" data-testid={`allergy-alert-${patient.id}`}></i>
                        )}
                        <span className={`text-sm ${hasAllergies(patient.allergies) ? 'text-red-600 font-medium' : 'text-gray-500'}`} data-testid={`allergies-${patient.id}`}>
                          {patient.allergies}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(patient.status)}`} data-testid={`status-${patient.id}`}>
                        {patient.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-medical-text-primary text-sm" data-testid={`provider-${patient.id}`}>
                        {patient.provider}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span 
                        className="text-medical-text-muted text-sm truncate max-w-xs block" 
                        title={patient.notes}
                        data-testid={`notes-${patient.id}`}
                      >
                        {patient.notes || 'No notes'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => onPatientSelect(patient)}
                        className="bg-medical-primary hover:bg-teal-800 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                        data-testid={`view-patient-${patient.id}`}
                      >
                        <i className="fas fa-eye mr-1"></i>View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}