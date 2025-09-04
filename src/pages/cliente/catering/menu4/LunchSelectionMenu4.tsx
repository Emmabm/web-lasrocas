import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../../../supabaseClient';
import { useUserContext } from '../../../../hooks/useUserContext';

const opcionesLunch = [
  'Ragú de ternera con papas al romero',
  'Lomo al malbec con puré de calabazas y azúcar morena',
  'Bondiola de cerdo con camotes asados y salsa barbacoa',
  'Bondiola de cerdo con vegetales al wok y reducción de soja y miel',
  'Humita',
  'Pollo al curry con ensalada de cous-cous',
  'Pollo a la cazadora',
  'Chorizos de cerdo a la pomarola',
  'Tres variedades de pasta rellena con salsa caruso, bolognesa y filetto',
  'Fajitas de pollo y carne con frijoles, hebras de queso, lechuga, arroz amarillo y pico de gallo',
  'Paella valenciana',
  'Cazuela de calamares y mariscos',
];

const LunchSelectionMenu4: React.FC = () => {
  const [seleccionadas, setSeleccionadas] = useState<string[]>([]);
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

      console.log('LunchSelectionMenu4 useEffect - urlToken:', urlToken, 'contextToken:', token, 'finalToken:', finalToken, 'pathname:', location.pathname, 'search:', location.search);

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

  const toggleItem = (item: string) => {
    console.log('LunchSelectionMenu4 toggleItem - item:', item, 'seleccionadas:', seleccionadas);
    if (seleccionadas.includes(item)) {
      setSeleccionadas(seleccionadas.filter((i) => i !== item));
    } else if (seleccionadas.length < 2) {
      setSeleccionadas([...seleccionadas, item]);
    } else {
      alert('Solo podés seleccionar 2 opciones.');
    }
  };

  const continuar = async () => {
    if (seleccionadas.length !== 2) {
      setError('Debés elegir exactamente 2 opciones.');
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

    const { error } = await supabase.rpc('upsert_menu4_formularios', {
      p_event_id: eventId,
      p_paso: 'lunch-menu4',
      p_datos: { opciones: seleccionadas },
    });

    if (error) {
      setError(`No se pudo guardar: ${error.message}`);
      return;
    }

    console.log('LunchSelectionMenu4 continuar - Navigating to:', `/catering/menu4/postre?token=${token}`);
    navigate(`/catering/menu4/postre?token=${token}`);
  };

  const volver = () => {
    console.log('LunchSelectionMenu4 volver - token:', token);
    navigate(`/catering/menu4/recepcion?token=${token}`);
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
          Cena tipo Lunch — Menú 4 (Lunch)
        </h1>
        <p className="text-center text-gray-600 text-lg mb-8">
          Stands de comidas atendidos por mozos. Elegí <span className="text-[#FF6B35] font-semibold">2 opciones</span>.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {opcionesLunch.map((item) => (
            <div
              key={item}
              onClick={() => toggleItem(item)}
              className={`p-6 rounded-xl border-2 text-center cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                seleccionadas.includes(item) ? 'border-[#FF6B35] bg-orange-50' : 'border-gray-200'
              }`}
            >
              <p className="text-base font-medium text-gray-800">{item}</p>
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
            disabled={seleccionadas.length !== 2}
            className={`px-6 py-2 rounded-md text-white shadow-md transition-all duration-300 hover:scale-105 ${
              seleccionadas.length === 2 ? 'bg-[#FF6B35] hover:bg-[#e65a23]' : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            Confirmar y continuar →
          </button>
        </div>
      </div>
    </div>
  );
};

export default LunchSelectionMenu4;