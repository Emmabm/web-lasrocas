import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../../../supabaseClient';
import { useUserContext } from '../../../../hooks/useUserContext';

const postres = [
  'Flan casero con dulce de leche',
  'Helado de chocolate y limón cocado relleno de dulce de leche, con base de chocolate',
  'Brownie con dulce de leche, merengue y salsa de frutos rojos',
  'Cheese cake con salsa de frutos rojos',
  'Lemon pie',
  'Chocotorta',
  'Tiramisú',
  'Torta de oreo',
];

const DessertSelectionMenu1: React.FC = () => {
  const [postre, setPostre] = useState<string | null>(null);
  const [eventId, setEventId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
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

  const continuar = async () => {
    if (!postre) {
      setError('Debés elegir un postre.');
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

    const { error } = await supabase
      .from('menu1_formularios')
      .upsert([
        {
          event_id: eventId,
          paso: 'postre-menu1',
          datos: { postre },
        },
      ], { onConflict: 'event_id,paso' });

    if (error) {
      setError(`No se pudo guardar: ${error.message}`);
      return;
    }

    navigate(`/catering/menu1/kids?token=${token}`);
  };

  const volver = () => {
    navigate(`/catering/menu1/main?token=${token}`);
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
      <div className="max-w-5xl w-full bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-4xl font-serif font-bold text-center text-gray-800 mb-6">
          Postre — Menú 1 (Formal)
        </h1>
        <p className="text-center text-gray-600 text-lg mb-8">
          Elegí <span className="text-[#FF6B35] font-semibold">1 postre</span> para tu evento.
        </p>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">🌟 Recomendación de la casa</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="rounded-xl border-2 border-gray-200 overflow-hidden">
              <img 
                src="/public/img/platos/helado-chocolate-limon.webp" 
                alt="Helado de chocolate y limón" 
                className="w-full h-48 object-cover" 
              />
              <div className="p-4 space-y-1">
                <h3 className="font-semibold text-lg text-gray-800">
                  Helado de chocolate y limón cocado relleno de dulce de leche, con base de chocolate
                </h3>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">🍨 Postres</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {postres.map((item) => (
              <div
                key={item}
                onClick={() => setPostre(item)}
                className={`p-6 rounded-xl border-2 text-center cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  postre === item ? 'border-[#FF6B35] bg-orange-50' : 'border-gray-200'
                }`}
              >
                <p className="text-base font-medium text-gray-800">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="flex justify-center gap-4">
          <button
            onClick={volver}
            className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-100 transition"
          >
            ← Volver
          </button>
          <button
            onClick={continuar}
            disabled={!postre}
            className={`px-6 py-2 rounded-md text-white shadow-md transition-all duration-300 hover:scale-105 ${
              postre ? 'bg-[#FF6B35] hover:bg-[#e65a23]' : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            Confirmar y continuar →
          </button>
        </div>
      </div>
    </div>
  );
};

export default DessertSelectionMenu1;