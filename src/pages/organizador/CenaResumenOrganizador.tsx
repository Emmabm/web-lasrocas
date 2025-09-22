import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import * as XLSX from "xlsx-js-style";

interface InvitadoCena {
  id: string;
  evento_id: string;
  nombre_apellido: string;
  num_adultos: number;
  num_ninos: number;
  num_bebes: number;
  observaciones: string | null;
}

export default function CenaResumenOrganizador() {
  const [invitados, setInvitados] = useState<InvitadoCena[]>([]);
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const fetchInvitados = async () => {
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

      const { data: invitadosData, error: invitadosError } = await supabase
        .from("invitados_cena")
        .select("id, evento_id, nombre_apellido, num_adultos, num_ninos, num_bebes, observaciones")
        .eq("evento_id", id)
        .order("nombre_apellido", { ascending: true });

      if (invitadosError) {
        setModalMessage(`Error al cargar invitados: ${invitadosError.message}`);
        setInvitados([]);
      } else {
        setInvitados(invitadosData || []);
      }
    } catch (error: any) {
      setModalMessage("Error al cargar datos: " + error.message);
      setInvitados([]);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();
    const sheetData = [];

    sheetData.push(["Resumen de Invitados a la Cena"]);
    sheetData.push([]);
    sheetData.push(["Nombre y Apellido", "Adultos", "Niños", "Bebés", "Observaciones"]);

    invitados.forEach((invitado) => {
      sheetData.push([
        invitado.nombre_apellido,
        invitado.num_adultos || "",
        invitado.num_ninos || "",
        invitado.num_bebes || "",
        invitado.observaciones || "",
      ]);
    });

    const totalAdultos = invitados.reduce((sum, inv) => sum + (inv.num_adultos || 0), 0);
    const totalNinos = invitados.reduce((sum, inv) => sum + (inv.num_ninos || 0), 0);
    const totalBebes = invitados.reduce((sum, inv) => sum + (inv.num_bebes || 0), 0);
    sheetData.push([]);
    sheetData.push(["Totales", totalAdultos, totalNinos, totalBebes, ""]);

    const sheet = XLSX.utils.aoa_to_sheet(sheetData);
    sheet["!cols"] = [
      { wch: 20 }, // Nombre y Apellido
      { wch: 10 }, // Adultos
      { wch: 10 }, // Niños
      { wch: 10 }, // Bebés
      { wch: 30 }, // Observaciones
    ];

    const range = XLSX.utils.decode_range(sheet["!ref"]!);
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
        if (!sheet[cellRef]) continue;
        const isHeader = R === 2;
        const isTitle = R === 0;
        const isTotal = R === invitados.length + 4;
        sheet[cellRef].s = {
          border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } },
          alignment: { vertical: "center", horizontal: isHeader || isTitle ? "center" : "left", wrapText: true },
          font: { bold: isHeader || isTitle || isTotal, sz: isHeader ? 12 : isTitle ? 14 : isTotal ? 12 : 11 },
          fill: isHeader ? { fgColor: { rgb: "FFC107" } } : isTitle ? { fgColor: { rgb: "FFF8E1" } } : isTotal ? { fgColor: { rgb: "FFECB3" } } : undefined,
        };
      }
    }

    XLSX.utils.book_append_sheet(workbook, sheet, "Resumen Cena");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    const url = window.URL.createObjectURL(data);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Resumen_Cena_${id}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (id) fetchInvitados();
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

        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 flex items-center bg-orange-100 rounded-lg p-4 shadow-md">
           Resumen de Cena
        </h1>

        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
             Lista de Invitados
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm sm:text-base">
              <thead className="bg-[#FF6B35] text-white">
                <tr>
                  <th className="p-3 text-left font-semibold rounded-tl-lg">Nombre y Apellido</th>
                  <th className="p-3 text-left font-semibold">Adultos</th>
                  <th className="p-3 text-left font-semibold">Niños</th>
                  <th className="p-3 text-left font-semibold">Bebés</th>
                  <th className="p-3 text-left font-semibold rounded-tr-lg">Observaciones</th>
                </tr>
              </thead>
              <tbody>
                {invitados.length > 0 ? (
                  invitados.map((invitado, index) => (
                    <tr
                      key={invitado.id}
                      className={`border-b border-gray-200 ${index % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-orange-50`}
                    >
                      <td className="p-3 text-gray-700">{invitado.nombre_apellido}</td>
                      <td className="p-3 text-gray-700">{invitado.num_adultos || ""}</td>
                      <td className="p-3 text-gray-700">{invitado.num_ninos || ""}</td>
                      <td className="p-3 text-gray-700">{invitado.num_bebes || ""}</td>
                      <td className="p-3 text-gray-700">{invitado.observaciones || ""}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-gray-500">
                      No hay invitados registrados para la cena.
                    </td>
                  </tr>
                )}
                {invitados.length > 0 && (
                  <tr className="bg-orange-100 font-semibold">
                    <td className="p-3 text-gray-800">Totales</td>
                    <td className="p-3 text-gray-800">
                      {invitados.reduce((sum, inv) => sum + (inv.num_adultos || 0), 0)}
                    </td>
                    <td className="p-3 text-gray-800">
                      {invitados.reduce((sum, inv) => sum + (inv.num_ninos || 0), 0)}
                    </td>
                    <td className="p-3 text-gray-800">
                      {invitados.reduce((sum, inv) => sum + (inv.num_bebes || 0), 0)}
                    </td>
                    <td className="p-3"></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <button
            onClick={() => navigate("/organizador/panel")}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg shadow-md"
          >
            ← Volver al panel
          </button>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={exportToExcel}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md"
            >
              Exportar a Excel
            </button>
            <button
              onClick={() => navigate(`/organizador/evento/${id}/horarios`)}
              className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white font-semibold py-3 px-6 rounded-lg shadow-md"
            >
              Ver Resumen Horarios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}