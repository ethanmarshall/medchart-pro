import { useQuery } from "@tanstack/react-query";
import { type AuditLog } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface AuditLogProps {
  entityType: string;
  entityId: string;
  title?: string;
}

export function AuditLogComponent({ entityType, entityId, title = "Change Log" }: AuditLogProps) {
  const { data: auditLogs = [], isLoading } = useQuery<AuditLog[]>({
    queryKey: ['/api/audit', entityType, entityId],
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create': return 'fa-plus-circle';
      case 'update': return 'fa-edit';
      case 'administer': return 'fa-syringe';
      case 'delete': return 'fa-trash';
      default: return 'fa-info-circle';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create': return 'text-green-600';
      case 'update': return 'text-blue-600';
      case 'administer': return 'text-purple-600';
      case 'delete': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getActionLabel = (action: string, entityType: string) => {
    switch (action) {
      case 'create': return `${entityType} created`;
      case 'update': return `${entityType} updated`;
      case 'administer': return 'Medicine administered';
      case 'delete': return `${entityType} deleted`;
      default: return action;
    }
  };

  const formatChanges = (changes: Record<string, any> | null) => {
    if (!changes) return null;
    
    return Object.entries(changes).map(([key, value]) => (
      <span key={key} className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs mr-2 mb-1">
        <strong>{key}:</strong> {typeof value === 'object' ? JSON.stringify(value) : String(value)}
      </span>
    ));
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-medical border border-medical-border p-6">
        <h3 className="text-lg font-semibold text-medical-text-primary mb-4">
          <i className="fas fa-history text-medical-primary mr-2"></i>{title}
        </h3>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-medical border border-medical-border p-6">
      <h3 className="text-lg font-semibold text-medical-text-primary mb-4">
        <i className="fas fa-history text-medical-primary mr-2"></i>{title}
      </h3>
      
      <div className="max-h-96 overflow-y-auto">
        {auditLogs.length === 0 ? (
          <div className="text-center py-8">
            <i className="fas fa-clipboard-list text-4xl text-gray-300 mb-4"></i>
            <p className="text-gray-500">No changes recorded yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {auditLogs.map((log) => (
              <div 
                key={log.id} 
                className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200"
                data-testid={`audit-log-${log.id}`}
              >
                <div className={`flex-shrink-0 mt-1 ${getActionColor(log.action)}`}>
                  <i className={`fas ${getActionIcon(log.action)}`}></i>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-gray-900">
                      {getActionLabel(log.action, log.entityType)}
                    </p>
                    <time 
                      className="text-sm text-gray-500" 
                      title={log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Unknown time'}
                      data-testid={`audit-time-${log.id}`}
                    >
                      {log.timestamp ? formatDistanceToNow(new Date(log.timestamp), { addSuffix: true }) : 'Unknown time'}
                    </time>
                  </div>
                  
                  {log.changes && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-2">Changes:</p>
                      <div className="flex flex-wrap">
                        {formatChanges(log.changes)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}