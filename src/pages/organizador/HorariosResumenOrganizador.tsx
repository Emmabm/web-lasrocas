import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import * as XLSX from 'xlsx-js-style';

export default function HorariosResumenOrganizador() {
  const [scheduleBlocks, setScheduleBlocks] = useState<any[]>([]);
  const [externalStaff, setExternalStaff] = useState<any[]>([]);
  const [evento, setEvento] = useState<any>({});
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const fetchEventoYHorarios = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      const user = session?.session?.user;
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data: eventoData, error: eventoError } = await supabase
        .from('eventos')
        .select('id, organizador_id, nombre')
        .eq('id', id)
        .single();

      if (eventoError || !eventoData) {
        alert('Evento no encontrado o acceso denegado');
        navigate('/organizador/panel');
        return;
      }

      if (eventoData.organizador_id !== user.id) {
        alert('Acceso denegado');
        navigate('/organizador/panel');
        return;
      }

      setEvento(eventoData);

      // --- CORRECCIÓN: Usar evento_id en lugar de user_id ---
      const { data: scheduleData, error: scheduleError } = await supabase
        .from('schedule_blocks')
        .select('id, title, time')
        .eq('evento_id', id)
        .order('time', { ascending: true });

      setScheduleBlocks(scheduleError ? [] : scheduleData || []);

      const { data: staffData, error: staffError } = await supabase
        .from('external_staff')
        .select('id, name, role, contact')
        .eq('evento_id', id)
        .order('role', { ascending: true });

      setExternalStaff(staffError ? [] : staffData || []);

    } catch (error) {
      console.error('Error inesperado:', error);
      setScheduleBlocks([]);
      setExternalStaff([]);
      setEvento({});
    }
  };

  useEffect(() => {
    if (id) fetchEventoYHorarios();
  }, [id, navigate]);

  const formatScheduleBlock = (block: any) => block.time ? `${block.time} - ${block.title}` : block.title || 'Sin actividad';
  const formatExternalStaff = (staff: any) => `${staff.name} (${staff.role}, ${staff.contact})`;

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();

    const sheetData = [];

    // Horarios
    sheetData.push(["Horarios"]);
    sheetData.push(["Hora", "Descripción"]);
    const horariosData = scheduleBlocks.map(block => [
      block.time || 'No especificada',
      block.title || 'Sin actividad'
    ]);
    sheetData.push(...horariosData);

    sheetData.push([]);

    // Personal Externo
    sheetData.push(["Personal Externo"]);
    sheetData.push(["Nombre", "Rol", "Teléfono"]);
    const staffData = externalStaff.map(staff => [
      staff.name || 'Sin nombre',
      staff.role || 'Sin rol',
      staff.contact || 'Sin contacto'
    ]);
    sheetData.push(...staffData);

    const sheet = XLSX.utils.aoa_to_sheet(sheetData);

    sheet['!cols'] = [
      { wch: 20 },
      { wch: 50 },
      { wch: 20 }
    ];

    const range = XLSX.utils.decode_range(sheet['!ref']!);
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
        if (!sheet[cellRef]) continue;

        const isHeader = R === 1 || R === horariosData.length + 3;
        const isTitle = R === 0 || R === horariosData.length + 2;

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

    XLSX.utils.book_append_sheet(workbook, sheet, "Resumen");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    const url = window.URL.createObjectURL(data);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Resumen_Horarios_Personal_${id}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 flex items-center bg-orange-100 rounded-lg p-4 shadow-md">
          Resumen de Evento y Horarios
        </h1>

        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Detalles del Evento</h2>
          {evento.id ? (
            <div className="text-gray-600 text-sm sm:text-base space-y-2">
              <p><strong>Nombre:</strong> {evento.nombre || 'No especificado'}</p>
            </div>
          ) : (
            <p className="text-gray-500">No hay detalles del evento disponibles.</p>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Horarios</h2>
          {scheduleBlocks.length > 0 ? (
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              {scheduleBlocks.map(block => (
                <li key={block.id} className="text-sm sm:text-base">{formatScheduleBlock(block)}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm sm:text-base">No hay horarios registrados para este evento.</p>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Personal Externo</h2>
          {externalStaff.length > 0 ? (
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              {externalStaff.map(staff => (
                <li key={staff.id} className="text-sm sm:text-base">{formatExternalStaff(staff)}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm sm:text-base">No hay personal externo registrado para este evento.</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <button
            onClick={() => navigate("/organizador/panel")}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg"
          >
            ← Volver al panel
          </button>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={exportToExcel}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg"
            >
              Exportar a Excel 
            </button>

            <button
              onClick={() => navigate(`/organizador/evento/${id}/invitados`)}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-lg"
            >
              Ver resumen de invitados
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
