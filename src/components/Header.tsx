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
  const [loadingMenu, setLoadingMenu] = useState(true);

  const urlToken = new URLSearchParams(location.search).get('token');
  const activeToken = urlToken || token;

  useEffect(() => {
    if (!activeToken) {
      setLoadingMenu(false);
      return;
    }

    if (urlToken && urlToken !== token) setToken(urlToken);

    const fetchMenu = async () => {
      try {
        const { data, error } = await supabase
          .from('eventos')
          .select('menu, estado')
          .eq('token_acceso', activeToken)
          .single();

        if (error || !data) {
          console.error('Error fetching menu:', error);
          setLoadingMenu(false);
          return;
        }

        if (data.menu && menuSeleccionado !== data.menu) setMenuSeleccionado(data.menu);
        setLoadingMenu(false);
      } catch (err) {
        console.error('Error al conectar con Supabase:', err);
        setLoadingMenu(false);
      }
    };

    fetchMenu();
  }, [activeToken, urlToken, token, setToken, setMenuSeleccionado, menuSeleccionado]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setLogueado(!!data.session?.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setLogueado(!!session?.user));
    return () => listener?.subscription.unsubscribe();
  }, []);

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  if (location.pathname.includes('/organizador/panel') || location.pathname.startsWith('/auth')) return null;
  if (loadingMenu) return <header className="bg-[#FF6B35] text-white shadow-md"><div className="container mx-auto px-4 py-3 text-center">Cargando navegación...</div></header>;

  const navToken = activeToken;
  const getPathWithToken = (path: string) => navToken ? `${path}?token=${navToken}` : path;

  return (
    <header className="bg-[#FF6B35] text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex flex-col md:flex-row md:justify-between md:items-center">
        <div className="flex items-center justify-between w-full">
          <h1 className="text-2xl font-bold font-sans italic">Las Rocas</h1>
          {logueado && location.pathname.startsWith('/admin') && (
            <button onClick={cerrarSesion} className="ml-4 flex items-center bg-white text-[#FF6B35] px-3 py-1 rounded hover:bg-gray-100 transition">
              <span className="text-sm">Cerrar sesión</span>
            </button>
          )}
        </div>
        <nav className="md:flex md:items-center mt-3 md:mt-0">
          <ul className="flex justify-around md:space-x-8">
            <li><NavLink to={getPathWithToken('/cliente')} className={({ isActive }) => isActive ? 'text-white font-medium' : 'text-white/90 hover:text-white'}><Home className="h-5 w-5"/><span className="text-xs mt-1">Inicio</span></NavLink></li>
            <li><NavLink to={getPathWithToken('/catering')} className={({ isActive }) => isActive ? 'text-white font-medium' : 'text-white/90 hover:text-white'}><Utensils className="h-5 w-5"/><span className="text-xs mt-1">Catering</span></NavLink></li>
            {menuSeleccionado !== 'menu4' && <li><NavLink to={getPathWithToken('/mesa')} className={({ isActive }) => isActive ? 'text-white font-medium' : 'text-white/90 hover:text-white'}><LayoutGrid className="h-5 w-5"/><span className="text-xs mt-1">Mesas</span></NavLink></li>}
            {menuSeleccionado === 'menu4' && <li><NavLink to={getPathWithToken('/invitados-cena')} className={({ isActive }) => isActive ? 'text-white font-medium' : 'text-white/90 hover:text-white'}><Users className="h-5 w-5"/><span className="text-xs mt-1">Cena</span></NavLink></li>}
            <li><NavLink to={getPathWithToken('/horarios')} className={({ isActive }) => isActive ? 'text-white font-medium' : 'text-white/90 hover:text-white'}><Calendar className="h-5 w-5"/><span className="text-xs mt-1">Horarios</span></NavLink></li>
            <li><NavLink to={getPathWithToken('/invitados')} className={({ isActive }) => isActive ? 'text-white font-medium' : 'text-white/90 hover:text-white'}><Users className="h-5 w-5"/><span className="text-xs mt-1">Baile</span></NavLink></li>
            <li><NavLink to={getPathWithToken('/observaciones')} className={({ isActive }) => isActive ? 'text-white font-medium' : 'text-white/90 hover:text-white'}><FileText className="h-5 w-5"/><span className="text-xs mt-1">Observaciones</span></NavLink></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
