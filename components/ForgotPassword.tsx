import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { ArrowLeftIcon } from './icons';

interface ForgotPasswordProps {
  onNavigateToLogin: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onNavigateToLogin }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });

    if (error) {
      setError(`Erro: ${error.message}`);
    } else {
      setSuccessMessage("Se uma conta com este email existir, um link para redefinir a senha foi enviado.");
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-200 to-sky-200 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="relative flex items-center justify-center mb-6">
          <button 
            onClick={onNavigateToLogin} 
            className="absolute left-0 p-2 text-gray-500 hover:text-blue-700 hover:bg-gray-100 rounded-full transition-colors"
            title="Voltar para o Login"
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-bold text-blue-700 text-center">Redefinir Senha</h2>
        </div>

        {error && <p className="text-red-500 mb-4 bg-red-100 p-3 rounded-md text-center">{error}</p>}
        {successMessage && <p className="text-green-500 mb-4 bg-green-100 p-3 rounded-md text-center">{successMessage}</p>}
        
        <form onSubmit={handlePasswordReset} className={successMessage ? 'hidden' : ''}>
          <p className="text-sm text-gray-600 mb-4">
            Digite seu email e enviaremos um link para você redefinir sua senha.
          </p>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email:</label>
            <input
              type="email"
              id="email"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
          </div>
          <button
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            type="submit"
            disabled={loading}
          >
            {loading ? 'Enviando...' : 'Enviar Link de Redefinição'}
          </button>
        </form>
        <p className="mt-8 text-center text-xs text-gray-400">By: Munaier</p>
      </div>
    </div>
  );
};

export default ForgotPassword;