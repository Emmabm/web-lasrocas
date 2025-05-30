// -----------------------------
// TablePlanner.tsx – 24 mesas 6‑6‑5‑4‑3 + Escenario, DJ, Oficina y Pasarela
// -----------------------------
import React, { useState } from 'react';
import { AlertCircle, Save, ChevronRight } from 'lucide-react';
import FloorPlan from '../components/FloorPlan';
import GuestAssigner from '../components/GuestAssigner';

import { Table } from '../types/types';

/*****  Coordenadas base  *****/
const ORIGIN_X = 160;
const ORIGIN_Y = 120;
const COL_SPACING = 120;
const ROW_SPACING = 110;
const CIRCLE_SIZE = 70;

/*****  Helpers  *****/
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
  isUsed: false,    // Sin centro de mesa por defecto
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

/*****  Distribución de elementos  *****/
const initialTables: Table[] = [
  // Elementos fijos
  createFixed(
    'ESCENARIO',
    ORIGIN_X + COL_SPACING * 2.5,
    ORIGIN_Y - ROW_SPACING / 0,
    COL_SPACING * 3,
    60,
  ),
  createFixed('DJ', ORIGIN_X - 90 + 30, ORIGIN_Y + ROW_SPACING * 4, 110, 110),
  createFixed('OFICINA', ORIGIN_X + COL_SPACING * 5 + 30, ORIGIN_Y + ROW_SPACING * 4, 110, 110),
  createFixed(
    'PASARELA',
    ORIGIN_X - 90 + (COL_SPACING * 6.2) / 2,
    ORIGIN_Y + ROW_SPACING * 4 + CIRCLE_SIZE / 2 + 10,
    COL_SPACING * 5,
    15,
  ),
  // Mesas circulares
  ...Array.from({ length: 6 }, (_, i) => createTable(`M${i + 1}`, i, 0)),
  ...Array.from({ length: 6 }, (_, i) => createTable(`M${i + 7}`, i, 1)),
  ...Array.from({ length: 5 }, (_, i) => createTable(`M${i + 13}`, i, 2)),
  ...Array.from({ length: 4 }, (_, i) => createTable(`M${i + 18}`, i + 1, 3)),
  ...Array.from({ length: 3 }, (_, i) => createTable(`M${i + 22}`, i + 2, 4)),
];

// Opciones de decoración
const tableclothColors = [
  { id: 'white', name: 'Blanco', value: '#FFFFFF' },
  { id: 'ivory', name: 'Marfil', value: '#FFFFF0' },
  { id: 'beige', name: 'Beige', value: '#F5F5DC' },
  { id: 'gold', name: 'Dorado', value: '#FFD700' },
  { id: 'silver', name: 'Plateado', value: '#C0C0C0' },
  { id: 'burgundy', name: 'Borgoña', value: '#800020' },
];

const centerpieceOptions = [
  { id: 'none', name: 'Ninguno' },
  { id: 'flowers', name: 'Flores frescas' },
  { id: 'candles', name: 'Velas' },
  { id: 'fruit', name: 'Fruta' },
  { id: 'modern', name: 'Centro moderno' },
  { id: 'rustic', name: 'Centro rústico' },
];

const TOTAL_STEPS = 2;

const TablePlanner: React.FC = () => {
  const [tables, setTables] = useState<Table[]>(initialTables);
  const [selected, setSelected] = useState<Table | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saved, setSaved] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

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

  const updateDecoration = (id: string, tableclothColor: string, centerpiece: string) => {
    setTables(prev => prev.map(t => (t.id === id ? { ...t, tableclothColor, centerpiece } : t)));
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
          {/* Sidebar */}
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

          {/* Plano */}
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
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6">Decoración de Mesas</h2>
          
          <div className="space-y-8">
            {tables.filter(t => t.isAssignable).map(table => (
              <div key={table.id} className="border rounded-lg p-4">
                <h3 className="font-medium mb-4">Mesa {table.id}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Color de mantel */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Color de mantel</h4>
                    <div className="flex flex-wrap gap-2">
                      {tableclothColors.map(color => (
                        <button
                          key={color.id}
                          className={`w-10 h-10 rounded-full border-2 ${table.tableclothColor === color.value ? 'border-[#FF6B35]' : 'border-gray-200'}`}
                          style={{ backgroundColor: color.value }}
                          onClick={() => updateDecoration(table.id, color.value, table.centerpiece ?? 'none')}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                  
                  {/* Centro de mesa */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Centro de mesa</h4>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={table.centerpiece}
                      onChange={(e) => updateDecoration(table.id, table.tableclothColor ?? '', e.target.value)}
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
            ))}
          </div>
        </div>
      )}

      {/* Navigation buttons */}
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