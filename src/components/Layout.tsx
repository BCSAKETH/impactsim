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
  Radio,
  Clock,
  AlertTriangle,
  Leaf,
  Heart,
  BarChart3,
  MapPin,
  Send,
  MessageSquare,
  TrendingUp,
  Download,
  Info,
  ArrowDown,
  Globe,
  Calendar,
  Filter,
  Play,
  Sparkles,
  ArrowRight,
  Plus,
  Zap,
  LayoutGrid,
  Search,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
  BookOpen,
  Users
} from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { useSimulation } from '../context/SimulationContext';
import { TERMS } from './StartupDictionary';

import { toast } from 'sonner';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const { user } = useAuth();
  const { t } = useSimulation();
  const navItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutGrid },
    { id: 'hub', label: t('hub'), icon: Network },
    { id: 'sprint', label: t('sprint'), icon: Zap },
    { id: 'workspace', label: t('workspace'), icon: Wrench },
    { id: 'boardroom', label: t('boardroom'), icon: Users },
    { id: 'dictionary', label: t('dictionary'), icon: BookOpen },
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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Zap size={24} fill="currentColor" />
          </div>
          <span className="font-headline font-black text-indigo-950 text-2xl tracking-tighter">Yukti</span>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Master the Art of Execution</p>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-4 py-3 px-4 rounded-xl transition-all duration-300 font-headline relative group",
              activeTab === item.id 
                ? "text-teal-900 font-bold bg-white shadow-sm border border-slate-200" 
                : "text-slate-500 hover:text-teal-800 hover:bg-white/50"
            )}
          >
            {activeTab === item.id && (
              <motion.div 
                layoutId="active-tab-indicator"
                className="absolute left-0 w-1 h-6 bg-teal-600 rounded-r-full"
              />
            )}
            <item.icon size={20} className={cn(activeTab === item.id ? "text-teal-600" : "text-slate-400 group-hover:text-teal-600")} />
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
  const { state, updateState, startNewSimulation, t } = useSimulation();

  const notifications = state.notifications || [];

  const [settingsState, setSettingsState] = useState({
    emailNotifs: true,
    pushNotifs: true,
    autoSave: true,
    aiModel: 'gemini-2.0-flash',
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
      const filteredSims = userSims.filter(sim => 
        (sim.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sim.description?.toLowerCase().includes(searchQuery.toLowerCase()))
      ).map(s => ({ ...s, type: 'simulation' }));

      const filteredTerms = TERMS.filter(t => 
        t.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.definition.toLowerCase().includes(searchQuery.toLowerCase())
      ).map(t => ({ ...t, title: t.term, description: t.definition, type: 'term' }));

      setResults([...filteredSims, ...filteredTerms]);
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
      <div className="flex items-center gap-6 flex-1">
        {/* Top Search Engine */}
        <div className="relative" ref={searchRef}>
          <div className="flex items-center gap-4 bg-slate-200/50 px-4 py-2 rounded-full w-80 transition-all focus-within:w-96 focus-within:bg-white focus-within:shadow-md border border-transparent focus-within:border-slate-200">
            <Search size={18} className="text-slate-400" />
            <input 
              type="text" 
              placeholder={t('search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim().length > 1 && setIsSearching(true)}
              className="bg-transparent border-none focus:ring-0 text-sm w-full font-body outline-none text-slate-700 font-medium"
            />
          </div>

          {/* Search Results Dropdown */}
          <AnimatePresence>
            {isSearching && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 w-[450px] mt-3 bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden z-50"
              >
                <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Search Intelligence — {results.length} results
                  </p>
                  {results.length > 0 && <span className="text-[9px] font-black text-teal-600 uppercase tracking-widest px-2 py-0.5 bg-teal-50 rounded">Results Ready</span>}
                </div>
                <div className="max-h-[400px] overflow-y-auto divide-y divide-slate-50">
                  {results.length > 0 ? (
                    results.map((res) => (
                      <button
                        key={res.id || res.term}
                        className="w-full flex items-center gap-4 p-5 hover:bg-teal-50/30 transition-all text-left group"
                        onClick={async () => {
                          if (res.type === 'simulation') {
                            await startNewSimulation({ id: res.id, name: res.title, region: res.category });
                            setActiveTab('workspace');
                          } else {
                            setActiveTab('dictionary');
                            const element = document.getElementById(`term-${res.term}`);
                            element?.scrollIntoView({ behavior: 'smooth' });
                          }
                          setSearchQuery('');
                          setIsSearching(false);
                        }}
                      >
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center transition-transform group-hover:scale-110",
                          res.type === 'simulation' ? "bg-teal-50 text-teal-600" : "bg-indigo-50 text-indigo-600"
                        )}>
                          {res.type === 'simulation' ? <Zap size={20} /> : <BookOpen size={20} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-slate-900 truncate group-hover:text-teal-700 transition-colors">
                              {res.title || res.term}
                            </span>
                            <span className="text-[8px] font-black uppercase px-2 py-0.5 bg-slate-100 rounded text-slate-400 group-hover:bg-white transition-colors">
                              {res.type === 'simulation' ? 'Venture' : 'Term'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 truncate line-clamp-1">{res.description || res.definition}</p>
                        </div>
                        <ChevronRight size={16} className="text-slate-300 group-hover:text-teal-500 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
                      </button>
                    ))
                  ) : (
                    <div className="p-12 text-center text-slate-400">
                      <Search size={24} className="mx-auto mb-2 opacity-20" />
                      No matches found
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Localized Language Switcher - NOW BESIDE NOTIFICATIONS */}
        <div className="flex bg-slate-200/50 p-1.5 rounded-[1.2rem] items-center gap-1 border border-slate-200 backdrop-blur-sm">
           {['English', 'Hindi', 'Telugu'].map((lang) => (
             <button
               key={lang}
               onClick={() => {
                 updateState({ gameLanguage: lang });
                 toast.success(`${t('language')}: ${lang}`);
               }}
               className={cn(
                 "px-4 py-2 rounded-[0.8rem] text-[10px] font-black uppercase tracking-widest transition-all relative overflow-hidden group",
                 (state.gameLanguage || 'English') === lang 
                   ? "bg-white text-teal-600 shadow-md border border-white" 
                   : "text-slate-500 hover:text-slate-800 hover:bg-white/40"
               )}
             >
               <span className="relative z-10">{lang === 'English' ? 'EN' : lang === 'Hindi' ? 'HI' : 'TE'}</span>
             </button>
           ))}
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => { setShowNotifications(!showNotifications); setShowSettings(false); }}
            className={cn(
              "p-3 rounded-2xl transition-all relative",
              showNotifications ? "bg-teal-50 text-teal-600" : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            )}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] font-black flex items-center justify-center border-2 border-white">{unreadCount}</span>
            )}
          </button>
          
          <AnimatePresence>
            {showNotifications && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                className="absolute top-full right-0 mt-3 w-96 bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden z-50 shadow-[0_20px_50px_rgba(0,0,0,0.1)]"
              >
                <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                  <h4 className="font-headline font-black text-slate-900 border-none uppercase tracking-widest text-xs">{t('notifications')}</h4>
                  <button onClick={markAllRead} className="text-[10px] font-black text-teal-600 hover:underline uppercase tracking-widest">Mark All Read</button>
                </div>
                <div className="max-h-[400px] overflow-y-auto divide-y divide-slate-50">
                  {notifications.length > 0 ? notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      className={cn(
                        "p-6 hover:bg-teal-50/30 transition-all cursor-pointer flex gap-4 border-l-4",
                        !notif.read ? "bg-teal-50/20 border-teal-500" : "border-transparent"
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <p className={cn("text-xs font-black uppercase tracking-tight", !notif.read ? "text-slate-900" : "text-slate-500")}>{notif.title}</p>
                          <span className="text-[9px] font-bold text-slate-400 uppercase">{notif.time}</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="p-10 text-center text-slate-400 text-xs font-medium italic">No new alerts.</div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Global Action Settings */}
        <div className="relative" ref={settingsRef}>
          <button 
            onClick={() => { setShowSettings(!showSettings); setShowNotifications(false); }}
            className={cn(
              "p-3 rounded-2xl transition-all",
              showSettings ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            )}
          >
            <Settings size={20} />
          </button>
          
          <AnimatePresence>
            {showSettings && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                className="absolute top-full right-0 mt-3 w-80 bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden z-50 p-6 space-y-6"
              >
                 <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-3xl border border-slate-100">
                    <img 
                      src={user?.photoURL || "https://i.pravatar.cc/150?u=alex"} 
                      alt={user?.displayName || "User"} 
                      className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-xs text-slate-900 truncate uppercase tracking-tight">{user?.displayName || 'Architect'}</p>
                      <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                    </div>
                 </div>

                 <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{t('settings')}</p>
                    {[{ key: 'emailNotifs' as const, label: 'Email Alerts' }, { key: 'autoSave' as const, label: 'Mission Auto-Save' }].map((toggle) => (
                      <div key={toggle.key} className="flex items-center justify-between py-2 group">
                        <span className="text-xs text-slate-600 font-bold group-hover:text-slate-950 transition-colors uppercase tracking-tight">{toggle.label}</span>
                        <button
                          onClick={() => setSettingsState(prev => ({ ...prev, [toggle.key]: !prev[toggle.key] }))}
                          className={cn("w-10 h-6 rounded-full transition-all relative", settingsState[toggle.key] ? "bg-teal-600 scale-110 shadow-lg shadow-teal-600/20" : "bg-slate-200")}
                        >
                          <div className={cn("w-3.5 h-3.5 bg-white rounded-full absolute top-1.5 transition-all shadow-sm", settingsState[toggle.key] ? "left-5.5" : "left-1.5")} />
                        </button>
                      </div>
                    ))}
                 </div>

                 <button 
                  onClick={async () => { await signOut(auth); toast.success('Signed out'); }}
                  className="w-full py-4 bg-red-50 text-red-600 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  <LogOut size={16} />
                  {t('logout')}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>
        <div className="flex items-center gap-4 bg-teal-900 text-white px-5 py-2 rounded-2xl shadow-lg shadow-teal-900/20">
          <div className="flex flex-col">
            <span className="text-[7px] font-black uppercase tracking-[0.2em] text-teal-400">Impact Score</span>
            <span className="text-sm font-black tracking-tighter leading-none">{(state.impactScore ?? 4250).toLocaleString()}</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/10 font-headline font-black text-xs text-teal-300">{initials}</div>
        </div>
      </div>
    </header>
  );
}
