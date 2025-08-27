import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../../../supabaseClient';
import { useUserContext } from '../../../../hooks/useUserContext';

const menusInfantiles = [
  'Milanesa de pollo con papas fritas',
  'Milanesa de carne con papas fritas',
  'Lasagna',
  'Hamburguesas con papas fritas',
  'Pata de pollo con papas fritas',
];

const KidsMenuSelectionMenu2: React.FC = () => {
  const [menuInfantil, setMenuInfantil] = useState<string | null>(null);
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
        .select('id')
        .eq('token_acceso', finalToken)
        .single();

      if (error || !data) {
        setError('Error al cargar el evento');
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
    if (!menuInfantil) {
      setError('Debés elegir un menú infantil.');
      return;
    }

    if (!eventId) {
      setError('No se encontró el ID del evento');
      return;
    }

    console.log('KidsMenuSelectionMenu2 continuar - Guardando:', { event_id: eventId, paso: 'menu-infantil-menu2', datos: { menu_infantil: menuInfantil } });
    const { error } = await supabase.rpc('upsert_menu2_formularios', {
      p_event_id: eventId,
      p_paso: 'menu-infantil-menu2',
      p_datos: { menu_infantil: menuInfantil },
    });

    if (error) {
      console.error('KidsMenuSelectionMenu2 continuar - Error:', error.message);
      setError(`No se pudo guardar: ${error.message}`);
      return;
    }

    navigate(`/catering/menu2/bebidas?token=${token}`);
  };

  const volver = () => {
    navigate(`/catering/menu2/postre?token=${token}`);
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
          Menú Infantil — Menú 2 (Clásico)
        </h1>
        <p className="text-center text-gray-600 text-lg mb-8">
          Elegí <span className="text-[#FF6B35] font-semibold">1 menú infantil</span> (de 3 a 12 años).
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {menusInfantiles.map((item) => (
            <div
              key={item}
              onClick={() => setMenuInfantil(item)}
              className={`p-6 rounded-xl border-2 text-center cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                menuInfantil === item ? 'border-[#FF6B35] bg-orange-50' : 'border-gray-200'
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
            disabled={!menuInfantil}
            className={`px-6 py-2 rounded-md text-white shadow-md transition-all duration-300 hover:scale-105 ${
              menuInfantil ? 'bg-[#FF6B35] hover:bg-[#e65a23]' : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            Confirmar y continuar →
          </button>
        </div>
      </div>
    </div>
  );
};

export default KidsMenuSelectionMenu2;