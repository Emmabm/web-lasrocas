import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../../../supabaseClient';
import { useUserContext } from '../../../../hooks/useUserContext';

const opcionesEntrada: string[] = [
  'Selección de Fiambres y quesos: Jamón serrano, bondiola de cerdo, lomito braseado a las hierbas, salame tandilero. Queso pategras, reggianito, provolone y feta de cabra, con nueces, pasas negras y rubias y tostaditas de pan de campo.',
  'Lasagna bolognesa: mozarella, espinaca, jamón y queso y salsa bolognesa.',
  'Ensalada Caesar: hojas verdes, pollo grillé, croutons, hebras de parmesano y aderezo Caesar.',
  'Tostón de pan de campo con jamón serrano y ensalada caponata.',
  'Provoleta a la plancha con vegetales grillados y chimichurri de hierbas.',
  'Milhojas de vegetales asados y queso fontina con coulis de morrones y tomates asados.',
];

const EntradaSelectionMenu2: React.FC = () => {
  const [entradas, setEntradas] = useState<string[]>([]);
  const [eventId, setEventId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { token, setPaso } = useUserContext();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      const params = new URLSearchParams(location.search);
      const urlToken = params.get('token');
      const finalToken = urlToken || token;
      if (!finalToken) {
        setError('No se proporcionó un token');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('eventos')
        .select('id, estado')
        .eq('token_acceso', finalToken)
        .single();

      if (error || !data) {
        setError('Error al cargar el evento');
        setLoading(false);
        return;
      }

      if (data.estado === 'inactivo') {
        setError('El evento está inactivo. No podés realizar modificaciones.');
        setLoading(false);
        return;
      }

      setEventId(data.id);
      setPaso('catering');
      setLoading(false);
    };
    fetchEvent();
  }, [token, location.search, setPaso]);

  const handleEntradaChange = (item: string) => {
    if (entradas.includes(item)) {
      setEntradas(entradas.filter((entrada) => entrada !== item));
    } else if (entradas.length < 3) {
      setEntradas([...entradas, item]);
    }
  };

  const continuar = async () => {
    if (entradas.length === 0) {
      setError('Debés elegir al menos una entrada.');
      return;
    }

    if (!eventId) {
      setError('No se encontró el ID del evento');
      return;
    }

    const { data: eventData, error: eventError } = await supabase
      .from('eventos')
      .select('estado')
      .eq('id', eventId)
      .single();

    if (eventError || !eventData) {
      setError('Error al cargar el evento');
      return;
    }

    if (eventData.estado === 'inactivo') {
      setError('El evento está inactivo. No podés realizar modificaciones.');
      return;
    }

    const { error } = await supabase.rpc('upsert_menu2_formularios', {
      p_event_id: eventId,
      p_paso: 'plato-entrada-menu2',
      p_datos: { entradas },
    });

    if (error) {
      setError(`No se pudo guardar: ${error.message}`);
      return;
    }

    navigate(`/catering/menu2/main?token=${token}`);
  };

  const volver = () => {
    navigate(`/catering?token=${token}`);
  };

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
    <div className="bg-white flex justify-center pt-10 pb-6 px-6">
      <div className="max-w-5xl w-full bg-white rounded-2xl shadow-lg px-8 py-6">
        <h1 className="text-4xl font-serif font-bold text-center text-gray-800 mb-6">
          Entrada — Menú 2 (Clásico)
        </h1>
        <p className="text-center text-gray-600 text-lg mb-4">
          Incluye bandejeo de canapés fríos, calientes, pinchos de carnes y verduras, empanadas surtidas. Elegí{' '}
          <span className="text-[#FF6B35] font-semibold">hasta 3 entradas</span>.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {opcionesEntrada.map((item) => (
            <div
              key={item}
              onClick={() => handleEntradaChange(item)}
              className={`p-6 rounded-xl border-2 text-center cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                entradas.includes(item) ? 'border-[#FF6B35] bg-orange-50' : 'border-gray-200'
              }`}
            >
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={entradas.includes(item)}
                  onChange={() => handleEntradaChange(item)}
                  disabled={!entradas.includes(item) && entradas.length >= 3}
                  className="h-5 w-5 text-[#FF6B35] focus:ring-[#FF6B35] border-gray-300 rounded"
                />
                <p className="text-base font-medium text-gray-800">{item}</p>
              </label>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-4">
          <button
            onClick={volver}
            className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-100 transition"
          >
            ← Volver
          </button>
          <button
            onClick={continuar}
            disabled={entradas.length === 0}
            className={`px-6 py-2 rounded-md text-white shadow-md transition-all duration-300 hover:scale-105 ${
              entradas.length > 0 ? 'bg-[#FF6B35] hover:bg-[#e65a23]' : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            Confirmar y continuar →
          </button>
        </div>
      </div>
    </div>
  );
};

export default EntradaSelectionMenu2;