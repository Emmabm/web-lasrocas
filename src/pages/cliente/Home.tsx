import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { useUserContext } from '../../hooks/useUserContext';

const Home: React.FC = () => {
  const [eventType, setEventType] = useState<string | null>(null);
  const [eventName, setEventName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const { setPaso, setToken } = useUserContext();

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      const token = searchParams.get('token');
      console.log('Token extraído:', token);
      if (!token) {
        setError('No se proporcionó un token');
        setLoading(false);
        return;
      }

      setToken(token); // Guardar token en el contexto
      console.log('Buscando evento con token:', token);
      const { data, error } = await supabase
        .from('eventos')
        .select('tipo, nombre')
        .eq('token_acceso', token)
        .single();

      if (error) {
        console.error('Error fetching event:', error);
        setError('Error al cargar el evento: ' + error.message);
        setLoading(false);
        return;
      }

      console.log('Evento encontrado:', data);
      setEventType(data?.tipo || null);
      setEventName(data?.nombre || 'Evento');
      setPaso('cliente'); // Establecer paso inicial
      setLoading(false);
    };
    fetchEvent();
  }, [searchParams, setPaso, setToken]);

  if (loading) return <div className="text-center py-8">Cargando...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  const isFiesta15 = eventType === 'fiesta15';

  return (
  <div className="container mx-auto px-4 py-10">
    <section className="mb-10 text-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">
        Bienvenido a Las Rocas - {eventName}
      </h1>
      <p className="text-xl text-gray-600 max-w-2xl mx-auto">
        La plataforma integral para planificar tu evento de manera fácil e interactiva.
      </p>
    </section>

    <section className="bg-gray-100 rounded-lg p-8 max-w-6xl mx-auto mt-20">
      <div className="flex flex-col items-center mb-10">
        <h2 className="text-2xl font-bold text-center">¿Cómo funciona?</h2>
      </div>
      <div className="flex flex-col sm:flex-row justify-center flex-wrap gap-6">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 bg-[#FF6B35] text-white rounded-full flex items-center justify-center mb-4">
            1
          </div>
          <h3 className="text-lg font-medium mb-2">Elige tu Menú</h3>
          <p className="text-center text-gray-600">
            Selecciona las opciones de catering que mejor se adapten a tu evento.
          </p>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 bg-[#FF6B35] text-white rounded-full flex items-center justify-center mb-4">
            2
          </div>
          <h3 className="text-lg font-medium mb-2">Diseña tu Salón</h3>
          <p className="text-center text-gray-600">
            Arrastra y coloca las mesas en nuestro plano interactivo (si aplica).
          </p>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 bg-[#FF6B35] text-white rounded-full flex items-center justify-center mb-4">
            3
          </div>
          <h3 className="text-lg font-medium mb-2">Organiza los Horarios</h3>
          <p className="text-center text-gray-600">
            Programa las actividades y tiempos clave de tu evento.
          </p>
        </div>
        {isFiesta15 && (
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 bg-[#FF6B35] text-white rounded-full flex items-center justify-center mb-4">
              4
            </div>
            <h3 className="text-lg font-medium mb-2">Gestiona tus Invitados</h3>
            <p className="text-center text-gray-600">
              Administra la lista de invitados para tu fiesta de 15.
            </p>
          </div>
        )}
      </div>
    </section>
  </div>
);
};

export default Home;