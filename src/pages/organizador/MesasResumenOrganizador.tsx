import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import * as XLSX from "xlsx-js-style";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import FloorPlan from "../../components/FloorPlan";
import { Table } from "../../types/types";

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

const MIN_GUESTS = 8;
const MAX_GUESTS = 11;
const MIN_GUESTS_MAIN = 8;
const MAX_GUESTS_MAIN = 15;

const ORIGIN_X = 150;
const ORIGIN_Y = 120;
const COL_SPACING = 100;
const ROW_SPACING = 90;
const CIRCLE_SIZE = 60;
const RECT_WIDTH = 130;
const RECT_HEIGHT = 60;

const initialTables: Table[] = [
  { id: 'ESCENARIO', position: { x: 365, y: 40 }, shape: 'rectangle', width: 190, height: 60, isAssignable: false, isMain: false, isUsed: false, numAdults: 0, numChildren: 0, numBabies: 0, descripcion: undefined, guestGroups: [], tableName: 'ESCENARIO', guests: [] },
  { id: 'DJ', position: { x: 90, y: 480 }, shape: 'square', width: 110, height: 110, isAssignable: false, isMain: false, isUsed: false, numAdults: 0, numChildren: 0, numBabies: 0, descripcion: undefined, guestGroups: [], tableName: 'DJ', guests: [] },
  { id: 'OFICINA', position: { x: 660, y: 480 }, shape: 'rectangle', width: 240, height: 110, isAssignable: false, isMain: false, isUsed: false, numAdults: 0, numChildren: 0, numBabies: 0, descripcion: undefined, guestGroups: [], tableName: 'OFICINA', guests: [] },
  { id: 'PASARELA', position: { x: 320, y: 510 }, shape: 'rectangle', width: 500, height: 15, isAssignable: false, isMain: false, isUsed: false, numAdults: 0, numChildren: 0, numBabies: 0, descripcion: undefined, guestGroups: [], tableName: 'PASARELA', guests: [] },
  ...[
    [-1, 1], [-1, 0], [0.2, 0], [0.2, 1], [0, 2], [0.7, 3], [1.2, 3.8], [2.3, 3.8],
    [1.8, 2.5], [1.5, 1.1], [2.2, 0], [3, 1], [3.3, 2], [3, 2.8], [3.5, 3.8],
    [4.7, 3], [4.7, 2], [4.7, 1], [4.7, 0], [5.6, 0], [5.6, 1], [5.6, 2], [5.6, 3]
  ].map(([x, y], i): Table => ({
    id: i === 10 ? 'Principal' : `M${i + 1 - (i >= 11 ? 1 : 0)}`,
    position: { x: x * COL_SPACING + ORIGIN_X, y: y * ROW_SPACING + ORIGIN_Y },
    shape: i === 10 ? 'rectangle' : 'circle',
    width: i === 10 ? RECT_WIDTH : CIRCLE_SIZE,
    height: i === 10 ? RECT_HEIGHT : CIRCLE_SIZE,
    isAssignable: true,
    isMain: i === 10,
    isUsed: false,
    tableName: i === 10 ? 'Principal' : undefined,
    tablecloth: 'white',
    napkinColor: 'white',
    centerpiece: 'none',
    numAdults: 0,
    numChildren: 0,
    numBabies: 0,
    descripcion: undefined,
    guestGroups: [],
    guests: [],
  })),
];

export default function MesasResumenOrganizador() {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [decoracion, setDecoracion] = useState<Decoracion | null>(null);
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const croquisRef = useRef<HTMLDivElement>(null);

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
            const isMainA = a.is_main || a.table_id.toLowerCase().includes("principal");
            const isMainB = b.is_main || b.table_id.toLowerCase().includes("principal");
            if (isMainA && !isMainB) return -1;
            if (!isMainA && isMainB) return 1;
            const getNumber = (table_id: string) => {
              if (table_id.toLowerCase().includes("principal")) return -1;
              const match = table_id.match(/\d+/);
              return match ? parseInt(match[0], 10) : Infinity;
            };
            return getNumber(a.table_id) - getNumber(b.table_id);
          })
          .slice(0, 24);

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

  // Mapear mesas al formato Table para FloorPlan
  const tables: Table[] = initialTables.map((table) => {
    const dbTable = mesas.find((m) => m.table_id === table.id);
    return {
      ...table,
      tableName: dbTable?.table_name || (table.isMain ? 'Principal' : table.tableName),
      isUsed: dbTable ? dbTable.is_used || dbTable.is_main : table.isUsed,
      numAdults: dbTable?.num_adults || 0,
      numChildren: dbTable?.num_children || 0,
      numBabies: dbTable?.num_babies || 0,
      descripcion: dbTable?.descripcion || undefined,
      guestGroups: dbTable?.guest_groups || [],
      guests: dbTable?.guest_groups ? dbTable.guest_groups.map((group) => group.name) : [],
      tablecloth: decoracion?.tablecloth || 'white',
      napkinColor: decoracion?.napkin_color || 'white',
      centerpiece: decoracion?.centerpiece || 'none',
    };
  });

  // Preparar datos para FloorPlan
  const tableWarnings: string[] = tables
    .filter((t) => t.isAssignable && t.isUsed)
    .filter((t) => {
      const total = (t.numAdults || 0) + (t.numChildren || 0) + (t.numBabies || 0);
      return t.isMain
        ? total < MIN_GUESTS_MAIN || total > MAX_GUESTS_MAIN
        : total < MIN_GUESTS || total > MAX_GUESTS;
    })
    .map((t) => t.id);

  const tableGuests = Object.fromEntries(
    tables.map((t) => [
      t.id,
      (t.guestGroups || []).reduce(
        (sum, group) => sum + (group.numAdults || 0) + (group.numChildren || 0) + (group.numBabies || 0),
        0
      ),
    ])
  );

  const exportToPDF = async () => {
    if (croquisRef.current) {
      const canvas = await html2canvas(croquisRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 190;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Croquis_Mesas_${id}.pdf`);
    }
  };

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();
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
            grupo.numAdults || "",
            grupo.numChildren || "",
            grupo.numBabies || "",
            mesaNombre,
            grupo.details || "",
          ]);
        });
      } else {
        guestTableData.push(["Sin asignar", "", "", "", mesaNombre, ""]);
      }
    });

    const totalAdultos = mesas.reduce(
      (sum, mesa) => sum + (mesa.guest_groups?.reduce((s, g) => s + (g.numAdults || 0), 0) || 0),
      0
    );
    const totalNinos = mesas.reduce(
      (sum, mesa) => sum + (mesa.guest_groups?.reduce((s, g) => s + (g.numChildren || 0), 0) || 0),
      0
    );
    const totalBebes = mesas.reduce(
      (sum, mesa) => sum + (mesa.guest_groups?.reduce((s, g) => s + (g.numBabies || 0), 0) || 0),
      0
    );
    guestTableData.push([]);
    guestTableData.push(["Totales", totalAdultos, totalNinos, totalBebes, "", ""]);

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

    const sheetData = [...guestTableData, ...decorationTableData];
    const sheet = XLSX.utils.aoa_to_sheet(sheetData);

    sheet["!cols"] = [
      { wch: 25 },
      { wch: 20 },
      { wch: 20 },
      { wch: 10 },
      { wch: 20 },
      { wch: 40 },
    ];

    const range = XLSX.utils.decode_range(sheet["!ref"]!);
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
        if (!sheet[cellRef]) continue;

        const isTitle = R === 0 || R === guestTableData.length;
        const isHeader = R === 2 || R === guestTableData.length + 2;
        const isTotal = R === guestTableData.length - 2;
        const isGuestData = R > 2 && R < guestTableData.length - 2;
        const isDecorationDataRow = R > guestTableData.length + 2;
        const cellValue = sheet[XLSX.utils.encode_cell({ r: R, c: 0 })]?.v;
        const isNoAsignado = isGuestData && (typeof cellValue === "string" && cellValue.includes("Sin asignar"));

        const isDecorationTableColumn = isDecorationDataRow && C > 2;
        if (isDecorationTableColumn) continue;

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
          fill: isTitle
            ? { fgColor: { rgb: "FFF9C4" } }
            : isHeader
            ? { fgColor: { rgb: "FFD700" } }
            : isTotal
            ? { fgColor: { rgb: "FFFBEA" } }
            : isDecorationDataRow || isGuestData
            ? { fgColor: { rgb: R % 2 === 0 ? "F5F5F5" : "FFFFFF" } }
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

        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 flex items-center bg-orange-100 rounded-lg p-4 shadow-md">
          Resumen de Mesas y Decoración
        </h1>

        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">Croquis del Salón</h2>
          <div ref={croquisRef} className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden p-4 shadow-inner">
            <FloorPlan
              tables={tables}
              onTableSelect={() => {}}
              tableWarnings={tableWarnings}
              tableGuests={tableGuests}
              tableCapacity={MAX_GUESTS}
            />
          </div>
          <button
            onClick={exportToPDF}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md"
          >
            Exportar Croquis a PDF
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">Distribución de Grupos</h2>
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
                          <td className="p-3 text-gray-700"></td>
                          <td className="p-3 text-gray-700"></td>
                          <td className="p-3 text-gray-700"></td>
                          <td className="p-3 text-gray-700"></td>
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
                        <td className="p-3 text-gray-700">{grupo.numAdults || ""}</td>
                        <td className="p-3 text-gray-700">{grupo.numChildren || ""}</td>
                        <td className="p-3 text-gray-700">{grupo.numBabies || ""}</td>
                        <td className="p-3 text-gray-700">{grupo.details || ""}</td>
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
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">Detalles de Decoración</h2>
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