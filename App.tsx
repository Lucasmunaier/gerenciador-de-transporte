import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { User } from '@supabase/supabase-js';
import { AppProvider, useAppContext } from './contexts/AppContext';
import PassengersTab from './components/tabs/PassengersTab';
import TripsTab from './components/tabs/TripsTab';
import FuelLogTab from './components/tabs/FuelLogTab';
import BillingTab from './components/tabs/BillingTab';
import ReportsTab from './components/tabs/ReportsTab';
import ProfileTab from './components/tabs/ProfileTab';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import { Tab } from './types';
import { APP_TITLE, TAB_NAMES } from './constants';
import { 
  UserPlusIcon, CalendarDaysIcon, BeakerIcon, CreditCardIcon, ChartBarIcon,
  ChevronDoubleLeftIcon, ChevronDoubleRightIcon, ArrowLeftOnRectangleIcon,
  Bars3Icon, UserCircleIcon
} from './components/icons';

const MainApp: React.FC<{ user: User }> = ({ user }) => {
  const { profile } = useAppContext();
  const [activeTab, setActiveTab] = useState<Tab>(Tab.PASSENGERS);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleLogout = async () => {
    if (window.confirm("Tem certeza que deseja sair?")) { await supabase.auth.signOut(); }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case Tab.PASSENGERS: return <PassengersTab />;
      case Tab.TRIPS: return <TripsTab />;
      case Tab.FUEL_LOGS: return <FuelLogTab />;
      case Tab.BILLING: return <BillingTab />;
      case Tab.REPORTS: return <ReportsTab />;
      case Tab.PROFILE: return <ProfileTab />;
      default: return null;
    }
  };

  const TabButton: React.FC<{ tab: Tab; icon: React.ReactNode; label: string; isMinimized: boolean; onClick?: () => void; }> = ({ tab, icon, label, isMinimized, onClick }) => (
    <button onClick={() => { setActiveTab(tab); if(onClick) onClick(); }} className={`w-full flex items-center py-2.5 text-sm font-medium rounded-md transition-all duration-150 ease-in-out ${isMinimized ? 'justify-center px-2' : 'justify-start space-x-3 px-3'} ${activeTab === tab ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-700 hover:text-slate-100'}`}>
      {icon} {!isMinimized && <span className="truncate">{label}</span>}
    </button>
  );

  const SidebarContent = ({ isMinimized, onMobileNavClick }: { isMinimized: boolean, onMobileNavClick?: () => void }) => (
    <>
      <div className={`flex-grow space-y-2 ${isMinimized ? 'space-y-3' : 'space-y-2'}`}>
        <TabButton tab={Tab.PASSENGERS} icon={<UserPlusIcon className="w-5 h-5 flex-shrink-0" />} label={TAB_NAMES[Tab.PASSENGERS]} isMinimized={isMinimized} onClick={onMobileNavClick}/>
        <TabButton tab={Tab.TRIPS} icon={<CalendarDaysIcon className="w-5 h-5 flex-shrink-0" />} label={TAB_NAMES[Tab.TRIPS]} isMinimized={isMinimized} onClick={onMobileNavClick}/>
        <TabButton tab={Tab.FUEL_LOGS} icon={<BeakerIcon className="w-5 h-5 flex-shrink-0" />} label={TAB_NAMES[Tab.FUEL_LOGS]} isMinimized={isMinimized} onClick={onMobileNavClick}/>
        <TabButton tab={Tab.BILLING} icon={<CreditCardIcon className="w-5 h-5 flex-shrink-0" />} label={TAB_NAMES[Tab.BILLING]} isMinimized={isMinimized} onClick={onMobileNavClick}/>
        <TabButton tab={Tab.REPORTS} icon={<ChartBarIcon className="w-5 h-5 flex-shrink-0" />} label={TAB_NAMES[Tab.REPORTS]} isMinimized={isMinimized} onClick={onMobileNavClick}/>
        <TabButton tab={Tab.PROFILE} icon={<UserCircleIcon className="w-5 h-5 flex-shrink-0" />} label={TAB_NAMES[Tab.PROFILE]} isMinimized={isMinimized} onClick={onMobileNavClick}/>
      </div>
      <button onClick={handleLogout} className={`w-full flex items-center py-2.5 text-sm font-medium rounded-md text-slate-300 hover:bg-slate-700 hover:text-slate-100 transition-colors duration-150 ${isMinimized ? 'justify-center px-2' : 'justify-start space-x-3 px-3'}`} title="Sair">
          <ArrowLeftOnRectangleIcon className="w-5 h-5 flex-shrink-0" /> {!isMinimized && <span className="truncate">Sair</span>}
      </button>
      <div className="hidden lg:block">
        <button onClick={() => setIsSidebarMinimized(!isSidebarMinimized)} className={`mt-2 w-full flex items-center py-2.5 text-sm font-medium rounded-md text-slate-300 hover:bg-slate-700 hover:text-slate-100 transition-colors duration-150 ${isMinimized ? 'justify-center px-2' : 'justify-start space-x-3 px-3'}`} title={isSidebarMinimized ? "Expandir Menu" : "Minimizar Menu"}>
          {isSidebarMinimized ? <ChevronDoubleRightIcon className="w-5 h-5 flex-shrink-0" /> : <ChevronDoubleLeftIcon className="w-5 h-5 flex-shrink-0" />} {!isMinimized && <span className="truncate">Minimizar</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-100 to-sky-100 text-gray-800">
      <header className="bg-white shadow-lg sticky top-0 z-30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={() => setMobileSidebarOpen(true)} className="lg:hidden mr-4 p-2 text-gray-600 hover:text-blue-700"><Bars3Icon className="w-6 h-6"/></button>
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 tracking-tight">{APP_TITLE}</h1>
          </div>
          <div className="text-sm text-gray-600 hidden sm:block">
            Usuário: <span className="font-semibold">{profile?.full_name || user.email}</span>
          </div>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <div className={`fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity ${isMobileSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setMobileSidebarOpen(false)} aria-hidden="true"></div>
        <nav className={`fixed inset-y-0 left-0 bg-slate-800 text-white p-5 flex flex-col z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`} style={{ width: '15rem' }}>
          <SidebarContent isMinimized={false} onMobileNavClick={() => setMobileSidebarOpen(false)} />
        </nav>
        <nav className={`hidden lg:flex flex-shrink-0 bg-slate-800 text-white overflow-y-auto flex-col transition-all duration-300 ease-in-out ${isSidebarMinimized ? 'w-20 p-3' : 'w-60 p-5'}`} aria-label="Main navigation">
           <SidebarContent isMinimized={isSidebarMinimized}/>
        </nav>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="bg-gray-50 p-4 sm:p-6 rounded-xl shadow-2xl min-h-full">
            {renderTabContent()}
          </div>
        </main>
      </div>
      <footer className="py-4 text-center text-sm text-gray-500 border-t border-gray-200 bg-white">
        <p>&copy; {new Date().getFullYear()} {APP_TITLE}. Todos os direitos reservados.</p>
        <p className="mt-1 text-xs text-gray-400">By: Munaier</p>
      </footer>
    </div>
  );
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'login' | 'register' | 'forgotPassword'>('login');
  
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };
    getSession();
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => { authListener?.subscription.unsubscribe(); };
  }, []);

  if (loading) { return <div className="flex items-center justify-center min-h-screen">Carregando...</div>; }
  
  if (!user) {
    switch (view) {
      case 'register': return <Register onNavigateToLogin={() => setView('login')} />;
      case 'forgotPassword': return <ForgotPassword onNavigateToLogin={() => setView('login')} />;
      default: return <Login onNavigateToRegister={() => setView('register')} onNavigateToForgotPassword={() => setView('forgotPassword')} />;
    }
  }

  return (
    <AppProvider user={user}>
      <MainApp user={user} />
    </AppProvider>
  );
};
export default App;