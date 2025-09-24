import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Home, Utensils, LayoutGrid, Users, Calendar, FileText } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useUserContext } from '../hooks/useUserContext';

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { menuSeleccionado, token, setToken, setMenuSeleccionado } = useUserContext();
  const [logueado, setLogueado] = useState(false);
  const [mostrarInvitados] = useState(true); // siempre true
  const [loadingMenu, setLoadingMenu] = useState(true); // Nuevo estado para la carga del menú

  const urlToken = new URLSearchParams(location.search).get('token');

  // Efecto para cargar el token y el menú desde Supabase
  useEffect(() => {
    const activeToken = urlToken || token;
    console.log('Header.tsx - Valores iniciales:', { activeToken, menuSeleccionado, urlToken, token });
    if (!activeToken) {
      setLoadingMenu(false);
      return;
    }

    // Persistir el token en el contexto
    if (urlToken && urlToken !== token) {
      console.log('Header.tsx - Persistiendo token:', { token, urlToken });
      setToken(urlToken);
    }

    // Cargar el menú desde Supabase
    const fetchMenu = async () => {
      try {
        const { data, error } = await supabase
          .from('eventos')
          .select('menu, estado')
          .eq('token_acceso', activeToken)
          .single();

        if (error || !data) {
          console.error('Header.tsx - Error fetching menu:', error);
          setLoadingMenu(false);
          return;
        }

        if (data.menu && menuSeleccionado !== data.menu) {
          console.log('Header.tsx - Actualizando menuSeleccionado:', data.menu);
          setMenuSeleccionado(data.menu);
        }

        // Si el evento está inactivo, mostrar mensaje
        if (data.estado === 'inactivo') {
          console.warn('Header.tsx - Evento inactivo');
        }
        setLoadingMenu(false);
      } catch (err) {
        console.error('Header.tsx - Error al conectar con Supabase:', err);
        setLoadingMenu(false);
      }
    };

    fetchMenu();
  }, [urlToken, token, setToken, setMenuSeleccionado, menuSeleccionado]);

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

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  if (location.pathname.includes('/organizador/panel') || location.pathname.startsWith('/auth')) return null;

  const navToken = token || urlToken;
  const getPathWithToken = (path: string) => {
    return navToken ? `${path}?token=${navToken}` : path;
  };

  // Mostrar un placeholder mientras se carga el menú
  if (loadingMenu) return (
    <header className="bg-[#FF6B35] text-white shadow-md">
      <div className="container mx-auto px-4 py-3 text-center">Cargando navegación...</div>
    </header>
  );

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
                  to={getPathWithToken('/cliente')}
                  className={({ isActive }) =>
                    `flex flex-col items-center transition-colors ${isActive ? 'text-white font-medium' : 'text-white/90 hover:text-white'}`
                  }
                >
                  <Home className="h-5 w-5" />
                  <span className="text-xs mt-1">Inicio</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to={getPathWithToken('/catering')}
                  className={({ isActive }) =>
                    `flex flex-col items-center transition-colors ${isActive ? 'text-white font-medium' : 'text-white/90 hover:text-white'}`
                  }
                >
                  <Utensils className="h-5 w-5" />
                  <span className="text-xs mt-1">Catering</span>
                </NavLink>
              </li>
              {menuSeleccionado !== 'menu4' && (
                <li>
                  <NavLink
                    to={getPathWithToken('/mesa')}
                    className={({ isActive }) =>
                      `flex flex-col items-center transition-colors ${isActive ? 'text-white font-medium' : 'text-white/90 hover:text-white'}`
                    }
                  >
                    <LayoutGrid className="h-5 w-5" />
                    <span className="text-xs mt-1">Mesas</span>
                  </NavLink>
                </li>
              )}
              {menuSeleccionado === 'menu4' && (
                <li>
                  <NavLink
                    to={getPathWithToken('/invitados-cena')}
                    className={({ isActive }) =>
                      `flex flex-col items-center transition-colors ${isActive ? 'text-white font-medium' : 'text-white/90 hover:text-white'}`
                    }
                  >
                    <Users className="h-5 w-5" />
                    <span className="text-xs mt-1">Cena</span>
                  </NavLink>
                </li>
              )}
              <li>
                <NavLink
                  to={getPathWithToken('/horarios')}
                  className={({ isActive }) =>
                    `flex flex-col items-center transition-colors ${isActive ? 'text-white font-medium' : 'text-white/90 hover:text-white'}`
                  }
                >
                  <Calendar className="h-5 w-5" />
                  <span className="text-xs mt-1">Horarios</span>
                </NavLink>
              </li>
              {mostrarInvitados && (
                <li>
                  <NavLink
                    to={getPathWithToken('/invitados')}
                    className={({ isActive }) =>
                      `flex flex-col items-center transition-colors ${isActive ? 'text-white font-medium' : 'text-white/90 hover:text-white'}`
                    }
                  >
                    <Users className="h-5 w-5" />
                    <span className="text-xs mt-1">Baile</span>
                  </NavLink>
                </li>
              )}
              <li>
                <NavLink
                  to={getPathWithToken('/observaciones')}
                  className={({ isActive }) =>
                    `flex flex-col items-center transition-colors ${isActive ? 'text-white font-medium' : 'text-white/90 hover:text-white'}`
                  }
                >
                  <FileText className="h-5 w-5" />
                  <span className="text-xs mt-1">Observaciones</span>
                </NavLink>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;