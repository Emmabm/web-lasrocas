import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function RequireAuth({ children }: { children: JSX.Element }) {
  const [loading, setLoading] = useState(true);
  const [estaLogueado, setEstaLogueado] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setEstaLogueado(!!data.session?.user);
      setLoading(false);
    };

    checkSession();
  }, []);

  if (loading) return <p className="p-6">Verificando autenticación...</p>;

  return estaLogueado ? children : <Navigate to="/auth" replace />;
}
