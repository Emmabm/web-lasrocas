import React from 'react';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

const OrganizadorPanelWrapper = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fffaf7] to-[#fceee7]">
      <header className="bg-[#ff5e2e] text-white shadow-lg px-8 py-4 flex justify-between items-center rounded-b-2xl">
        <h1 className="text-2xl font-bold font-sans tracking-wide drop-shadow-sm">
          Las Rocas | Panel de Control
        </h1>
        <button
          onClick={cerrarSesion}
          className="flex items-center gap-2 bg-white text-[#ff5e2e] px-4 py-2 rounded-full shadow-md hover:bg-gray-100 transition-all duration-200"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-sm font-medium">Cerrar sesión</span>
        </button>
      </header>

      <main className="px-8 py-6">{children}</main>
    </div>
  );
};

export default OrganizadorPanelWrapper;
