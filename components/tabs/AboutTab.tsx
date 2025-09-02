import React from 'react';
import { APP_TITLE } from '../../constants';

const AboutTab: React.FC = () => {
  return (
    <div className="space-y-6 bg-white p-6 sm:p-8 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-800">Sobre o {APP_TITLE}</h2>
      <div className="prose max-w-none text-gray-700">
        <p>
          Bem-vindo ao {APP_TITLE}, a sua solução completa para gerenciar o transporte de passageiros de forma simples e eficiente.
        </p>
        <p>
          Este projeto foi desenvolvido para ajudar motoristas e organizadores de caronas a manter um controle preciso sobre passageiros, viagens realizadas, despesas com combustível e pagamentos pendentes. Com uma interface intuitiva, nosso objetivo é economizar seu tempo e garantir que nenhuma informação importante seja perdida.
        </p>
        <h3 className="text-2xl font-semibold text-gray-800 mt-6">Nossos Recursos</h3>
        <ul>
          <li><strong>Gerenciamento de Passageiros:</strong> Cadastre e organize as informações de todos os seus passageiros, incluindo endereço e valor por viagem.</li>
          <li><strong>Registro de Viagens:</strong> Lance facilmente as viagens diárias (ida, volta ou ambas) para cada passageiro.</li>
          <li><strong>Controle de Abastecimento:</strong> Mantenha um histórico dos seus gastos com combustível e calcule o consumo médio do seu veículo.</li>
          <li><strong>Cobrança Simplificada:</strong> Gere relatórios de cobrança detalhados para cada passageiro com apenas alguns cliques, com opção de exportar em PDF e enviar via WhatsApp.</li>
          <li><strong>Relatórios Completos:</strong> Tenha uma visão clara das suas receitas, custos e lucros com nossos relatórios financeiros.</li>
        </ul>
        <h3 className="text-2xl font-semibold text-gray-800 mt-6">Desenvolvido por</h3>
        <p>
          Este aplicativo foi criado por Lucas Munaier, com o objetivo de aplicar tecnologias web modernas para resolver um problema do dia a dia.
        </p>
      </div>
    </div>
  );
};

export default AboutTab;