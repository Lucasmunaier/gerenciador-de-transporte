import React from 'react';
import { APP_TITLE } from '../../constants';

const ContactTab: React.FC = () => {
  return (
    <div className="space-y-6 bg-white p-6 sm:p-8 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-800">Fale Conosco</h2>
      <div className="prose max-w-none text-gray-700">
        <p>
          A sua opinião é muito importante para nós! Se você tiver alguma dúvida, sugestão, ou encontrou algum problema ao usar o {APP_TITLE}, por favor, entre em contato.
        </p>
        
        <h3 className="text-2xl font-semibold text-gray-800 mt-6">Informações de Contato</h3>
        <ul>
          <li>
            <strong>Email:</strong> <a href="mailto:munaierapp@mail.com" className="text-blue-600 hover:underline">munaierapp@mail.com</a>
          </li>
          <li>
            <strong>GitHub do Projeto:</strong> <a href="https://github.com/lucasmunaier/gerenciador-de-transporte" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">lucasmunaier/gerenciador-de-transporte</a>
          </li>
        </ul>
        <p className="mt-4">
          Faremos o nosso melhor para responder o mais breve possível. Obrigado por usar nosso aplicativo!
        </p>
      </div>
    </div>
  );
};

export default ContactTab;