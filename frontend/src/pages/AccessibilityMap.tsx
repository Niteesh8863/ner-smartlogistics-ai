import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { api } from '../services/api';
import { RoadSegment, Bridge, IncidentReport, Vehicle } from '../types';
import { AccessibilityBadge, RiskMeter } from '../components/AccessibilityBadge';
import { Shield, AlertTriangle, Info, Truck, CheckCircle, X, Layers, Filter } from 'lucide-react';

// Fix Leaflet default marker icons in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom colored icons for incidents, bridges, vehicles
const incidentIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const bridgeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const vehicleIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

interface MapProps {
  selectedState: string;
}

export const AccessibilityMap: React.FC<MapProps> = ({ selectedState }) => {
  const [segments, setSegments] = useState<RoadSegment[]>([]);
  const [bridges, setBridges] = useState<Bridge[]>([]);
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedSegment, setSelectedSegment] = useState<RoadSegment | null>(null);
  
  // Layer toggles
  const [showRoads, setShowRoads] = useState<boolean>(true);
  const [showBridges, setShowBridges] = useState<boolean>(true);
  const [showIncidents, setShowIncidents] = useState<boolean>(true);
  const [showVehicles, setShowVehicles] = useState<boolean>(true);

  // Status Filter
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const segRes = await api.get(`/geo/road-segments?state=${selectedState}`);
        setSegments(segRes.data);

        const brgRes = await api.get(`/geo/bridges?state=${selectedState}`);
        setBridges(brgRes.data);

        const incRes = await api.get(`/incidents?state=${selectedState}`);
        setIncidents(incRes.data);

        const vehRes = await api.get('/vehicles');
        setVehicles(vehRes.data);
      } catch (err) {
        console.error("Failed to load map GIS layers:", err);
      }
    };
    fetchData();
  }, [selectedState]);

  // Center coordinate of North Eastern Region (Guwahati center approx: 26.14, 91.77)
  const nerCenter: [number, number] = [26.1433, 91.7898];

  const getSegmentColor = (status: string) => {
    switch (status) {
      case 'OPEN': return '#10B981'; // Green
      case 'RESTRICTED': return '#F59E0B'; // Amber
      case 'CLOSED': return '#EF4444'; // Red
      default: return '#64748B'; // Slate
    }
  };

  const filteredSegments = segments.filter(seg => {
    if (filterStatus !== 'ALL' && seg.current_status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="relative h-[calc(100vh-8.5rem)] flex flex-col rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-white">
      
      {/* Top Filter & Layer Bar */}
      <div className="bg-white/95 backdrop-blur px-4 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between z-10 gap-2">
        <div className="flex items-center space-x-3 text-xs">
          <span className="font-bold text-slate-800 flex items-center">
            <Layers className="w-4 h-4 mr-1.5 text-blue-600" />
            GIS Active Layers:
          </span>

          <label className="flex items-center space-x-1 cursor-pointer">
            <input type="checkbox" checked={showRoads} onChange={(e) => setShowRoads(e.target.checked)} className="rounded text-blue-600" />
            <span>Highways ({filteredSegments.length})</span>
          </label>

          <label className="flex items-center space-x-1 cursor-pointer">
            <input type="checkbox" checked={showBridges} onChange={(e) => setShowBridges(e.target.checked)} className="rounded text-blue-600" />
            <span>Bridges ({bridges.length})</span>
          </label>

          <label className="flex items-center space-x-1 cursor-pointer">
            <input type="checkbox" checked={showIncidents} onChange={(e) => setShowIncidents(e.target.checked)} className="rounded text-blue-600" />
            <span>Field Incidents ({incidents.length})</span>
          </label>

          <label className="flex items-center space-x-1 cursor-pointer">
            <input type="checkbox" checked={showVehicles} onChange={(e) => setShowVehicles(e.target.checked)} className="rounded text-blue-600" />
            <span>Live Vehicles ({vehicles.length})</span>
          </label>
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500">Road Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-slate-300 rounded px-2 py-1 text-xs bg-slate-50 font-medium"
          >
            <option value="ALL">All States (Open/Restricted/Closed)</option>
            <option value="OPEN">Open Only</option>
            <option value="RESTRICTED">Restricted Only</option>
            <option value="CLOSED">Closed Only</option>
          </select>
        </div>
      </div>

      {/* Interactive Map */}
      <div className="relative flex-1">
        <MapContainer center={nerCenter} zoom={7} scrollWheelZoom={true} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Road Segment Polylines */}
          {showRoads && filteredSegments.map((seg) => {
            const positions: [number, number][] = [
              [seg.start_lat, seg.start_lng],
              [seg.end_lat, seg.end_lng]
            ];
            const color = getSegmentColor(seg.current_status);
            const isClosed = seg.current_status === 'CLOSED';

            return (
              <Polyline
                key={seg.id}
                positions={positions}
                pathOptions={{
                  color: color,
                  weight: isClosed ? 6 : 5,
                  dashArray: isClosed ? '6, 6' : undefined,
                  opacity: 0.95
                }}
                eventHandlers={{
                  click: () => setSelectedSegment(seg)
                }}
              >
                <Popup>
                  <div className="text-xs p-1 space-y-1">
                    <div className="font-bold text-slate-900">{seg.name}</div>
                    <div className="text-blue-600 font-mono font-semibold">{seg.highway_number} • {seg.district}, {seg.state}</div>
                    <div>Length: {seg.length_km} km</div>
                    <div>Status: <AccessibilityBadge status={seg.current_status} /></div>
                    <div className="text-slate-500 italic mt-1">{seg.status_reason}</div>
                    <button
                      onClick={() => setSelectedSegment(seg)}
                      className="mt-2 w-full py-1 bg-blue-600 text-white rounded text-[11px] font-semibold"
                    >
                      View AI Disruption & Terrain Details
                    </button>
                  </div>
                </Popup>
              </Polyline>
            );
          })}

          {/* Strategic Bridges */}
          {showBridges && bridges.map((brg) => (
            <Marker key={brg.id} position={[brg.lat, brg.lng]} icon={bridgeIcon}>
              <Popup>
                <div className="text-xs p-1 space-y-1">
                  <div className="font-bold text-slate-900">{brg.name}</div>
                  <div className="text-slate-600">River: {brg.river_name} • {brg.district}, {brg.state}</div>
                  <div>Health: <span className="font-semibold">{brg.health_status}</span></div>
                  <div>Load Limit: {brg.load_capacity_tons} Tons (Length: {brg.length_meters}m)</div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Verified Field Incidents */}
          {showIncidents && incidents.map((inc) => (
            <Marker key={inc.id} position={[inc.lat, inc.lng]} icon={incidentIcon}>
              <Popup>
                <div className="text-xs p-1 space-y-1">
                  <div className="font-bold text-rose-600 flex items-center">
                    <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                    {inc.category}: {inc.title}
                  </div>
                  <div className="text-slate-600">{inc.district}, {inc.state}</div>
                  <div className="text-slate-700">{inc.description}</div>
                  <div className="font-semibold text-slate-900">Severity: {inc.severity} • Status: {inc.status}</div>
                  {inc.image_url && (
                    <img src={inc.image_url} alt="Field Photo" className="w-full h-24 object-cover rounded mt-1" />
                  )}
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Fleet Telemetry Tracking */}
          {showVehicles && vehicles.map((veh) => (
            <Marker key={veh.id} position={[veh.current_lat, veh.current_lng]} icon={vehicleIcon}>
              <Popup>
                <div className="text-xs p-1 space-y-1">
                  <div className="font-bold text-indigo-700 flex items-center">
                    <Truck className="w-3.5 h-3.5 mr-1" />
                    {veh.id} ({veh.model_name})
                  </div>
                  <div>Driver: {veh.driver_name} ({veh.driver_phone})</div>
                  <div>Speed: {veh.current_speed_kmh} km/h • Status: <span className="font-bold">{veh.status}</span></div>
                  {veh.is_anomaly && (
                    <div className="text-rose-600 font-bold bg-rose-50 p-1 rounded">
                      ⚠️ Anomaly: {veh.anomaly_reason}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Legend Box */}
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur p-3 rounded-lg border border-slate-200 shadow-md text-xs space-y-1.5 z-[1000]">
          <div className="font-bold text-slate-900 border-b border-slate-100 pb-1">Map Legend</div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-1 bg-emerald-500 rounded"></span>
            <span>Open Highway Corridor</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-1 bg-amber-500 rounded"></span>
            <span>Restricted Traffic (Caution)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-1 bg-rose-500 border-b border-dashed"></span>
            <span>Closed Highway (Blockage)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span>Field Incident Marker</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <span>Strategic Bridge</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
            <span>Tracked Delivery Vehicle</span>
          </div>
        </div>

        {/* Segment Detail Drawer / Side Panel */}
        {selectedSegment && (
          <div className="absolute top-0 right-0 w-80 md:w-96 h-full bg-white border-l border-slate-200 shadow-xl p-5 overflow-y-auto z-[1000] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  {selectedSegment.id}
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-1">{selectedSegment.name}</h3>
              </div>
              <button 
                onClick={() => setSelectedSegment(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="text-slate-500">Operational Status</div>
                <div className="mt-1 flex items-center justify-between">
                  <AccessibilityBadge status={selectedSegment.current_status} />
                  <span className="text-[11px] text-slate-400">Length: {selectedSegment.length_km} km</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1.5 bg-slate-50 p-2 rounded border border-slate-100">
                  {selectedSegment.status_reason}
                </p>
              </div>

              {/* AI Disruption Risk Gauge */}
              <div className="border-t border-slate-100 pt-3">
                <div className="text-slate-500 font-semibold mb-1">AI Disruption Probability (24h)</div>
                <RiskMeter score={selectedSegment.current_risk_score} level={selectedSegment.current_risk_level} />
                <div className="text-[10px] text-slate-400 mt-1">
                  Model: XGBoost Classifier v1.0.0 (Trained on IMD & GSI Landslide Data)
                </div>
              </div>

              {/* Terrain & Geospatial Attributes */}
              <div className="border-t border-slate-100 pt-3 space-y-1.5">
                <div className="text-slate-700 font-bold">Terrain & Hydrology Attributes:</div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Elevation:</span>
                  <span className="font-semibold text-slate-800">{selectedSegment.elevation_m} meters</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Slope Steepness:</span>
                  <span className="font-semibold text-slate-800">{selectedSegment.slope_degrees}°</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Soil Lithology:</span>
                  <span className="font-semibold text-slate-800">{selectedSegment.soil_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Distance to Major River:</span>
                  <span className="font-semibold text-slate-800">{selectedSegment.distance_to_river_km} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Road Class & Surface:</span>
                  <span className="font-semibold text-slate-800">{selectedSegment.road_class} ({selectedSegment.surface_type})</span>
                </div>
              </div>

              {/* Coordinates info */}
              <div className="border-t border-slate-100 pt-3">
                <div className="text-[10px] text-slate-400 font-mono">
                  Start: {selectedSegment.start_lat.toFixed(4)}, {selectedSegment.start_lng.toFixed(4)}<br />
                  End: {selectedSegment.end_lat.toFixed(4)}, {selectedSegment.end_lng.toFixed(4)}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Last Updated: {new Date(selectedSegment.last_status_update).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

