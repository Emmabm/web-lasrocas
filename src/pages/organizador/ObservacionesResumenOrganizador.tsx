import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { ArrowLeft, Download, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';

// Define a type for a single observation
interface Observacion {
  id: string;
  contenido: string;
  created_at: string;
}

export default function ObservacionesResumenOrganizador() {
  const { id: eventoId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [observaciones, setObservaciones] = useState<Observacion[]>([]);
  const [eventoNombre, setEventoNombre] = useState<string>('');
  const [eventoEstado, setEventoEstado] = useState<'activo' | 'inactivo' | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalMessage, setModalMessage] = useState<string | null>(null);

  // Verificar autenticación y cargar datos del evento
  useEffect(() => {
    const fetchData = async () => {
      // Verificar autenticación
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      if (!eventoId) {
        setModalMessage('Error: No se proporcionó un ID de evento.');
        setLoading(false);
        return;
      }

      // Verificar que el usuario sea el organizador del evento
      const { data: evento, error: eventoError } = await supabase
        .from('eventos')
        .select('id, nombre, estado, organizador_id')
        .eq('id', eventoId)
        .single();

      if (eventoError || !evento) {
        setModalMessage(`Error al cargar el evento: ${eventoError?.message || 'Evento no encontrado.'}`);
        setLoading(false);
        return;
      }

      if (evento.organizador_id !== session.user.id) {
        setModalMessage('No tienes permiso para acceder a este evento.');
        setLoading(false);
        return;
      }

      setEventoNombre(evento.nombre || 'Evento sin nombre');
      setEventoEstado(evento.estado);

      // Cargar observaciones
      const { data: observacionesData, error: observacionesError } = await supabase
        .from('observaciones_generales')
        .select('id, contenido, created_at')
        .eq('evento_id', eventoId)
        .order('created_at', { ascending: false });

      if (observacionesError) {
        setModalMessage(`Error al cargar observaciones: ${observacionesError.message}`);
        setLoading(false);
        return;
      }

      setObservaciones(observacionesData || []);
      setLoading(false);
    };

    fetchData();
  }, [eventoId, navigate]);

  // Función para eliminar una observación
  const handleDeleteObservation = async (obsId: string) => {
    if (eventoEstado === 'inactivo') {
      setModalMessage('El evento está inactivo. No puedes realizar modificaciones.');
      return;
    }

    if (window.confirm('¿Estás seguro de que quieres eliminar esta observación?')) {
      const { error } = await supabase
        .from('observaciones_generales')
        .delete()
        .eq('id', obsId)
        .eq('evento_id', eventoId);

      if (error) {
        setModalMessage(`Error al eliminar observación: ${error.message}`);
      } else {
        setObservaciones(observaciones.filter((obs) => obs.id !== obsId));
        setModalMessage('Observación eliminada correctamente.');
      }
    }
  };

  // Función para exportar a Excel
  const handleExportToExcel = () => {
    const data = observaciones.map((obs) => ({
      Fecha: new Date(obs.created_at).toLocaleString('es-AR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      Observación: obs.contenido,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    // Estilizar el encabezado
    worksheet['!cols'] = [{ wch: 20 }, { wch: 60 }]; // Ancho de columnas
    const headerStyle = {
      font: { bold: true },
      alignment: { horizontal: 'center' },
      border: {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' },
      },
    };

    // Aplicar estilo al encabezado
    ['A1', 'B1'].forEach((cell) => {
      if (worksheet[cell]) {
        worksheet[cell].s = headerStyle;
      }
    });

    // Agregar bordes a todas las celdas
    const range = XLSX.utils.decode_range(worksheet['!ref'] || '');
    for (let row = range.s.r; row <= range.e.r; row++) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        if (!worksheet[cellAddress]) continue;
        worksheet[cellAddress].s = {
          ...worksheet[cellAddress].s,
          border: {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' },
          },
        };
      }
    }

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Observaciones');
    XLSX.writeFile(workbook, `Observaciones_Evento_${eventoNombre.replace(/\s+/g, '_')}.xlsx`);
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
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Información</h3>
              <p className="text-gray-600 mb-6">{modalMessage}</p>
              <button
                className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 w-full transition-colors"
                onClick={() => {
                  setModalMessage(null);
                  if (modalMessage.includes('No tienes permiso') || modalMessage.includes('Evento no encontrado')) {
                    navigate('/organizador/panel');
                  }
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <span className="mr-2">📝</span> Observaciones del Evento: {eventoNombre}
          </h1>
          <button
            onClick={() => navigate('/organizador/panel')}
            className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            title="Volver al panel"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Volver al panel
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-700">
              Observaciones ingresadas por el cliente
            </h2>
            <button
              onClick={handleExportToExcel}
              className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              title="Exportar a Excel"
            >
              <Download className="w-4 h-4 mr-2" /> Exportar a Excel
            </button>
          </div>

          {observaciones.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-gray-700">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="p-4 text-left">Fecha</th>
                    <th className="p-4 text-left">Observación</th>
                    <th className="p-4 text-left">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {observaciones.map((obs) => (
                    <tr key={obs.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        {new Date(obs.created_at).toLocaleString('es-AR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="p-4 whitespace-pre-wrap">{obs.contenido}</td>
                      <td className="p-4">
                        <button
                          onClick={() => handleDeleteObservation(obs.id)}
                          className={`flex items-center px-3 py-1 border border-red-500 text-red-600 rounded-lg hover:bg-red-500 hover:text-white transition-colors ${
                            eventoEstado === 'inactivo' ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          disabled={eventoEstado === 'inactivo'}
                          title="Eliminar observación"
                        >
                          <Trash2 className="w-4 h-4 mr-1" /> Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 italic text-center py-8">
              No hay observaciones ingresadas para este evento.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}