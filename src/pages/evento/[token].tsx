import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import Guests from '../cliente/invitados/Guests';

interface Evento {
  id: string;
  nombre: string;
  tipo: string;
  fecha: string;
  menu: number; // ahora usamos "menu" según tu tabla
  token_acceso: string;
  estado?: string;
  catering_confirmado?: boolean;
}

export default function EventoPage() {
  const { token } = useParams<{ token: string }>();
  const [evento, setEvento] = useState<Evento | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menu, setMenu] = useState<number | null>(null);

  // 1️⃣ Cargar evento al entrar por el link
  useEffect(() => {
    if (!token || token.length < 5) {
      setError('Link inválido o incompleto.');
      setCargando(false);
      return;
    }

    const cargarEvento = async () => {
      const { data, error } = await supabase
        .from('eventos')
        .select('*')
        .eq('token_acceso', token)
        .single();

      if (error || !data) {
        setError('Evento no encontrado o link inválido.');
        setEvento(null);
      } else {
        const eventoData = data as Evento;
        setEvento(eventoData);
        setMenu(eventoData.menu); // <-- usamos la columna "menu" de la tabla
      }

      setCargando(false);
    };

    cargarEvento();
  }, [token]);

  // 2️⃣ Mostrar/ocultar secciones según el menú
  useEffect(() => {
    if (menu === null) return;

    const mesas = document.getElementById('seccion-mesas');
    const cena = document.getElementById('seccion-cena');

    if (menu === 4) {
      if (mesas) mesas.style.display = 'none';
      if (cena) cena.style.display = 'block';
    } else {
      if (mesas) mesas.style.display = 'block';
      if (cena) cena.style.display = 'none';
    }
  }, [menu]);

  // 3️⃣ Función para cambiar el menú y guardar en DB
  const cambiarMenu = async (nuevoMenu: number) => {
    setMenu(nuevoMenu);

    await supabase
      .from('eventos')
      .update({ menu: nuevoMenu })
      .eq('token_acceso', token);
  };

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

  const fechaFormateada = evento.fecha
    ? new Date(evento.fecha).toLocaleDateString('es-AR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

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

          {/* Selector de menú */}
          <div className="mb-4">
            <label className="block mb-1 text-gray-700">Seleccioná tu menú:</label>
            <select
              value={menu || ''}
              onChange={(e) => cambiarMenu(Number(e.target.value))}
              className="border p-2 rounded w-full"
            >
              <option value={1}>Menú 1</option>
              <option value={2}>Menú 2</option>
              <option value={3}>Menú 3</option>
              <option value={4}>Menú 4 (islas, sin mesas)</option>
            </select>
          </div>

          {/* Secciones */}
          <div id="seccion-mesas" className="bg-gray-100 rounded-lg p-4 mb-4">
            <p className="text-lg font-semibold">🪑 Mesas</p>
            <p>Organización simple y dinámica.</p>
          </div>

          <div id="seccion-cena" className="bg-gray-100 rounded-lg p-4 mb-4">
            <p className="text-lg font-semibold">🍽️ Cena / Islas</p>
            <p>Sección visible solo si el menú es de tipo islas.</p>
          </div>

          <div className="bg-gray-100 rounded-lg p-4 mb-4">
            <p className="text-lg font-semibold">📋 Invitados</p>
            {tipo === 'fiesta15' ? (
              <Guests eventoId={evento.id} />
            ) : (
              <p>Confirmaciones en tiempo real.</p>
            )}
          </div>

          <div className="bg-gray-100 rounded-lg p-4 mb-4">
            <p className="text-lg font-semibold">⏰ Horarios</p>
            <p>Planificación clara para tu evento.</p>
          </div>

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
              El evento se realizará en <strong>Salón Las Rocas</strong>, ubicado en{' '}
              <strong>Chacras de Coria, Mendoza</strong>. Zona tranquila, ideal para celebraciones íntimas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
