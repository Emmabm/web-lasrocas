import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "../../../supabaseClient";
import { useUserContext } from "../../../hooks/useUserContext";

const Observaciones = () => {
  const [loading, setLoading] = useState(true);
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const { token, setToken } = useUserContext();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [observaciones, setObservaciones] = useState("");
  const [eventId, setEventId] = useState<string | null>(null);
  const [eventoEstado, setEventoEstado] = useState<'activo' | 'inactivo' | null>(null);

  useEffect(() => {
    const fetchEventData = async () => {
      const urlToken = searchParams.get("token");

      // Si el token no existe en el contexto pero sí en la URL, lo guardamos.
      if (!token && urlToken) {
        console.log('Observaciones.tsx - Persistiendo token desde URL:', urlToken);
        setToken(urlToken);
      } else if (!token && !urlToken) {
        setModalMessage("Error: No se proporcionó un token de acceso.");
        setLoading(false);
        return;
      }

      const activeToken = token || urlToken;
      if (!activeToken) {
        setModalMessage("Error: No se proporcionó un token de acceso.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("eventos")
        .select("id, estado, observaciones")
        .eq("token_acceso", activeToken)
        .single();

      if (error || !data) {
        console.error("Error fetching event:", error?.message);
        setModalMessage("Error al obtener el evento. Por favor, verifica el enlace o inicia sesión nuevamente.");
        setLoading(false);
        return;
      }

      setEventId(data.id);
      setEventoEstado(data.estado);
      setObservaciones(data.observaciones || "");
      setLoading(false);

      if (data.estado === 'inactivo') {
        setModalMessage("El evento está inactivo. No podés realizar modificaciones.");
      }
    };

    fetchEventData();
  }, [searchParams, navigate, token, setToken]);

  const handleModalClose = () => {
    setModalMessage(null);
    if (modalMessage?.includes("No se proporcionó un token") || modalMessage?.includes("Error al obtener el evento")) {
      navigate("/cliente");
    }
  };

  const handleSaveObservaciones = async () => {
    if (eventoEstado === 'inactivo') {
      setModalMessage('El evento está inactivo. No podés realizar modificaciones.');
      return;
    }

    if (!eventId || !token) {
      setModalMessage("Error: No se encontró el ID del evento o el token de acceso.");
      return;
    }

    const { error } = await supabase
      .from("eventos")
      .update({ observaciones })
      .eq("id", eventId);

    if (error) {
      console.error("Error al guardar observaciones:", error.message);
      setModalMessage(`Error al guardar observaciones: ${error.message}`);
      return;
    }

    console.log("Observaciones guardadas correctamente, redirigiendo a /thank-you con token:", token);
    navigate(`/thank-you?token=${token}`);
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-600">Cargando...</div>
    );
  }

  if (!token) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8">
      {modalMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Atención</h3>
            <p className="text-gray-600 mb-6">{modalMessage}</p>
            <button
              className="bg-[#FF6B35] text-white px-4 py-2 rounded-md hover:bg-[#FF6B35]/90 w-full transition-colors"
              onClick={handleModalClose}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
          <span className="mr-3">📝</span> Observaciones
        </h2>

        <div className="mb-8">
          <textarea
            className="w-full border border-gray-300 px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF6B35] transition-all text-base"
            placeholder="Ingresa tus observaciones sobre el evento..."
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            disabled={eventoEstado === 'inactivo'}
            rows={6}
          />
        </div>

        <div className="mt-8">
          <button
            className="bg-[#FF6B35] text-white px-6 py-3 rounded-md hover:bg-[#FF6B35]/90 w-full text-base font-semibold transition-colors"
            onClick={handleSaveObservaciones}
            disabled={eventoEstado === 'inactivo'}
          >
            Finalizar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Observaciones;