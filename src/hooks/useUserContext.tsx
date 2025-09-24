import { createContext, useContext, useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';

type Rol = 'admin' | 'organizador' | 'cliente' | null;

interface UserContextType {
  role: Rol;
  setRole: (role: Rol) => void;
  paso: string | null;
  setPaso: (paso: string | null) => void;
  menuSeleccionado: string | null;
  setMenuSeleccionado: (menu: string | null) => void;
  token: string | null;
  setToken: (token: string | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<Rol>(null);
  const [paso, setPaso] = useState<string | null>(null);
  const [menuSeleccionado, setMenuSeleccionado] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Cargar el menú desde Supabase al montar o cambiar la ruta/token
  useEffect(() => {
    const urlToken = searchParams.get('token') || (location.pathname.match(/\/evento\/(.+)/)?.[1]);
    const activeToken = urlToken || token;
    console.log('UserProvider - Active token:', activeToken);
    if (!activeToken) {
      console.log('UserProvider - No token available');
      return;
    }

    // Persistir el token en el contexto
    if (urlToken && urlToken !== token) {
      console.log('UserProvider - Persistiendo token:', urlToken);
      setToken(urlToken);
    }

    const fetchMenu = async () => {
      try {
        console.log('UserProvider - Buscando evento con token:', activeToken);
        const { data, error } = await supabase
          .from('eventos')
          .select('menu, estado, catering_confirmado')
          .eq('token_acceso', activeToken)
          .single();

        if (error || !data) {
          console.error('UserProvider - Error fetching menu:', error);
          return;
        }

        console.log('UserProvider - Evento encontrado:', data);
        if (data.menu && menuSeleccionado !== data.menu) {
          console.log('UserProvider - Actualizando menuSeleccionado:', data.menu);
          setMenuSeleccionado(data.menu);
        }

        if (data.estado === 'inactivo') {
          console.warn('UserProvider - Evento inactivo');
        }
      } catch (err) {
        console.error('UserProvider - Error al conectar con Supabase:', err);
      }
    };

    fetchMenu();
  }, [location, searchParams, token, menuSeleccionado]);

  return (
    <UserContext.Provider value={{ role, setRole, paso, setPaso, menuSeleccionado, setMenuSeleccionado, token, setToken }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};
