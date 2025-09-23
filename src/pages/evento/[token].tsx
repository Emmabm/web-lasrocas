import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

export default function EventoPage() {
  const { token } = useParams();
  const [evento, setEvento] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuSeleccionado, setMenuSeleccionado] = useState<string>('');

  useEffect(() => {
    const cargarEvento = async () => {
      if (!token || token.length < 5) {
        setError('Link inválido o incompleto.');
        setCargando(false);
        return;
      }

      const { data, error } = await supabase
        .from('eventos')
        .select('*')
        .eq('token_acceso', token)
        .single();

      if (error || !data) {
        setError('Evento no encontrado o link inválido.');
        setEvento(null);
      } else {
        setEvento(data);
        // Guardamos el menú que estaba seleccionado para mostrar la sección correcta
        setMenuSeleccionado(data.menu || '');
      }

      setCargando(false);
    };

    cargarEvento();
  }, [token]);

  if (cargando) return <p className="p-6 text-center">⏳ Cargando evento...</p>;
  if (error) return <p className="p-6 text-center text-red-600">{error}</p>;
  if (!evento) return null;

  const mensajes: Record<string, string> = {
    cumple: '🎂 ¡Fiesta de cumpleaños!',
    casamiento: '💍 Casamiento soñado',
    fiesta15: '✨ Fiesta de 15 inolvidable',
    egresados: '🎓 Fiesta de egresados',
  };

  const tipo = evento.tipo?.toLowerCase();
  const mensaje = mensajes[tipo] || '🎉 Evento especial';

  const fechaFormateada = new Date(evento.fecha).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-4">
          <h1 className="text-3xl font-bold">{mensaje}</h1>
          <p className="text-sm opacity-90 mt-1">
            {fechaFormateada} | {evento.nombre}
          </p>
        </div>

        <div className="px-6 py-5">
          <p className="text-gray-700 mb-4 text-center">
            Usá esta plataforma para organizar cada detalle y compartir el evento con tus invitados.
          </p>

          {/* Mostrar sección según menú */}
          {menuSeleccionado === 'menu4' ? (
            <div className="mt-6 bg-gray-100 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-2">🍽️ Sección de Cena (Por Islas)</h2>
              <p>Este menú no utiliza mesas, se organiza por islas.</p>
            </div>
          ) : (
            <div className="mt-6 bg-gray-100 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-2">🪑 Sección de Mesas</h2>
              <p>Organización de mesas según tu evento.</p>
            </div>
          )}

          {/* Invitados (solo ejemplo, lo podés adaptar) */}
          {tipo === 'fiesta15' && (
            <div className="mt-6">
              {/* Aquí iría tu componente de invitados */}
            </div>
          )}

          {/* Ubicación del salón */}
          <div className="mt-8 rounded-xl overflow-hidden shadow-md bg-gray-100 p-6">
            <h2 className="text-xl font-semibold mb-3 text-gray-800">🗺️ Ubicación del salón</h2>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3389.9907190337947!2d-68.893072!3d-32.9817357!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x967e0af3dc0e8f1f%3A0x718ba9105fddebd!2sLas%20Rocas!5e0!3m2!1ses!2sar!4v1721003400000"
              width="100%"
              height="250"
              style={{ border: 0, borderRadius: '12px' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Mapa del salón Las Rocas"
            ></iframe>
            <p className="mt-3 text-sm text-gray-600">
              El evento se realizará en <strong>Salón Las Rocas</strong>, ubicado en <strong>Chacras de Coria, Mendoza</strong>. Zona tranquila, ideal para celebraciones íntimas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
