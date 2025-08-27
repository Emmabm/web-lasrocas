import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import * as XLSX from 'xlsx-js-style';

interface Guest {
  id: string;
  first_name: string;
  last_name: string;
  dni: string;
  gender: 'male' | 'female';
  evento_id: string;
}

export default function InvitadosResumenOrganizador() {
  const [invitados, setInvitados] = useState<Guest[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'male' | 'female'>('all');
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const fetchInvitados = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      const user = session?.session?.user;
      if (!user) {
        setModalMessage('Debes iniciar sesión para ver los invitados.');
        navigate('/auth');
        return;
      }

      if (!id) {
        setModalMessage('No se proporcionó un ID de evento válido.');
        navigate('/organizador/panel');
        return;
      }

      const { data: evento, error: eventoError } = await supabase
        .from('eventos')
        .select('organizador_id, tipo')
        .eq('id', id)
        .single();

      if (eventoError || !evento) {
        console.error('Error al verificar evento:', eventoError?.message);
        setModalMessage('Evento no encontrado o acceso denegado.');
        navigate('/organizador/panel');
        return;
      }

      if (evento.organizador_id !== user.id) {
        setModalMessage('Acceso denegado.');
        navigate('/organizador/panel');
        return;
      }

      if (evento.tipo.toLowerCase() !== 'fiesta15') {
        setModalMessage('Lista de invitados solo disponible para eventos tipo fiesta15.');
        navigate('/organizador/panel');
        return;
      }

      const { data, error } = await supabase
        .from('invitados')
        .select('*')
        .eq('evento_id', id);

      if (error) {
        console.error('Error al cargar invitados:', error.message);
        setModalMessage(`Error al cargar invitados: ${error.message}`);
        return;
      }

      const sorted = data.sort((a, b) => a.last_name.localeCompare(b.last_name));
      setInvitados(sorted || []);
    } catch (error) {
      console.error('Error inesperado al cargar invitados:', error);
      setModalMessage('Error inesperado al cargar invitados. Por favor, revisa la consola.');
    }
  };

  useEffect(() => {
    if (id) {
      fetchInvitados();
    }
  }, [id, navigate]);

  const renderList = (filteredGuests: Guest[], label?: string) => (
    <div>
      {label && <h3 className="text-xl font-semibold text-gray-700 mb-4">{label}</h3>}
      <ul className="space-y-2">
        {filteredGuests.map((guest) => (
          <li
            key={guest.id}
            className="bg-white p-3 rounded-md shadow-sm hover:bg-orange-100 transition-colors text-base"
          >
            {guest.last_name} {guest.first_name}:   {guest.dni}
          </li>
        ))}
        {filteredGuests.length === 0 && (
          <li className="text-gray-500 text-base p-3">No hay invitados en esta categoría.</li>
        )}
      </ul>
    </div>
  );

  const exportInvitadosExcel = () => {
    if (activeTab === 'all') {
      setModalMessage('Por favor, selecciona "Hombres" o "Mujeres" para exportar.');
      return;
    }

    const wb = XLSX.utils.book_new();

    const exportSheet = (guests: Guest[], sheetName: string) => {
      const data = guests.map((g) => ({
        Nombre: `${g.first_name} ${g.last_name}`,
        DNI: g.dni,
        Género: g.gender === 'male' ? 'Hombre' : 'Mujer',
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      ws['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 10 }];

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
              right: { style: 'thin', color: { rgb: '000000' } },
            },
            alignment: {
              vertical: 'center',
              horizontal: R === 0 ? 'center' : 'left',
              wrapText: true,
            },
            font: {
              bold: R === 0,
              sz: R === 0 ? 12 : 11,
              color: { rgb: '000000' },
            },
            fill: R === 0 ? { fgColor: { rgb: 'FFD580' } } : undefined,
          };
        }
      }

      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    };

    if (activeTab === 'male') {
      exportSheet(invitados.filter((g) => g.gender === 'male'), 'Hombres');
    } else if (activeTab === 'female') {
      exportSheet(invitados.filter((g) => g.gender === 'female'), 'Mujeres');
    }

    XLSX.writeFile(wb, `Invitados_${activeTab === 'male' ? 'Hombres' : 'Mujeres'}_Evento_${id}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
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

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="mr-2">🧑‍🤝‍🧑</span> Resumen de Invitados
          </h1>

          <div className="flex gap-4 mb-6">
            {['all', 'male', 'female'].map((tab) => (
              <button
                key={tab}
                className={`px-6 py-3 rounded-lg font-medium text-sm transition-all ${
                  activeTab === tab
                    ? 'bg-[#FF6B35] text-white shadow-md'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => setActiveTab(tab as typeof activeTab)}
              >
                {tab === 'all' ? 'Todos' : tab === 'male' ? 'Hombres' : 'Mujeres'}
              </button>
            ))}
          </div>

          {activeTab === 'all' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderList(invitados.filter((g) => g.gender === 'male'), 'Hombres')}
              {renderList(invitados.filter((g) => g.gender === 'female'), 'Mujeres')}
            </div>
          ) : (
            renderList(invitados.filter((g) => g.gender === activeTab))
          )}

          <div className="flex flex-col sm:flex-row justify-start gap-4 mt-8">
            <button
              onClick={() => navigate('/organizador/panel')}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
            >
              ← Volver al panel
            </button>
            {activeTab !== 'all' && (
              <button
                onClick={exportInvitadosExcel}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
              >
                Exportar Invitados a Excel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}