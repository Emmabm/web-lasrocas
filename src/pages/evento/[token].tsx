import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

export default function EventoPage() {
  const { token } = useParams();
  const [evento, setEvento] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de UI para secciones
  const [mostrarMesas, setMostrarMesas] = useState(false);
  const [mostrarCena, setMostrarCena] = useState(false);
  const [menuSeleccionado, setMenuSeleccionado] = useState('');

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
        // Inicializamos la UI según el menú guardado
        setMenuSeleccionado(data.menu || '');
        if (data.menu === 'menu4') {
          setMostrarMesas(false);
          setMostrarCena(true);
        } else {
          setMostrarMesas(true);
          setMostrarCena(false);
        }
      }

      setCargando(false);
    };

    cargarEvento();
  }, [token]);

  if (cargando) return <p className="p-6 text-center">⏳ Cargando evento...</p>;
  if (error) return <p className="p-6 text-center text-red-600">{error}</p>;
  if (!evento) return null;

  const handleMenuChange = async (nuevoMenu: string) => {
    setMenuSeleccionado(nuevoMenu);

    if (nuevoMenu === 'menu4') {
      setMostrarMesas(false);
      setMostrarCena(true);
    } else {
      setMostrarMesas(true);
      setMostrarCena(false);
    }

    // Guardamos en la base de datos
    const { error } = await supabase
      .from('eventos')
      .update({ menu: nuevoMenu })
      .eq('id', evento.id);

    if (error) {
      console.error('Error al actualizar el menú:', error.message);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">{evento.nombre}</h1>

      <div className="mb-6">
        <label className="block font-semibold mb-2">Seleccionar menú:</label>
        <select
          value={menuSeleccionado}
          onChange={(e) => handleMenuChange(e.target.value)}
          className="border rounded px-4 py-2 w-full"
        >
          <option value="">-- Elegí un menú --</option>
          <option value="menu1">Menú 1</option>
          <option value="menu2">Menú 2</option>
          <option value="menu3">Menú 3</option>
          <option value="menu4">Menú 4 (Islas, sin mesas)</option>
        </select>
      </div>

      {mostrarMesas && (
        <div className="bg-gray-100 p-4 rounded mb-4">
          <h2 className="font-semibold mb-2">🪑 Sección Mesas</h2>
          <p>Organización de mesas según el menú seleccionado.</p>
        </div>
      )}

      {mostrarCena && (
        <div className="bg-gray-100 p-4 rounded mb-4">
          <h2 className="font-semibold mb-2">🍽️ Sección Cena</h2>
          <p>Este menú se sirve tipo islas, no requiere mesas.</p>
        </div>
      )}

      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="font-semibold mb-2">📋 Invitados</h2>
        <p>Confirmaciones en tiempo real.</p>
      </div>

      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="font-semibold mb-2">⏰ Horarios</h2>
        <p>Planificación clara para tu evento.</p>
      </div>
    </div>
  );
}
