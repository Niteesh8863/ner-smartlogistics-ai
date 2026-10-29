import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { saveOfflineIncident, getPendingIncidents, syncPendingIncidents } from '../services/offlineStore';
import { IncidentCategory, IncidentSeverity } from '../types';
import { Camera, MapPin, Upload, Wifi, WifiOff, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

export const IncidentReporting: React.FC = () => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<IncidentCategory>('LANDSLIDE');
  const [severity, setSeverity] = useState<IncidentSeverity>('HIGH');
  const [lat, setLat] = useState<number>(26.1445);
  const [lng, setLng] = useState<number>(91.7362);
  const [state, setState] = useState('Assam');
  const [district, setDistrict] = useState('Kamrup Metropolitan');
  const [description, setDescription] = useState('');
  const [reporterName, setReporterName] = useState('Tenzing Lepcha (Field Officer)');
  const [imageUrl, setImageUrl] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingReports, setPendingReports] = useState<any[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const refreshPending = async () => {
    try {
      const pending = await getPendingIncidents();
      setPendingReports(pending);
    } catch (e) {
      console.warn("Could not read IDB:", e);
    }
  };

  useEffect(() => {
    refreshPending();
  }, []);

  const handleCaptureLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(Number(pos.coords.latitude.toFixed(4)));
          setLng(Number(pos.coords.longitude.toFixed(4)));
          alert(`GPS Coordinates Acquired: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        },
        (err) => {
          alert("Could not acquire GPS automatically. Using default terrain coordinates.");
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage(null);

    const reportData = {
      title,
      category,
      severity,
      lat,
      lng,
      state,
      district,
      description,
      reporter_name: reporterName,
      image_url: imageUrl || 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80'
    };

    if (navigator.onLine) {
      try {
        await api.post('/incidents', reportData);
        setSuccessMessage("Incident report successfully transmitted to District Operations Center!");
        setTitle('');
        setDescription('');
      } catch (err) {
        // Fallback to offline queue
        await saveOfflineIncident(reportData);
        setSuccessMessage("Network error: Incident report queued safely in offline IndexedDB storage.");
        refreshPending();
      }
    } else {
      // Offline mode
      await saveOfflineIncident(reportData);
      setSuccessMessage("Offline mode: Incident report saved to local device queue. Will sync automatically once reconnected.");
      refreshPending();
    }

    setIsSubmitting(false);
  };

  const handleManualSync = async () => {
    const res = await syncPendingIncidents();
    alert(`Sync completed! ${res.synced} reports synchronized to server, ${res.failed} failed.`);
    refreshPending();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-100 text-amber-800 rounded-md">
            MODULE F: FIELD INCIDENT REPORTING (OFFLINE PWA)
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Ground Field Incident Report Entry
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Geotagged photographic reporting for landslides, flooding, bridge fractures, and severe blockages
          </p>
        </div>

        <div className="text-right">
          {navigator.onLine ? (
            <span className="inline-flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <Wifi className="w-3.5 h-3.5 mr-1 text-emerald-600" />
              Online Direct
            </span>
          ) : (
            <span className="inline-flex items-center text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              <WifiOff className="w-3.5 h-3.5 mr-1 text-amber-600" />
              Offline PWA Mode
            </span>
          )}
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center">
          <CheckCircle className="w-4 h-4 mr-2 text-emerald-600 flex-shrink-0" />
          {successMessage}
        </div>
      )}

      {/* Main Report Form */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Incident Headline / Summary</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Major rockfall blocking both lanes near Mile 29"
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Hazard Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as IncidentCategory)}
                className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 font-bold text-slate-800"
              >
                <option value="LANDSLIDE">LANDSLIDE (Mudslide / Rockfall)</option>
                <option value="FLOOD">FLOOD (River Overwash / Inundation)</option>
                <option value="ROAD_DAMAGE">ROAD DAMAGE (Subsidence / Surface Cracking)</option>
                <option value="BRIDGE_DAMAGE">BRIDGE DAMAGE (Structural Fracture)</option>
                <option value="CONGESTION">SEVERE CONGESTION (Stranded Convoys)</option>
                <option value="SEVERE_WEATHER">SEVERE WEATHER (Gale Wind / Dense Fog)</option>
                <option value="OTHER">OTHER UNFORESEEN HAZARD</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Severity Assessment</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as IncidentSeverity)}
                className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 font-bold"
              >
                <option value="CRITICAL">CRITICAL (Total Road Cutoff)</option>
                <option value="HIGH">HIGH (Single Lane Impassable)</option>
                <option value="MEDIUM">MEDIUM (Severe Slowdown)</option>
                <option value="LOW">LOW (Cautionary Shoulder Damage)</option>
              </select>
            </div>
          </div>

          {/* Location & GPS */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center">
                <MapPin className="w-4 h-4 mr-1 text-blue-600" />
                Geotagged Coordinates
              </span>
              <button
                type="button"
                onClick={handleCaptureLocation}
                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-semibold flex items-center cursor-pointer"
              >
                Acquire Device GPS
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div>
                <label className="block text-[11px] text-slate-500">Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={lat}
                  onChange={(e) => setLat(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded p-1.5 font-mono bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500">Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={lng}
                  onChange={(e) => setLng(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded p-1.5 font-mono bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full border border-slate-300 rounded p-1.5 bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500">District</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full border border-slate-300 rounded p-1.5 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Ground Verification Description & Observations</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail the estimated volume of debris, water depth, stranded vehicles, and machinery needed..."
              className="w-full border border-slate-300 rounded-lg p-2.5"
            />
          </div>

          {/* Photograph Upload URL / Simulation */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center">
              <Camera className="w-3.5 h-3.5 mr-1" />
              Evidence Photograph (Image URL / Geotagged Capture)
            </label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://... (or leave blank for sample verified field image)"
              className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Reporting Officer Identification</label>
            <input
              type="text"
              value={reporterName}
              onChange={(e) => setReporterName(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 font-semibold"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-sm shadow-md transition cursor-pointer flex items-center justify-center"
          >
            {isSubmitting ? 'Recording Report...' : 'Transmit Incident Report to District Emergency Center'}
          </button>
        </form>
      </div>

      {/* Offline Pending Synchronization Queue */}
      {pendingReports.length > 0 && (
        <div className="bg-amber-50 p-5 rounded-xl border border-amber-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Offline Incident Queue ({pendingReports.length} Pending Synchronization)</span>
            </div>
            <button
              onClick={handleManualSync}
              className="px-3 py-1 bg-amber-600 text-white text-xs font-bold rounded flex items-center hover:bg-amber-700 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Sync Now
            </button>
          </div>

          <div className="space-y-1.5">
            {pendingReports.map((p) => (
              <div key={p.offline_client_id} className="bg-white p-2.5 rounded border border-amber-200 text-xs flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-900">{p.title}</div>
                  <div className="text-[10px] text-slate-500">{p.category} • {p.district}, {p.state} • ID: {p.offline_client_id}</div>
                </div>
                <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">
                  Pending Upload
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

