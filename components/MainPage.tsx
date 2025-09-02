import React from 'react';
import { Tab } from '../types';
import { APP_TITLE, TAB_NAMES } from '../constants';
import {
  UserCircleIcon,
  UserPlusIcon,
  CalendarDaysIcon,
  LocationMarkerIcon,
  FuelPumpIcon,
  CreditCardIcon,
  ChartBarIcon,
  ArrowLeftOnRectangleIcon // Ícone importado para o botão de Sair
} from './icons';

interface MainPageProps {
  setActiveTab: (tab: Tab) => void;
  handleLogout: () => Promise<void>; // Prop para a função de logout
}

const MainPage: React.FC<MainPageProps> = ({ setActiveTab, handleLogout }) => {
  const features = [
    { tab: Tab.PROFILE, icon: <UserCircleIcon className="w-8 h-8 text-blue-500" />, title: TAB_NAMES[Tab.PROFILE], description: "Gerencie suas informações pessoais e de conta." },
    { tab: Tab.PASSENGERS, icon: <UserPlusIcon className="w-8 h-8 text-green-500" />, title: TAB_NAMES[Tab.PASSENGERS], description: "Adicione, edite e remova passageiros." },
    { tab: Tab.TRIPS, icon: <CalendarDaysIcon className="w-8 h-8 text-indigo-500" />, title: TAB_NAMES[Tab.TRIPS], description: "Registre as viagens de seus passageiros." },
    { tab: Tab.NAVIGATION, icon: <LocationMarkerIcon className="w-8 h-8 text-purple-500" />, title: TAB_NAMES[Tab.NAVIGATION], description: "Planeje e navegue por suas rotas." },
    { tab: Tab.FUEL_LOGS, icon: <FuelPumpIcon className="w-8 h-8 text-yellow-500" />, title: TAB_NAMES[Tab.FUEL_LOGS], description: "Controle seus abastecimentos e consumo." },
    { tab: Tab.BILLING, icon: <CreditCardIcon className="w-8 h-8 text-red-500" />, title: TAB_NAMES[Tab.BILLING], description: "Realize a cobrança de seus passageiros." },
    { tab: Tab.REPORTS, icon: <ChartBarIcon className="w-8 h-8 text-teal-500" />, title: TAB_NAMES[Tab.REPORTS], description: "Visualize relatórios financeiros e operacionais." },
  ];

  return (
    <div className="relative text-center">
      {/* Botão de Sair no canto superior direito */}
      <button
        onClick={handleLogout}
        className="absolute -top-4 -right-4 sm:-top-2 sm:-right-2 flex items-center space-x-2 p-2 text-gray-500 hover:text-red-600 transition-colors rounded-full hover:bg-gray-100"
        title="Sair"
      >
        <span className="text-sm font-semibold hidden sm:inline">Sair</span>
        <ArrowLeftOnRectangleIcon className="w-6 h-6" />
      </button>
      
      {/* Conteúdo da Página */}
      <img src="/favicon.png" alt="Logo" className="w-40 h-auto mx-auto mb-4" />
      <h1 className="text-4xl font-bold text-gray-800 mb-2">{APP_TITLE}</h1>
      <p className="text-lg text-gray-600 mb-8">Seu assistente para gerenciamento de transporte.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <div 
            key={feature.tab} 
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer flex flex-col items-center text-center"
            onClick={() => setActiveTab(feature.tab)}
          >
            <div className="mb-4">{feature.icon}</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h2>
            <p className="text-gray-600 text-sm">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MainPage;