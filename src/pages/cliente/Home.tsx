import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { useUserContext } from '../../hooks/useUserContext';

const Home: React.FC = () => {
  const [eventName, setEventName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const { setPaso, setToken, setMenuSeleccionado, menuSeleccionado } = useUserContext();

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      const token = searchParams.get('token');
      console.log('Home.tsx - Token extraído:', token);
      if (!token) {
        setError('No se proporcionó un token');
        setLoading(false);
        return;
      }

      setToken(token); // Guardar token en el contexto
      console.log('Home.tsx - Buscando evento con token:', token);
      const { data, error } = await supabase
        .from('eventos')
        .select('id, tipo, nombre, estado, menu, catering_confirmado')
        .eq('token_acceso', token)
        .single();

      if (error || !data) {
        console.error('Home.tsx - Error fetching event:', error);
        setError('Error al cargar el evento: ' + (error?.message || 'Evento no encontrado.'));
        setLoading(false);
        return;
      }

      console.log('Home.tsx - Evento encontrado:', data);
      if (data.estado === 'inactivo') {
        setModalMessage('El evento está inactivo. No podés realizar modificaciones.');
        setLoading(false);
        return;
      }

      setEventName(data?.nombre || 'Evento');
      setPaso('cliente'); // Establecer paso inicial
      if (data.menu && data.menu !== menuSeleccionado) {
        console.log('Home.tsx - Actualizando menuSeleccionado:', data.menu);
        setMenuSeleccionado(data.menu);
      }

      setLoading(false);
    };
    fetchEvent();
  }, [searchParams, setPaso, setToken, setMenuSeleccionado, menuSeleccionado]);

  if (loading) return (
    <div className="text-center py-8">Cargando...</div>
  );

  if (error) return (
    <div className="text-center py-8 text-red-500">{error}</div>
  );

  return (
    <div className="container mx-auto px-4 py-10">
      {modalMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Atención</h3>
            <p className="text-gray-600 mb-6">{modalMessage}</p>
            <button
              className="bg-[#FF6B35] text-white px-4 py-2 rounded-md hover:bg-[#FF6B35]/90 w-full transition-colors"
              onClick={() => setModalMessage(null)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
      <section className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Bienvenido a Las Rocas - {eventName}
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          La plataforma integral para planificar tu evento de manera fácil e interactiva.
        </p>
      </section>

      <section className="bg-gray-50 rounded-2xl p-10 max-w-6xl mx-auto mt-20 shadow-md">
        <div className="flex flex-col items-center mb-10">
          <h2 className="text-3xl font-bold text-center text-gray-800">¿Cómo funciona?</h2>
          <p className="text-gray-600 mt-2 text-center max-w-2xl">
            Sigue estos sencillos pasos para organizar tu evento de forma rápida y personalizada.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              step: 1,
              title: 'Elige tu Menú',
              desc: 'Selecciona las opciones de catering que mejor se adapten a tu evento.',
            },
            {
              step: 2,
              title: 'Diseña tu Salón',
              desc: 'Completa la distribución y decoración de las mesas.',
            },
            {
              step: 3,
              title: 'Organiza la Cena',
              desc: 'Si elegiste el menú 4, asigná los invitados a la cena.',
            },
            {
              step: 4,
              title: 'Organiza los Horarios',
              desc: 'Programa las actividades y tiempos clave de tu evento.',
            },
            {
              step: 5,
              title: 'Gestiona el Baile (Invitados)',
              desc: 'Administra la lista de invitados para el baile de tu evento.',
            },
            {
              step: 6,
              title: 'Añade Observaciones',
              desc: 'Ingresa notas o detalles especiales para tu evento.',
            },
          ].map(({ step, title, desc }) => (
            <div
              key={step}
              className="flex flex-col items-center bg-white rounded-2xl shadow-md p-6 transition transform hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="w-12 h-12 bg-[#FF6B35] text-white rounded-full flex items-center justify-center text-lg font-bold mb-4 shadow">
                {step}
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2 text-center">
                {title}
              </h3>
              <p className="text-gray-600 text-center text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;