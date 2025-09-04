import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../../supabaseClient';
import { useUserContext } from '../../../hooks/useUserContext';

const bebidasIncluidas = {
  recepcionYCena: [
    'Gaseosas en botellas de vidrio de 1 ¼ litros (línea Coca Cola)',
    'Agua con y sin gas',
    'Cerveza tirada',
    'Vinos tintos y blancos (Malbec, Chardonnay y Dulce Natural)',
  ],
  baile: [
    'Gaseosas (Coca Cola, Fanta, Sprite, Pomelo y Tónica)',
    'Jugos de naranja',
    'Agua con y sin gas',
    'Fernet Branca con Coca Cola',
    'Campari con jugo de naranja o tónica',
    'Cervezas',
    'Gin Tonic',
    'Gancia',
    'Vermut con pomelo',
    'Aperol Spritz',
    'Vodka con sprite o jugo de naranja',
  ],
};

const bebidasExtra = [
  'Mojitos',
  'Caipifruta',
  'Daiquiris',
  'Licuados sin alcohol',
];

const DrinksSelection: React.FC = () => {
  const [bebidasSeleccionadas, setBebidasSeleccionadas] = useState<string[]>([]);
  const [eventId, setEventId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token: contextToken, setPaso, setToken } = useUserContext();
  const navigate = useNavigate();
  const location = useLocation();
  const menu = location.pathname.includes('menu1') ? 'menu1' : location.pathname.includes('menu2') ? 'menu2' : location.pathname.includes('menu3') ? 'menu3' : 'menu4';

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      const params = new URLSearchParams(location.search);
      const urlToken = params.get('token');
      const finalToken = urlToken || contextToken;

      if (!finalToken) {
        setError('No se proporcionó un token de acceso. Por favor, volvé al inicio.');
        navigate('/cliente');
        setLoading(false);
        return;
      }

      if (urlToken && urlToken !== contextToken) {
        setToken(urlToken);
      }

      const { data, error } = await supabase
        .from('eventos')
        .select('id, estado')
        .eq('token_acceso', finalToken)
        .single();

      if (error || !data) {
        setError('Error al cargar el evento. Verificá el token de acceso.');
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
  }, [contextToken, location.search, setPaso, setToken, navigate]);

  const toggleBebida = (bebida: string) => {
    setBebidasSeleccionadas((prev) =>
      prev.includes(bebida) ? prev.filter((item) => item !== bebida) : [...prev, bebida]
    );
  };

  const continuar = async () => {
    const params = new URLSearchParams(location.search);
    const urlToken = params.get('token');
    const finalToken = urlToken || contextToken;

    if (!finalToken) {
      setError('No se proporcionó un token de acceso. Por favor, volvé al inicio.');
      navigate('/cliente');
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

    const { error } = await supabase.rpc(`upsert_${menu}_formularios`, {
      p_event_id: eventId,
      p_paso: `bebidas-${menu}`,
      p_datos: { bebidas_extra: bebidasSeleccionadas },
    });

    if (error) {
      setError(`No se pudo guardar: ${error.message}`);
      return;
    }

    navigate(`/catering/${menu}/comidas-baile?token=${finalToken}`);
  };

  const volver = () => {
    const params = new URLSearchParams(location.search);
    const urlToken = params.get('token');
    const finalToken = urlToken || contextToken;
    navigate(`/catering/${menu}/${menu === 'menu4' ? 'postre' : 'kids'}?token=${finalToken || ''}`);
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
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-5xl w-full bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-4xl font-serif font-bold text-center text-gray-800 mb-6">
          Bebidas — Menú {menu.replace('menu', '')}
        </h1>
        <p className="text-center text-gray-600 text-lg mb-4">
          Bebidas incluidas en el menú:
        </p>
        <div className="bg-orange-50 border border-[#FF6B35] rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Recepción y Cena/Almuerzo</h2>
          <ul className="text-gray-700 text-base list-disc list-inside">
            {bebidasIncluidas.recepcionYCena.map((bebida) => (
              <li key={bebida}>{bebida}</li>
            ))}
          </ul>
          <h2 className="text-xl font-semibold text-gray-800 mt-4 mb-2">Baile</h2>
          <ul className="text-gray-700 text-base list-disc list-inside">
            {bebidasIncluidas.baile.map((bebida) => (
              <li key={bebida}>{bebida}</li>
            ))}
          </ul>
        </div>
        <p className="text-center text-gray-600 text-lg mb-4">
          Seleccioná <span className="text-[#FF6B35] font-semibold">bebidas con costo extra</span> (opcional):
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {bebidasExtra.map((bebida) => (
            <div
              key={bebida}
              onClick={() => toggleBebida(bebida)}
              className={`p-4 rounded-lg border-2 text-center cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                bebidasSeleccionadas.includes(bebida) ? 'border-[#FF6B35] bg-orange-50' : 'border-gray-200'
              }`}
            >
              <p className="text-base font-medium text-gray-800">{bebida}</p>
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
            className="bg-[#FF6B35] hover:bg-[#e65a23] text-white px-6 py-2 rounded-md shadow-md transition-all duration-300 hover:scale-105"
          >
            Confirmar y continuar →
          </button>
        </div>
      </div>
    </div>
  );
};

export default DrinksSelection;