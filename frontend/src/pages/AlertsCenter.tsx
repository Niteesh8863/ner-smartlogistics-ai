import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Alert } from '../types';
import { AlertTriangle, Bell, Plus, CheckCircle, Languages, ShieldAlert, X } from 'lucide-react';

interface Props {
  selectedState: string;
}

export const AlertsCenter: React.FC<Props> = ({ selectedState }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [language, setLanguage] = useState<'EN' | 'HI' | 'AS'>('EN');

  // Broadcast Alert Form
  const [showBroadcastModal, setShowBroadcastModal] = useState<boolean>(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<'INFO' | 'WARNING' | 'DANGER' | 'CRITICAL'>('CRITICAL');
  const [category, setCategory] = useState('ROAD_CLOSURE');
  const [state, setState] = useState('Nagaland');
  const [action, setAction] = useState('Avoid corridor; take state bypass');

  const fetchAlerts = async () => {
    try {
      const res = await api.get<Alert[]>(`/alerts?state=${selectedState}&active_only=true`);
      setAlerts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [selectedState]);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/alerts', {
        title,
        message,
        severity,
        category,
        state,
        recommended_action: action
      });
      setShowBroadcastModal(false);
      setTitle('');
      setMessage('');
      fetchAlerts();
    } catch (err) {
      alert("Failed to broadcast alert.");
    }
  };

  const handleDismiss = async (alertId: string) => {
    try {
      await api.patch(`/alerts/${alertId}/dismiss`);
      fetchAlerts();
    } catch (err) {
      alert("Failed to dismiss alert.");
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <span className="px-2.5 py-0.5 text-xs font-bold bg-rose-100 text-rose-800 rounded-md">
            MODULE G: EMERGENCY EARLY WARNING & ALERTS
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Emergency Disaster & Transit Disruption Broadcast Center
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated alerts dispatched to district commissioners, transport operators, and public safety boards
          </p>
        </div>

        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          {/* Multilingual Selector */}
          <div className="flex items-center text-xs bg-slate-100 rounded-lg p-1 border border-slate-200">
            <Languages className="w-3.5 h-3.5 ml-1 mr-1 text-slate-500" />
            <button
              onClick={() => setLanguage('EN')}
              className={`px-2 py-1 rounded font-bold ${language === 'EN' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600'}`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('HI')}
              className={`px-2 py-1 rounded font-bold ${language === 'HI' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600'}`}
            >
              हिन्दी
            </button>
            <button
              onClick={() => setLanguage('AS')}
              className={`px-2 py-1 rounded font-bold ${language === 'AS' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600'}`}
            >
              অসমীয়া
            </button>
          </div>

          <button
            onClick={() => setShowBroadcastModal(true)}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-1" />
            Issue Alert
          </button>
        </div>
      </div>

      {/* Active Alerts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {alerts.map((a) => (
          <div
            key={a.id}
            className={`p-5 rounded-xl border shadow-sm transition space-y-3 ${
              a.severity === 'CRITICAL' ? 'bg-rose-50/70 border-rose-300' :
              a.severity === 'WARNING' ? 'bg-amber-50/70 border-amber-300' :
              'bg-blue-50/70 border-blue-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                a.severity === 'CRITICAL' ? 'bg-rose-600 text-white' :
                a.severity === 'WARNING' ? 'bg-amber-600 text-white' :
                'bg-blue-600 text-white'
              }`}>
                {a.severity} • {a.category}
              </span>
              <span className="text-[11px] font-semibold text-slate-600">{a.state}</span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900">{a.title}</h3>
              <p className="text-xs text-slate-700 mt-1 leading-relaxed">{a.message}</p>
            </div>

            <div className="p-2.5 bg-white/90 rounded border border-slate-200 text-xs">
              <span className="font-bold text-slate-800">Action:</span> {a.recommended_action}
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-200">
              <span>Source: {a.source}</span>
              <button
                onClick={() => handleDismiss(a.id)}
                className="text-slate-600 hover:text-slate-900 font-semibold cursor-pointer underline"
              >
                Dismiss Alert
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Broadcast Alert Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 flex items-center">
              <ShieldAlert className="w-5 h-5 mr-2 text-rose-600" />
              Issue Critical Emergency Disruption Broadcast
            </h3>

            <form onSubmit={handleBroadcast} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alert Headline</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. NH-29 Landslide Closure Broadcast"
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Severity Level</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 font-bold"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="DANGER">DANGER</option>
                    <option value="WARNING">WARNING</option>
                    <option value="INFO">INFO</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target State</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Detailed Emergency Message</label>
                <textarea
                  rows={3}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe obstruction, affected vehicles, and transit prohibitions..."
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mandatory Recommended Action</label>
                <input
                  type="text"
                  required
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-rose-600 text-white rounded text-xs font-bold hover:bg-rose-700 cursor-pointer"
                >
                  Broadcast to District Systems
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

