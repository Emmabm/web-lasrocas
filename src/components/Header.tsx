import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { Home, Utensils, LayoutGrid, Users, LogOut } from 'lucide-react';
import { supabase } from '../supabaseClient';

const eventosConInvitados = ['fiesta15'];

const Header: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tipoEvento = searchParams.get('tipo') || '';
  const mostrarInvitados = eventosConInvitados.includes(tipoEvento);
  const linkInvitados = mostrarInvitados ? `/eventos?tipo=${tipoEvento}` : '/';

  const [logueado, setLogueado] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Chequear sesión al montar el componente
    supabase.auth.getSession().then(({ data }) => {
      setLogueado(!!data.session?.user);
    });

    // Escuchar cambios en sesión
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

  return (
    <header className="bg-[#FF6B35] text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold font-sans">Las Rocas</h1>
              <span className="ml-3 text-white/90 hidden md:inline">Arma tu evento</span>
            </div>

            {logueado && (
              <button
                onClick={cerrarSesion}
                className="ml-4 flex items-center bg-white text-[#FF6B35] px-3 py-1 rounded hover:bg-gray-100 transition"
              >
                <LogOut className="h-4 w-4 mr-1" />
                <span className="text-sm">Cerrar sesión</span>
              </button>
            )}
          </div>

          <nav className="md:flex md:items-center mt-3 md:mt-0">
            <ul className="flex justify-around md:space-x-8">
              <li>
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `flex flex-col items-center text-white/90 hover:text-white transition-colors ${
                      isActive ? 'text-white font-medium' : ''
                    }`
                  }
                >
                  <Home className="h-5 w-5" />
                  <span className="text-xs mt-1">Inicio</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/catering"
                  className={({ isActive }) =>
                    `flex flex-col items-center text-white/90 hover:text-white transition-colors ${
                      isActive ? 'text-white font-medium' : ''
                    }`
                  }
                >
                  <Utensils className="h-5 w-5" />
                  <span className="text-xs mt-1">Catering</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/mesas"
                  className={({ isActive }) =>
                    `flex flex-col items-center text-white/90 hover:text-white transition-colors ${
                      isActive ? 'text-white font-medium' : ''
                    }`
                  }
                >
                  <LayoutGrid className="h-5 w-5" />
                  <span className="text-xs mt-1">Mesas</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/eventos"
                  className={({ isActive }) =>
                    `flex flex-col items-center text-white/90 hover:text-white transition-colors ${
                      isActive ? 'text-white font-medium' : ''
                    }`
                  }
                >
                  <span className="h-5 w-5 flex items-center justify-center">📅</span>
                  <span className="text-xs mt-1">Organizador de horarios</span>
                </NavLink>
              </li>

              {mostrarInvitados && (
                <li>
                  <NavLink
                    to={linkInvitados}
                    className={({ isActive }) =>
                      `flex flex-col items-center text-white/90 hover:text-white transition-colors ${
                        isActive ? 'text-white font-medium' : ''
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
