import { createContext, useContext, useState } from 'react';

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