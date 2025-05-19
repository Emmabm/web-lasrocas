// -----------------------------
// TablePlanner.tsx – 24 mesas 6‑6‑5‑4‑3 + Escenario, DJ, Oficina y Pasarela
// -----------------------------
import React, { useState } from 'react';
import { AlertCircle, Save } from 'lucide-react';
import FloorPlan from '../components/FloorPlan';
import GuestAssigner from '../components/GuestAssigner';
import TableSummary from '../components/TableSummary';
import { Table } from '../types/types';

/*****  Coordenadas base  *****/
const ORIGIN_X = 160;    // margen izquierdo visual
const ORIGIN_Y =120;    // margen superior de la primera fila
const COL_SPACING =120;//separación horizontal entre centros
const ROW_SPACING = 110;           // separación vertical entre centros
const CIRCLE_SIZE = 70;        // diámetro de las mesas

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

/*****  Distribución de elementos  *****/
//   Filas de mesas: 6,6,5,4,3  (de arriba hacia abajo)
//   DJ (izq)  |  Pasarela  |  Oficina (der)   – todos alineados en la parte baja
//   Escenario arriba centrado, ligeramente separado de la fila 0

const initialTables: Table[] = [
  // ── Elementos fijos ──────────────────────────────────────────
  // Escenario centrado sobre las 6 mesas superiores
  createFixed(
    'ESCENARIO',
    ORIGIN_X + COL_SPACING * 2.5,          // centro entre col 2‑3   (0‑5 totales)
    ORIGIN_Y - ROW_SPACING /0,            // media fila arriba (visible)
    COL_SPACING * 3,                       // ancho ≈ 3 mesas
    60,
  ),

  // DJ y Oficina ocupan la misma fila que la última línea de mesas (fila 4)
  createFixed('DJ', ORIGIN_X - 90 + 30, ORIGIN_Y + ROW_SPACING * 4, 100, 100),
  createFixed('OFICINA', ORIGIN_X + COL_SPACING * 5 + 30, ORIGIN_Y + ROW_SPACING * 4, 100, 100),

  // Pasarela conecta la parte baja entre DJ y Oficina
  createFixed(
    'PASARELA',
    ORIGIN_X - 90 + (COL_SPACING * 6.2) / 2, // centro entre extremos
    ORIGIN_Y + ROW_SPACING * 4 + CIRCLE_SIZE / 2 + 10, // justo bajo la fila 4
    COL_SPACING * 5,                        // alcanza de DJ a Oficina
    15,
  ),

  // ── Mesas circulares ─────────────────────────────────────────
  // Fila 0 (6 mesas)
  ...Array.from({ length: 6 }, (_, i) => createTable(`M${i + 1}`, i, 0)),
  // Fila 1 (6 mesas)
  ...Array.from({ length: 6 }, (_, i) => createTable(`M${i + 7}`, i, 1)),
  // Fila 2 (5 mesas, columnas 0‑4)
  ...Array.from({ length: 5 }, (_, i) => createTable(`M${i + 13}`, i, 2)),
  // Fila 3 (4 mesas, columnas 1‑4)
  ...Array.from({ length: 4 }, (_, i) => createTable(`M${i + 18}`, i + 1, 3)),
  // Fila 4 (3 mesas, columnas 2‑4)
  ...Array.from({ length: 3 }, (_, i) => createTable(`M${i + 22}`, i + 2, 4)),
];

/*****  Componente principal  *****/
const TablePlanner: React.FC = () => {
  const [tables, setTables] = useState<Table[]>(initialTables);
  const [selected, setSelected] = useState<Table | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saved, setSaved] = useState(false);

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

  const used     = tables.filter(t => t.isAssignable && t.isUsed);
  const warnings = tables.filter(t => t.isAssignable && (t.guests.length < 8 || t.guests.length > 11));

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-6">Comanda de Armado</h1>

      {saved && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center z-50">
          <span className="mr-2 font-medium">¡Guardado exitosamente!</span>
          <button className="text-green-700" onClick={() => setSaved(false)}>×</button>
        </div>
      )}

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

            <TableSummary tables={tables.filter(t => t.isAssignable)} onTableSelect={selectTable} />

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

      {showModal && selected && (
        <GuestAssigner table={selected} onClose={() => setShowModal(false)} onSave={updateGuests} />
      )}
    </div>
  );
};

export default TablePlanner;