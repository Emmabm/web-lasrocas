import { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { v4 as uuidv4 } from 'uuid';

export default function AdminPanel() {
  const [tipoEvento, setTipoEvento] = useState('cumpleaños');
  const [linkGenerado, setLinkGenerado] = useState('');
  const [cargando, setCargando] = useState(false);

  const generarLink = async () => {
    setCargando(true);
    const token = uuidv4();

    // Obtener el usuario actual (requiere que esté logueado con Supabase Auth)
    const { data: session } = await supabase.auth.getSession();
    const user = session?.session?.user;

    if (!user) {
      alert('Debes iniciar sesión como admin para generar eventos.');
      setCargando(false);
      return;
    }

    const { error } = await supabase.from('eventos').insert([
      {
        nombre: `Evento ${tipoEvento}`,
        tipo: tipoEvento,
        token_acceso: token,
        admin_id: user.id,
      },
    ]);

    if (error) {
      console.error('Error al crear evento:', error.message);
      alert('Hubo un error al generar el evento.');
      setCargando(false);
      return;
    }

    const url = `${window.location.origin}/evento/${token}`;
    await navigator.clipboard.writeText(url);
    setLinkGenerado(url);
    setCargando(false);
  };

  return (
    <div className="p-6 space-y-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-gray-800">🎉 Generar Link para el Cliente</h1>

      <label className="block text-sm text-gray-600 mb-1">Tipo de evento:</label>
      <select
        value={tipoEvento}
        onChange={(e) => setTipoEvento(e.target.value)}
        className="border p-2 rounded w-full"
      >
        <option value="cumpleaños">Cumpleaños</option>
        <option value="15">Fiesta de 15</option>
        <option value="casamiento">Casamiento</option>
        <option value="egresados">Egresados</option>
      </select>

      <button
        onClick={generarLink}
        disabled={cargando}
        className={`w-full mt-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded ${
          cargando ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {cargando ? 'Generando...' : 'Generar y copiar link'}
      </button>

      {linkGenerado && (
        <div className="mt-4 p-3 border rounded bg-green-50 text-green-700">
          ✅ Link generado y copiado:
          <br />
          <a href={linkGenerado} className="underline text-green-700">{linkGenerado}</a>
        </div>
      )}
    </div>
  );
}
