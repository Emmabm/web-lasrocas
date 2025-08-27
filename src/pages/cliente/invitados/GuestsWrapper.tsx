import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "../../../supabaseClient";
import Guests from "./Guests";

const GuestsWrapper = () => {
  const [eventId, setEventId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const urlToken = searchParams.get("token");
    if (!urlToken) {
      setModalMessage("No se proporcionó un token");
      return;
    }
    setToken(urlToken);

    const fetchEvent = async () => {
      const { data, error } = await supabase
        .from("eventos")
        .select("id, tipo")
        .eq("token_acceso", urlToken)
        .single();

      if (error || !data) {
        setModalMessage("Error al obtener el evento: " + (error?.message || "Evento no encontrado"));
        return;
      }

      if (data.tipo.toLowerCase() !== "fiesta15") {
        setModalMessage("Esta sección es solo para eventos de tipo Fiesta de 15");
        navigate(`/horarios?token=${urlToken}`);
        return;
      }

      const { data: horarios, error: horariosError } = await supabase
        .from("schedule_blocks")
        .select("id")
        .eq("user_id", data.id)
        .limit(1);

      if (horariosError || !horarios.length) {
        setModalMessage("Debes completar los horarios antes de gestionar invitados");
        navigate(`/horarios?token=${urlToken}`);
        return;
      }

      setEventId(data.id);
    };

    fetchEvent();
  }, [searchParams, navigate]);

  return (
    <div>
      {modalMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Atención</h3>
            <p className="text-gray-600 mb-6">{modalMessage}</p>
            <button
              className="bg-[#FF6B35] text-white px-4 py-2 rounded-md hover:bg-[#FF6B35]/90 w-full transition-colors"
              onClick={() => {
                setModalMessage(null);
                if (modalMessage.includes("No se proporcionó un token")) {
                  navigate("/cliente");
                }
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
      {eventId && token ? (
        <Guests eventId={eventId} token={token} />
      ) : (
        <div className="text-center py-8 text-gray-600">Cargando...</div>
      )}
    </div>
  );
};

export default GuestsWrapper;