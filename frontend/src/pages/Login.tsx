import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, User as UserIcon, ArrowRight, CheckCircle2 } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('superadmin@ner.gov.in');
  const [password, setPassword] = useState('Admin@12345');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const success = await login(username, password);
    setIsLoading(false);

    if (success) {
      navigate('/');
    } else {
      setError('Invalid username or password. Please verify credentials.');
    }
  };

  const handleQuickDemoLogin = (email: string, pass: string) => {
    setUsername(email);
    setPassword(pass);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20 mb-4">
          <Shield className="w-9 h-9" />
        </div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">
          NER SmartLogistics AI
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Ministry of Development of North Eastern Region (MDoNER)
        </p>
        <p className="text-[11px] text-amber-400 font-mono mt-0.5">SIH 2026 Problem Statement SIH26002</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-800 py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-slate-700">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-lg p-3">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Official Email or Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="name@ner.gov.in"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Secure Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition cursor-pointer"
            >
              {isLoading ? 'Verifying Credentials...' : 'Authenticate & Enter Platform'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </form>

          {/* Quick Demo Accounts Selection */}
          <div className="mt-6 pt-6 border-t border-slate-700">
            <div className="text-[11px] font-semibold text-slate-400 mb-2 uppercase tracking-wider text-center">
              Quick Role Demonstration Accounts
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('superadmin@ner.gov.in', 'Admin@12345')}
                className="p-2 rounded bg-slate-900 hover:bg-slate-700 border border-slate-700 text-left text-slate-200 transition"
              >
                <div className="font-bold text-amber-400">Super Admin</div>
                <div className="text-[10px] text-slate-400">Full System Control</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('mdoner.admin@ner.gov.in', 'Govt@12345')}
                className="p-2 rounded bg-slate-900 hover:bg-slate-700 border border-slate-700 text-left text-slate-200 transition"
              >
                <div className="font-bold text-blue-400">Govt Admin</div>
                <div className="text-[10px] text-slate-400">State/NER Overview</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('district.officer@assam.gov.in', 'District@12345')}
                className="p-2 rounded bg-slate-900 hover:bg-slate-700 border border-slate-700 text-left text-slate-200 transition"
              >
                <div className="font-bold text-emerald-400">District Officer</div>
                <div className="text-[10px] text-slate-400">Verify & Approve Roads</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('field.officer@ner.gov.in', 'Field@12345')}
                className="p-2 rounded bg-slate-900 hover:bg-slate-700 border border-slate-700 text-left text-slate-200 transition"
              >
                <div className="font-bold text-purple-400">Field Officer</div>
                <div className="text-[10px] text-slate-400">Offline PWA Reporting</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('logistics@ner-trans.in', 'Logistics@12345')}
                className="p-2 rounded bg-slate-900 hover:bg-slate-700 border border-slate-700 text-left text-slate-200 transition"
              >
                <div className="font-bold text-cyan-400">Logistics Operator</div>
                <div className="text-[10px] text-slate-400">Fleet & Consignments</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('public@viewer.in', 'Public@12345')}
                className="p-2 rounded bg-slate-900 hover:bg-slate-700 border border-slate-700 text-left text-slate-200 transition"
              >
                <div className="font-bold text-slate-300">Public Viewer</div>
                <div className="text-[10px] text-slate-400">Read-Only Safety Alerts</div>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

