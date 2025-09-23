import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "../../../supabaseClient";
import Guests from "./Guests";
import { useUserContext } from "../../../hooks/useUserContext";

const GuestsWrapper = () => {
  const [loading, setLoading] = useState(true);
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const [eventType, setEventType] = useState<string | null>(null);
  const { token, setToken } = useUserContext();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const urlToken = searchParams.get("token");

    // Si el token no existe en el contexto pero sí en la URL, lo guardamos.
    if (!token && urlToken) {
      setToken(urlToken);
    } else if (!token && !urlToken) {
      setModalMessage("No se proporcionó un token de acceso.");
      setLoading(false);
      return;
    }

    const fetchEventData = async () => {
      // Usar el token del contexto, que ahora siempre estará disponible si llegamos aquí.
      const activeToken = token || urlToken;
      if (!activeToken) {
        setModalMessage("No se proporcionó un token de acceso.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("eventos")
        .select("id, tipo, estado")
        .eq("token_acceso", activeToken)
        .single();

      if (error || !data) {
        console.error("Error fetching event:", error?.message);
        setModalMessage("Error al obtener el evento. Por favor, verifica el enlace o inicia sesión nuevamente.");
        setLoading(false);
        return;
      }

      // No redirigimos al panel del organizador, incluso si el usuario es organizador
      if (data.estado === 'inactivo') {
        setModalMessage("El evento está inactivo. No podés realizar modificaciones.");
        setLoading(false);
        return;
      }

      setEventType(data.tipo);
      setLoading(false);
    };

    fetchEventData();
  }, [searchParams, navigate, token, setToken]);

  const handleModalClose = () => {
    setModalMessage(null);
    if (modalMessage?.includes("No se proporcionó un token") || modalMessage?.includes("Error al obtener el evento")) {
      navigate("/cliente");
    }
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
    <div>
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
      <Guests eventType={eventType} />
    </div>
  );
};

export default GuestsWrapper;