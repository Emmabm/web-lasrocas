import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tableclothOptions, centerpieceOptions } from '../../../hooks/useTablePlanner';

interface Props {
  globalDecoration: {
    tablecloth: string;
    napkinColor: string;
    centerpiece: string;
  };
  updateGlobalDecoration: (
    tableclothId: string,
    napkinColor: string,
    centerpiece: string
  ) => void;
  guardarDistribucionYDecoracion: () => Promise<void> | void;
  token: string | null;
}

// Mapa de combinaciones de imágenes
const imageMap: Record<string, string> = {
    'white-white': '/img/mesas/blanco-servilleta-blanca.webp',
    'white-black': '/img/mesas/blanco-servilleta-negra.webp',
    'grey-white': '/img/mesas/peltre-servilleta-blanca.webp',
    'grey-black': '/img/mesas/peltre-servilleta-negra.webp',
    'black-white': '/img/mesas/negro-servilleta-blanca.webp',
    'black-black': '/img/mesas/negro-servilleta-negra.webp',
    'two-tone-white-black': '/img/mesas/mixto.webp',
};

const DecorationPanel: React.FC<Props> = ({
  globalDecoration,
  updateGlobalDecoration,
  guardarDistribucionYDecoracion,
  token
}) => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  // Función para obtener la URL de la imagen
  const getImageUrl = (tableclothId: string, napkinColorId: string): string => {
    if (tableclothId === 'two-tone') {
      return imageMap['two-tone-white-black'];
    }
    const key = `${tableclothId}-${napkinColorId}`;
    return imageMap[key] || '';
  };

  const handleTableclothChange = (id: string) => {
    const option = tableclothOptions.find(t => t.id === id);
    if (!option) return;
    updateGlobalDecoration(id, option.napkins.defaultColor, globalDecoration.centerpiece);
  };

  const handleNapkinChange = (color: string) => {
    updateGlobalDecoration(globalDecoration.tablecloth, color, globalDecoration.centerpiece);
  };

  const handleCenterpieceChange = (id: string) => {
    updateGlobalDecoration(globalDecoration.tablecloth, globalDecoration.napkinColor, id);
  };

  const handleFinalizarYGuardar = async () => {
    setSaving(true);
    try {
      await guardarDistribucionYDecoracion();
      if (token) {
        navigate(`/horarios?token=${token}`);
      }
    } catch (error) {
      console.error('Error guardando distribución y decoración:', error);
      setSaving(false);
    }
  };

  return (
    <section className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100 max-w-5xl mx-auto">
      <h2 className="text-4xl font-extrabold text-gray-900 mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-[#FF6B35] to-[#FF8C66] tracking-tight">
        Personaliza tu Decoración
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tableclothOptions.map(option => (
          <label
            key={option.id}
            className={`relative block rounded-2xl overflow-hidden cursor-pointer border transition-all duration-300 hover:shadow-xl hover:-translate-y-2 ${
              globalDecoration.tablecloth === option.id
                ? 'border-4 border-[#FF6B35] shadow-lg'
                : 'border-2 border-gray-200'
            } bg-white`}
          >
            <input
              type="radio"
              name="tablecloth"
              value={option.id}
              checked={globalDecoration.tablecloth === option.id}
              onChange={() => handleTableclothChange(option.id)}
              className="hidden"
            />
            <div className="flex flex-col items-center gap-4 p-6">
              <div className="relative w-64 h-48 rounded-xl overflow-hidden shadow-md">
                {/* Lógica de la imagen corregida */}
                <img
                  src={
                    globalDecoration.tablecloth === option.id
                      ? getImageUrl(option.id, globalDecoration.napkinColor)
                      : option.image // Se muestra la imagen predeterminada si no está seleccionada
                  }
                  alt={option.name}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
                {globalDecoration.tablecloth === option.id && (
                  <div className="absolute top-2 right-2 bg-[#FF6B35] text-white text-xs font-semibold px-2 py-1 rounded-full">
                    Seleccionado
                  </div>
                )}
              </div>
              <span className="text-xl font-semibold text-gray-800">{option.name}</span>
              {globalDecoration.tablecloth === option.id && (
                <div className="w-full mt-4">
                  <h4 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wider">
                    Color de Servilleta
                  </h4>
                  <div className="flex gap-3 flex-wrap justify-center">
                    {option.napkins.availableColors.map(color => (
                      <label
                        key={color}
                        className={`flex items-center gap-2 cursor-pointer bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 transition-all duration-200 ${
                          globalDecoration.napkinColor === color ? 'ring-2 ring-[#FF6B35]' : ''
                        }`}
                      >
                        <input
                          type="radio"
                          name="napkinColor"
                          value={color}
                          checked={globalDecoration.napkinColor === color}
                          onChange={() => handleNapkinChange(color)}
                          className="hidden"
                        />
                        <div
                          className="w-8 h-8 rounded-full border-2 border-gray-300 shadow-sm"
                          style={{
                            backgroundColor: color.includes('negro') ? '#000000' : color.includes('blanco') ? '#ffffff' : color
                          }}
                        />
                        <span className="capitalize text-gray-700 font-medium">{color}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </label>
        ))}
      </div>
      <div className="mt-12 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-8 shadow-sm border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">💐</span> Centro de Mesa
        </h3>
        <select
          value={globalDecoration.centerpiece}
          onChange={e => handleCenterpieceChange(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35] transition-all duration-200 hover:bg-gray-50"
          disabled={saving}
        >
          {centerpieceOptions.map(option => (
            <option key={option.id} value={option.id} className="text-gray-700">
              {option.name}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-12 flex justify-center">
        <button
          onClick={handleFinalizarYGuardar}
          disabled={saving}
          className="px-10 py-4 bg-gradient-to-r from-[#FF6B35] to-[#FF8C66] text-white text-lg font-semibold rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Guardando...' : 'Finalizar y Guardar'}
        </button>
      </div>
    </section>
  );
};

export default DecorationPanel;