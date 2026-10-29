import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { IncidentReport, RoadStatus } from '../types';
import { CheckSquare, ShieldCheck, XCircle, CheckCircle2, AlertTriangle, ArrowRight, Camera } from 'lucide-react';

interface Props {
  selectedState: string;
}

export const IncidentVerification: React.FC<Props> = ({ selectedState }) => {
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedIncident, setSelectedIncident] = useState<IncidentReport | null>(null);

  // Verification Form State
  const [verificationNotes, setVerificationNotes] = useState('Ground verification complete by District Highway Squad. Heavy earthmovers engaged.');
  const [updateRoadSegment, setUpdateRoadSegment] = useState<boolean>(true);
  const [newRoadStatus, setNewRoadStatus] = useState<RoadStatus>('CLOSED');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const fetchIncidents = async () => {
    try {
      const res = await api.get<IncidentReport[]>(`/incidents?state=${selectedState}`);
      setIncidents(res.data);
      if (!selectedIncident && res.data.length > 0) {
        setSelectedIncident(res.data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [selectedState]);

  const handleVerify = async (status: 'VERIFIED' | 'REJECTED') => {
    if (!selectedIncident) return;
    setIsProcessing(true);

    try {
      await api.post(`/incidents/${selectedIncident.id}/verify`, {
        status,
        verification_notes: verificationNotes,
        update_road_segment: updateRoadSegment,
        new_road_status: updateRoadSegment ? newRoadStatus : null
      });
      alert(`Incident ${selectedIncident.id} has been marked as ${status}!`);
      fetchIncidents();
    } catch (err) {
      alert("Verification action failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResolve = async () => {
    if (!selectedIncident) return;
    setIsProcessing(true);

    try {
      await api.post(`/incidents/${selectedIncident.id}/resolve`, {
        resolution_notes: "Debris cleared by BRO. Road restored to normal traffic flow.",
        restore_road_open: true
      });
      alert(`Incident ${selectedIncident.id} resolved and road segment restored to OPEN!`);
      fetchIncidents();
    } catch (err) {
      alert("Resolution action failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-md">
            MODULE F: DISTRICT OFFICER VERIFICATION WORKFLOW
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Ground Incident Verification & Highway Status Approval
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Strict governance: Unverified field submissions do NOT alter road status without authenticated approval
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Incident Queue List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Incident Verification Queue ({incidents.length})
          </h3>

          <div className="space-y-2">
            {incidents.map((inc) => (
              <div
                key={inc.id}
                onClick={() => setSelectedIncident(inc)}
                className={`p-3 rounded-lg border text-xs cursor-pointer transition ${
                  selectedIncident?.id === inc.id
                    ? 'border-emerald-600 bg-emerald-50/70 shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 truncate">{inc.title}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    inc.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' :
                    inc.status === 'REPORTED' ? 'bg-amber-100 text-amber-800' :
                    inc.status === 'RESOLVED' ? 'bg-blue-100 text-blue-800' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {inc.status}
                  </span>
                </div>

                <div className="text-slate-500 text-[11px] mt-1">{inc.district}, {inc.state} • {inc.category}</div>
                <div className="text-slate-400 text-[10px] mt-1 font-mono">{inc.id} • {new Date(inc.created_at).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Incident Details & Verification Action */}
        {selectedIncident && (
          <div className="lg:col-span-2 space-y-4">
            
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 text-xs">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {selectedIncident.id}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">{selectedIncident.title}</h3>
                  <div className="text-slate-500 text-xs mt-0.5">
                    Location: <strong className="text-slate-800">{selectedIncident.district}, {selectedIncident.state}</strong> • Road Segment: <strong className="text-blue-700">{selectedIncident.road_segment_id || 'Off-Highway'}</strong>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400">Severity</span>
                  <div className="font-bold text-rose-600 text-sm">{selectedIncident.severity}</div>
                </div>
              </div>

              {/* Photo Evidence if uploaded */}
              {selectedIncident.image_url && (
                <div>
                  <div className="font-semibold text-slate-700 mb-1 flex items-center">
                    <Camera className="w-3.5 h-3.5 mr-1 text-slate-500" />
                    Field Ground Photographic Evidence:
                  </div>
                  <img
                    src={selectedIncident.image_url}
                    alt="Incident Photographic Evidence"
                    className="w-full h-56 object-cover rounded-lg border border-slate-200 shadow-inner"
                  />
                </div>
              )}

              {/* Description */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                <div className="font-bold text-slate-800">Field Officer Ground Report:</div>
                <p className="text-slate-700 leading-relaxed">{selectedIncident.description}</p>
                <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-200 mt-2">
                  Reported by: <strong>{selectedIncident.reporter_name}</strong>
                </div>
              </div>

              {/* Verification Form */}
              <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-3">
                <div className="font-bold text-emerald-950 flex items-center">
                  <CheckSquare className="w-4 h-4 mr-1 text-emerald-600" />
                  District Officer Ground Verification Panel
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Official Verification Findings & Orders</label>
                  <textarea
                    rows={3}
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 bg-white"
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-1.5 cursor-pointer font-semibold text-slate-800">
                    <input
                      type="checkbox"
                      checked={updateRoadSegment}
                      onChange={(e) => setUpdateRoadSegment(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>Update Road Segment Accessibility Status</span>
                  </label>

                  {updateRoadSegment && (
                    <select
                      value={newRoadStatus}
                      onChange={(e) => setNewRoadStatus(e.target.value as RoadStatus)}
                      className="border border-slate-300 rounded px-2.5 py-1 bg-white font-bold"
                    >
                      <option value="CLOSED">CLOSED (Complete Blockage)</option>
                      <option value="RESTRICTED">RESTRICTED (Single Lane / Convoys)</option>
                      <option value="OPEN">OPEN (Normal Flow)</option>
                    </select>
                  )}
                </div>

                <div className="flex justify-end space-x-2 pt-2 border-t border-emerald-200">
                  {selectedIncident.status !== 'RESOLVED' && (
                    <button
                      onClick={handleResolve}
                      disabled={isProcessing}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition cursor-pointer"
                    >
                      Clear & Resolve Obstruction
                    </button>
                  )}

                  <button
                    onClick={() => handleVerify('REJECTED')}
                    disabled={isProcessing}
                    className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-lg font-bold transition cursor-pointer"
                  >
                    Reject Submission
                  </button>

                  <button
                    onClick={() => handleVerify('VERIFIED')}
                    disabled={isProcessing}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition cursor-pointer flex items-center"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1.5" />
                    Verify & Enforce Status
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  );
};

