import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

export default function EventoPage() {
  const { token } = useParams();
  const [evento, setEvento] = useState<any>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarEvento = async () => {
      const { data, error } = await supabase
        .from('eventos')
        .select('*')
        .eq('token_acceso', token)
        .single();

      if (error || !data) {
        console.error('Evento no encontrado');
        setEvento(null);
      } else {
        setEvento(data);
      }

      setCargando(false);
    };

    cargarEvento();
  }, [token]);

  if (cargando) return <p className="p-4">Cargando evento...</p>;

  if (!evento) return <p className="p-4 text-red-600">Evento no encontrado o link inválido.</p>;

  const mensajes = {
    cumple: '¡Bienvenido a tu fiesta de cumpleaños!',
    casamiento: 'Bienvenidos a la planificación de su boda 💍',
    fiesta15: '✨ Es hora de organizar tu fiesta de 15 soñada',
    egresados: '🎓 Comienza la cuenta regresiva a la noche más esperada',
  };
  type TipoEvento = keyof typeof mensajes;
  const tipo: TipoEvento = evento.tipo as TipoEvento;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">🎉 {mensajes[tipo] || '¡Bienvenido al organizador de tu evento!'}</h1>
      <p className="text-gray-700 mb-4">Organizá todos los detalles de tu evento con esta plataforma pensada especialmente para vos.</p>

      {/* Acá irán los pasos personalizados según el tipo (Mesas, Catering, Invitados...) */}
      <ul className="space-y-2">
        <li>📍 Catering</li>
        <li>🪑 Distribución de mesas</li>
        <li>📋 Invitados</li>
        <li>⏰ Horarios</li>
      </ul>
    </div>
  );
}
