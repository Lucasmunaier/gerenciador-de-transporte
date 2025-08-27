import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { supabase } from '../supabaseClient';

const CompleteProfile: React.FC = () => {
  const { profile, updateProfile, fetchData } = useAppContext();
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setUsername(profile.username || '');
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (username.length < 3) {
      setError("O nome de usuário deve ter pelo menos 3 caracteres.");
      return;
    }

    setLoading(true);

    try {
      // Verifica se o username já está em uso por outra pessoa
      const { data, error: checkError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username.toLowerCase())
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = row not found, o que é bom
        throw checkError;
      }

      if (data) {
        setError("Este nome de usuário já está em uso. Por favor, escolha outro.");
        setLoading(false);
        return;
      }

      // Se estiver livre, atualiza o perfil
      await updateProfile({
        full_name: fullName,
        username: username.toLowerCase(),
        phone: profile?.phone || null,
        address: profile?.address || null,
      });

      // Força a atualização dos dados no AppContext para sair desta tela
      await fetchData();

    } catch (error: any) {
      setError(`Erro ao salvar perfil: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-200 to-sky-200 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-blue-700 mb-2 text-center">Complete seu Perfil</h2>
        <p className="text-center text-sm text-gray-600 mb-6">Para continuar, por favor, defina seu nome de usuário.</p>
        
        {error && <p className="text-red-500 mb-4 bg-red-100 p-3 rounded-md text-center">{error}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-gray-700 text-sm font-bold mb-2">Nome Completo:</label>
            <input
              type="text"
              id="fullName"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Como você gostaria de ser chamado?"
              required
            />
          </div>
          <div>
            <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">Nome de Usuário:</label>
            <input
              type="text"
              id="username"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ex: joaosilva (letras minúsculas, sem espaços)"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Este será seu nome de login único.</p>
          </div>
          <div className="pt-2">
            <button
              className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              type="submit"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar e Continuar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;
