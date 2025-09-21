import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import * as XLSX from "xlsx-js-style";

interface GeneralObservation {
  id: string;
  evento_id: string;
  catering_observations: string | null;
  tables_observations: string | null;
  schedule_observations: string | null;
  dinner_observations: string | null;
  dance_observations: string | null;
  general_observations: string | null;
}

export default function ObservacionesResumenOrganizador() {
  const [observations, setObservations] = useState<GeneralObservation | null>(null);
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
        .eq("evento_id", id)
        .single();

      if (observationsError) {
        setModalMessage(`Error al cargar observaciones: ${observationsError.message}`);
        setObservations(null);
      } else {
        setObservations(observationsData || null);
      }
    } catch (error: any) {
      setModalMessage("Error al cargar datos: " + error.message);
      setObservations(null);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (!observations) {
      setModalMessage("No hay datos para exportar.");
      return;
    }

    const workbook = XLSX.utils.book_new();
    const data = [
      ["Observaciones Generales del Evento"],
      [],
      ["Categoría", "Observación"],
      ["Catering", observations.catering_observations || "Sin observaciones."],
      ["Mesas", observations.tables_observations || "Sin observaciones."],
      ["Horarios", observations.schedule_observations || "Sin observaciones."],
      ["Cena", observations.dinner_observations || "Sin observaciones."],
      ["Baile", observations.dance_observations || "Sin observaciones."],
      ["Otras observaciones", observations.general_observations || "Sin observaciones."],
    ];

    const sheet = XLSX.utils.aoa_to_sheet(data);

    // Ajustar anchos de columna
    sheet["!cols"] = [{ wch: 25 }, { wch: 60 }];

    // Aplicar estilos
    const range = XLSX.utils.decode_range(sheet["!ref"]!);
    for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
            if (!sheet[cellRef]) continue;

            const isTitle = R === 0;
            const isHeader = R === 2;

            sheet[cellRef].s = {
                border: {
                    top: { style: "thin" },
                    bottom: { style: "thin" },
                    left: { style: "thin" },
                    right: { style: "thin" },
                },
                alignment: {
                    vertical: "center",
                    horizontal: isTitle || isHeader ? "center" : "left",
                    wrapText: true,
                },
                font: {
                    bold: isTitle || isHeader,
                    sz: isTitle ? 14 : isHeader ? 12 : 11,
                },
                fill: isTitle
                    ? { fgColor: { rgb: "FFF9C4" } }
                    : isHeader
                    ? { fgColor: { rgb: "FFD700" } }
                    : { fgColor: { rgb: R % 2 === 0 ? "F5F5F5" : "FFFFFF" } },
            };
        }
    }

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
      <div className="max-w-5xl mx-auto">
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

        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 flex items-center bg-orange-50 rounded-lg p-4 shadow-md">
          📝 Observaciones Generales
        </h1>
        
        {observations ? (
          <>
            <div className="grid gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">🍽️ Catering</h2>
                <p className="text-gray-700">{observations.catering_observations || "Sin observaciones."}</p>
              </div>
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">🪑 Mesas</h2>
                <p className="text-gray-700">{observations.tables_observations || "Sin observaciones."}</p>
              </div>
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">⏰ Horarios</h2>
                <p className="text-gray-700">{observations.schedule_observations || "Sin observaciones."}</p>
              </div>
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">🍽️ Cena</h2>
                <p className="text-gray-700">{observations.dinner_observations || "Sin observaciones."}</p>
              </div>
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">💃 Baile</h2>
                <p className="text-gray-700">{observations.dance_observations || "Sin observaciones."}</p>
              </div>
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">📝 Otras Observaciones</h2>
                <p className="text-gray-700">{observations.general_observations || "Sin observaciones."}</p>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
            <p className="text-gray-500">No hay observaciones registradas para este evento.</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8">
          <button
            onClick={() => navigate("/organizador/panel")}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg shadow-md"
          >
            ← Volver al panel
          </button>
          {observations && (
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