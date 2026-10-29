import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Vehicle, TelemetryPoint } from '../types';
import { Truck, AlertTriangle, Play, RefreshCw, MapPin, Gauge, Fuel } from 'lucide-react';

export const VehicleTracking: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const fetchVehicles = async () => {
    try {
      const res = await api.get<Vehicle[]>('/vehicles');
      setVehicles(res.data);
      if (!selectedVehicle && res.data.length > 0) {
        setSelectedVehicle(res.data[0]);
      }
    } catch (err) {
      console.error("Failed to fetch vehicles:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
    const interval = setInterval(fetchVehicles, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedVehicle) {
      api.get<TelemetryPoint[]>(`/vehicles/${selectedVehicle.id}/history`)
        .then(res => setTelemetryHistory(res.data))
        .catch(err => console.error(err));
    }
  }, [selectedVehicle]);

  // Simulate GPS coordinates advance
  const handleSimulateGPSMove = async (speedKmh: number) => {
    if (!selectedVehicle) return;
    setIsSimulating(true);

    const deltaLat = (Math.random() - 0.5) * 0.02;
    const deltaLng = (Math.random() - 0.5) * 0.02;

    try {
      const res = await api.post(`/vehicles/${selectedVehicle.id}/telemetry`, {
        lat: selectedVehicle.current_lat + deltaLat,
        lng: selectedVehicle.current_lng + deltaLng,
        speed_kmh: speedKmh,
        heading: Math.random() * 360
      });
      setSelectedVehicle(res.data);
      fetchVehicles();
    } catch (err) {
      alert("GPS simulation update failed.");
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <span className="px-2.5 py-0.5 text-xs font-bold bg-indigo-100 text-indigo-800 rounded-md">
            MODULE E: FLEET TELEMETRY & ANOMALY MONITOR
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Real-Time Vehicle Tracking & Stalled Incident Detection
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            GPS telemetry ingestion, geofence monitoring, and Isolation Forest stalled-vehicle anomaly identification
          </p>
        </div>

        <button
          onClick={fetchVehicles}
          className="mt-3 md:mt-0 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          Refresh Telemetry
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Vehicles List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-900">Monitored Fleet ({vehicles.length})</h3>
            <span className="text-[11px] text-slate-400">Live Telemetry</span>
          </div>

          <div className="space-y-2">
            {vehicles.map((v) => (
              <div
                key={v.id}
                onClick={() => setSelectedVehicle(v)}
                className={`p-3 rounded-lg border text-xs cursor-pointer transition ${
                  selectedVehicle?.id === v.id
                    ? 'border-indigo-600 bg-indigo-50/70 shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 flex items-center">
                    <Truck className="w-4 h-4 mr-1.5 text-indigo-600" />
                    {v.id}
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    v.status === 'IN_TRANSIT' ? 'bg-emerald-100 text-emerald-800' :
                    v.status === 'STALLED' ? 'bg-rose-100 text-rose-800' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {v.status}
                  </span>
                </div>

                <div className="mt-1 text-slate-600 text-[11px]">{v.model_name}</div>
                <div className="mt-2 flex items-center justify-between text-slate-500 text-[11px]">
                  <span>Driver: {v.driver_name}</span>
                  <span className="font-mono font-bold text-slate-700">{v.current_speed_kmh} km/h</span>
                </div>

                {v.is_anomaly && (
                  <div className="mt-2 p-1.5 bg-rose-50 border border-rose-200 rounded text-rose-700 text-[10px] font-semibold flex items-center">
                    <AlertTriangle className="w-3 h-3 mr-1 flex-shrink-0" />
                    {v.anomaly_reason}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Selected Vehicle Detail & Live Simulator */}
        {selectedVehicle && (
          <div className="lg:col-span-2 space-y-4">
            
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center">
                    <Truck className="w-5 h-5 mr-2 text-indigo-600" />
                    {selectedVehicle.id} • {selectedVehicle.model_name}
                  </h3>
                  <div className="text-xs text-slate-500">
                    Assigned Driver: <strong className="text-slate-800">{selectedVehicle.driver_name}</strong> ({selectedVehicle.driver_phone})
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-400">Last Ping</div>
                  <div className="text-xs font-mono font-bold text-slate-800">
                    {new Date(selectedVehicle.last_telemetry_time).toLocaleTimeString()}
                  </div>
                </div>
              </div>

              {/* Status & Telemetry Gauges */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-slate-500 flex items-center"><Gauge className="w-3.5 h-3.5 mr-1" /> Speed</div>
                  <div className="text-lg font-bold text-slate-900 mt-1">{selectedVehicle.current_speed_kmh} km/h</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-slate-500 flex items-center"><Fuel className="w-3.5 h-3.5 mr-1" /> Fuel Level</div>
                  <div className="text-lg font-bold text-emerald-600 mt-1">{selectedVehicle.fuel_pct}%</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-slate-500 flex items-center"><MapPin className="w-3.5 h-3.5 mr-1" /> Coordinates</div>
                  <div className="text-xs font-mono font-semibold text-slate-700 mt-1.5">
                    {selectedVehicle.current_lat.toFixed(4)}, {selectedVehicle.current_lng.toFixed(4)}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-slate-500">Anomaly State</div>
                  <div className={`text-xs font-bold mt-1.5 ${selectedVehicle.is_anomaly ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {selectedVehicle.is_anomaly ? 'ALERT: STALLED / ANOMALY' : 'NORMAL TRANSIT'}
                  </div>
                </div>
              </div>

              {/* Interactive Telemetry GPS Simulator Actions */}
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg space-y-2">
                <div className="text-xs font-bold text-indigo-950 flex items-center">
                  <Play className="w-3.5 h-3.5 mr-1 fill-current" />
                  Live GPS Simulator (Test Fleet Telemetry Ingestion):
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <button
                    onClick={() => handleSimulateGPSMove(48.0)}
                    disabled={isSimulating}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium transition cursor-pointer"
                  >
                    Simulate Normal Transit (48 km/h)
                  </button>
                  <button
                    onClick={() => handleSimulateGPSMove(0.0)}
                    disabled={isSimulating}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded font-medium transition cursor-pointer"
                  >
                    Simulate Stalled / Breakdown (0 km/h)
                  </button>
                </div>
              </div>

              {/* Telemetry Point History Log */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 mb-2">Recent Telemetry Ping Audit</h4>
                <div className="max-h-52 overflow-y-auto border border-slate-200 rounded-lg text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 sticky top-0">
                      <tr>
                        <th className="py-2 px-3">Timestamp</th>
                        <th className="py-2 px-3">Coordinates</th>
                        <th className="py-2 px-3">Speed</th>
                        <th className="py-2 px-3">Anomaly Flag</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {telemetryHistory.map((pt) => (
                        <tr key={pt.id} className="hover:bg-slate-50">
                          <td className="py-1.5 px-3 text-slate-500 font-mono">
                            {new Date(pt.timestamp).toLocaleTimeString()}
                          </td>
                          <td className="py-1.5 px-3 text-slate-700 font-mono">
                            {pt.lat.toFixed(4)}, {pt.lng.toFixed(4)}
                          </td>
                          <td className="py-1.5 px-3 font-semibold text-slate-800">
                            {pt.speed_kmh} km/h
                          </td>
                          <td className="py-1.5 px-3">
                            {pt.is_anomaly ? (
                              <span className="text-rose-600 font-bold">ANOMALY</span>
                            ) : (
                              <span className="text-emerald-600">NORMAL</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  );
};

