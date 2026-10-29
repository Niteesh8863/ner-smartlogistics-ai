import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { FileText, Shield, Filter, RefreshCw, Clock, User as UserIcon } from 'lucide-react';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterAction, setFilterAction] = useState<string>('ALL');

  const fetchLogs = async () => {
    try {
      const res = await api.get('/audit-logs?limit=100');
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(l => {
    if (filterAction !== 'ALL' && l.action !== filterAction) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <span className="px-2.5 py-0.5 text-xs font-bold bg-slate-100 text-slate-800 rounded-md">
            MODULE J: GOVERNMENT AUDIT TRAIL
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            System Security & Administrative Audit Events
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tamper-evident log of verified road status changes, incident endorsements, and emergency broadcasts
          </p>
        </div>

        <div className="mt-4 md:mt-0 flex items-center space-x-2">
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="border border-slate-300 rounded-lg p-2 text-xs bg-slate-50 font-medium"
          >
            <option value="ALL">All Actions</option>
            <option value="LOGIN_SUCCESS">LOGIN_SUCCESS</option>
            <option value="VERIFY_INCIDENT">VERIFY_INCIDENT</option>
            <option value="UPDATE_ROAD_STATUS">UPDATE_ROAD_STATUS</option>
            <option value="CREATE_ALERT">CREATE_ALERT</option>
            <option value="CREATE_INCIDENT_REPORT">CREATE_INCIDENT_REPORT</option>
          </select>

          <button
            onClick={fetchLogs}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Timestamp</th>
                <th className="py-2.5 px-4">User</th>
                <th className="py-2.5 px-4">Action</th>
                <th className="py-2.5 px-4">Resource Target</th>
                <th className="py-2.5 px-4">Details</th>
                <th className="py-2.5 px-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-4 font-mono text-slate-500 text-[11px]">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-4 font-semibold text-slate-800">
                    {log.user_email || 'System Agent'}
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-600 font-mono text-[11px]">
                    {log.resource_type}: {log.resource_id}
                  </td>
                  <td className="py-2.5 px-4 text-slate-700 max-w-xs truncate">
                    {log.details}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-slate-400 text-[11px]">
                    {log.ip_address}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

