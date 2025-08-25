import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { User } from '@supabase/supabase-js';

const ProfileTab: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
    };
    fetchUser();
  }, []);

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const { error } = await supabase.auth.updateUser({ email: newEmail });

    if (error) {
      setError(error.message);
    } else {
      setSuccess("Um link de confirmação foi enviado para o seu email antigo e para o novo. Por favor, clique no link enviado para o NOVO email para confirmar a alteração.");
      setNewEmail('');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">Meu Perfil</h2>
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Informações do Usuário</h3>
        <p className="text-gray-600"><strong>Email Atual:</strong> {user?.email}</p>
      </div>
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Alterar Email</h3>
        {error && <p className="text-red-500 mb-4 bg-red-100 p-3 rounded-md text-center">{error}</p>}
        {success && <p className="text-green-500 mb-4 bg-green-100 p-3 rounded-md text-center">{success}</p>}
        <form onSubmit={handleChangeEmail} className="space-y-4">
          <div>
            <label htmlFor="newEmail" className="block text-sm font-medium text-gray-700">Novo Endereço de Email</label>
            <input
              type="email"
              id="newEmail"
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              className="mt-1 block w-full md:w-1/2 border border-gray-300 rounded-md shadow-sm py-2 px-3"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar Novo Email'}
          </button>
        </form>
      </div>
    </div>
  );
};
export default ProfileTab;