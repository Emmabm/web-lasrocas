import { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";
import { useNavigate } from "react-router-dom";
import { useUserContext } from '../../../hooks/useUserContext';

// Define a type for a single observation
interface Observacion {
  id: string;
  contenido: string;
  created_at: string;
}

const Observaciones = () => {
  const navigate = useNavigate();
  const { token } = useUserContext();
  const [eventId, setEventId] = useState<string | null>(null);
  const [eventoEstado, setEventoEstado] = useState<'activo' | 'inactivo' | null>(null);
  const [observacionesList, setObservacionesList] = useState<Observacion[]>([]);
  const [nuevaObservacion, setNuevaObservacion] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Function to fetch observations from the database
  const fetchObservations = async (id: string) => {
    const { data, error } = await supabase
      .from('observaciones_generales')
      .select('*')
      .eq('evento_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      setModalMessage(`Error al cargar observaciones: ${error.message}`);
    } else {
      setObservacionesList(data || []);
    }
  };

  // Effect to get the eventId and load existing observations
  useEffect(() => {
    const fetchEventData = async () => {
      if (!token) {
        setModalMessage("Error: No se encontró el token de acceso.");
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('eventos')
        .select('id, estado')
        .eq('token_acceso', token)
        .single();

      if (error || !data) {
        setModalMessage(`Error al obtener datos del evento: ${error?.message || 'No se encontró el evento.'}`);
        setIsLoading(false);
        return;
      }

      setEventId(data.id);
      setEventoEstado(data.estado);
      await fetchObservations(data.id);
      
      setIsLoading(false);

      if (data.estado === 'inactivo') {
        setModalMessage('El evento está inactivo. No podés realizar modificaciones.');
      }
    };

    fetchEventData();
  }, [token]);

  const isBlocked = !!(eventoEstado === 'inactivo');

  const handleSaveObservation = async () => {
    if (isBlocked) {
      setModalMessage('El evento está inactivo. No podés realizar modificaciones.');
      return;
    }

    if (!eventId) {
      setModalMessage('Error: No se ha podido obtener el ID del evento.');
      return;
    }
    
    if (nuevaObservacion.trim() === "") {
        setModalMessage("Por favor, escribe una observación para guardar.");
        return;
    }

    const { data, error } = await supabase
      .from('observaciones_generales')
      .insert({ contenido: nuevaObservacion, evento_id: eventId })
      .select();

    if (error) {
      console.error("Error al guardar observaciones:", error.message);
      setModalMessage(`Error al guardar: ${error.message}`);
    } else {
      setModalMessage("Observación guardada correctamente.");
      setObservacionesList(prev => [...data, ...prev]);
      setNuevaObservacion("");
    }
  };
  
  const handleDeleteObservation = async (obsId: string) => {
    if (window.confirm("¿Estás seguro de que quieres borrar esta observación?")) {
        const { error } = await supabase
            .from('observaciones_generales')
            .delete()
            .eq('id', obsId);

        if (error) {
            setModalMessage(`Error al borrar: ${error.message}`);
        } else {
            setObservacionesList(observacionesList.filter(obs => obs.id !== obsId));
            setModalMessage("Observación borrada correctamente.");
        }
    }
  };

  const handleEditClick = (obs: Observacion) => {
    setEditingId(obs.id);
    setNuevaObservacion(obs.contenido);
  };
  
  const handleUpdateObservation = async () => {
    if (isBlocked) {
      setModalMessage('El evento está inactivo. No podés realizar modificaciones.');
      return;
    }

    if (!editingId || nuevaObservacion.trim() === "") {
      setModalMessage("No hay observación para actualizar.");
      return;
    }

    const { error } = await supabase
      .from('observaciones_generales')
      .update({ contenido: nuevaObservacion })
      .eq('id', editingId);

    if (error) {
      setModalMessage(`Error al actualizar: ${error.message}`);
    } else {
      setModalMessage("Observación actualizada correctamente.");
      setObservacionesList(prev => 
        prev.map(obs => obs.id === editingId ? { ...obs, contenido: nuevaObservacion } : obs)
      );
      setNuevaObservacion("");
      setEditingId(null);
    }
  };

  const handleFinalize = () => {
    if (isBlocked) {
      setModalMessage('El evento está inactivo. No podés realizar modificaciones.');
      return;
    }

    if (!token) {
      setModalMessage('Error: No se encontró el token de acceso.');
      return;
    }

    navigate(`/thank-you?token=${token}`);
  };

  if (isLoading) {
    return (
      <div className="text-center py-8 text-gray-600">Cargando...</div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8">
      {modalMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Información</h3>
            <p className="text-gray-600 mb-6">{modalMessage}</p>
            <button
              className="bg-[#FF6B35] text-white px-4 py-2 rounded-md hover:bg-[#FF6B35]/90 w-full transition-colors"
              onClick={() => setModalMessage(null)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
          📝 Observaciones del Evento
        </h2>
        <p className="text-gray-600 mb-6">
          Utiliza este espacio para añadir cualquier detalle o nota especial que consideres importante para tu evento.
        </p>
        
        <div className="mb-6">
          <textarea
            className="w-full h-32 p-4 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-[#FF6B35] transition-all text-base"
            placeholder="Escribe una nueva observación aquí..."
            value={nuevaObservacion}
            onChange={(e) => setNuevaObservacion(e.target.value)}
            disabled={isBlocked}
          ></textarea>
        </div>

        <div className="mt-6 space-y-4">
          <button
            className={`w-full px-6 py-3 rounded-md font-semibold transition-colors ${
              isBlocked ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-[#FF6B35] text-white hover:bg-[#FF6B35]/90'
            }`}
            onClick={editingId ? handleUpdateObservation : handleSaveObservation}
            disabled={isBlocked}
          >
            {editingId ? "Actualizar Observación" : "Guardar Observación"}
          </button>
          <button
            className={`w-full px-6 py-3 rounded-md font-semibold transition-colors ${
              isBlocked ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-[#FF6B35] text-white hover:bg-[#FF6B35]/90'
            }`}
            onClick={handleFinalize}
            disabled={isBlocked}
          >
            Finalizar
          </button>
        </div>

        <div className="mt-8">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Observaciones Anteriores</h3>
          {observacionesList.length > 0 ? (
            <ul className="space-y-4">
              {observacionesList.map((obs) => (
                <li key={obs.id} className="bg-gray-100 p-4 rounded-md shadow-sm flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500 mb-2">
                      {new Date(obs.created_at).toLocaleString('es-AR', {
                        year: 'numeric', month: 'long', day: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                    <p className="text-gray-700 whitespace-pre-wrap">{obs.contenido}</p>
                  </div>
                  <div className="flex space-x-2 mt-1">
                    <button
                      onClick={() => handleEditClick(obs)}
                      disabled={isBlocked}
                      className={`text-blue-500 hover:text-blue-700 ${isBlocked && 'opacity-50 cursor-not-allowed'}`}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteObservation(obs.id)}
                      disabled={isBlocked}
                      className={`text-red-500 hover:text-red-700 ${isBlocked && 'opacity-50 cursor-not-allowed'}`}
                    >
                      🗑️
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">Aún no hay observaciones guardadas.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Observaciones;