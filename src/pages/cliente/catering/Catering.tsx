import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../../supabaseClient';
import { useUserContext } from '../../../hooks/useUserContext';

const menus = [
  { id: 'menu1', nombre: 'Menú 1 - Formal', descripcion: 'Un menú elegante con opciones sofisticadas para eventos formales.' },
  { id: 'menu2', nombre: 'Menú 2 - Clásico', descripcion: 'Sabores tradicionales con un toque moderno para cualquier ocasión.' },
  { id: 'menu3', nombre: 'Menú 3 - Parrillada', descripcion: 'Una experiencia de asado argentino con carnes de primera.' },
  { id: 'menu4', nombre: 'Menú 4 - Lunch', descripcion: 'Opciones ligeras y variadas, perfectas para eventos informales.' },
];

const Catering = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setMenuSeleccionado } = useUserContext();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const [eventoEstado, setEventoEstado] = useState<'activo' | 'inactivo' | null>(null);

  const query = new URLSearchParams(location.search);
  const token = query.get('token');

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError('No se proporcionó un token');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('eventos')
          .select('id, estado')
          .eq('token_acceso', token)
          .single();

        if (error || !data) {
          setError('Evento no encontrado');
          setLoading(false);
          return;
        }

        setEventoEstado(data.estado);
        if (data.estado === 'inactivo') {
          setModalMessage('El evento está inactivo. No podés realizar modificaciones.');
          setLoading(false);
          return;
        }

        setLoading(false);
      } catch (err) {
        setError('Error al conectar con la base de datos');
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleMenuSelect = async (menuId: string) => {
    if (!token) {
      setError('No se proporcionó un token');
      return;
    }

    if (eventoEstado === 'inactivo') {
      setModalMessage('El evento está inactivo. No podés realizar modificaciones.');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('eventos')
        .select('estado')
        .eq('token_acceso', token)
        .single();

      if (error || !data) {
        setError('Evento no encontrado');
        return;
      }

      if (data.estado === 'inactivo') {
        setModalMessage('El evento está inactivo. No podés realizar modificaciones.');
        return;
      }

      setMenuSeleccionado(menuId);
      navigate(`/catering/${menuId}/recepcion?token=${token}`);
    } catch (err) {
      setError('Error al conectar con la base de datos');
    }
  };

  const isBlocked = eventoEstado === 'inactivo';

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center text-gray-700 text-xl">Cargando...</div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center text-red-500 text-xl">{error}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex justify-center pt-11 pb-20 px-6">
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
      <div className="max-w-5xl w-full bg-white rounded-2xl shadow-lg pt-6 pb-4 px-8">
        <h1 className="text-4xl font-serif font-bold text-center text-gray-800 mb-6">
          Selección de Catering
        </h1>
        <p className="text-center text-gray-600 text-lg mb-10">
          Elegí un <span className="text-[#FF6B35] font-semibold">menú</span> para tu evento
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {menus.map((menu) => (
            <div
              key={menu.id}
              className="p-6 rounded-xl border-2 border-gray-200 bg-white text-center transition-all duration-300 hover:border-[#FF6B35] hover:shadow-xl hover:-translate-y-1"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{menu.nombre}</h2>
              <p className="text-gray-600 text-sm">{menu.descripcion}</p>
              <button
                onClick={() => handleMenuSelect(menu.id)}
                className={`mt-4 bg-[#FF6B35] text-white px-4 py-2 rounded-md hover:bg-[#e55a2e] transition ${isBlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isBlocked}
              >
                Seleccionar
              </button>
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-8">
          <button
            onClick={() => navigate(`/cliente?token=${token}`)}
            className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-100 transition"
          >
            ← Volver
          </button>
        </div>
      </div>
    </div>
  );
};

export default Catering;