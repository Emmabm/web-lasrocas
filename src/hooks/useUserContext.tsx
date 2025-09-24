import { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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

  // Cargar el menú desde Supabase al cambiar la ruta o token
  useEffect(() => {
    const urlToken = new URLSearchParams(location.search).get('token');
    const activeToken = urlToken || token;
    if (!activeToken) return;

    const fetchMenu = async () => {
      try {
        const { data, error } = await supabase
          .from('eventos')
          .select('menu, estado, catering_confirmado')
          .eq('token_acceso', activeToken)
          .single();

        if (error || !data) {
          console.error('UserProvider - Error fetching menu:', error);
          return;
        }

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
  }, [location, token, menuSeleccionado]);

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