import React, { useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { api } from '../services/api';
import { RoutePlanResponse, RouteAlternative, CargoType } from '../types';
import { Navigation, ShieldAlert, CheckCircle2, Clock, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';
import { AccessibilityBadge } from '../components/AccessibilityBadge';

const PRESET_ORIGINS = [
  { name: 'Guwahati Jalukbari Logistics Hub (Assam)', lat: 26.1445, lng: 91.7362 },
  { name: 'Siliguri Transport Depot (Gateway to Sikkim)', lat: 26.7271, lng: 88.3953 },
  { name: 'Dimapur Commercial Rail Yard (Nagaland)', lat: 25.9068, lng: 93.7273 }
];

const PRESET_DESTINATIONS = [
  { name: 'Kohima Civil Hospital & Distribution Hub (Nagaland)', lat: 25.6751, lng: 94.1086 },
  { name: 'Gangtok Central Medical Warehouse (Sikkim)', lat: 27.3389, lng: 88.6065 },
  { name: 'Shillong Polo Grounds Terminal (Meghalaya)', lat: 25.5788, lng: 91.8933 },
  { name: 'Dibrugarh Medical College Depot (Assam)', lat: 27.4728, lng: 94.9120 }
];

export const RoutePlanner: React.FC = () => {
  const [origin, setOrigin] = useState(PRESET_ORIGINS[2]); // Dimapur default
  const [destination, setDestination] = useState(PRESET_DESTINATIONS[0]); // Kohima default
  const [cargoType, setCargoType] = useState<CargoType>('MEDICINE');
  const [alphaTime, setAlphaTime] = useState<number>(0.35);
  const [betaRisk, setBetaRisk] = useState<number>(0.50);
  const [gammaDist, setGammaDist] = useState<number>(0.15);

  const [loading, setLoading] = useState<boolean>(false);
  const [routePlan, setRoutePlan] = useState<RoutePlanResponse | null>(null);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number>(0);

  const handleComputeRoute = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post('/routes/plan', {
        origin_name: origin.name,
        origin_lat: origin.lat,
        origin_lng: origin.lng,
        destination_name: destination.name,
        destination_lat: destination.lat,
        destination_lng: destination.lng,
        cargo_type: cargoType,
        avoid_high_risk: true,
        alpha_time: alphaTime,
        beta_risk: betaRisk,
        gamma_dist: gammaDist
      });
      setRoutePlan(res.data);
      setSelectedRouteIndex(0);
    } catch (err) {
      console.error("Route planning error:", err);
      alert("Failed to compute risk-aware route.");
    } finally {
      setLoading(false);
    }
  };

  const activeRoute: RouteAlternative | undefined = routePlan?.alternatives[selectedRouteIndex];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <span className="px-2.5 py-0.5 text-xs font-bold bg-blue-100 text-blue-800 rounded-md">
          MODULE D: MULTI-FACTOR RISK ROUTE OPTIMIZER
        </span>
        <h2 className="text-xl font-bold text-slate-900 mt-1">
          Risk-Time-Distance Graph Routing & Corridor Comparison
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Cost Formula: Cost = α·Time + β·DisruptionRisk + γ·Distance • Strict Safety Pruning on Confirmed Road Closures
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Route Planner Control Form */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center">
            <Navigation className="w-4 h-4 mr-2 text-blue-600" />
            Route Planning Parameters
          </h3>

          <form onSubmit={handleComputeRoute} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Origin Logistics Depot</label>
              <select
                value={origin.name}
                onChange={(e) => {
                  const found = PRESET_ORIGINS.find(o => o.name === e.target.value);
                  if (found) setOrigin(found);
                }}
                className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50"
              >
                {PRESET_ORIGINS.map((o) => (
                  <option key={o.name} value={o.name}>{o.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Delivery Destination</label>
              <select
                value={destination.name}
                onChange={(e) => {
                  const found = PRESET_DESTINATIONS.find(d => d.name === e.target.value);
                  if (found) setDestination(found);
                }}
                className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50"
              >
                {PRESET_DESTINATIONS.map((d) => (
                  <option key={d.name} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Consignment Cargo Priority</label>
              <select
                value={cargoType}
                onChange={(e) => setCargoType(e.target.value as CargoType)}
                className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 font-bold text-blue-800"
              >
                <option value="MEDICINE">Medicines & Vaccines (Risk Averse - High Safety)</option>
                <option value="FOOD">Food & Grains Emergency Ration (Balanced)</option>
                <option value="AGRI">Agricultural & Perishable Produce (Fastest Time)</option>
                <option value="CONSTRUCTION">Construction Steel / Bridge Girders (Heavy Load Paved)</option>
                <option value="EMERGENCY">Disaster Response Rescue Equipment</option>
              </select>
            </div>

            {/* Weights Sliders */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="font-semibold text-slate-700">Cost Optimization Weights:</div>
              <div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Travel Time (α): {alphaTime}</span>
                  <span>Disruption Risk (β): {betaRisk}</span>
                  <span>Distance (γ): {gammaDist}</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs flex items-center justify-center transition cursor-pointer"
            >
              {loading ? 'Optimizing Corridor Graph...' : 'Calculate Risk-Optimized Routes'}
            </button>
          </form>

          {/* Warning Message if closed road */}
          {routePlan?.warning_message && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>{routePlan.warning_message}</div>
            </div>
          )}

          {/* Alternative Route Choices */}
          {routePlan && routePlan.alternatives.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="text-xs font-bold text-slate-900">Computed Route Options:</div>
              {routePlan.alternatives.map((alt, idx) => (
                <div
                  key={alt.route_id}
                  onClick={() => setSelectedRouteIndex(idx)}
                  className={`p-3 rounded-lg border text-xs cursor-pointer transition ${
                    selectedRouteIndex === idx 
                      ? 'border-blue-600 bg-blue-50/70 shadow-sm' 
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center">
                      {alt.is_recommended && <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />}
                      {alt.label}
                    </span>
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono">
                      Cost: {alt.cost_score}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 mt-1.5 text-slate-600 text-[11px]">
                    <span>Distance: <strong>{alt.total_distance_km} km</strong></span>
                    <span>Est Time: <strong>{alt.estimated_time_hours} hrs</strong></span>
                    <span>Risk: <strong className={alt.average_risk_score > 0.5 ? 'text-rose-600' : 'text-emerald-600'}>{(alt.average_risk_score * 100).toFixed(0)}%</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Map Visualization & Route Comparison Breakdown */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Map showing route path */}
          <div className="h-96 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden relative">
            <MapContainer center={[origin.lat, origin.lng]} zoom={8} className="h-full w-full">
              <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Start & End Markers */}
              <Marker position={[origin.lat, origin.lng]}>
                <Popup>Origin: {origin.name}</Popup>
              </Marker>
              <Marker position={[destination.lat, destination.lng]}>
                <Popup>Destination: {destination.name}</Popup>
              </Marker>

              {/* Render Alternatives with contrasting colors */}
              {routePlan?.alternatives.map((alt, idx) => {
                const isSelected = selectedRouteIndex === idx;
                const color = isSelected ? '#2563EB' : '#94A3B8';
                return (
                  <Polyline
                    key={alt.route_id}
                    positions={alt.path_coords}
                    pathOptions={{
                      color: color,
                      weight: isSelected ? 6 : 3,
                      dashArray: isSelected ? undefined : '5, 5',
                      opacity: isSelected ? 0.95 : 0.6
                    }}
                  />
                );
              })}
            </MapContainer>
          </div>

          {/* Route Segment Breakdown Table */}
          {activeRoute && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900">
                  Turn-by-Turn Monitored Road Segments ({activeRoute.label})
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  Total Segments: {activeRoute.segments.length}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">Segment Name</th>
                      <th className="py-2 px-3">Highway</th>
                      <th className="py-2 px-3">Distance</th>
                      <th className="py-2 px-3">Disruption Risk</th>
                      <th className="py-2 px-3">Accessibility Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeRoute.segments.map((seg, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-medium text-slate-900">{seg.name}</td>
                        <td className="py-2 px-3 font-mono text-blue-600 font-bold">{seg.highway_number}</td>
                        <td className="py-2 px-3">{seg.length_km} km</td>
                        <td className="py-2 px-3">
                          <span className={seg.risk_score > 0.5 ? 'text-rose-600 font-bold' : 'text-emerald-600 font-semibold'}>
                            {(seg.risk_score * 100).toFixed(0)}%
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <AccessibilityBadge status={seg.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Safety Notes */}
              <div className="mt-3 p-3 bg-slate-50 rounded-lg text-xs space-y-1">
                <div className="font-bold text-slate-800">Operational & Safety Advisory:</div>
                {activeRoute.safety_notes.map((note, idx) => (
                  <div key={idx} className="text-slate-600 flex items-center">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-blue-600 flex-shrink-0" />
                    <span>{note}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

