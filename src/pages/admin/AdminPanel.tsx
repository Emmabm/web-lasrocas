import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';

export default function AdminPanel() {
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarEventos = async () => {
      const { data: session } = await supabase.auth.getSession();
      const user = session?.session?.user;
      if (!user) return;

      const { data: usuario } = await supabase
        .from('usuarios')
        .select('rol')
        .eq('email', user.email)
        .single();

      if (!usuario || usuario.rol !== 'admin') {
        alert('Acceso denegado: solo administradores');
        window.location.href = '/';
        return;
      }

      const { data, error } = await supabase
        .from('eventos')
        .select('*, usuarios(nombre)')
        .order('created_at', { ascending: false });

      if (error) {
        alert('Error al cargar eventos');
      } else {
        setEventos(data || []);
      }

      setLoading(false);
    };

    cargarEventos();
  }, []);

  const copiarLink = async (token: string) => {
    const link = `${window.location.origin}/evento/${token}`;
    await navigator.clipboard.writeText(link);
    alert('✅ Link copiado');
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📊 Panel de Administración</h1>

      {loading ? (
        <p>Cargando...</p>
      ) : eventos.length === 0 ? (
        <p>No hay eventos registrados.</p>
      ) : (
        <table className="w-full text-sm border rounded shadow">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="p-2">Organizador</th>
              <th className="p-2">Tipo</th>
              <th className="p-2">Fecha</th>
              <th className="p-2">Token</th>
              <th className="p-2">Link</th>
              <th className="p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {eventos.map((e) => (
              <tr key={e.id} className="border-t hover:bg-gray-50">
                <td className="p-2">{e.usuarios?.nombre || 'Sin nombre'}</td>
                <td className="p-2">{e.tipo}</td>
                <td className="p-2">{new Date(e.created_at).toLocaleString()}</td>
                <td className="p-2 text-xs">{e.token_acceso}</td>
                <td className="p-2 text-xs text-blue-700">
                  <code>{`${window.location.origin}/evento/${e.token_acceso}`}</code>
                </td>
                <td className="p-2">
                  <button
                    onClick={() => copiarLink(e.token_acceso)}
                    className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-sm"
                  >
                    Copiar
                  </button>
                  <a
                    href={`/evento/${e.token_acceso}`}
                    target="_blank"
                    className="text-blue-600 underline ml-2 text-sm"
                  >
                    Ver
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
