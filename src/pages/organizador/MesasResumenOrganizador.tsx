import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import * as XLSX from "xlsx-js-style";

const centerpieceOptions = [
  { id: 'none', name: 'Ninguno' },
  { id: 'candles', name: 'Centro de mesa del salón' },
  { id: 'modern', name: 'Centro proporcionado por el cliente' }
];

interface Mesa {
  id: string;
  evento_id: string;
  table_id: string;
  table_name: string | null;
  num_adults: number | null;
  num_children: number | null;
  descripcion: string | null;
  is_main: boolean;
  is_used: boolean;
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
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const fetchMesasYDecoracion = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      const user = session?.session?.user;
      if (!user) {
        setModalMessage("Debes iniciar sesión para ver la información.");
        navigate("/");
        return;
      }

      if (!id) {
        setModalMessage("No se proporcionó un ID de evento válido.");
        navigate("/organizador/panel");
        return;
      }

      const { data: evento, error: eventoError } = await supabase
        .from("eventos")
        .select("organizador_id, nombre, fecha")
        .eq("id", id)
        .single();

      if (eventoError || !evento) {
        console.error("Error al verificar evento:", eventoError?.message);
        setModalMessage("Evento no encontrado o acceso denegado.");
        navigate("/organizador/panel");
        return;
      }

      if (evento.organizador_id !== user.id) {
        console.error("Acceso denegado: organizador_id no coincide");
        setModalMessage("Acceso denegado.");
        navigate("/organizador/panel");
        return;
      }

      const { data: mesasData, error: mesasError } = await supabase
        .from("mesas")
        .select("id, evento_id, table_id, table_name, num_adults, num_children, descripcion, is_main, is_used")
        .eq("evento_id", id);

      if (mesasError) {
        console.error("Error al cargar mesas:", mesasError.message);
        setModalMessage(`Error al cargar mesas: ${mesasError.message}`);
        setMesas([]);
      } else if (mesasData) {
        console.log("Datos crudos de mesas:", mesasData);
        const mesasFiltradas = mesasData.filter((m) => m.is_used || m.is_main);
        const principal = mesasFiltradas.filter((m) => m.is_main);
        const otras = mesasFiltradas
          .filter((m) => !m.is_main)
          .sort((a, b) => {
            const getNumber = (table_id: string | null) => {
              if (!table_id || !table_id.includes("M")) return Infinity;
              const num = parseInt(table_id.replace(/\D/g, "") || "0");
              return isNaN(num) ? Infinity : num;
            };
            const numA = getNumber(a.table_id);
            const numB = getNumber(b.table_id);
            return numA - numB;
          });
        setMesas([...principal, ...otras].slice(0, 24));
      }

      const { data: decoracionData, error: decoracionError } = await supabase
        .from("decoracion_evento")
        .select("id, evento_id, tablecloth, napkin_color, centerpiece")
        .eq("evento_id", id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (decoracionError) {
        console.error("Error al cargar decoración:", decoracionError.message);
        setModalMessage(`Error al cargar decoración: ${decoracionError.message}`);
        setDecoracion(null);
      } else {
        console.log("Datos crudos de decoración:", decoracionData);
        setDecoracion(decoracionData?.[0] || null);
      }
    } catch (error: any) {
      console.error("Error inesperado:", error.message || error);
      setModalMessage("Ocurrió un error al cargar la información. Por favor, revisa la consola.");
      setMesas([]);
      setDecoracion(null);
    }
  };

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();

    // Preparar datos para una sola hoja
    const sheetData = [];

    // Título para la tabla de mesas
    sheetData.push(["Distribución de Mesas"]);
    sheetData.push([
      "Número de Mesa",
      "Nombre de Mesa",
      "Cantidad de Adultos",
      "Cantidad de Niños",
      "Total de Personas",
      "Detalle Especial"
    ]);

    // Datos de mesas
    const mesasData = mesas.map((mesa, index) => {
      const { numero, nombre, adultos, ninos, total, detalle } = formatMesa(mesa, index);
      return [numero, nombre, adultos, ninos, total, detalle];
    });
    sheetData.push(...mesasData);

    // Fila vacía para separar tablas
    sheetData.push([]);

    // Título para la tabla de decoración
    sheetData.push(["Detalles de Decoración"]);
    sheetData.push(["Color del Mantel", "Color de Servilletas", "Centro de Mesa"]);

    // Datos de decoración
    const decoracionData = formatDecoracion(decoracion).map(item => [
      item.tablecloth,
      item.napkin_color,
      item.centerpiece
    ]);
    sheetData.push(...decoracionData);

    // Crear hoja
    const sheet = XLSX.utils.aoa_to_sheet(sheetData);

    // Ajustar anchos de columna
    sheet['!cols'] = [
      { wch: 15 }, // Número de Mesa
      { wch: 20 }, // Nombre de Mesa
      { wch: 20 }, // Cantidad de Adultos
      { wch: 20 }, // Cantidad de Niños
      { wch: 20 }, // Total de Personas
      { wch: 30 }, // Detalle Especial
      { wch: 20 }, // Color del Mantel
      { wch: 20 }, // Color de Servilletas
      { wch: 30 }  // Centro de Mesa
    ];

    // Aplicar estilos a las celdas
    const range = XLSX.utils.decode_range(sheet['!ref']!);
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
        if (!sheet[cellRef]) continue;

        const isHeader = R === 1 || R === mesasData.length + 3; // Encabezados de mesas y decoración
        const isTitle = R === 0 || R === mesasData.length + 2; // Títulos de secciones

        sheet[cellRef].s = {
          border: {
            top: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } },
            left: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } }
          },
          alignment: {
            vertical: 'center',
            horizontal: isHeader || isTitle ? 'center' : 'left',
            wrapText: true
          },
          font: {
            bold: isHeader || isTitle,
            sz: isHeader ? 12 : isTitle ? 14 : 11,
            color: { rgb: '000000' }
          },
          fill: isHeader ? { fgColor: { rgb: 'FFD580' } } : isTitle ? { fgColor: { rgb: 'FFF3E0' } } : undefined
        };
      }
    }

    // Generar y descargar archivo
    XLSX.utils.book_append_sheet(workbook, sheet, "Resumen");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    const url = window.URL.createObjectURL(data);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Resumen_Mesas_Decoracion_${id}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (id) {
      fetchMesasYDecoracion();
    }
  }, [id, navigate]);

  const formatMesa = (mesa: Mesa, index: number) => {
    const nombre = mesa.is_main ? "Mesa Principal" : mesa.table_name || `Mesa ${index + 1}`;
    const adultos = mesa.num_adults ?? 0;
    const ninos = mesa.num_children ?? 0;
    const total = adultos + ninos;
    const detalle = mesa.descripcion || "Sin observaciones";
    const numero = mesa.is_main
      ? "Principal"
      : mesa.table_id && mesa.table_id.includes("M")
      ? parseInt(mesa.table_id.replace(/\D/g, "") || "0")
      : index + 1;
    return { numero, nombre, adultos, ninos, total, detalle };
  };

  const formatDecoracion = (decoracion: Decoracion | null) => {
    if (!decoracion) {
      return [{
        tablecloth: "No registrado",
        napkin_color: "No registrado",
        centerpiece: "No registrado",
      }];
    }
    const selectedOption = centerpieceOptions.find(option => option.id === decoracion.centerpiece);
    return [{
      tablecloth: decoracion.tablecloth || "No registrado",
      napkin_color: decoracion.napkin_color || "No registrado",
      centerpiece: selectedOption 
        ? selectedOption.name 
        : decoracion.centerpiece 
          ? `${decoracion.centerpiece} (${decoracion.centerpiece === 'modern' ? 'Elegido por el cliente' : decoracion.centerpiece === 'candles' ? 'Del salón' : 'Desconocido'})`
          : "No registrado",
    }];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6 sm:p-8">
      <div className="max-w-5xl mx-auto">
        {modalMessage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Atención</h3>
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

        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 flex items-center bg-orange-50 rounded-lg p-4 shadow-md">
          <span className="mr-3 text-2xl">🪑</span> Resumen de Mesas y Decoración
        </h1>

        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">📋</span> Distribución de Mesas
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm sm:text-base">
              <thead className="bg-orange-200 text-gray-800">
                <tr>
                  <th className="p-4 text-left font-semibold rounded-tl-lg">Número de Mesa</th>
                  <th className="p-4 text-left font-semibold">Nombre de Mesa</th>
                  <th className="p-4 text-left font-semibold">Cantidad de Adultos</th>
                  <th className="p-4 text-left font-semibold">Cantidad de Niños</th>
                  <th className="p-4 text-left font-semibold">Total de Personas</th>
                  <th className="p-4 text-left font-semibold rounded-tr-lg">Detalle Especial</th>
                </tr>
              </thead>
              <tbody>
                {mesas.length > 0 ? (
                  mesas.map((mesa, index) => {
                    const { numero, nombre, adultos, ninos, total, detalle } = formatMesa(mesa, index);
                    return (
                      <tr
                        key={mesa.id || index}
                        className="border-b border-gray-200 hover:bg-orange-50 transition-colors duration-200"
                      >
                        <td className="p-4 text-gray-700">{numero}</td>
                        <td className="p-4 text-gray-700">{nombre}</td>
                        <td className="p-4 text-gray-700">{adultos}</td>
                        <td className="p-4 text-gray-700">{ninos}</td>
                        <td className="p-4 text-gray-700">{total}</td>
                        <td className="p-4 text-gray-700">{detalle}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-gray-500 text-base">
                      No hay mesas registradas para este evento.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">🎀</span> Detalles de Decoración
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm sm:text-base">
              <thead className="bg-orange-200 text-gray-800">
                <tr>
                  <th className="p-4 text-left font-semibold rounded-tl-lg">Color del Mantel</th>
                  <th className="p-4 text-left font-semibold">Color de Servilletas</th>
                  <th className="p-4 text-left font-semibold rounded-tr-lg">Centro de Mesa</th>
                </tr>
              </thead>
              <tbody>
                {formatDecoracion(decoracion).map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-200 hover:bg-orange-50 transition-colors duration-200"
                  >
                    <td className="p-4 text-gray-700">{item.tablecloth}</td>
                    <td className="p-4 text-gray-700">{item.napkin_color}</td>
                    <td className="p-4 text-gray-700">{item.centerpiece}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <button
            onClick={() => navigate("/organizador/panel")}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
          >
            ← Volver al panel
          </button>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={exportToExcel}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
            >
              Exportar a Excel
            </button>
            <button
              onClick={() => navigate(`/organizador/evento/${id}/horarios`)}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
            >
              Ver resumen de horarios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}