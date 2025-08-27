import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useUserContext } from '../hooks/useUserContext';

interface RequireAuthProps {
  children: JSX.Element;
  allowedRoles: Array<'admin' | 'organizador' | 'cliente'>;
}

export default function RequireAuth({ children, allowedRoles }: RequireAuthProps) {
  const [loading, setLoading] = useState(true);
  const [estaLogueado, setEstaLogueado] = useState(false);
  const { role, setRole } = useUserContext();

  useEffect(() => {
    const checkSession = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;

      if (userId) {
        setEstaLogueado(true);
        const { data: perfil } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single();

        if (perfil?.role) {
          setRole(perfil.role);
        }
      } else {
        setEstaLogueado(false);
      }

      setLoading(false);
    };

    checkSession();
  }, [setRole]);

  if (loading) {
    return <p className="p-6">Verificando autenticación...</p>;
  }

  if (!estaLogueado) {
    return <Navigate to="/auth" replace />;
  }

  if (!allowedRoles.includes(role!)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
