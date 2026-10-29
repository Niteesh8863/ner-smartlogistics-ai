import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Activity, CheckCircle2, AlertTriangle, RefreshCw, Shield, Database, Radio } from 'lucide-react';

export const DataSourcesHealth: React.FC = () => {
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchHealth = async () => {
    try {
      const res = await api.get('/integrations/health');
      setSources(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-md">
            MODULE H: MULTI-SOURCE SENSOR & DATA ADAPTER LAYER
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            External Government & Geospatial Integrations Health
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time feed ingestion status, API latency, schema validation, and fallback baseline safeguards
          </p>
        </div>

        <button
          onClick={fetchHealth}
          className="mt-4 md:mt-0 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          Poll Feeds Now
        </button>
      </div>

      {/* Grid of Integrated Adapters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sources.map((s) => (
          <div key={s.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">{s.category}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  s.status === 'HEALTHY' ? 'bg-emerald-100 text-emerald-800' :
                  s.status === 'DEGRADED' ? 'bg-amber-100 text-amber-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {s.status}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900">{s.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{s.provider}</p>
            </div>

            <div className="space-y-1.5 text-xs border-t border-slate-100 pt-3">
              <div className="flex justify-between">
                <span className="text-slate-500">API Response Latency:</span>
                <span className="font-mono font-bold text-slate-800">{s.latency_ms} ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Data Freshness:</span>
                <span className="font-semibold text-slate-700">{s.data_freshness_min} mins ago</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Records Ingested:</span>
                <span className="font-mono font-semibold text-blue-600">{s.record_count} features</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Adapter Mode:</span>
                <span className="font-semibold text-slate-800">
                  {s.fallback_active ? 'Local Synthetic Fallback' : 'Live Gateway Stream'}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400">
              Licensing: {s.licensing}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

