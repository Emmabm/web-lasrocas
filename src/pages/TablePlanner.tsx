// src/pages/TablePlanner.tsx
import React, { useState } from 'react';
import { AlertCircle, Save, ChevronRight, Check } from 'lucide-react';
import FloorPlan from '../components/FloorPlan';
import GuestAssigner from '../components/GuestAssigner';
import { Table } from '../types/types';

const ORIGIN_X = 150;
const ORIGIN_Y = 120;
const COL_SPACING = 120;
const ROW_SPACING = 110;
const CIRCLE_SIZE = 70;

const createTable = (id: string, col: number, row: number): Table => ({
  id,
  position: {
    x: ORIGIN_X + col * COL_SPACING,
    y: ORIGIN_Y + row * ROW_SPACING,
  },
  shape: 'circle',
  width: CIRCLE_SIZE,
  height: CIRCLE_SIZE,
  isAssignable: true,
  guests: [],
  isUsed: false,
});

const createFixed = (id: string, x: number, y: number, width: number, height: number): Table => ({
  id,
  position: { x, y },
  shape: width === height ? 'square' : 'rectangle',
  width,
  height,
  isAssignable: false,
  guests: [],
  isUsed: false,
});

const initialTables: Table[] = [
  createFixed('ESCENARIO', ORIGIN_X + COL_SPACING * 2.5, ORIGIN_Y - ROW_SPACING / 0, COL_SPACING * 3, 60),
  createFixed('DJ', ORIGIN_X - 90 + 30, ORIGIN_Y + ROW_SPACING * 4, 110, 110),
  createFixed('OFICINA', ORIGIN_X + COL_SPACING * 5 + 30, ORIGIN_Y + ROW_SPACING * 4, 240, 110),
  createFixed('PASARELA', ORIGIN_X - 90 + (COL_SPACING * 6.2) / 2, ORIGIN_Y + ROW_SPACING * 4 + CIRCLE_SIZE / 2 + 10, COL_SPACING * 5, 15),
  createTable("M1", 0, 1),
  createTable("M2", 0, 0),
  createTable("M3", 1, 0),
  createTable("M4", 0.9, 1),
  createTable("M5", 0, 2),
  createTable("M6", 0.7, 3),
  createTable("M7", 1.2, 3.8),
  createTable("M8", 2.3, 3.8),
  createTable("M9", 1.8, 2.5),
  createTable("M10", 2, 1.2),
  createTable("M11", 2, 0.2),
  createTable("M12", 3, 0.2),
  createTable("M13", 3, 1),
  createTable("M14", 3.3, 2),
  createTable("M15", 3, 2.8),
  createTable("M16", 3.5, 3.8),
  createTable("M17", 4.7, 3),
  createTable("M18", 4.7, 2),
  createTable("M19", 4.7, 1),
  createTable("M20", 4.7, 0),
  createTable("M21", 5.6, 0),
  createTable("M22", 5.6, 1),
  createTable("M23", 5.6, 2),
  createTable("M24", 5.6, 3),
];

const tableclothOptions = [
  {
    id: 'white',
    name: 'Blanco',
    mainColor: '#FFFFFF',
    napkins: {
      availableColors: ['white', 'black'],
      defaultColor: 'white'
    },
    image: '/images/tablecloths/white.jpg'
  },
  {
    id: 'grey',
    name: 'Peltre',
    mainColor: '#808080',
    napkins: {
      availableColors: ['white', 'black'],
      defaultColor: 'white'
    },
    image: '/images/tablecloths/grey.jpg'
  },
  {
    id: 'black',
    name: 'Negro',
    mainColor: '#000000',
    napkins: {
      availableColors: ['white', 'black'],
      defaultColor: 'black'
    },
    image: '/images/tablecloths/black.jpg'
  },
  {
    id: 'two-tone',
    name: 'Blanco y Negro',
    mainColor: '#FFFFFF',
    secondaryColor: '#000000',
    napkins: {
      availableColors: ['white-black'],
      defaultColor: 'white-black'
    },
    image: '/images/tablecloths/two-tone.jpg',
    isTwoTone: true
  }
];

const centerpieceOptions = [
  { id: 'none', name: 'Ninguno' },
  { id: 'candles', name: 'Centro de mesa del salon' },
  { id: 'modern', name: 'Centro proporcionado por el cliente' },
];

const TOTAL_STEPS = 2;

// ... (mantén todo igual hasta la definición del componente TablePlanner)

const TablePlanner: React.FC = () => {
  const [tables, setTables] = useState<Table[]>(initialTables);
  const [selected, setSelected] = useState<Table | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saved, setSaved] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Estado para decoración global
  const [globalDecoration, setGlobalDecoration] = useState({
    tablecloth: tableclothOptions[0].id,
    napkinColor: tableclothOptions[0].napkins.defaultColor,
    centerpiece: centerpieceOptions[0].id,
  });

  const moveTable = (id: string, pos: { x: number; y: number }) =>
    setTables(prev => prev.map(t => (t.id === id && t.isAssignable ? { ...t, position: pos } : t)));

  const selectTable = (id: string) => {
    const t = tables.find(tb => tb.id === id && tb.isAssignable);
    if (!t) return;
    setSelected(t);
    setShowModal(true);
  };

  const updateGuests = (id: string, guests: string[]) => {
    setTables(prev => prev.map(t => (t.id === id ? { ...t, guests, isUsed: guests.length > 0 } : t)));
    setShowModal(false);
    setSelected(null);
  };

  // Actualizar decoración global y a todas las mesas asignables
  const updateGlobalDecoration = (tableclothId: string, napkinColor: string, centerpiece: string) => {
    setGlobalDecoration({ tablecloth: tableclothId, napkinColor, centerpiece });

    setTables(prev =>
      prev.map(t =>
        t.isAssignable
          ? { ...t, tablecloth: tableclothId, napkinColor, centerpiece }
          : t
      )
    );
  };

  const used = tables.filter(t => t.isAssignable && t.isUsed);
  const warnings = tables.filter(t => t.isAssignable && (t.guests.length < 8 || t.guests.length > 11));

  const nextStep = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const StepIndicator: React.FC = () => (
    <ol className="flex items-center w-full justify-center mb-8">
      {['Distribución', 'Decoración'].map((label, index) => {
        const stepNumber = index + 1;
        const isActive = currentStep >= stepNumber;
        return (
          <React.Fragment key={label}>
            <li className={`flex items-center ${isActive ? 'text-[#FF6B35]' : 'text-gray-500'}`}>
              <span className={`flex items-center justify-center w-8 h-8 rounded-full ${isActive ? 'bg-[#FF6B35] text-white' : 'bg-gray-200'}`}>
                {stepNumber}
              </span>
              <span className="ml-2 text-sm whitespace-nowrap">{label}</span>
            </li>
            {stepNumber < TOTAL_STEPS && <span className="w-16 h-1 mx-4 bg-gray-200"></span>}
          </React.Fragment>
        );
      })}
    </ol>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-6">Comanda de Armado</h1>

      {saved && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center z-50">
          <span className="mr-2 font-medium">¡Guardado exitosamente!</span>
          <button className="text-green-700" onClick={() => setSaved(false)}>×</button>
        </div>
      )}

      <StepIndicator />

      {currentStep === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Resumen de Mesas</h2>
              <div className="p-4 bg-[#FF6B35]/10 rounded-lg mb-4">
                <p className="font-medium">Mesas utilizadas: {used.length}/{tables.filter(t => t.isAssignable).length}</p>
              </div>
              {warnings.length > 0 && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-lg mb-4">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                    <div>
                      <h3 className="font-medium text-red-800 mb-1">Advertencias:</h3>
                      <ul className="text-sm text-red-700 space-y-1">
                        {warnings.map(t => (
                          <li key={t.id}>{`Mesa ${t.id}: ${t.guests.length} invitados`}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 3000); }}
                className="w-full mt-4 bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white py-2 px-4 rounded-md flex items-center justify-center"
              >
                <Save className="w-4 h-4 mr-2" />
                Guardar distribución
              </button>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Plano del Salón</h2>
              <p className="text-sm text-gray-600 mb-4">Deslizá una mesa y hacé clic para asignar invitados.</p>
              <div className="bg-gray-100 rounded-lg border border-gray-200 overflow-hidden">
                <FloorPlan
                  tables={tables}
                  onTableMove={moveTable}
                  onTableSelect={selectTable}
                  tableWarnings={warnings.map(t => t.id)}
                  tableGuests={Object.fromEntries(tables.filter(t => t.isAssignable).map(t => [t.id, t.guests.length]))}
                  tableCapacity={10}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6">Decoración Global para Todas las Mesas</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium mb-2">Mantel</h4>
              <div className="grid grid-cols-2 gap-4">
                {tableclothOptions.map(option => (
                  <div 
                    key={option.id}
                    className={`border-2 rounded-lg p-2 cursor-pointer ${
                      globalDecoration.tablecloth === option.id ? 'border-[#FF6B35]' : 'border-gray-200'
                    }`}
                    onClick={() => updateGlobalDecoration(
                      option.id,
                      option.napkins.defaultColor,
                      globalDecoration.centerpiece
                    )}
                  >
                    <img 
                      src={option.image} 
                      alt={option.name}
                      className="w-full h-24 object-cover rounded mb-2"
                    />
                    <div className="flex justify-between items-center">
                      <span>{option.name}</span>
                      {globalDecoration.tablecloth === option.id && (
                        <Check className="h-4 w-4 text-[#FF6B35]" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              {/* Solo mostrar selección de servilletas si el mantel no es two-tone */}
              {!tableclothOptions.find(t => t.id === globalDecoration.tablecloth)?.isTwoTone ? (
                <>
                  <h4 className="text-sm font-medium mb-2">Color de servilletas</h4>
                  <div className="flex gap-3">
                    {tableclothOptions
                      .find(t => t.id === globalDecoration.tablecloth)!
                      .napkins.availableColors.map(color => (
                        <button
                          key={color}
                          className={`w-10 h-10 rounded-full border-2 cursor-pointer ${
                            globalDecoration.napkinColor === color ? 'border-[#FF6B35]' : 'border-gray-200'
                          }`}
                          style={{ 
                            backgroundColor: color === 'black' ? '#000' : '#FFF',
                            borderColor: color === 'black' ? '#000' : '#DDD'
                          }}
                          onClick={() => updateGlobalDecoration(
                            globalDecoration.tablecloth, 
                            color,
                            globalDecoration.centerpiece
                          )}
                          title={color === 'black' ? 'Negras' : 'Blancas'}
                        />
                    ))}
                  </div>
                </>
              ) : (
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-600">
                    Este mantel incluye servilletas blancas en la parte negra y negras en la parte blanca.
                  </p>
                </div>
              )}

              <h4 className="text-sm font-medium mb-2 mt-4">Centro de mesa</h4>
              <select
                className="w-full p-2 border rounded-md"
                value={globalDecoration.centerpiece}
                onChange={(e) => updateGlobalDecoration(
                  globalDecoration.tablecloth, 
                  globalDecoration.napkinColor,
                  e.target.value
                )}
              >
                {centerpieceOptions.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between mt-8 max-w-4xl mx-auto">
        <button
          onClick={prevStep}
          className={`px-4 py-2 rounded-md border border-gray-300 ${currentStep === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
          disabled={currentStep === 1}
        >
          Anterior
        </button>

        <button
          onClick={nextStep}
          className="px-4 py-2 rounded-md bg-[#FF6B35] text-white hover:bg-[#FF6B35]/90 flex items-center"
          disabled={currentStep === TOTAL_STEPS}
        >
          Siguiente
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>

      {showModal && selected && (
        <GuestAssigner table={selected} onClose={() => setShowModal(false)} onSave={updateGuests} />
      )}
    </div>
  );
};

export default TablePlanner;   