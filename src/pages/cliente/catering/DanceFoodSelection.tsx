import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../../supabaseClient';
import { useUserContext } from '../../../hooks/useUserContext';
import { ArrowLeft, IceCream } from 'lucide-react';

const comidasExtra = [
  'Panchitos',
  'Hamburguesas',
  'Choripancitos',
  'Minilomos de ternera con tomate, lechuga',
  'Montaditos de jamon crudo en pan de campo',
  'Tacos de cerdo, carne y pollo',
];

const DanceFoodSelection: React.FC = () => {
  const [comidasSeleccionadas, setComidasSeleccionadas] = useState<{ nombre: string; cantidad: number }[]>([]);
  const [helados, setHelados] = useState<number>(60);
  const [eventId, setEventId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token: contextToken, setPaso } = useUserContext();
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
        navigate('/catering');
        setLoading(false);
        return;
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
  }, [contextToken, location.search, setPaso, navigate]);

  const toggleComida = (comida: string) => {
    setComidasSeleccionadas((prev) => {
      const exists = prev.find((item) => item.nombre === comida);
      if (exists) {
        return prev.filter((item) => item.nombre !== comida);
      }
      return [...prev, { nombre: comida, cantidad: 0 }];
    });
  };

  const updateCantidad = (comida: string, cantidad: number) => {
    setComidasSeleccionadas((prev) =>
      prev.map((item) => (item.nombre === comida ? { ...item, cantidad: Math.max(0, cantidad) } : item))
    );
  };

  const handleHeladosChange = (value: number) => {
    if (value === 0 || value >= 60) {
      setHelados(value);
    }
  };

  const continuar = async () => {
    const params = new URLSearchParams(location.search);
    const urlToken = params.get('token');
    const finalToken = urlToken || contextToken;

    if (helados > 0 && helados < 60) {
      setError('El stand de helados requiere un mínimo de 60 unidades.');
      return;
    }

    if (!finalToken) {
      setError('No se proporcionó un token de acceso. Por favor, volvé al inicio.');
      navigate('/catering');
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
      p_paso: `baile-${menu}`,
      p_datos: { 
        comidas: { incluidas: ['Bandejeo de pizzas'], extra: comidasSeleccionadas.filter((c) => c.cantidad > 0) },
        helados: helados >= 60 ? helados : null,
      },
    });

    if (error) {
      setError(`No se pudo guardar: ${error.message}`);
      return;
    }

    navigate(`/catering/${menu}/resumen?token=${encodeURIComponent(finalToken)}`);
  };

  const volver = () => {
    const params = new URLSearchParams(location.search);
    const urlToken = params.get('token');
    const finalToken = urlToken || contextToken;
    navigate(`/catering/${menu}/bebidas?token=${finalToken || ''}`);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 to-white">
      <div className="text-center text-gray-700 text-xl font-serif">Cargando...</div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 to-white">
      <div className="text-center text-red-500 text-xl font-serif">{error}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex justify-center pt-10 pb-6 px-6">
      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-2xl p-10">
        <h1 className="text-5xl font-serif font-bold text-center text-gray-800 mb-8">
          Comidas para el Baile — Menú {menu.replace('menu', '')}
        </h1>
        <p className="text-center text-gray-600 text-lg mb-4 font-medium">
          Incluido: <span className="text-[#FF6B35] font-semibold">Bandejeo de pizzas</span>
        </p>
        <p className="text-center text-gray-600 text-lg mb-6 font-medium">
          Seleccioná <span className="text-[#FF6B35] font-semibold">comidas con costo extra</span> (opcional) y especificá cantidades:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          {comidasExtra.map((comida) => (
            <div
              key={comida}
              className={`p-6 rounded-2xl border-2 flex items-center justify-between transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                comidasSeleccionadas.find((c) => c.nombre === comida)
                  ? 'border-[#FF6B35] bg-orange-100'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div
                onClick={() => toggleComida(comida)}
                className="cursor-pointer flex-1 flex items-center gap-3"
              >
                <p className="text-base font-medium text-gray-800">{comida}</p>
              </div>
              {comidasSeleccionadas.find((c) => c.nombre === comida) && (
                <input
                  type="number"
                  min="0"
                  value={comidasSeleccionadas.find((c) => c.nombre === comida)?.cantidad || 0}
                  onChange={(e) => updateCantidad(comida, parseInt(e.target.value) || 0)}
                  className="w-24 p-2 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                />
              )}
            </div>
          ))}
        </div>
        <p className="text-center text-gray-600 text-lg mb-4 font-medium">
          Stand de helados (mínimo 60 unidades, opcional):
        </p>
        <div className="flex justify-center items-center gap-4 mb-10">
          <IceCream className="text-[#FF6B35] h-6 w-6" />
          <input
            type="number"
            min="0"
            value={helados}
            onChange={(e) => handleHeladosChange(parseInt(e.target.value) || 0)}
            className="w-32 p-3 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-[#FF6B35] bg-orange-50"
            placeholder="Cantidad de helados"
          />
        </div>
        <div className="flex justify-center gap-6">
          <button
            onClick={volver}
            className="bg-white border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg flex items-center gap-2 hover:bg-gray-100 hover:border-[#FF6B35] transition-all duration-300"
          >
            <ArrowLeft className="h-5 w-5" />
            Volver
          </button>
          <button
            onClick={continuar}
            className="bg-[#FF6B35] hover:bg-[#e65a23] text-white px-8 py-3 rounded-lg shadow-md transition-all duration-300 hover:scale-105 hover:shadow-xl"
          >
            Confirmar y continuar →
          </button>
        </div>
      </div>
    </div>
  );
};

export default DanceFoodSelection;