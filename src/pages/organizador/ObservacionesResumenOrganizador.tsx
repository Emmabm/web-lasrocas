import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import * as XLSX from "xlsx-js-style";

interface GeneralObservation {
  id: string;
  evento_id: string;
  general_observations: string | null;
}

export default function ObservacionesResumenOrganizador() {
  const [observations, setObservations] = useState<GeneralObservation[]>([]);
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const fetchObservations = async () => {
    setLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const user = session?.session?.user;
      if (!user) {
        setModalMessage("Debes iniciar sesión.");
        navigate("/");
        return;
      }

      if (!id) {
        setModalMessage("ID de evento no válido.");
        navigate("/organizador/panel");
        return;
      }

      const { data: evento, error: eventoError } = await supabase
        .from("eventos")
        .select("organizador_id")
        .eq("id", id)
        .single();

      if (eventoError || !evento) {
        setModalMessage("Evento no encontrado.");
        navigate("/organizador/panel");
        return;
      }

      if (evento.organizador_id !== user.id) {
        setModalMessage("Acceso denegado.");
        navigate("/organizador/panel");
        return;
      }

      const { data: observationsData, error: observationsError } = await supabase
        .from("observaciones_generales")
        .select("*")
        .eq("evento_id", id);

      if (observationsError) {
        setModalMessage(`Error al cargar observaciones: ${observationsError.message}`);
        setObservations([]);
      } else {
        setObservations(observationsData || []);
      }
    } catch (error: any) {
      setModalMessage("Error al cargar datos: " + error.message);
      setObservations([]);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (observations.length === 0) {
      setModalMessage("No hay datos para exportar.");
      return;
    }

    const workbook = XLSX.utils.book_new();
    const data = [["Observaciones Generales del Evento"], []];

    const text = observations.map(o => o.general_observations).filter(Boolean).join("\n") || "Sin observaciones.";
    data.push([text]);

    const sheet = XLSX.utils.aoa_to_sheet(data);
    sheet["!cols"] = [{ wch: 80 }];

    XLSX.utils.book_append_sheet(workbook, sheet, "Observaciones");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Observaciones_Evento_${id}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (id) fetchObservations();
  }, [id, navigate]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-white">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6 sm:p-8">
      <div className="max-w-3xl mx-auto">
        {modalMessage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Atención</h3>
              <p className="text-gray-600 mb-6">{modalMessage}</p>
              <button
                className="bg-[#FF6B35] text-white px-4 py-2 rounded-md hover:bg-[#FF6B35]/90 w-full"
                onClick={() => {
                  setModalMessage(null);
                  navigate("/organizador/panel");
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        )}

        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 bg-orange-100 rounded-lg p-4 shadow-md">
          Observaciones Generales
        </h1>

        <div className="bg-white rounded-2xl shadow-xl p-6">
          <p className="text-gray-700 whitespace-pre-line">
            {observations.map(o => o.general_observations).filter(Boolean).join("\n") || "Sin observaciones."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8">
          <button
            onClick={() => navigate("/organizador/panel")}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg shadow-md"
          >
            ← Volver al panel
          </button>
          {observations.length > 0 && (
            <button
              onClick={exportToExcel}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md"
            >
              Exportar a Excel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
