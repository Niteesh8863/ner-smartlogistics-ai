import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Consignment, CargoType, ConsignmentPriority, ConsignmentStatus, Vehicle } from '../types';
import { Package, Truck, Clock, AlertTriangle, CheckCircle2, Plus, ArrowRight } from 'lucide-react';

export const Consignments: React.FC = () => {
  const [consignments, setConsignments] = useState<Consignment[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  // New Consignment Form
  const [newTitle, setNewTitle] = useState('');
  const [cargoType, setCargoType] = useState<CargoType>('MEDICINE');
  const [priority, setPriority] = useState<ConsignmentPriority>('HIGH');
  const [weightTons, setWeightTons] = useState<number>(3.5);
  const [originName, setOriginName] = useState('Guwahati Central Depot');
  const [destName, setDestName] = useState('Kohima Civil Hospital');
  const [assignedVehicleId, setAssignedVehicleId] = useState('');

  const fetchConsignments = async () => {
    try {
      const [cRes, vRes] = await Promise.all([
        api.get<Consignment[]>('/consignments'),
        api.get<Vehicle[]>('/vehicles')
      ]);
      setConsignments(cRes.data);
      setVehicles(vRes.data);
      if (vRes.data.length > 0) setAssignedVehicleId(vRes.data[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsignments();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `CNS-NER-2026-${Math.floor(100 + Math.random() * 900)}`;

    try {
      await api.post('/consignments', {
        id: newId,
        title: newTitle,
        cargo_type: cargoType,
        priority: priority,
        weight_tons: weightTons,
        origin_name: originName,
        origin_lat: 26.1445,
        origin_lng: 91.7362,
        destination_name: destName,
        destination_lat: 25.6751,
        destination_lng: 94.1086,
        assigned_vehicle_id: assignedVehicleId || null
      });
      setShowCreateModal(false);
      setNewTitle('');
      fetchConsignments();
    } catch (err) {
      alert("Failed to register consignment.");
    }
  };

  const handleUpdateStatus = async (id: string, status: ConsignmentStatus) => {
    try {
      await api.patch(`/consignments/${id}/status`, { status });
      fetchConsignments();
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <span className="px-2.5 py-0.5 text-xs font-bold bg-cyan-100 text-cyan-800 rounded-md">
            MODULE E: ESSENTIAL SUPPLIES SUPPLY CHAIN
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Essential Goods Consignment Dispatch & Priority Tracking
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cold-chain medicine, emergency food rations, agricultural supply, and strategic construction shipments
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="mt-3 md:mt-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Register New Consignment
        </button>
      </div>

      {/* Consignments Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Consignment ID & Cargo</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Origin / Destination</th>
                <th className="py-3 px-4">Vehicle</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {consignments.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{c.title}</div>
                    <div className="text-[11px] font-mono text-blue-600">{c.id} • {c.weight_tons} Tons</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                      {c.cargo_type}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      c.priority === 'CRITICAL' ? 'bg-rose-100 text-rose-800' :
                      c.priority === 'HIGH' ? 'bg-amber-100 text-amber-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {c.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-slate-800 font-medium">{c.origin_name}</div>
                    <div className="text-slate-500 flex items-center mt-0.5 text-[11px]">
                      <ArrowRight className="w-3 h-3 mr-1" />
                      {c.destination_name}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-indigo-700">
                    {c.assigned_vehicle_id || <span className="text-slate-400">Unassigned</span>}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      c.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' :
                      c.status === 'DELAYED' ? 'bg-rose-100 text-rose-800' :
                      c.status === 'IN_TRANSIT' ? 'bg-blue-100 text-blue-800' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-1">
                    {c.status !== 'DELIVERED' && (
                      <button
                        onClick={() => handleUpdateStatus(c.id, 'DELIVERED')}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded font-semibold text-[11px] transition cursor-pointer"
                      >
                        Confirm Delivery
                      </button>
                    )}
                    {c.status === 'IN_TRANSIT' && (
                      <button
                        onClick={() => handleUpdateStatus(c.id, 'DELAYED')}
                        className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded font-semibold text-[11px] transition cursor-pointer"
                      >
                        Flag Delay
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Register New Essential Consignment</h3>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Consignment Title / Description</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Life-saving Antibiotics & Insulin Supply"
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cargo Category</label>
                  <select
                    value={cargoType}
                    onChange={(e) => setCargoType(e.target.value as CargoType)}
                    className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50"
                  >
                    <option value="MEDICINE">MEDICINE (Critical Cold-Chain)</option>
                    <option value="FOOD">FOOD (Emergency Ration / Grains)</option>
                    <option value="AGRI">AGRI (Perishable Vegetables/Produce)</option>
                    <option value="CONSTRUCTION">CONSTRUCTION (Heavy Bridge Steel)</option>
                    <option value="EMERGENCY">EMERGENCY (Disaster Relief Gear)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as ConsignmentPriority)}
                    className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Weight (Tons)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={weightTons}
                    onChange={(e) => setWeightTons(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assign Transport Vehicle</label>
                  <select
                    value={assignedVehicleId}
                    onChange={(e) => setAssignedVehicleId(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50"
                  >
                    <option value="">Leave Unassigned</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.id} ({v.driver_name})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Origin Logistics Point</label>
                <input
                  type="text"
                  required
                  value={originName}
                  onChange={(e) => setOriginName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Destination Facility</label>
                <input
                  type="text"
                  required
                  value={destName}
                  onChange={(e) => setDestName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700"
                >
                  Create Consignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

