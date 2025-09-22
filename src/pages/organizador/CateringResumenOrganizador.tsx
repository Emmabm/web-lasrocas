import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import * as XLSX from 'xlsx-js-style';

interface CateringItem {
  id: string;
  event_id: string;
  paso: string;
  datos: any;
  source: string;
}

export default function CateringResumenOrganizador() {
  const [catering, setCatering] = useState<CateringItem[]>([]);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const ordenPasos = [
    'entrada',
    'plato-principal',
    'lunch',
    'postre',
    'menu-infantil',
    'bebidas',
    'baile'
  ];

  const detectarPaso = (paso: string): string => {
    const limpio = paso.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (limpio.includes('entrada')) return 'entrada';
    if (limpio.includes('plato-principal') || limpio.includes('principal') || limpio.includes('lunch')) return 'plato-principal';
    if (limpio.includes('postre') || limpio.includes('tarta')) return 'postre';
    if (limpio.includes('infantil') || limpio.includes('kids')) return 'menu-infantil';
    if (limpio.includes('bebidas') || limpio.includes('drink')) return 'bebidas';
    if (limpio.includes('baile') || limpio.includes('fiesta')) return 'baile';
    return 'otro';
  };

  const fetchCatering = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      const user = session?.session?.user;
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data: evento, error: eventoError } = await supabase
        .from('eventos')
        .select('organizador_id')
        .eq('id', id)
        .single();

      if (eventoError || !evento) {
        alert('Evento no encontrado o acceso denegado');
        navigate('/organizador/panel');
        return;
      }

      if (evento.organizador_id !== user.id) {
        alert('Acceso denegado');
        navigate('/organizador/panel');
        return;
      }

      const { data: resumenData, error: resumenError } = await supabase
        .from('eventos_resumen')
        .select('menu, datos, created_at')
        .eq('event_id', id)
        .order('created_at', { ascending: false });

      if (resumenError || !resumenData?.length) {
        setCatering([]);
        return;
      }

      const latestResumen = resumenData[0];
      const allData: CateringItem[] = Object.entries(latestResumen.datos || {}).map(([paso, datos]) => ({
        id: paso,
        event_id: id ?? '',
        paso,
        datos,
        source: latestResumen.menu as string
      }));

      const cateringOrdenado = allData.sort((a, b) => {
        const indexA = ordenPasos.indexOf(detectarPaso(a.paso));
        const indexB = ordenPasos.indexOf(detectarPaso(b.paso));
        return indexA - indexB;
      });

      setCatering(cateringOrdenado);
    } catch (error) {
      console.error('Error inesperado:', error);
      setCatering([]);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCatering();
    }
  }, [id, navigate]);

  const mostrarPasoBonito = (paso: string): string => {
    const tipo = detectarPaso(paso);
    const mapa: Record<string, string> = {
      'entrada': 'Recepción',
      'plato-principal': 'Plato principal',
      'postre': 'Postre',
      'menu-infantil': 'Menú infantil',
      'bebidas': 'Bebidas',
      'baile': 'Menú de baile'
    };
    return mapa[tipo] || paso.charAt(0).toUpperCase() + paso.slice(1);
  };

  const formatDetalles = (paso: string, datos: any): string => {
    const tipo = detectarPaso(paso);
    if (!datos) return '—';

    switch (tipo) {
      case 'entrada':
        return `Recepción: ${datos.opciones?.join(' o ') || datos.entrada || datos.recepcion || datos.tipo || '—'}`;
      case 'plato-principal':
        return `Plato principal: ${datos.carne || datos.tipo || datos.opciones?.join(', ') || '—'} ${datos.salsa ? `con salsa ${datos.salsa}` : ''} ${datos.guarniciones?.length > 0 ? `y guarniciones: ${datos.guarniciones.join(', ')}` : ''}`;
      case 'postre':
        return `Postre: ${datos.postre || datos.tarta || datos.tipo || '—'}`;
      case 'menu-infantil':
        return `Menú infantil: ${datos.menu_infantil || datos.tipo || '—'}`;
      case 'bebidas':
        return `Bebidas extra: ${datos.bebidas_extra?.join(', ') || datos.bebidas || datos.tipo || '—'}`;
      case 'baile':
        const comidasIncluidas = datos.comidas?.incluidas?.join(', ') || datos.incluidas?.join(', ') || 'Bandejeo de pizzas';
        const comidasExtra = datos.comidas?.extra?.map((e: { nombre: string; cantidad: number }) => `${e.nombre} (${e.cantidad})`).join(', ') || datos.extra?.map((e: { nombre: string; cantidad: number }) => `${e.nombre} (${e.cantidad})`).join(', ') || '';
        const helados = datos.helados ? `Helados: ${datos.helados} unidades` : '';
        return `Menú de baile: ${comidasIncluidas}${comidasExtra ? ', ' + comidasExtra : ''}${helados ? ', ' + helados : ''}`;
      default:
        return JSON.stringify(datos, null, 2);
    }
  };

  const exportToExcel = () => {
    const data = catering.map((item) => ({
      Menú: item.source,
      Sección: mostrarPasoBonito(item.paso),
      Detalles: formatDetalles(item.paso, item.datos)
    }));

    const ws = XLSX.utils.json_to_sheet(data);

    // Ajustar columnas
    ws['!cols'] = [
      { wch: 20 },
      { wch: 20 },
      { wch: 60 }
    ];

    // Agregar estilo a las celdas
    const range = XLSX.utils.decode_range(ws['!ref']!);
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[cellRef]) continue;

        ws[cellRef].s = {
          border: {
            top: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } },
            left: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } }
          },
          alignment: {
            vertical: 'center',
            horizontal: R === 0 ? 'center' : 'left',
            wrapText: true
          },
          font: {
            bold: R === 0,
            sz: R === 0 ? 12 : 11,
            color: { rgb: '000000' }
          },
          fill: R === 0 ? { fgColor: { rgb: 'FFD580' } } : undefined
        };
      }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Catering');
    XLSX.writeFile(wb, `Catering_Resumen_${id}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-gray-100 p-6 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 flex items-center bg-orange-100 rounded-lg p-4 shadow-md">
          <span className="mr-3 text-3xl"></span> Resumen de Catering
        </h1>
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 transition-all duration-300 hover:shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm sm:text-base">
              <thead className="bg-orange-200 text-gray-800">
                <tr>
                  <th className="p-4 text-left font-semibold rounded-tl-lg">Menú</th>
                  <th className="p-4 text-left font-semibold">Sección</th>
                  <th className="p-4 text-left font-semibold rounded-tr-lg">Detalles</th>
                </tr>
              </thead>
              <tbody>
                {catering.map((c) => (
                  <tr
                    key={`${c.source}-${c.paso}`}
                    className="border-b border-gray-200 hover:bg-orange-50 transition-colors duration-200"
                  >
                    <td className="p-4 font-medium text-gray-700">{c.source}</td>
                    <td className="p-4 flex items-center gap-2">
                      <span className="text-gray-700">{mostrarPasoBonito(c.paso)}</span>
                    </td>
                    <td className="p-4 text-gray-600">{formatDetalles(c.paso, c.datos)}</td>
                  </tr>
                ))}
                {catering.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-6 text-center text-gray-500 text-base">
                      No hay datos de catering registrados en eventos_resumen para este evento.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <button
            onClick={() => navigate('/organizador/panel')}
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
              onClick={() => navigate(`/organizador/evento/${id}/mesas`)}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
            >
              Ver resumen de mesas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
