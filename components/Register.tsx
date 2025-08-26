import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { ArrowLeftIcon } from './icons';

interface RegisterProps {
  onNavigateToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onNavigateToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    if (!username.trim() || !fullName.trim()) {
        setError("Nome completo e nome de usuário são obrigatórios.");
        return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: fullName.trim(),
          username: username.trim().toLowerCase(),
        }
      }
    });

    if (error) {
      setError(`Erro ao criar conta: ${error.message}`);
    } else {
      setSuccessMessage("Conta criada! Por favor, verifique seu email para confirmar sua conta antes de fazer o login.");
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setFullName('');
      setUsername('');
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
          <h2 className="text-2xl font-bold text-blue-700 text-center">Criar Nova Conta</h2>
        </div>

        {error && <p className="text-red-500 mb-4 bg-red-100 p-3 rounded-md text-center">{error}</p>}
        {successMessage && <p className="text-green-500 mb-4 bg-green-100 p-3 rounded-md text-center">{successMessage}</p>}
        
        <form onSubmit={handleRegister} className={`space-y-4 ${successMessage ? 'hidden' : ''}`}>
          <div>
            <label htmlFor="fullName" className="block text-gray-700 text-sm font-bold mb-2">Nome Completo:</label>
            <input type="text" id="fullName" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ex: João da Silva" required />
          </div>
          <div>
            <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">Nome de Usuário:</label>
            <input type="text" id="username" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Ex: joaosilva (será seu login)" required />
          </div>
          <div>
            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email:</label>
            <input type="email" id="email" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" required />
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">Senha:</label>
            <input type="password" id="password" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" required />
          </div>
          <div className="mb-2">
            <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-bold mb-2">Confirmar Senha:</label>
            <input type="password" id="confirmPassword" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repita a senha" required />
          </div>
          <div className="pt-2">
            <button className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline ${loading ? 'opacity-50 cursor-not-allowed' : ''}`} type="submit" disabled={loading}>
              {loading ? 'Criando conta...' : 'Criar Conta'}
            </button>
          </div>
        </form>
        
        <p className={`mt-4 text-gray-600 text-center text-xs ${successMessage ? 'hidden' : ''}`}>
          Já tem uma conta?{' '}
          <button onClick={onNavigateToLogin} className="text-blue-500 hover:text-blue-700 font-bold">
            Faça o login
          </button>
        </p>
        <p className="mt-8 text-center text-xs text-gray-400">By: Munaier</p>
      </div>
    </div>
  );
};
export default Register;
