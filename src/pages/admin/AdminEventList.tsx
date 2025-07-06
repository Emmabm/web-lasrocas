import { useState, useEffect } from 'react';
import { Pencil, Save } from 'lucide-react';
import { supabase } from '../../supabaseClient';

export default function AdminEventList() {
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [tipoEditado, setTipoEditado] = useState('');

  useEffect(() => {
    cargarEventos();
  }, []);

  const cargarEventos = async () => {
    setLoading(true);
    const { data: session } = await supabase.auth.getSession();
    const user = session?.session?.user;
    if (!user) return;

    const { data, error } = await supabase
      .from('eventos')
      .select('*')
      .eq('admin_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      alert('Error al cargar eventos: ' + error.message);
    } else {
      setEventos(data || []);
    }

    setLoading(false);
  };

  const copiarLink = async (token: string) => {
    const link = `${window.location.origin}/evento/${token}`;
    await navigator.clipboard.writeText(link);
    alert('Link copiado al portapapeles 📋');
  };

  const eliminarEvento = async (id: number) => {
    const confirmar = confirm('¿Eliminar este evento? Esta acción no se puede deshacer.');
    if (!confirmar) return;

    const { error } = await supabase.from('eventos').delete().eq('id', id);
    if (error) {
      alert('Error al eliminar el evento: ' + error.message);
    } else {
      setEventos((prev) => prev.filter((e) => e.id !== id));
    }
  };

  const guardarCambios = async (id: number) => {
    const { error } = await supabase
      .from('eventos')
      .update({ tipo: tipoEditado })
      .eq('id', id);

    if (error) {
      alert('Error al actualizar: ' + error.message);
    } else {
      setEventos((prev) =>
        prev.map((evento) =>
          evento.id === id ? { ...evento, tipo: tipoEditado } : evento
        )
      );
      setEditandoId(null);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📋 Mis eventos generados</h1>

      {loading ? (
        <p>Cargando eventos...</p>
      ) : eventos.length === 0 ? (
        <p>No generaste ningún evento todavía.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border rounded shadow">
            <thead className="bg-orange-500 text-white">
              <tr>
                <th className="p-2 text-left">Tipo</th>
                <th className="p-2 text-left">Creado</th>
                <th className="p-2 text-left">Token</th>
                <th className="p-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {eventos.map((evento) => (
                <tr key={evento.id} className="border-t hover:bg-gray-50">
                  <td className="p-2">
                    {editandoId === evento.id ? (
                      <input
                        className="border rounded px-2 py-1 text-sm"
                        value={tipoEditado}
                        onChange={(e) => setTipoEditado(e.target.value)}
                      />
                    ) : (
                      evento.tipo
                    )}
                  </td>
                  <td className="p-2">
                    {new Date(evento.created_at).toLocaleString()}
                  </td>
                  <td className="p-2 text-xs text-gray-700">
                    {evento.token_acceso}
                  </td>
                  <td className="p-2 space-x-2">
                    <button
                      onClick={() => copiarLink(evento.token_acceso)}
                      className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-sm"
                    >
                      Copiar
                    </button>
                    <a
                      href={`/evento/${evento.token_acceso}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline text-sm"
                    >
                      Ver
                    </a>
                    <button
                      onClick={() => eliminarEvento(evento.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-sm"
                    >
                      Eliminar
                    </button>
                    {editandoId === evento.id ? (
                      <button
                        onClick={() => guardarCambios(evento.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-sm"
                      >
                        <Save className="inline-block w-4 h-4 mr-1" /> Guardar
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setEditandoId(evento.id);
                          setTipoEditado(evento.tipo);
                        }}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-sm"
                      >
                        <Pencil className="inline-block w-4 h-4 mr-1" /> Editar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
