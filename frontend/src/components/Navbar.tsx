import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Bell, Cloud, CloudOff, RefreshCw, LogOut, User as UserIcon } from 'lucide-react';
import { getPendingIncidents, syncPendingIncidents } from '../services/offlineStore';

export const NER_STATES = [
  'ALL',
  'Assam',
  'Arunachal Pradesh',
  'Meghalaya',
  'Manipur',
  'Mizoram',
  'Nagaland',
  'Sikkim',
  'Tripura'
];

interface NavbarProps {
  selectedState: string;
  onSelectState: (state: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ selectedState, onSelectState }) => {
  const { user, logout } = useAuth();
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check pending offline incidents
    const checkPending = async () => {
      try {
        const pending = await getPendingIncidents();
        setPendingSyncCount(pending.length);
      } catch (e) {
        // IDB might not be loaded yet
      }
    };
    checkPending();
    const interval = setInterval(checkPending, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const handleSyncNow = async () => {
    setIsSyncing(true);
    try {
      const res = await syncPendingIncidents();
      alert(`Offline Sync Complete! Synced: ${res.synced}, Failed: ${res.failed}`);
      const pending = await getPendingIncidents();
      setPendingSyncCount(pending.length);
    } catch (err) {
      alert("Sync error. Please check server connection.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <header className="bg-[#0F2942] text-white sticky top-0 z-50 border-b border-slate-700 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        
        {/* Brand & Emblem */}
        <div className="flex items-center space-x-3">
          <div className="bg-amber-500 text-[#0F2942] font-black p-2 rounded-md flex items-center justify-center tracking-wider">
            <Shield className="w-5 h-5 mr-1" />
            <span className="font-extrabold text-xs">MDoNER</span>
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white flex items-center">
              NER SmartLogistics <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-blue-600 rounded text-blue-100 font-mono">AI</span>
            </h1>
            <p className="text-[11px] text-slate-300 hidden sm:block">SIH26002 Accessibility Intelligence & Disaster Resilience</p>
          </div>
        </div>

        {/* State Filter & Actions */}
        <div className="flex items-center space-x-4">
          
          {/* State Selector */}
          <div className="flex items-center text-xs bg-slate-800/80 rounded-md px-2.5 py-1.5 border border-slate-700">
            <span className="text-slate-400 mr-2 hidden md:inline">Region:</span>
            <select
              value={selectedState}
              onChange={(e) => onSelectState(e.target.value)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900 text-white">All 8 NER States</option>
              {NER_STATES.filter(s => s !== 'ALL').map((state) => (
                <option key={state} value={state} className="bg-slate-900 text-white">
                  {state}
                </option>
              ))}
            </select>
          </div>

          {/* Online/Offline & Sync Badge */}
          <div className="flex items-center space-x-2">
            {isOnline ? (
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
                <Cloud className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                <span className="hidden sm:inline">Online</span>
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-amber-900/60 text-amber-300 border border-amber-700/50">
                <CloudOff className="w-3.5 h-3.5 mr-1 text-amber-400" />
                <span className="hidden sm:inline">Offline (PWA)</span>
              </span>
            )}

            {pendingSyncCount > 0 && (
              <button
                onClick={handleSyncNow}
                disabled={isSyncing || !isOnline}
                className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition animate-pulse"
                title="Click to sync offline reports to server"
              >
                <RefreshCw className={`w-3 h-3 mr-1 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{pendingSyncCount} Pending Sync</span>
              </button>
            )}
          </div>

          {/* User Role Badge & Logout */}
          {user ? (
            <div className="flex items-center space-x-3 border-l border-slate-700 pl-3">
              <div className="text-right hidden md:block">
                <div className="text-xs font-medium text-white">{user.full_name}</div>
                <div className="text-[10px] text-amber-300 font-mono tracking-wider">{user.role}</div>
              </div>
              <button
                onClick={logout}
                className="p-1.5 text-slate-400 hover:text-rose-400 rounded-md transition"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="border-l border-slate-700 pl-3">
              <span className="text-xs text-slate-400">Public Portal</span>
            </div>
          )}

        </div>

      </div>
    </header>
  );
};

