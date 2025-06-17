import { useState } from 'react';

export default function AdminPanel() {
  const [tipoEvento, setTipoEvento] = useState('cumpleaños');
  const [linkGenerado, setLinkGenerado] = useState('');

  const generarLink = () => {
    const url = `${window.location.origin}/evento?tipo=${tipoEvento}`;
    navigator.clipboard.writeText(url);
    setLinkGenerado(url);
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Generar link para el cliente</h1>

      <select
        value={tipoEvento}
        onChange={(e) => setTipoEvento(e.target.value)}
        className="border p-2 rounded"
      >
        <option value="cumpleaños">Cumpleaños</option>
        <option value="fiesta15">Fiesta de 15</option>
        <option value="casamiento">Casamiento</option>
        <option value="egresados">Fiesta de egresados</option>
      </select>

      <button
        onClick={generarLink}
        className="bg-orange-500 text-white px-4 py-2 rounded"
      >
        Generar y copiar link
      </button>

      {linkGenerado && (
        <p className="mt-2 text-green-600">Link: <a href={linkGenerado}>{linkGenerado}</a></p>
      )}
    </div>
  );
}
