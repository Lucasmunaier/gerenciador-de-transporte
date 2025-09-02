import React from 'react';
import { APP_TITLE } from '../constants';
import { CheckCircleIcon } from './icons';

interface LandingPageProps {
  onNavigateToRegister: () => void;
  onNavigateToLogin: () => void;
  onNavigateToContact: () => void; // <-- Nova propriedade
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToRegister, onNavigateToLogin, onNavigateToContact }) => {
  const features = [
    "Gerenciamento completo de passageiros",
    "Registro detalhado de viagens",
    "Controle de abastecimentos e consumo",
    "Geração de cobranças em PDF",
    "Envio de cobranças via WhatsApp",
    "Relatórios financeiros"
  ];

  return (
    <div className="bg-slate-50">
      {/* Header Público */}
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <img src="/favicon.png" alt="Logo" className="w-8 h-8" />
            <span className="font-bold text-xl text-blue-700">{APP_TITLE}</span>
          </div>
          <div className="space-x-4">
            <button onClick={onNavigateToLogin} className="text-gray-600 hover:text-blue-600 font-semibold">Entrar</button>
            <button onClick={onNavigateToRegister} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">Cadastre-se Grátis</button>
          </div>
        </nav>
      </header>

      {/* Seção Principal (Hero) */}
      <main>
        <section className="text-center py-20 bg-white">
          <div className="container mx-auto px-6">
            <h1 className="text-5xl font-extrabold text-gray-800 mb-4">A maneira mais simples de gerenciar suas caronas</h1>
            <p className="text-xl text-gray-600 mb-8">Controle passageiros, viagens, finanças e muito mais. Tudo em um só lugar.</p>
            <button onClick={onNavigateToRegister} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg">Comece a usar agora</button>
          </div>
        </section>

        {/* Seção de Funcionalidades */}
        <section id="features" className="py-20">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Funcionalidades Incríveis</h2>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-4">Tudo sob controle</h3>
                <p className="text-gray-700 mb-6">Nunca mais perca o controle de quem pagou ou quanto você gastou com combustível. Nossa plataforma organiza tudo para você.</p>
                <ul className="space-y-4">
                  {features.map(feature => (
                    <li key={feature} className="flex items-start">
                      <CheckCircleIcon className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-1" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gray-200 h-80 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Você pode colocar um GIF do app aqui</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Rodapé Público */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-6 text-center">
          {/* Link para Fale Conosco adicionado aqui */}
          <div className="mb-4">
            <button onClick={onNavigateToContact} className="text-gray-300 hover:text-white hover:underline">
              Fale Conosco
            </button>
          </div>
          <p>&copy; {new Date().getFullYear()} {APP_TITLE}. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;