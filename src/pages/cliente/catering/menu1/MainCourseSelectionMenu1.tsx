import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../../../supabaseClient';
import { useUserContext } from '../../../../hooks/useUserContext';

const carnes = [
  { id: 'lomo', nombre: 'Lomo de ternera grillado', descripcion: 'Clásico y elegante, cocido al punto justo.', imagen: '/img/platos/lomo-de-ternera.webp' },
  { id: 'pollo-relleno', nombre: 'Pollo relleno con mozarella y jamón cocido', descripcion: 'Jugoso y sabroso.', imagen: '/img/platos/pollo-relleno.webp' },
  { id: 'bondiola', nombre: 'Bondiola de cerdo', descripcion: 'Tierna, caramelizada y deliciosa.', imagen: '/img/platos/bondiola-de-cerdo.webp' },
];

const salsas = [
  'Salsa Malbec',
  'Chimi de hierbas',
  'Salsa de Champiñones',
  'Cuatro quesos',
  'Barbacoa',
];

const guarniciones = [
  'Mouseline de batatas (puré)',
  'Mil hojas de papas',
  'Mil hojas de batatas',
  'Puré de papas y olivas con salsa malbec',
  'Puré de papas con parmesano y champignones',
  'Papas rústicas',
  'Papas a la crema',
  'Mezclum de hojas verdes y tomatitos cherrys',
  'Verdura al horno cortadas en julianas',
  'Tomates confitados',
  'Cebollas al malbec',
  'Ratatuil de verduras (verduras salteadas)',
];

const MainCourseSelectionMenu1: React.FC = () => {
  const [carne, setCarne] = useState<string | null>(null);
  const [salsa, setSalsa] = useState<string | null>(null);
  const [guarnicionesSeleccionadas, setGuarnicionesSeleccionadas] = useState<string[]>([]);
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

      console.log('MainCourseSelectionMenu1 useEffect - urlToken:', urlToken, 'contextToken:', token, 'finalToken:', finalToken, 'pathname:', location.pathname, 'search:', location.search);

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

  const toggleGuarnicion = (item: string) => {
    console.log('MainCourseSelectionMenu1 toggleGuarnicion - item:', item, 'guarnicionesSeleccionadas:', guarnicionesSeleccionadas);
    if (guarnicionesSeleccionadas.includes(item)) {
      setGuarnicionesSeleccionadas(guarnicionesSeleccionadas.filter((i) => i !== item));
    } else if (guarnicionesSeleccionadas.length < 2) {
      setGuarnicionesSeleccionadas([...guarnicionesSeleccionadas, item]);
    } else {
      alert('Solo podés seleccionar 2 guarniciones.');
    }
  };

  const continuar = async () => {
    if (!carne || !salsa || guarnicionesSeleccionadas.length !== 2) {
      setError('Debés elegir 1 carne, 1 salsa y 2 guarniciones.');
      return;
    }

    if (!eventId) {
      setError('No se encontró el ID del evento');
      return;
    }

    const { error } = await supabase
      .from('menu1_formularios')
      .upsert([
        {
          event_id: eventId,
          paso: 'plato-principal-menu1',
          datos: { carne, salsa, guarniciones: guarnicionesSeleccionadas },
        },
      ], { onConflict: 'event_id,paso' });

    if (error) {
      setError(`No se pudo guardar: ${error.message}`);
      return;
    }

    console.log('MainCourseSelectionMenu1 continuar - Navigating to:', `/catering/menu1/postre?token=${token}`);
    navigate(`/catering/menu1/postre?token=${token}`);
  };

  const volver = () => {
    console.log('MainCourseSelectionMenu1 volver - token:', token);
    navigate(`/catering/menu1/recepcion?token=${token}`);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center text-gray-700 text-xl">Cargando menú...</div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center text-red-500 text-xl">{error}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-4xl sm:text-5xl font-serif font-bold text-center text-gray-800 mb-6">
          Plato Principal — Menú 1 (Formal)
        </h1>
        <p className="text-center text-gray-600 text-lg mb-8">
          Elegí <span className="text-[#FF6B35] font-semibold">1 plato, 1 salsa y 2 guarniciones</span> para tu plato principal.
        </p>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">🍽️ Platos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {carnes.map((item) => (
              <div
                key={item.id}
                onClick={() => setCarne(item.nombre)}
                className={`rounded-xl border-2 cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  carne === item.nombre ? 'border-[#FF6B35] bg-orange-50' : 'border-gray-200'
                }`}
              >
                <img src={item.imagen} alt={item.nombre} className="w-full h-48 object-cover" />
                <div className="p-4 space-y-1">
                  <h3 className="font-semibold text-lg text-gray-800">{item.nombre}</h3>
                  <p className="text-sm text-gray-600">{item.descripcion}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">🥣 Salsas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {salsas.map((item) => (
              <div
                key={item}
                onClick={() => setSalsa(item)}
                className={`p-5 rounded-xl border-2 text-center cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  salsa === item ? 'border-[#FF6B35] bg-orange-50' : 'border-gray-200'
                }`}
              >
                <p className="text-base font-medium text-gray-800">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">🥗 Guarniciones</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {guarniciones.map((item) => (
              <div
                key={item}
                onClick={() => toggleGuarnicion(item)}
                className={`p-5 rounded-xl border-2 text-center cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  guarnicionesSeleccionadas.includes(item) ? 'border-[#FF6B35] bg-orange-50' : 'border-gray-200'
                }`}
              >
                <p className="text-base font-medium text-gray-800">{item}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-center text-gray-500 mt-4">Podés seleccionar hasta 2 guarniciones.</p>
        </section>

        <div className="flex justify-center gap-6">
          <button
            onClick={volver}
            className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-100 transition"
          >
            ← Volver
          </button>
          <button
            onClick={continuar}
            disabled={!carne || !salsa || guarnicionesSeleccionadas.length !== 2}
            className={`px-6 py-2 rounded-md text-white shadow-md transition-all duration-300 hover:scale-105 ${
              carne && salsa && guarnicionesSeleccionadas.length === 2
                ? 'bg-[#FF6B35] hover:bg-[#e65a23]'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            Confirmar y continuar →
          </button>
        </div>
      </div>
    </div>
  );
};

export default MainCourseSelectionMenu1;