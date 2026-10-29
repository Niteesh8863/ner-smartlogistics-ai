import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { User, UserRole } from '../types';
import { Users, Plus, Shield, CheckCircle, Mail, Phone, Building } from 'lucide-react';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);

  // Form state
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('FIELD_OFFICER');
  const [department, setDepartment] = useState('Public Works Department');
  const [state, setState] = useState('Assam');
  const [district, setDistrict] = useState('Kamrup Metropolitan');

  const fetchUsers = async () => {
    try {
      const res = await api.get<User[]>('/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/users', {
        email,
        username,
        password,
        full_name: fullName,
        role,
        department,
        state,
        district
      });
      setShowModal(false);
      setEmail('');
      setUsername('');
      setPassword('');
      setFullName('');
      fetchUsers();
    } catch (err) {
      alert("Failed to create user account.");
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <span className="px-2.5 py-0.5 text-xs font-bold bg-slate-100 text-slate-800 rounded-md">
            MODULE J: GOVERNMENT RBAC & ACCESS CONTROL
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Departmental User & Role Authorization
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Role-Based Access Control (RBAC) enforced on backend across all 6 administrative tiers
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Create User Account
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role Tier</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Jurisdiction</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{u.full_name}</div>
                    <div className="text-slate-500 font-mono text-[11px]">{u.email}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                      u.role === 'SUPER_ADMIN' ? 'bg-amber-100 text-amber-800' :
                      u.role === 'GOVT_ADMIN' ? 'bg-blue-100 text-blue-800' :
                      u.role === 'DISTRICT_OFFICER' ? 'bg-emerald-100 text-emerald-800' :
                      u.role === 'FIELD_OFFICER' ? 'bg-purple-100 text-purple-800' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-700">
                    {u.department || 'General'}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {u.district ? `${u.district}, ${u.state}` : (u.state || 'All NER States')}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center text-emerald-600 font-semibold text-[11px]">
                      <CheckCircle className="w-3.5 h-3.5 mr-1" /> Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Provision New Government User</h3>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Username</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 font-bold"
                  >
                    <option value="GOVT_ADMIN">GOVT_ADMIN</option>
                    <option value="DISTRICT_OFFICER">DISTRICT_OFFICER</option>
                    <option value="FIELD_OFFICER">FIELD_OFFICER</option>
                    <option value="LOGISTICS_OPERATOR">LOGISTICS_OPERATOR</option>
                    <option value="PUBLIC_VIEWER">PUBLIC_VIEWER</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700"
                >
                  Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

