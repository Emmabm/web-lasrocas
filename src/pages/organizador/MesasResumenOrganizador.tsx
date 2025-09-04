import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import * as XLSX from "xlsx-js-style";

const centerpieceOptions = [
  { id: "none", name: "Ninguno" },
  { id: "candles", name: "Centro de mesa del salón" },
  { id: "modern", name: "Centro proporcionado por el cliente" },
];

interface GuestGroup {
  id?: string;
  name: string;
  numAdults: number;
  numChildren: number;
  numBabies: number;
  details: string;
}

interface Mesa {
  id: string;
  evento_id: string;
  table_id: string;
  table_name: string | null;
  num_adults: number | null;
  num_children: number | null;
  num_babies: number | null;
  descripcion: string | null;
  is_main: boolean;
  is_used: boolean;
  guest_groups: GuestGroup[];
}

interface Decoracion {
  id: string;
  evento_id: string;
  tablecloth: string | null;
  napkin_color: string | null;
  centerpiece: string | null;
}

export default function MesasResumenOrganizador() {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [decoracion, setDecoracion] = useState<Decoracion | null>(null);
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const fetchMesasYDecoracion = async () => {
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

      const { data: mesasData, error: mesasError } = await supabase
        .from("mesas")
        .select("id, evento_id, table_id, table_name, num_adults, num_children, num_babies, descripcion, is_main, is_used, guest_groups")
        .eq("evento_id", id);

      if (mesasError) {
        setModalMessage(`Error al cargar mesas: ${mesasError.message}`);
        setMesas([]);
      } else if (mesasData) {
        // Depuración: Mostrar detalles de cada mesa
        console.log(
          "Datos de mesas desde Supabase:",
          mesasData.map((m) => ({
            id: m.id,
            table_id: m.table_id,
            is_main: m.is_main,
            is_used: m.is_used,
            guest_groups: m.guest_groups,
          }))
        );

        const mesasFiltradas = mesasData
          .filter((m) => m.is_used || m.is_main)
          .sort((a, b) => {
            // Priorizar Mesa Principal (is_main: true o table_id contiene "principal")
            const isMainA = a.is_main || a.table_id.toLowerCase().includes("principal");
            const isMainB = b.is_main || b.table_id.toLowerCase().includes("principal");
            if (isMainA && !isMainB) return -1;
            if (!isMainA && isMainB) return 1;

            // Ordenar otras mesas por número en table_id
            const getNumber = (table_id: string) => {
              if (table_id.toLowerCase().includes("principal")) return -1; // Priorizar "Principal"
              const match = table_id.match(/\d+/); // Extraer número de "M1", "M2", etc.
              return match ? parseInt(match[0], 10) : Infinity;
            };

            return getNumber(a.table_id) - getNumber(b.table_id);
          })
          .slice(0, 24); // Limitar a 24 mesas

        // Depuración: Mostrar mesas ordenadas
        console.log(
          "Mesas ordenadas:",
          mesasFiltradas.map((m) => ({
            id: m.id,
            table_id: m.table_id,
            is_main: m.is_main,
            guest_groups: m.guest_groups,
          }))
        );

        setMesas(mesasFiltradas);
      }

      const { data: decoracionData, error: decoracionError } = await supabase
        .from("decoracion_evento")
        .select("id, evento_id, tablecloth, napkin_color, centerpiece")
        .eq("evento_id", id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (decoracionError) {
        setModalMessage(`Error al cargar decoración: ${decoracionError.message}`);
        setDecoracion(null);
      } else {
        setDecoracion(decoracionData?.[0] || null);
      }
    } catch (error: any) {
      setModalMessage("Error al cargar datos: " + error.message);
      setMesas([]);
      setDecoracion(null);
    } finally {
      setLoading(false);
    }
  };

const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();

    // --- Data for the Guest Group Table ---
    const guestTableData = [];
    guestTableData.push(["Resumen de Mesas y Decoración"]);
    guestTableData.push([]);
    guestTableData.push(["Grupo Asignado", "Adultos", "Niños", "Bebés", "Mesa", "Observaciones"]);

    mesas.forEach((mesa) => {
        const mesaNombre = mesa.is_main
            ? "Mesa Principal"
            : mesa.table_name || `Mesa ${mesa.table_id ? mesa.table_id.replace(/\D/g, "") : "N/A"}`;
        if (mesa.guest_groups?.length) {
            mesa.guest_groups.forEach((grupo) => {
                guestTableData.push([
                    grupo.name,
                    grupo.numAdults,
                    grupo.numChildren,
                    grupo.numBabies,
                    mesaNombre,
                    grupo.details || "Sin observaciones",
                ]);
            });
        } else {
            guestTableData.push(["Sin asignar", 0, 0, 0, mesaNombre, "Sin observaciones"]);
        }
    });

    const totalAdultos = mesas.reduce((sum, mesa) => sum + (mesa.guest_groups?.reduce((s, g) => s + (g.numAdults || 0), 0) || 0), 0);
    const totalNinos = mesas.reduce((sum, mesa) => sum + (mesa.guest_groups?.reduce((s, g) => s + (g.numChildren || 0), 0) || 0), 0);
    const totalBebes = mesas.reduce((sum, mesa) => sum + (mesa.guest_groups?.reduce((s, g) => s + (g.numBabies || 0), 0) || 0), 0);
    guestTableData.push([]);
    guestTableData.push(["Totales", totalAdultos, totalNinos, totalBebes, "", ""]);

    // --- Data for the Decoration Table ---
    const decoracionData = formatDecoracion(decoracion).map((item) => [
        item.tablecloth,
        item.napkin_color,
        item.centerpiece,
    ]);

    const decorationTableData = [];
    decorationTableData.push([]);
    decorationTableData.push(["Detalles de Decoración"]);
    decorationTableData.push(["Color del Mantel", "Color de Servilletas", "Centro de Mesa"]);
    decorationTableData.push(...decoracionData);

    // --- Combine and Create Sheet ---
    const sheetData = [...guestTableData, ...decorationTableData];
    const sheet = XLSX.utils.aoa_to_sheet(sheetData);

    // --- Dynamic Cell Styling and Column Widths ---
    const guestTableLength = guestTableData.length;
    const decorationHeaderStart = guestTableLength + 2;

    // Set column widths
    sheet["!cols"] = [
        { wch: 25 }, // Columna A
        { wch: 20 }, // Columna B
        { wch: 20 }, // Columna C
        { wch: 10 }, // Columna D
        { wch: 20 }, // Columna E
        { wch: 40 }, // Columna F
    ];

    // Apply styles
    const range = XLSX.utils.decode_range(sheet["!ref"]!);
    for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
            if (!sheet[cellRef]) continue;

            const isTitle = R === 0 || R === guestTableLength;
            const isHeader = R === 2 || R === decorationHeaderStart;
            const isTotal = R === guestTableLength - 2;
            const isGuestData = R > 2 && R < guestTableLength - 2;
            const isDecorationDataRow = R > decorationHeaderStart;
            const cellValue = sheet[XLSX.utils.encode_cell({ r: R, c: 0 })]?.v;
            const isNoAsignado = isGuestData && (typeof cellValue === 'string' && cellValue.includes("Sin asignar"));

            // Determine if the cell is part of the decoration table and should be limited to 3 columns
            const isDecorationTableColumn = isDecorationDataRow && C > 2;
            if (isDecorationTableColumn) {
                // Skip styling for columns D, E, F in the decoration table area
                continue;
            }

            sheet[cellRef].s = {
                border: {
                    top: { style: "thin" },
                    bottom: { style: "thin" },
                    left: { style: "thin" },
                    right: { style: "thin" },
                },
                alignment: {
                    vertical: "center",
                    horizontal: isHeader || isTitle ? "center" : "left",
                    wrapText: true,
                },
                font: {
                    bold: isHeader || isTitle || isTotal,
                    sz: isTitle ? 14 : isHeader ? 12 : isTotal ? 12 : 11,
                    color: isNoAsignado ? { rgb: "FF0000" } : { rgb: "000000" },
                },
                fill:
                    isTitle
                        ? { fgColor: { rgb: "FFF9C4" } } // Amarillo pastel para títulos
                        : isHeader
                            ? { fgColor: { rgb: "FFD700" } } // Amarillo dorado para encabezados
                            : isTotal
                                ? { fgColor: { rgb: "FFFBEA" } } // Amarillo muy claro para totales
                                : isDecorationDataRow || isGuestData
                                    ? { fgColor: { rgb: R % 2 === 0 ? "F5F5F5" : "FFFFFF" } } // Alternating gray/white
                                    : undefined,
            };
        }
    }

    XLSX.utils.book_append_sheet(workbook, sheet, "Resumen");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    const url = window.URL.createObjectURL(data);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Resumen_Mesas_${id}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};
  useEffect(() => {
    if (id) fetchMesasYDecoracion();
  }, [id, navigate]);

  const formatDecoracion = (decoracion: Decoracion | null) => [
    {
      tablecloth: decoracion?.tablecloth || "No registrado",
      napkin_color: decoracion?.napkin_color || "No registrado",
      centerpiece: centerpieceOptions.find((opt) => opt.id === decoracion?.centerpiece)?.name || decoracion?.centerpiece || "No registrado",
    },
  ];

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
          🪑 Resumen de Mesas y Decoración
        </h1>

        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            📋 Distribución de Grupos
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm sm:text-base">
              <thead className="bg-[#FF6B35] text-white">
                <tr>
                  <th className="p-3 text-left font-semibold rounded-tl-lg">Mesa</th>
                  <th className="p-3 text-left font-semibold">Grupo Asignado</th>
                  <th className="p-3 text-left font-semibold">Adultos</th>
                  <th className="p-3 text-left font-semibold">Niños</th>
                  <th className="p-3 text-left font-semibold">Bebés</th>
                  <th className="p-3 text-left font-semibold rounded-tr-lg">Detalles</th>
                </tr>
              </thead>
              <tbody>
                {mesas.length > 0 ? (
                  mesas.flatMap((mesa, index) => {
                    const mesaNombre = mesa.is_main
                      ? "Mesa Principal"
                      : mesa.table_name || `Mesa ${mesa.table_id.replace(/\D/g, "") || index + 1}`;
                    if (!mesa.guest_groups?.length) {
                      return [
                        <tr key={mesa.id} className="border-b border-gray-200 bg-white hover:bg-orange-50">
                          <td className="p-3 text-gray-700">{mesaNombre}</td>
                          <td className="p-3 text-gray-700">Sin asignar</td>
                          <td className="p-3 text-gray-700">0</td>
                          <td className="p-3 text-gray-700">0</td>
                          <td className="p-3 text-gray-700">0</td>
                          <td className="p-3 text-gray-700">Sin observaciones</td>
                        </tr>,
                      ];
                    }
                    return mesa.guest_groups.map((grupo, i) => (
                      <tr
                        key={`${mesa.id}-${grupo.id || i}`}
                        className={`border-b border-gray-200 ${i % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-orange-50`}
                      >
                        <td className="p-3 text-gray-700">{i === 0 ? mesaNombre : ""}</td>
                        <td className="p-3 text-gray-700">{grupo.name}</td>
                        <td className="p-3 text-gray-700">{grupo.numAdults}</td>
                        <td className="p-3 text-gray-700">{grupo.numChildren}</td>
                        <td className="p-3 text-gray-700">{grupo.numBabies}</td>
                        <td className="p-3 text-gray-700">{grupo.details || "Sin observaciones"}</td>
                      </tr>
                    ));
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-gray-500">
                      No hay mesas registradas.
                    </td>
                  </tr>
                )}
                {mesas.length > 0 && (
                  <tr className="bg-orange-100 font-semibold">
                    <td className="p-3 text-gray-800">Totales</td>
                    <td className="p-3"></td>
                    <td className="p-3 text-gray-800">
                      {mesas.reduce(
                        (sum, mesa) => sum + (mesa.guest_groups?.reduce((s, g) => s + (g.numAdults || 0), 0) || 0),
                        0
                      )}
                    </td>
                    <td className="p-3 text-gray-800">
                      {mesas.reduce(
                        (sum, mesa) => sum + (mesa.guest_groups?.reduce((s, g) => s + (g.numChildren || 0), 0) || 0),
                        0
                      )}
                    </td>
                    <td className="p-3 text-gray-800">
                      {mesas.reduce(
                        (sum, mesa) => sum + (mesa.guest_groups?.reduce((s, g) => s + (g.numBabies || 0), 0) || 0),
                        0
                      )}
                    </td>
                    <td className="p-3"></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            🎀 Detalles de Decoración
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm sm:text-base">
              <thead className="bg-[#FF6B35] text-white">
                <tr>
                  <th className="p-3 text-left font-semibold rounded-tl-lg">Mantel</th>
                  <th className="p-3 text-left font-semibold">Servilletas</th>
                  <th className="p-3 text-left font-semibold rounded-tr-lg">Centro de Mesa</th>
                </tr>
              </thead>
              <tbody>
                {formatDecoracion(decoracion).map((item, index) => (
                  <tr
                    key={index}
                    className={`border-b border-gray-200 ${index % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-orange-50`}
                  >
                    <td className="p-3 text-gray-700">{item.tablecloth}</td>
                    <td className="p-3 text-gray-700">{item.napkin_color}</td>
                    <td className="p-3 text-gray-700">{item.centerpiece}</td>
                  </tr>
                ))}
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
              onClick={() => navigate(`/organizador/evento/${id}/cena`)}
              className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white font-semibold py-3 px-6 rounded-lg shadow-md"
            >
              Ver Resumen Cena
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}