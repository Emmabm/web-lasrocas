import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../../../supabaseClient';
import { useUserContext } from '../../../../hooks/useUserContext';

const DessertSelectionMenu4: React.FC = () => {
  const [eventId, setEventId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token: contextToken, setPaso } = useUserContext();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      const params = new URLSearchParams(location.search);
      const urlToken = params.get('token');
      const finalToken = urlToken || contextToken;
      if (!finalToken) {
        setError('No se proporcionó un token de acceso. Por favor, volvé al inicio.');
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
  }, [contextToken, location.search, setPaso]);

  const continuar = async () => {
    const params = new URLSearchParams(location.search);
    const urlToken = params.get('token');
    const finalToken = urlToken || contextToken;
    if (!eventId) {
      setError('No se encontró el ID del evento');
      return;
    }

    if (!finalToken) {
      setError('No se proporcionó un token de acceso. Por favor, volvé al inicio.');
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
      p_paso: 'postre-menu4',
      p_datos: { tipo: 'variedades de shots y mini postres' },
    });

    if (error) {
      setError(`No se pudo guardar: ${error.message}`);
      return;
    }

    navigate(`/catering/menu4/bebidas?token=${finalToken}`);
  };

  const volver = () => {
    const params = new URLSearchParams(location.search);
    const urlToken = params.get('token');
    const finalToken = urlToken || contextToken;
    if (!finalToken) {
      navigate('/catering');
      return;
    }
    navigate(`/catering/menu4/lunch?token=${finalToken}`);
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
          Postre — Menú 4 (Lunch)
        </h1>
        <p className="text-center text-gray-600 text-lg mb-4">
          El postre incluye <span className="text-[#FF6B35] font-semibold">variedades de shots y mini postres</span>:
        </p>
        <div className="bg-orange-50 border border-[#FF6B35] rounded-lg p-6 mb-8 text-center">
          <p className="text-gray-700 text-base">
            Variedades de shots y mini postres exhibidos en stands para autoservicio.
          </p>
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

export default DessertSelectionMenu4;