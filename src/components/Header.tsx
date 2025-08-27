import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Home, Utensils, LayoutGrid, Users, Calendar } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useUserContext } from '../hooks/useUserContext';

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { menuSeleccionado, token, setToken } = useUserContext();
  const [logueado, setLogueado] = useState(false);
  const [mostrarInvitados, setMostrarInvitados] = useState(false);

  // Obtener el token de la URL
  const urlToken = new URLSearchParams(location.search).get('token');

  useEffect(() => {
    // Persistir el token en el contexto
    if (urlToken && token !== urlToken) {
      console.log('Header.tsx - Persistiendo token:', { token, urlToken });
      setToken(urlToken);
    }
  }, [urlToken, token, setToken]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setLogueado(!!data.session?.user);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setLogueado(!!session?.user);
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const verificarTipo = async () => {
      const activeToken = token || urlToken;
      if (!activeToken) {
        console.error('No se proporcionó un token válido.');
        return;
      }

      const { data, error } = await supabase
        .from('eventos')
        .select('tipo')
        .eq('token_acceso', activeToken)
        .single();

      if (error || !data) {
        console.error('Error al verificar tipo de evento:', error);
        setMostrarInvitados(false);
      } else if (data.tipo.toLowerCase() === 'fiesta15') {
        setMostrarInvitados(true);
      } else {
        setMostrarInvitados(false);
      }
    };

    verificarTipo();
  }, [token, urlToken]);

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const handleMesasClick = (e: React.MouseEvent) => {
    const activeToken = token || urlToken;
    if (!activeToken) {
      e.preventDefault();
      alert('No se proporcionó un token válido.');
      return;
    }
    if (!menuSeleccionado || menuSeleccionado === 'menu4') {
      e.preventDefault();
      alert('Primero debes elegir el menú para pasar a mesas.');
      return;
    }
  };

  if (location.pathname.includes('/organizador/panel') || location.pathname.startsWith('/auth')) return null;

  // Usar token del contexto o de la URL
  const navToken = token || urlToken;

  return (
    <header className="bg-[#FF6B35] text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold font-sans italic">Las Rocas</h1>
              <span className="ml-3 text-white/90 hidden md:inline">Arma tu evento</span>
            </div>

            {logueado && location.pathname.startsWith('/admin') && (
              <button
                onClick={cerrarSesion}
                className="ml-4 flex items-center bg-white text-[#FF6B35] px-3 py-1 rounded hover:bg-gray-100 transition"
              >
                <span className="text-sm">Cerrar sesión</span>
              </button>
            )}
          </div>

          <nav className="md:flex md:items-center mt-3 md:mt-0">
            <ul className="flex justify-around md:space-x-8">
              <li>
                <NavLink
                  to={navToken ? `/cliente?token=${navToken}` : '/cliente'}
                  className={({ isActive }) =>
                    `flex flex-col items-center transition-colors ${
                      isActive ? 'text-white font-medium' : 'text-white/90 hover:text-white'
                    }`
                  }
                >
                  <Home className="h-5 w-5" />
                  <span className="text-xs mt-1">Inicio</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to={navToken ? `/catering?token=${navToken}` : '/catering'}
                  className={({ isActive }) =>
                    `flex flex-col items-center transition-colors ${
                      isActive ? 'text-white font-medium' : 'text-white/90 hover:text-white'
                    }`
                  }
                >
                  <Utensils className="h-5 w-5" />
                  <span className="text-xs mt-1">Catering</span>
                </NavLink>
              </li>
              {menuSeleccionado !== 'menu4' && (
                <li>
                  <NavLink
                    to={navToken ? `/mesa?token=${navToken}` : '/mesa'}
                    className={({ isActive }) =>
                      `flex flex-col items-center transition-colors ${
                        isActive ? 'text-white font-medium' : 'text-white/90 hover:text-white'
                      }`
                    }
                    onClick={handleMesasClick}
                  >
                    <LayoutGrid className="h-5 w-5" />
                    <span className="text-xs mt-1">Mesas</span>
                  </NavLink>
                </li>
              )}
              <li>
                <NavLink
                  to={navToken ? `/horarios?token=${navToken}` : '/horarios'}
                  className={({ isActive }) =>
                    `flex flex-col items-center transition-colors ${
                      isActive ? 'text-white font-medium' : 'text-white/90 hover:text-white'
                    }`
                  }
                >
                  <Calendar className="h-5 w-5" />
                  <span className="text-xs mt-1">Horarios</span>
                </NavLink>
              </li>
              {mostrarInvitados && (
                <li>
                  <NavLink
                    to={navToken ? `/invitados?token=${navToken}` : '/invitados'}
                    className={({ isActive }) =>
                      `flex flex-col items-center transition-colors ${
                        isActive ? 'text-white font-medium' : 'text-white/90 hover:text-white'
                      }`
                    }
                  >
                    <Users className="h-5 w-5" />
                    <span className="text-xs mt-1">Invitados</span>
                  </NavLink>
                </li>
              )}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;