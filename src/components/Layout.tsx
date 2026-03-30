import { useAuth } from '../App';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
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
import { cn } from '../lib/utils';

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
    { id: 'budgeting', label: 'Budgeting', icon: Wallet },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
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
          <span className="font-headline font-black text-teal-900 text-2xl tracking-tighter">ImpactSim</span>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Visionary Architect</p>
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

export function TopBar({ activeTab }: { activeTab: string }) {
  const { user } = useAuth();
  const initials = user?.displayName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'AR';

  return (
    <header className="fixed top-0 right-0 w-[calc(100%-16rem)] z-40 bg-slate-50/80 backdrop-blur-md h-20 px-10 flex justify-between items-center border-b border-slate-200">
      <div className="flex items-center gap-4 bg-slate-200/50 px-4 py-2 rounded-full w-96">
        <Search size={18} className="text-outline" />
        <input 
          type="text" 
          placeholder="Search simulations..." 
          className="bg-transparent border-none focus:ring-0 text-sm w-full font-body outline-none"
        />
      </div>
      <div className="flex items-center gap-6">
        <button className="text-slate-600 hover:text-teal-700 transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <button className="text-slate-600 hover:text-teal-700 transition-colors">
          <Settings size={20} />
        </button>
        <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-teal-900">Impact Score: <span className="font-bold">2,840</span></span>
          <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center text-teal-900 font-bold text-xs">{initials}</div>
        </div>
      </div>
    </header>
  );
}
