// ARQUIVO: components/Login.tsx

import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { GoogleIcon } from './icons'; // Supondo que você tenha um ícone do Google em icons.tsx

interface LoginProps {
  onNavigateToRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onNavigateToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      if (error.message === 'Invalid login credentials') {
        setError('Email ou senha inválidos.');
      } else {
        setError(`Erro ao fazer login: ${error.message}`);
      }
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-200 to-sky-200 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">Acesso ao Sistema</h2>
        {error && <p className="text-red-500 mb-4 bg-red-100 p-3 rounded-md text-center">{error}</p>}
        <form onSubmit={handleLogin}>
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
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">Senha:</label>
            <input
              type="password"
              id="password"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha"
              required
            />
          </div>
          <button
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            type="submit"
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="w-full border-t border-gray-300"></div></div>
          <div className="relative flex justify-center text-sm"><span className="bg-white px-2 text-gray-500">Ou continue com</span></div>
        </div>
        
        <button
          onClick={handleGoogleLogin}
          className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
        >
          <GoogleIcon className="w-5 h-5 mr-3" />
          Entrar com o Google
        </button>

        <p className="mt-6 text-gray-600 text-center text-xs">
          Ainda não tem uma conta?{' '}
          <button onClick={onNavigateToRegister} className="text-blue-500 hover:text-blue-700 font-bold">
            Crie uma agora
          </button>
        </p>
        <p className="mt-8 text-center text-xs text-gray-400">
        By: Munaier
        </p>
      </div>
    </div>
  );
};

// Você precisa de um ícone do Google. Adicione esta função ao seu arquivo `components/icons.tsx`
// export const GoogleIcon = (props) => ( ... código do ícone SVG ... );

export default Login;