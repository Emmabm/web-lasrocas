import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import FloorPlan from "../../components/FloorPlan";
import { Table } from "../../types/types";

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
  guest_groups: GuestGroup[] | null;
}

export default function MesasResumenOrganizador() {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const croquisRef = useRef<HTMLDivElement>(null);

  const fetchMesas = async () => {
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
        const mesasOrdenadas = mesasData.sort((a, b) => {
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
        });
        setMesas(mesasOrdenadas);
      }
    } catch (error: any) {
      setModalMessage("Error al cargar datos: " + error.message);
      setMesas([]);
    } finally {
      setLoading(false);
    }
  };

  // Mapear mesas al formato Table para FloorPlan
  const tables: Table[] = mesas.map((mesa, index) => ({
    id: mesa.table_id,
    tableName: mesa.table_name || (mesa.is_main ? "Mesa Principal" : `Mesa ${mesa.table_id.replace(/\D/g, "")}`),
    isMain: mesa.is_main,
    isUsed: mesa.is_used,
    isAssignable: true,
    guests: mesa.guest_groups ? mesa.guest_groups.map((group) => group.name) : [],
    guestGroups: mesa.guest_groups || [],
    position: {
      x: 100 + ((index % 6) * 100), // Grid simple: 6 mesas por fila
      y: 100 + Math.floor(index / 6) * 100,
    },
    width: 50,
    height: 50,
    shape: "circle",
  }));

  // Preparar datos para FloorPlan
  const tableWarnings: string[] = [];
  const tableGuests = Object.fromEntries(
    tables.map((t) => [
      t.id,
      (t.guestGroups || []).reduce(
        (sum, group) => sum + group.numAdults + group.numChildren + group.numBabies,
        0
      ),
    ])
  );
  const tableCapacity = 10;

  const exportToPDF = async () => {
    if (croquisRef.current) {
      const canvas = await html2canvas(croquisRef.current, { scale: 2 }); // Aumentar escala para mejor calidad
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

  useEffect(() => {
    if (id) fetchMesas();
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
          Croquis del Salón
        </h1>

        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div ref={croquisRef} className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden p-4 shadow-inner">
            <FloorPlan
              tables={tables}
              onTableSelect={() => {}}
              tableWarnings={tableWarnings}
              tableGuests={tableGuests}
              tableCapacity={tableCapacity}
            />
          </div>
          <div className="flex justify-between mt-4">
            <button
              onClick={() => navigate("/organizador/panel")}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg shadow-md"
            >
              ← Volver al panel
            </button>
            <button
              onClick={exportToPDF}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md"
            >
              Exportar Croquis a PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}