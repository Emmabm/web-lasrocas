import { useState, useEffect } from 'react';
import { Pencil, Trash2, Copy, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { User } from '@supabase/supabase-js';

const tiposValidos = ['fiesta15', 'casamiento', 'cumpleaños', 'egresados'];

export default function OrganizadorPanel() {
  const [eventos, setEventos] = useState<any[]>([]);
  const [tipoNuevo, setTipoNuevo] = useState('');
  const [nombreNuevo, setNombreNuevo] = useState('');
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [nombreEditado, setNombreEditado] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [copyStatus, setCopyStatus] = useState<Record<string, 'copiado' | 'copiar'>>({});
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  // Listener para el estado de autenticación
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_, session) => {
        if (!session) {
          navigate('/auth');
        } else {
          setUser(session.user);
        }
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  // Cargar eventos una vez que el usuario esté disponible
  useEffect(() => {
    const fetchEventos = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('eventos')
        .select('id, tipo, nombre, fecha, created_at, token_acceso, estado')
        .eq('organizador_id', user.id)
        .order('fecha', { ascending: true }); // <-- cambio aquí

      if (error) {
        setModalMessage(`Error al cargar eventos: ${error.message}`);
        return;
      }
      setEventos(data || []);
    };

    if (user) {
      fetchEventos();
    }
  }, [user, navigate]);

  const crearEvento = async () => {
    if (!tipoNuevo || !nombreNuevo) {
      setModalMessage('Por favor, completa todos los campos');
      return;
    }

    const tipoValido = tiposValidos.includes(tipoNuevo.toLowerCase());
    if (!tipoValido) {
      setModalMessage('Tipo de evento inválido');
      return;
    }

    if (!user?.id) {
      setModalMessage('Usuario no identificado');
      return;
    }

    // Asegurarse de que el usuario exista en la tabla "usuarios" antes de crear el evento
    const { data: usuario, error: fetchUserError } = await supabase
      .from('usuarios')
      .select('id')
      .eq('id', user.id)
      .single();

    if (fetchUserError || !usuario) {
      const { error: insertUserError } = await supabase.from('usuarios').insert([
        {
          id: user.id,
          email: user.email,
          nombre: user.user_metadata?.name || 'Sin nombre',
          rol: 'organizador',
        },
      ]);
      if (insertUserError) {
        setModalMessage(`Error al crear el usuario: ${insertUserError.message}`);
        return;
      }
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
          estado: 'activo',
        },
      ])
      .select();

    if (error) {
      setModalMessage(`No se pudo crear el evento: ${error.message}`);
      return;
    }

    setEventos([...eventos, nuevo[0]]);
    setTipoNuevo('');
    setNombreNuevo('');

    const clientLink = `${window.location.origin}/cliente?token=${token}`;
    await navigator.clipboard.writeText(clientLink);
    setModalMessage(`Evento creado con éxito. Link copiado: ${clientLink}`);
  };

  const copiarLink = async (token: string, eventId: string) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/cliente?token=${token}`);
      setCopyStatus(prev => ({ ...prev, [eventId]: 'copiado' }));

      setTimeout(() => {
        setCopyStatus(prev => ({ ...prev, [eventId]: 'copiar' }));
      }, 2000);
    } catch (err) {
      setModalMessage('Error al copiar el link.');
    }
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
        setModalMessage('El nombre no puede estar vacío');
        return;
      }

      if (!user?.id) {
        setModalMessage('No se encontró usuario autenticado');
        return;
      }

      const { error } = await supabase
        .from('eventos')
        .update({ nombre: nombreEditado.trim() })
        .eq('id', id)
        .eq('organizador_id', user.id);

      if (error) {
        setModalMessage(`Error al editar: ${error.message}`);
        return;
      }

      setEventos(eventos.map((e) => (e.id === id ? { ...e, nombre: nombreEditado.trim() } : e)));
      setEditandoId(null);
      setNombreEditado('');
    } catch (err) {
      setModalMessage('Error inesperado al editar el evento');
    }
  };

  const eliminarEvento = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este evento? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      // Eliminar registros dependientes de external_staff
      const { error: errorExternalStaff } = await supabase
        .from('external_staff')
        .delete()
        .eq('evento_id', id);
      if (errorExternalStaff) {
        setModalMessage(`Error al eliminar personal externo: ${errorExternalStaff.message}`);
        return;
      }

      // Eliminar registros dependientes de schedule_blocks
      const { error: errorScheduleBlocks } = await supabase
        .from('schedule_blocks')
        .delete()
        .eq('evento_id', id);
      if (errorScheduleBlocks) {
        setModalMessage(`Error al eliminar bloques de horarios: ${errorScheduleBlocks.message}`);
        return;
      }

      // Eliminar registros dependientes de selecciones_evento
      const { error: errorSelecciones } = await supabase
        .from('selecciones_evento')
        .delete()
        .eq('evento_id', id);
      if (errorSelecciones) {
        setModalMessage(`Error al eliminar selecciones: ${errorSelecciones.message}`);
        return;
      }

      // Eliminar registros dependientes de eventos_resumen
      const { error: errorResumen } = await supabase
        .from('eventos_resumen')
        .delete()
        .eq('event_id', id);
      if (errorResumen) {
        setModalMessage(`Error al eliminar resumen: ${errorResumen.message}`);
        return;
      }

      // Eliminar registros dependientes de observaciones_generales
      const { error: errorObservaciones } = await supabase
        .from('observaciones_generales')
        .delete()
        .eq('evento_id', id);
      if (errorObservaciones) {
        setModalMessage(`Error al eliminar observaciones: ${errorObservaciones.message}`);
        return;
      }

      // Eliminar registros dependientes de invitados
      const { error: errorInvitados } = await supabase
        .from('invitados')
        .delete()
        .eq('evento_id', id);
      if (errorInvitados) {
        setModalMessage(`Error al eliminar invitados: ${errorInvitados.message}`);
        return;
      }

      // Eliminar el evento
      const { error } = await supabase
        .from('eventos')
        .delete()
        .eq('id', id)
        .eq('organizador_id', user?.id);
      if (error) {
        setModalMessage(`Error al eliminar evento: ${error.message}`);
        return;
      }

      setEventos(eventos.filter((e) => e.id !== id));
      setModalMessage('Evento eliminado con éxito');
    } catch (err) {
      setModalMessage('Error inesperado al eliminar el evento');
    }
  };

  const toggleEventStatus = async (id: string, currentStatus: 'activo' | 'inactivo') => {
    try {
      if (!user?.id) {
        setModalMessage('No se encontró usuario autenticado');
        return;
      }

      const newStatus = currentStatus === 'activo' ? 'inactivo' : 'activo';
      const { error } = await supabase
        .from('eventos')
        .update({ estado: newStatus })
        .eq('id', id)
        .eq('organizador_id', user.id);

      if (error) {
        setModalMessage(`Error al cambiar estado: ${error.message}`);
        return;
      }

      setEventos(eventos.map((e) => (e.id === id ? { ...e, estado: newStatus } : e)));
      setModalMessage(`Evento ${newStatus === 'activo' ? 'activado' : 'desactivado'} correctamente`);
    } catch (err) {
      setModalMessage('Error inesperado al cambiar el estado del evento');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-700">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {modalMessage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Atención</h3>
              <p className="text-gray-600 mb-6">{modalMessage}</p>
              <button
                className="bg-[#FF6B35] text-white px-4 py-2 rounded-md hover:bg-[#FF6B35]/90 w-full"
                onClick={() => setModalMessage(null)}
              >
                Cerrar
              </button>
            </div>
          </div>
        )}

        <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center">
          <span className="mr-2"></span> Panel de Organizador
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
                  <th className="p-4 text-left">Estado</th>
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
                    <td className="p-4">{e.fecha}</td>
                    <td className="p-4">
                      <span
                        className={`font-medium ${
                          e.estado === 'activo' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {e.estado.charAt(0).toUpperCase() + e.estado.slice(1)}
                      </span>
                    </td>
                    <td className="p-4 max-w-[200px] truncate">
                      <code className="text-blue-600">{e.token_acceso}</code>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        <a
                          href={`/cliente?token=${e.token_acceso}`}
                          className="flex items-center px-3 py-1 border border-gray-300 text-gray-700 rounded-lg hover:bg-orange-500 hover:text-white transition-colors"
                          title="Ver evento como cliente"
                        >
                          Ver evento
                        </a>
                        <button
                          onClick={() => copiarLink(e.token_acceso, e.id)}
                          className="flex items-center px-3 py-1 border border-gray-300 text-gray-700 rounded-lg hover:bg-orange-500 hover:text-white transition-colors"
                          title="Copiar link"
                        >
                          {copyStatus[e.id] === 'copiado' ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-1" /> Copiado
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 mr-1" /> Copiar
                            </>
                          )}
                        </button>
                        {['catering', 'mesas', 'cena', 'horarios', 'invitados', 'observaciones'].map((path) => (
                          <a
                            key={path}
                            href={`/organizador/evento/${e.id}/${path}`}
                            className="flex items-center px-3 py-1 border border-gray-300 text-gray-700 rounded-lg hover:bg-orange-500 hover:text-white transition-colors"
                            title={`Ver ${path.charAt(0).toUpperCase() + path.slice(1)}`}
                          >
                            {path.charAt(0).toUpperCase() + path.slice(1)}
                          </a>
                        ))}
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
                          onClick={() => toggleEventStatus(e.id, e.estado)}
                          className={`flex items-center px-3 py-1 border rounded-lg transition-colors ${
                            e.estado === 'activo'
                              ? 'border-red-500 text-red-600 hover:bg-red-500 hover:text-white'
                              : 'border-green-500 text-green-600 hover:bg-green-500 hover:text-white'
                          }`}
                          title={e.estado === 'activo' ? 'Desactivar evento' : 'Activar evento'}
                        >
                          {e.estado === 'activo' ? (
                            <>
                              <XCircle className="w-4 h-4 mr-1" /> Desactivar
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-1" /> Activar
                            </>
                          )}
                        </button>
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
                    <td colSpan={6} className="text-center py-8 text-gray-500">
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
