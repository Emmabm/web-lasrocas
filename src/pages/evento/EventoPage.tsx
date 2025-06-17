import { useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import Catering from '../Catering';
import Guests from '../Guests';
import TablePlanner from '../TablePlanner';
import Home from '../Home'; 

export default function EventoPage() {
  const [searchParams] = useSearchParams();
  const tipoEvento = searchParams.get('tipo') || 'cumpleaños';

  const [seccion, setSeccion] = useState<'home' | 'catering' | 'invitados' | 'mesas'>('home');

  return (
    <div className="p-6">
      {/* Título oculto si es fiesta15 */}
      {tipoEvento !== 'fiesta15' && (
        <h1 className="text-3xl font-bold mb-4">{tipoEvento}</h1>
      )}

      {/* Menú principal */}
      <div className="flex gap-4 mb-6">
        <button onClick={() => setSeccion('home')}>Inicio</button>
        {tipoEvento === 'fiesta15' && <button onClick={() => setSeccion('invitados')}>Invitados</button>}
        <button onClick={() => setSeccion('catering')}>Catering</button>
        <button onClick={() => setSeccion('mesas')}>Mesas</button>
      </div>

      {/* Contenido según la sección */}
      {seccion === 'home' && <Home />}
      {seccion === 'invitados' && tipoEvento === 'fiesta15' && <Guests />}
      {seccion === 'catering' && <Catering />}
      {seccion === 'mesas' && <TablePlanner />}
    </div>
  );
}
