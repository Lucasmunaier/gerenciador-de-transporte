// ARQUIVO: constants.ts

import { Tab, TripType } from './types';

export const APP_TITLE = "Gerenciador de Transporte";

export const TAB_NAMES: Record<Tab, string> = {
  [Tab.PASSENGERS]: "Gerenciar Passageiros",
  [Tab.TRIPS]: "Registro de Viagens",
  [Tab.FUEL_LOGS]: "Abastecimentos",
  [Tab.BILLING]: "Cobrança",
  [Tab.REPORTS]: "Relatórios",
  [Tab.PROFILE]: "Meu Perfil",
  [Tab.NAVIGATION]: "Navegação", // Novo
};

export const TRIP_TYPE_OPTIONS = [
  { value: TripType.IDA, label: "Ida" },
  { value: TripType.VOLTA, label: "Volta" },
  { value: TripType.AMBOS, label: "Ida e Volta" },
];