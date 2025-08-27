import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../../supabaseClient';
import { useUserContext } from '../../../hooks/useUserContext';
import { ArrowLeft, CheckCircle } from 'lucide-react';

interface Formulario {
  paso: string;
  datos: any;
}

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

const CateringSummary: React.FC = () => {
  const [formularios, setFormularios] = useState<Formulario[]>([]);
  const [eventId, setEventId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token: contextToken, setPaso } = useUserContext();
  const navigate = useNavigate();
  const location = useLocation();

  const menu = location.pathname.includes('menu4') ? 'menu4' :
               location.pathname.includes('menu3') ? 'menu3' :
               location.pathname.includes('menu2') ? 'menu2' : 'menu1';

  useEffect(() => {
    const fetchEventAndFormularios = async () => {
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

      const { data: eventData, error: eventError } = await supabase
        .from('eventos')
        .select('id')
        .eq('token_acceso', finalToken)
        .single();

      if (eventError || !eventData) {
        setError('Error al cargar el evento. Verificá el token de acceso.');
        setLoading(false);
        return;
      }

      const { data: formData, error: formError } = await supabase
        .from(`${menu}_formularios`)
        .select('paso, datos')
        .eq('event_id', eventData.id);

      if (formError || !formData) {
        setError('Error al cargar las selecciones');
        setLoading(false);
        return;
      }

      const order = ['entrada', 'plato-principal', 'lunch', 'postre', 'menu-infantil', 'bebidas', 'baile'];
      const sortedFormData = formData.sort((a, b) => {
        const aIndex = order.findIndex((step) => a.paso.includes(step));
        const bIndex = order.findIndex((step) => b.paso.includes(step));
        return aIndex - bIndex;
      });

      setFormularios(sortedFormData);
      setEventId(eventData.id);
      setPaso('catering');
      setLoading(false);
    };
    fetchEventAndFormularios();
  }, [contextToken, location.search, setPaso, menu, location.pathname]);

  const confirmar = async () => {
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

    const resumenDatos = formularios.reduce((acc, formulario) => {
      const pasoKey = formulario.paso.replace(`-${menu}`, '');
      acc[pasoKey] = formulario.datos;
      return acc;
    }, {} as Record<string, any>);

    const { error } = await supabase.rpc('upsert_eventos_resumen', {
      p_event_id: eventId,
      p_menu: menu,
      p_datos: resumenDatos,
    });

    if (error) {
      setError(`No se pudo guardar el resumen: ${error.message}`);
      return;
    }

    navigate(menu === 'menu4' ? `/horarios?token=${finalToken}` : `/mesa?token=${finalToken}`);
  };

  const volver = () => {
    const params = new URLSearchParams(location.search);
    const urlToken = params.get('token');

    if (!urlToken && !contextToken) {
      setError('No se proporcionó un token de acceso. Por favor, volvé al inicio.');
      navigate('/cliente');
      return;
    }

    const finalToken = urlToken || contextToken;
    navigate(`/catering/${menu}/comidas-baile?token=${finalToken}`);
  };

  const getSectionTitle = (paso: string) => {
    if (paso.includes('entrada')) return 'Recepción';
    if (paso.includes('plato-principal') || paso.includes('lunch')) return 'Plato Principal';
    if (paso.includes('postre')) return 'Postre';
    if (paso.includes('menu-infantil')) return 'Menú Infantil';
    if (paso.includes('bebidas')) return 'Bebidas';
    if (paso.includes('baile')) return 'Comidas para el Baile';
    return paso.replace(`-${menu}`, '').charAt(0).toUpperCase() + paso.replace(`-${menu}`, '').slice(1);
  };

  const formatData = (datos: any, paso: string): JSX.Element => {
    if (!datos) {
      return <p className="text-gray-700 text-base">No hay selecciones</p>;
    }

    if (paso.includes('bebidas')) {
      return (
        <>
          <h3 className="text-base font-semibold text-gray-800 mt-2">Incluidas (Recepción y Cena/Almuerzo):</h3>
          <ul className="text-gray-700 text-base list-disc list-inside mb-2">
            {bebidasIncluidas.recepcionYCena.map((bebida) => (
              <li key={bebida}>{bebida}</li>
            ))}
          </ul>
          <h3 className="text-base font-semibold text-gray-800">Incluidas (Baile):</h3>
          <ul className="text-gray-700 text-base list-disc list-inside mb-2">
            {bebidasIncluidas.baile.map((bebida) => (
              <li key={bebida}>{bebida}</li>
            ))}
          </ul>
          <h3 className="text-base font-semibold text-gray-800">Extra:</h3>
          <ul className="text-gray-700 text-base list-disc list-inside">
            {datos.bebidas_extra?.length > 0 ? (
              datos.bebidas_extra.map((bebida: string) => <li key={bebida}>{bebida}</li>)
            ) : (
              <li>Ninguna</li>
            )}
          </ul>
        </>
      );
    }

    if (paso.includes('baile')) {
      return (
        <>
          <h3 className="text-base font-semibold text-gray-800">Incluidas:</h3>
          <ul className="text-gray-700 text-base list-disc list-inside mb-2">
            {datos.comidas?.incluidas?.length > 0 ? (
              datos.comidas.incluidas.map((comida: string) => <li key={comida}>{comida}</li>)
            ) : (
              <li>Bandejeo de pizzas</li>
            )}
          </ul>
          <h3 className="text-base font-semibold text-gray-800">Extra:</h3>
          <ul className="text-gray-700 text-base list-disc list-inside mb-2">
            {datos.comidas?.extra?.length > 0 ? (
              datos.comidas.extra.map((c: any) => (
                <li key={c.nombre}>{`${c.nombre} (${c.cantidad})`}</li>
              ))
            ) : (
              <li>Ninguna</li>
            )}
          </ul>
          {datos.helados && (
            <>
              <h3 className="text-base font-semibold text-gray-800">Stand de Helados:</h3>
              <ul className="text-gray-700 text-base list-disc list-inside">
                <li>{`${datos.helados} unidades`}</li>
              </ul>
            </>
          )}
        </>
      );
    }

    if (paso.includes('entrada')) {
      return (
        <ul className="text-gray-700 text-base list-disc list-inside">
          {datos.entrada ? (
            <li>{datos.entrada}</li>
          ) : datos.opciones?.length > 0 ? (
            datos.opciones.map((opcion: string) => <li key={opcion}>{opcion}</li>)
          ) : datos.tipo ? (
            <li>{datos.tipo}</li>
          ) : (
            <li>Ninguna</li>
          )}
        </ul>
      );
    }

    if (paso.includes('plato-principal') || paso.includes('lunch')) {
      return (
        <ul className="text-gray-700 text-base list-disc list-inside">
          {datos.carne ? <li>Carne: {datos.carne}</li> : null}
          {datos.salsa ? <li>Salsa: {datos.salsa}</li> : null}
          {datos.guarniciones?.length > 0 ? (
            <li>Guarniciones: {datos.guarniciones.join(', ')}</li>
          ) : datos.opciones?.length > 0 ? (
            <li>Opciones: {datos.opciones.join(', ')}</li>
          ) : datos.tipo ? (
            <li>{datos.tipo}</li>
          ) : (
            <li>Ninguna</li>
          )}
        </ul>
      );
    }

    if (paso.includes('postre')) {
      return (
        <ul className="text-gray-700 text-base list-disc list-inside">
          <li>{datos.postre || datos.tipo || 'Ninguno'}</li>
        </ul>
      );
    }

    if (paso.includes('menu-infantil')) {
      return (
        <ul className="text-gray-700 text-base list-disc list-inside">
          <li>Menú Infantil: {datos.menu_infantil || 'Ninguno'}</li>
        </ul>
      );
    }

    return (
      <ul className="text-gray-700 text-base list-disc list-inside">
        {Object.entries(datos as Record<string, any>).map(([key, value]) => (
          <li key={key}>
            {key.charAt(0).toUpperCase() + key.slice(1)}: {Array.isArray(value) ? value.join(', ') : value || 'Ninguno'}
          </li>
        ))}
      </ul>
    );
  };

  const expectedSections = menu === 'menu4' 
    ? ['entrada', 'lunch', 'postre', 'bebidas', 'baile']
    : ['entrada', 'plato-principal', 'postre', 'menu-infantil', 'bebidas', 'baile'];

  const missingSections = expectedSections.filter(
    (section) => !formularios.some((formulario) => formulario.paso === `${section}-${menu}`)
  );

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
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center p-6">
      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-2xl p-10">
        <h1 className="text-5xl font-serif font-bold text-center text-gray-800 mb-8">
          Resumen del Catering — Menú {menu.replace('menu', '')}
        </h1>
        {formularios.length === 0 ? (
          <p className="text-center text-gray-600 text-lg">No hay selecciones realizadas.</p>
        ) : (
          <div className="space-y-6 mb-8">
            {missingSections.length > 0 && (
              <div className="bg-red-100 border-2 border-red-500 rounded-2xl p-8 shadow-md">
                <h2 className="text-xl font-semibold text-red-800 mb-4">Secciones incompletas</h2>
                <p className="text-gray-700 text-base">
                  Faltan las siguientes secciones: {missingSections.map((section) => getSectionTitle(`${section}-${menu}`)).join(', ')}.
                  Por favor, completá todas las selecciones antes de continuar.
                </p>
              </div>
            )}
            {formularios.map((formulario) => (
              <div key={formulario.paso} className="bg-orange-100 border-2 border-[#FF6B35] rounded-2xl p-8 shadow-md">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">{getSectionTitle(formulario.paso)}</h2>
                {formatData(formulario.datos, formulario.paso)}
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-center gap-6">
          <button
            onClick={volver}
            className="bg-white border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg flex items-center gap-2 hover:bg-gray-100 hover:border-[#FF6B35] transition-all duration-300"
          >
            <ArrowLeft className="h-5 w-5" />
            Volver
          </button>
          <button
            onClick={confirmar}
            disabled={missingSections.length > 0}
            className={`px-8 py-3 rounded-lg flex items-center gap-2 text-white shadow-md transition-all duration-300 hover:scale-105 hover:shadow-xl ${
              missingSections.length > 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#FF6B35] hover:bg-[#e65a23]'
            }`}
          >
            <CheckCircle className="h-5 w-5" />
            Confirmar y continuar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CateringSummary;