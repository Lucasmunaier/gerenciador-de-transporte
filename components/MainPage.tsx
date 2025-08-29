import React from 'react';
import { Tab } from '../types';
import { APP_TITLE, TAB_NAMES } from '../constants';
import {
  UserPlusIcon, CalendarDaysIcon, FuelPumpIcon, CreditCardIcon, ChartBarIcon,
  LocationMarkerIcon, UserCircleIcon
} from './icons';

interface MainPageProps {
  setActiveTab: (tab: Tab) => void;
}

const MainPage: React.FC<MainPageProps> = ({ setActiveTab }) => {
  const features = [
    { tab: Tab.PROFILE, icon: <UserCircleIcon className="w-8 h-8 mx-auto mb-4 text-blue-500" />, title: TAB_NAMES[Tab.PROFILE], description: "Gerencie suas informações pessoais e de conta." },
    { tab: Tab.PASSENGERS, icon: <UserPlusIcon className="w-8 h-8 mx-auto mb-4 text-green-500" />, title: TAB_NAMES[Tab.PASSENGERS], description: "Adicione, edite e remova passageiros." },
    { tab: Tab.TRIPS, icon: <CalendarDaysIcon className="w-8 h-8 mx-auto mb-4 text-indigo-500" />, title: TAB_NAMES[Tab.TRIPS], description: "Registre as viagens de seus passageiros." },
    { tab: Tab.NAVIGATION, icon: <LocationMarkerIcon className="w-8 h-8 mx-auto mb-4 text-purple-500" />, title: TAB_NAMES[Tab.NAVIGATION], description: "Planeje e navegue por suas rotas." },
    { tab: Tab.FUEL_LOGS, icon: <FuelPumpIcon className="w-8 h-8 mx-auto mb-4 text-yellow-500" />, title: TAB_NAMES[Tab.FUEL_LOGS], description: "Controle seus abastecimentos e consumo." },
    { tab: Tab.BILLING, icon: <CreditCardIcon className="w-8 h-8 mx-auto mb-4 text-red-500" />, title: TAB_NAMES[Tab.BILLING], description: "Realize a cobrança de seus passageiros." },
    { tab: Tab.REPORTS, icon: <ChartBarIcon className="w-8 h-8 mx-auto mb-4 text-teal-500" />, title: TAB_NAMES[Tab.REPORTS], description: "Visualize relatórios financeiros e operacionais." },
  ];

  return (
    <div className="text-center">
      <img src="/favicon.png" alt="Logo" className="w-auto h-40 mx-auto mb-4" />
      <h1 className="text-4xl font-bold text-gray-800 mb-2">{APP_TITLE}</h1>
      <p className="text-lg text-gray-600 mb-8">Seu assistente para gerenciamento de transporte.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <div key={feature.tab} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => setActiveTab(feature.tab)}>
            {feature.icon}
            <h2 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h2>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MainPage;