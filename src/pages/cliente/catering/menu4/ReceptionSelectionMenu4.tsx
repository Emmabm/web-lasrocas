import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../../../supabaseClient';
import { useUserContext } from '../../../../hooks/useUserContext';

// Define the three selectable options
const RECEPTION_OPTIONS = [
  {
    value: 'bandejeo y mesa de fiambres',
    title: 'Bandejeo y Mesa de Fiambres',
    description: 'Bandejeo de canapés fríos, calientes, pinchos de carnes y verduras, empanadas surtidas y una mesa de fiambres y quesos de estación.',
  },
  {
    value: 'isla de sushi',
    title: 'Isla de Sushi',
    description: 'Una isla dedicada a la gastronomía japonesa con una variedad de rolls de sushi, nigiri y sashimis frescos preparados al momento.',
  },
  {
    value: 'isla de pastas',
    title: 'Isla de Pastas',
    description: 'Una estación de cocina en vivo con diferentes tipos de pastas, salsas a elección y toppings variados para crear un plato personalizado.',
  },
];

const ReceptionSelectionMenu4: React.FC = () => {
  const [eventId, setEventId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>(RECEPTION_OPTIONS[0].value);
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

    const { error } = await supabase.rpc('upsert_menu4_formularios', {
      p_event_id: eventId,
      p_paso: 'entrada-menu4',
      p_datos: { tipo: selectedOption },
    });

    if (error) {
      setError(`No se pudo guardar: ${error.message}`);
      return;
    }

    navigate(`/catering/menu4/lunch?token=${token}`);
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
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-lg px-6 py-4">
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-center text-gray-800 mb-4 sm:mb-6">
          Recepción — Menú 4 (Lunch)
        </h1>

        <p className="text-center text-gray-600 text-base sm:text-lg mb-4">
          Selecciona una opción para la recepción:
        </p>

        <div className="space-y-4 mb-8">
          {RECEPTION_OPTIONS.map((option) => (
            <div
              key={option.value}
              onClick={() => setSelectedOption(option.value)}
              className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                selectedOption === option.value
                  ? 'bg-orange-50 border-2 border-[#FF6B35] shadow-md'
                  : 'bg-gray-100 border border-gray-200 hover:bg-gray-200'
              }`}
            >
              <h3 className="font-semibold text-lg text-gray-800 mb-1">{option.title}</h3>
              <p className="text-gray-600 text-sm">{option.description}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-center flex-col sm:flex-row gap-4 sm:gap-6 mt-4">
          <button
            onClick={volver}
            className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-100 transition"
          >
            ← Volver
          </button>
          <button
            onClick={continuar}
            className="bg-[#FF6B35] hover:bg-[#e65a23] text-white px-6 py-2 rounded-md shadow-md transition-all duration-300 hover:scale-[1.03]"
          >
            Confirmar y continuar →
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceptionSelectionMenu4;