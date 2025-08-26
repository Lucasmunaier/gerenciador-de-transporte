import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useAppContext } from '../../contexts/AppContext';

const ProfileTab: React.FC = () => {
  const { profile, updateProfile } = useAppContext();
  
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(false);
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [errorPassword, setErrorPassword] = useState<string | null>(null);
  const [successPassword, setSuccessPassword] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setUsername(profile.username || '');
      setPhone(profile.phone || '');
      setAddress(profile.address || '');
    }
  }, [profile]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingProfile(true);
    try {
        await updateProfile({ full_name: fullName, username, phone, address });
        alert('Perfil atualizado com sucesso!');
    } catch (error: any) {
        alert(`Erro ao atualizar perfil: ${error.message}`);
    }
    setLoadingProfile(false);
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorPassword(null);
    setSuccessPassword(null);
    if (!currentPassword) { setErrorPassword("Por favor, insira sua senha atual."); return; }
    if (newPassword.length < 6) { setErrorPassword("A nova senha deve ter no mínimo 6 caracteres."); return; }
    if (newPassword !== confirmPassword) { setErrorPassword("As novas senhas não coincidem."); return; }
    
    setLoadingPassword(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !user.email) {
        setErrorPassword("Não foi possível identificar o usuário.");
        setLoadingPassword(false);
        return;
    }
    
    const { error: reauthError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
    });

    if (reauthError) {
        setErrorPassword("A senha atual está incorreta.");
        setLoadingPassword(false);
        return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    if (updateError) {
      setErrorPassword(updateError.message);
    } else {
      setSuccessPassword("Senha alterada com sucesso!");
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
    setLoadingPassword(false);
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">Meu Perfil</h2>
      
      <form onSubmit={handleProfileUpdate} className="p-6 bg-white rounded-lg shadow-md space-y-4">
        <h3 className="text-xl font-semibold text-gray-700">Informações do Perfil</h3>
        <p className="text-sm text-gray-500">Estas informações podem ser usadas em relatórios e cobranças.</p>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email (não pode ser alterado aqui)</label>
          <input type="email" id="email" value={profile ? (supabase.auth.getUser() as any)?.data?.user?.email || '' : ''} disabled className="mt-1 block w-full md:w-1/2 bg-gray-100 border border-gray-300 rounded-md shadow-sm py-2 px-3"/>
        </div>

        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Nome Completo</label>
          <input type="text" id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} className="mt-1 block w-full md:w-1/2 border border-gray-300 rounded-md shadow-sm py-2 px-3"/>
        </div>
        
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">Nome de Usuário</label>
          <input type="text" id="username" value={username} onChange={e => setUsername(e.target.value)} className="mt-1 block w-full md:w-1/2 border border-gray-300 rounded-md shadow-sm py-2 px-3"/>
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Telefone</label>
          <input type="tel" id="phone" value={phone} onChange={e => setPhone(e.target.value)} className="mt-1 block w-full md:w-1/2 border border-gray-300 rounded-md shadow-sm py-2 px-3"/>
        </div>
        
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">Endereço</label>
          <input type="text" id="address" value={address} onChange={e => setAddress(e.target.value)} className="mt-1 block w-full md:w-1/2 border border-gray-300 rounded-md shadow-sm py-2 px-3"/>
        </div>

        <button type="submit" disabled={loadingProfile} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
          {loadingProfile ? 'Salvando...' : 'Salvar Alterações do Perfil'}
        </button>
      </form>

      <form onSubmit={handlePasswordUpdate} className="p-6 bg-white rounded-lg shadow-md space-y-4">
        <h3 className="text-xl font-semibold text-gray-700">Alterar Senha</h3>
        {errorPassword && <p className="text-red-500 mb-2">{errorPassword}</p>}
        {successPassword && <p className="text-green-500 mb-2">{successPassword}</p>}
        
        <div>
          <label htmlFor="currentPassword">Senha Atual</label>
          <input type="password" id="currentPassword" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="mt-1 block w-full md:w-1/2 border border-gray-300 rounded-md shadow-sm py-2 px-3" required/>
        </div>
        <div>
          <label htmlFor="newPassword">Nova Senha</label>
          <input type="password" id="newPassword" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="mt-1 block w-full md:w-1/2 border border-gray-300 rounded-md shadow-sm py-2 px-3" required/>
        </div>
        <div>
          <label htmlFor="confirmPassword">Confirmar Nova Senha</label>
          <input type="password" id="confirmPassword" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="mt-1 block w-full md:w-1/2 border border-gray-300 rounded-md shadow-sm py-2 px-3" required/>
        </div>
         <button type="submit" disabled={loadingPassword} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50">
          {loadingPassword ? 'Alterando...' : 'Alterar Senha'}
        </button>
      </form>
    </div>
  );
};
export default ProfileTab;
