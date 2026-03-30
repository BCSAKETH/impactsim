import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { SIMULATIONS } from '../constants';
import { 
  LayoutDashboard, 
  Network, 
  Wrench, 
  Wallet, 
  BarChart3, 
  Settings, 
  Bell,
  Search,
  ChevronRight,
  Play,
  ArrowRight,
  TrendingUp,
  Users,
  Heart,
  Info,
  Send,
  Plus,
  Star,
  Zap,
  Download,
  RefreshCcw,
  AlertTriangle,
  MessageSquare,
  MapPin,
  Leaf,
  LogOut
} from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { cn } from '../lib/utils';
import { useSimulation } from '../context/SimulationContext';

import { toast } from 'sonner';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const { user } = useAuth();
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'hub', label: 'Simulation Hub', icon: Network },
    { id: 'workspace', label: 'Active Workspace', icon: Wrench },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-slate-100 flex flex-col py-10 px-6 z-50 border-r border-slate-200">
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl signature-gradient flex items-center justify-center text-white">
            <Zap size={24} fill="currentColor" />
          </div>
          <span className="font-headline font-black text-teal-900 text-2xl tracking-tighter">Yukti</span>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Master the Art of Execution</p>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-4 py-3 px-4 rounded-xl transition-all duration-200 font-headline",
              activeTab === item.id 
                ? "text-teal-900 font-bold border-r-4 border-teal-900 bg-white/50" 
                : "text-slate-600 hover:text-teal-800 hover:bg-white/30"
            )}
          >
            <item.icon size={20} />
            <span className="text-lg">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-10">
        <div className="p-4 rounded-2xl bg-slate-200/50 flex items-center gap-3 relative group">
          <img 
            src={user?.photoURL || "https://i.pravatar.cc/150?u=alex"} 
            alt={user?.displayName || "User"} 
            className="w-10 h-10 rounded-full border-2 border-primary/20"
            referrerPolicy="no-referrer"
          />
          <div className="overflow-hidden flex-1">
            <p className="font-bold text-sm text-on-surface truncate">{user?.displayName || "Architect"}</p>
            <p className="text-xs text-on-surface-variant truncate">{user?.email}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-red-600 transition-colors"
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}

export function TopBar({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [userSims, setUserSims] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const { state, updateState, startNewSimulation } = useSimulation();

  const notifications = state.notifications || [];

  const [settingsState, setSettingsState] = useState({
    emailNotifs: true,
    pushNotifs: true,
    autoSave: true,
    aiModel: 'gemini-2.0-flash',
    language: 'English',
  });

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'simulations'), where('authorUid', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sims: any[] = [];
      snapshot.forEach((doc) => {
        sims.push({ id: doc.id, ...doc.data() });
      });
      setUserSims(sims);
    });
    return unsubscribe;
  }, [user]);

  const initials = user?.displayName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'AR';

  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const filtered = userSims.filter(sim => 
        sim.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sim.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setResults(filtered);
      setIsSearching(true);
    } else {
      setResults([]);
      setIsSearching(false);
    }
  }, [searchQuery, userSims]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearching(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllRead = () => {
    updateState({ notifications: notifications.map(n => ({ ...n, read: true })) });
    toast.success('All notifications marked as read');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="fixed top-0 right-0 w-[calc(100%-16rem)] z-40 bg-slate-50/80 backdrop-blur-md h-20 px-10 flex justify-between items-center border-b border-slate-200">
      <div className="relative" ref={searchRef}>
        <div className="flex items-center gap-4 bg-slate-200/50 px-4 py-2 rounded-full w-96">
          <Search size={18} className="text-outline" />
          <input 
            type="text" 
            placeholder="Search simulations..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.trim().length > 1 && setIsSearching(true)}
            className="bg-transparent border-none focus:ring-0 text-sm w-full font-body outline-none"
          />
        </div>

        {/* Search Results Dropdown */}
        {isSearching && (
          <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50">
            <div className="p-4 border-b border-slate-50">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {results.length} Results Found
              </p>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {results.length > 0 ? (
                results.map((sim) => (
                  <button
                    key={sim.id}
                    className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors text-left group"
                    onClick={async () => {
                      await startNewSimulation({
                        id: sim.id,
                        name: sim.title,
                        region: sim.category
                      });
                      setSearchQuery('');
                      setIsSearching(false);
                      setActiveTab('workspace');
                      toast.success(`Resumed: ${sim.title}`);
                    }}
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                      <img src={sim.image} alt={sim.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-headline font-bold text-teal-900 truncate group-hover:text-primary transition-colors">{sim.title}</h4>
                      <p className="text-xs text-slate-500 truncate">{sim.description}</p>
                    </div>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-primary transition-all" />
                  </button>
                ))
              ) : (
                <div className="p-8 text-center">
                  <p className="text-slate-400 text-sm">No simulations match your search.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-6">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => { setShowNotifications(!showNotifications); setShowSettings(false); }}
            className="text-slate-600 hover:text-teal-700 transition-colors relative"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center">{unreadCount}</span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute top-full right-0 mt-3 w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                <h4 className="font-headline font-bold text-on-surface">Notifications</h4>
                <button onClick={markAllRead} className="text-xs font-bold text-primary hover:underline">Mark all read</button>
              </div>
              <div className="max-h-96 overflow-y-auto divide-y divide-slate-50">
                {notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    className={cn(
                      "p-4 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3",
                      !notif.read && "bg-teal-50/50"
                    )}
                    onClick={() => {
                      updateState({ notifications: notifications.map(n => n.id === notif.id ? { ...n, read: true } : n) });
                    }}
                  >
                    <div className={cn(
                      "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                      notif.type === 'success' ? 'bg-emerald-500' :
                      notif.type === 'warning' ? 'bg-amber-500' : 'bg-blue-400'
                    )} />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className={cn("text-sm font-bold truncate", !notif.read ? "text-on-surface" : "text-slate-500")}>{notif.title}</p>
                        <span className="text-[10px] text-slate-400 flex-shrink-0 ml-2">{notif.time}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notif.message}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-slate-100 text-center">
                <button onClick={() => { setShowNotifications(false); toast.info('All caught up!'); }} className="text-xs font-bold text-primary hover:underline">View All Notifications</button>
              </div>
            </div>
          )}
        </div>

        {/* Settings */}
        <div className="relative" ref={settingsRef}>
          <button 
            onClick={() => { setShowSettings(!showSettings); setShowNotifications(false); }}
            className="text-slate-600 hover:text-teal-700 transition-colors"
          >
            <Settings size={20} />
          </button>

          {showSettings && (
            <div className="absolute top-full right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50">
              <div className="p-5 border-b border-slate-100">
                <h4 className="font-headline font-bold text-on-surface">Settings</h4>
                <p className="text-xs text-slate-400 mt-1">Configure your preferences</p>
              </div>
              <div className="p-4 space-y-5">
                {/* Profile */}
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <img 
                    src={user?.photoURL || "https://i.pravatar.cc/150?u=alex"} 
                    alt={user?.displayName || "User"} 
                    className="w-10 h-10 rounded-full"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-on-surface truncate">{user?.displayName || 'Architect'}</p>
                    <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                  </div>
                </div>

                {/* Toggles */}
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Preferences</p>
                  {[
                    { key: 'emailNotifs' as const, label: 'Email Notifications' },
                    { key: 'pushNotifs' as const, label: 'Push Notifications' },
                    { key: 'autoSave' as const, label: 'Auto-Save Simulations' },
                  ].map((toggle) => (
                    <div key={toggle.key} className="flex items-center justify-between py-1">
                      <span className="text-sm text-on-surface-variant">{toggle.label}</span>
                      <button
                        onClick={() => {
                          setSettingsState(prev => ({ ...prev, [toggle.key]: !prev[toggle.key] }));
                          toast.success(`${toggle.label} ${settingsState[toggle.key] ? 'disabled' : 'enabled'}`);
                        }}
                        className={cn(
                          "w-10 h-6 rounded-full transition-colors relative",
                          settingsState[toggle.key] ? "bg-primary" : "bg-slate-200"
                        )}
                      >
                        <div className={cn(
                          "w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-sm",
                          settingsState[toggle.key] ? "left-5" : "left-1"
                        )} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* AI Model */}
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI Model</p>
                  <select 
                    value={settingsState.aiModel}
                    onChange={(e) => {
                      setSettingsState(prev => ({ ...prev, aiModel: e.target.value }));
                      toast.success(`AI Model set to ${e.target.value}`);
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-primary transition-colors"
                  >
                    <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                    <option value="gemini-2.0-pro">Gemini 2.0 Pro</option>
                    <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                  </select>
                </div>

                {/* Language */}
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Language</p>
                  <select 
                    value={state.gameLanguage || 'English'}
                    onChange={(e) => {
                      updateState({ gameLanguage: e.target.value });
                      toast.success(`Language set to ${e.target.value}`);
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-primary transition-colors"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                  </select>
                </div>
              </div>

              <div className="p-4 border-t border-slate-100">
                <button 
                  onClick={async () => {
                    try { await signOut(auth); toast.success('Signed out'); } catch(e) { console.error(e); }
                  }}
                  className="w-full py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-teal-900 line-clamp-1">
            Impact Score: <span className="font-bold">{(state.impactScore || 0).toLocaleString()}</span>
          </span>
          <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center text-teal-900 font-bold text-xs shrink-0">{initials}</div>
        </div>
      </div>
    </header>
  );
}
