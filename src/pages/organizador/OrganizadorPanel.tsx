import { useState, useEffect } from 'react';
import { Pencil, Trash2, Copy } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';

const tiposValidos = ['fiesta15', 'casamiento', 'cumpleaños', 'egresados'];

export default function OrganizadorPanel() {
  const [eventos, setEventos] = useState<any[]>([]);
  const [tipoNuevo, setTipoNuevo] = useState('');
  const [nombreNuevo, setNombreNuevo] = useState('');
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [nombreEditado, setNombreEditado] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEventos = async () => {
      const { data: session } = await supabase.auth.getSession();
      const user = session?.session?.user;
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data: usuario } = await supabase
        .from('usuarios')
        .select('rol')
        .eq('email', user.email)
        .single();

      if (!usuario) {
        await supabase.from('usuarios').insert([
          {
            email: user.email,
            nombre: user.user_metadata?.name || 'Sin nombre',
            rol: 'organizador',
          },
        ]);
      } else if (usuario.rol !== 'organizador') {
        alert('Acceso denegado');
        navigate('/');
        return;
      }

      const { data, error } = await supabase
        .from('eventos')
        .select('*')
        .eq('organizador_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error al cargar eventos:', error.message);
        return;
      }
      setEventos(data || []);
    };

    fetchEventos();
  }, [navigate]);

  const crearEvento = async () => {
    if (!tipoNuevo || !nombreNuevo) {
      alert('Por favor, completa todos los campos');
      return;
    }

    const tipoValido = tiposValidos.includes(tipoNuevo.toLowerCase());
    if (!tipoValido) {
      alert('Tipo de evento inválido');
      return;
    }

    const { data: session } = await supabase.auth.getSession();
    const user = session?.session?.user;
    if (!user?.id) {
      alert('Usuario no identificado');
      return;
    }

    const token =
      tipoNuevo.toLowerCase() +
      '-' +
      new Date().toISOString().split('T')[0] +
      '-' +
      Date.now().toString(36);

    const { data: nuevo, error } = await supabase
      .from('eventos')
      .insert([
        {
          tipo: tipoNuevo,
          nombre: nombreNuevo,
          token_acceso: token,
          organizador_id: user.id,
          estado: 'pendiente',
        },
      ])
      .select();

    if (error) {
      console.error('Error al crear evento:', error);
      alert(`No se pudo crear el evento: ${error.message}`);
      return;
    }

    setEventos([...eventos, nuevo[0]]);
    setTipoNuevo('');
    setNombreNuevo('');

    const clientLink = `${window.location.origin}/cliente?token=${token}`;
    if (
      window.confirm(`✅ Evento creado\n\nToken generado:\n${token}\n\n¿Copiar al portapapeles?`)
    ) {
      await navigator.clipboard.writeText(clientLink);
      alert('📋 Token copiado.');
    }
  };

  const copiarLink = async (token: string) => {
    await navigator.clipboard.writeText(`${window.location.origin}/cliente?token=${token}`);
    alert('✅ Link copiado');
  };

  const iniciarEdicion = (id: string, nombre: string) => {
    setEditandoId(id);
    setNombreEditado(nombre || '');
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setNombreEditado('');
  };

  const guardarCambios = async (id: string) => {
    try {
      if (!nombreEditado.trim()) {
        alert('El nombre no puede estar vacío');
        return;
      }

      const sessionResponse = await supabase.auth.getSession();
      const user = sessionResponse.data.session?.user;
      if (!user?.id) {
        console.error('No se encontró usuario autenticado');
        alert('Error: No se encontró usuario autenticado');
        return;
      }

      const { error } = await supabase
        .from('eventos')
        .update({ nombre: nombreEditado.trim() })
        .eq('id', id)
        .eq('organizador_id', user.id);

      if (error) {
        console.error('Error al editar en Supabase:', error);
        alert(`Error al editar: ${error.message}`);
        return;
      }

      setEventos(eventos.map((e) => (e.id === id ? { ...e, nombre: nombreEditado.trim() } : e)));
      setEditandoId(null);
      setNombreEditado('');
    } catch (err) {
      console.error('Error inesperado en guardarCambios:', err);
      alert('Error inesperado al editar el evento');
    }
  };

  const eliminarEvento = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este evento? Esta acción no se puede deshacer.')) {
      const { error: errorSelecciones } = await supabase
        .from('selecciones_evento')
        .delete()
        .eq('evento_id', id);
      if (errorSelecciones) {
        console.error('Error al eliminar selecciones_evento:', errorSelecciones);
        alert(`Error al eliminar selecciones: ${errorSelecciones.message}`);
        return;
      }

      const { error: errorResumen } = await supabase
        .from('eventos_resumen')
        .delete()
        .eq('event_id', id);
      if (errorResumen) {
        console.error('Error al eliminar eventos_resumen:', errorResumen);
        alert(`Error al eliminar resumen: ${errorResumen.message}`);
        return;
      }

      const { error } = await supabase
        .from('eventos')
        .delete()
        .eq('id', id)
        .eq('organizador_id', (await supabase.auth.getSession()).data.session?.user?.id);
      if (error) {
        console.error('Error al eliminar evento:', error);
        alert(`Error al eliminar evento: ${error.message}`);
        return;
      }

      setEventos(eventos.filter((e) => e.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center">
          <span className="mr-2">🎉</span> Panel de Organizador
        </h1>

        {/* Crear evento */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Crear Nuevo Evento</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <select
              value={tipoNuevo}
              onChange={(e) => setTipoNuevo(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:outline-none"
            >
              <option value="">Seleccioná tipo</option>
              {tiposValidos.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                </option>
              ))}
            </select>
            <input
              value={nombreNuevo}
              onChange={(e) => setNombreNuevo(e.target.value)}
              placeholder="Nombre del evento (ej: Fiesta de Zoe)"
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
            <button
              onClick={crearEvento}
              className="bg-orange-600 hover:bg-orange-700 text-white font-medium px-6 py-2 rounded-lg transition-colors"
            >
              Crear Evento
            </button>
          </div>
        </div>

        {/* Tabla eventos */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-gray-700">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="p-4 text-left">Tipo</th>
                  <th className="p-4 text-left">Nombre</th>
                  <th className="p-4 text-left">Fecha</th>
                  <th className="p-4 text-left">Link</th>
                  <th className="p-4 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {eventos.map((e) => (
                  <tr key={e.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="p-4">{e.tipo.charAt(0).toUpperCase() + e.tipo.slice(1)}</td>
                    <td className="p-4">
                      {editandoId === e.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            value={nombreEditado}
                            onChange={(ev) => setNombreEditado(ev.target.value)}
                            className="border border-gray-300 rounded-lg px-2 py-1 w-full focus:ring-2 focus:ring-orange-500 focus:outline-none"
                            placeholder="Nuevo nombre"
                          />
                          <button
                            onClick={() => guardarCambios(e.id)}
                            className="flex items-center px-3 py-1 border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-500 hover:text-white transition-colors"
                            title="Guardar cambios"
                          >
                            Guardar
                          </button>
                          <button
                            onClick={cancelarEdicion}
                            className="flex items-center px-3 py-1 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-500 hover:text-white transition-colors"
                            title="Cancelar"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <span className="font-medium">{e.nombre || '—'}</span>
                      )}
                    </td>
                    <td className="p-4">
                      {new Date(e.created_at).toLocaleDateString('es-AR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="p-4 max-w-[200px] truncate">
                      <code className="text-blue-600">{e.token_acceso}</code>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => copiarLink(e.token_acceso)}
                          className="flex items-center px-3 py-1 border border-gray-300 text-gray-700 rounded-lg hover:bg-orange-500 hover:text-white transition-colors"
                          title="Copiar link"
                        >
                          <Copy className="w-4 h-4 mr-1" /> Copiar
                        </button>
                        {['catering', 'mesas', 'horarios'].map((path) => (
                          <a
                            key={path}
                            href={`/organizador/evento/${e.id}/${path}`}
                            className="flex items-center px-3 py-1 border border-gray-300 text-gray-700 rounded-lg hover:bg-orange-500 hover:text-white transition-colors"
                          >
                            {path.charAt(0).toUpperCase() + path.slice(1)}
                          </a>
                        ))}
                        {e.tipo.toLowerCase() === 'fiesta15' && (
                          <a
                            href={`/organizador/evento/${e.id}/invitados`}
                            className="flex items-center px-3 py-1 border border-gray-300 text-gray-700 rounded-lg hover:bg-orange-500 hover:text-white transition-colors"
                          >
                            Invitados
                          </a>
                        )}
                        {editandoId !== e.id && (
                          <button
                            onClick={() => iniciarEdicion(e.id, e.nombre)}
                            className="flex items-center px-3 py-1 border border-gray-300 text-gray-700 rounded-lg hover:bg-orange-500 hover:text-white transition-colors"
                            title="Editar nombre"
                          >
                            <Pencil className="w-4 h-4 mr-1" /> Editar
                          </button>
                        )}
                        <button
                          onClick={() => eliminarEvento(e.id)}
                          className="flex items-center px-3 py-1 border border-red-500 text-red-600 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                          title="Eliminar evento"
                        >
                          <Trash2 className="w-4 h-4 mr-1" /> Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {eventos.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                      No hay eventos creados aún. ¡Creá uno para empezar!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-6 text-sm text-gray-600">
          Tipos de eventos disponibles: {tiposValidos.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(', ')}.
        </p>
      </div>
    </div>
  );
}