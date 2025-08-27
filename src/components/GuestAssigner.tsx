import React, { useState, useEffect, useRef } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Table } from '../types/types';

interface GuestAssignerProps {
  table: Table;
  onClose: () => void;
  onSave: (
    tableId: string,
    guests: string[],
    descripcion: string,
    numAdults: number,
    numChildren: number,
    tableName?: string
  ) => void;
}

const GuestAssigner: React.FC<GuestAssignerProps> = ({ table, onClose, onSave }) => {
  const [tableName, setTableName] = useState(table.tableName || '');
  const [numAdults, setNumAdults] = useState(table.numAdults ?? 0);
  const [numChildren, setNumChildren] = useState(table.numChildren ?? 0);
  const [details, setDetails] = useState(table.descripcion || '');
  const modalRef = useRef<HTMLDivElement>(null);

  // Inicializar los valores cuando cambia la mesa
  useEffect(() => {
    setTableName(table.isMain ? 'Principal' : (table.tableName || ''));
    setNumAdults(table.numAdults ?? 0);
    setNumChildren(table.numChildren ?? 0);
    setDetails(table.descripcion || '');
    console.log('Inicializando GuestAssigner:', { tableId: table.id, tableName: table.tableName, numAdults: table.numAdults, numChildren: table.numChildren, descripcion: table.descripcion });
  }, [table]);

  // Cerrar modal al hacer clic afuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const totalGuests = numAdults + numChildren;
  const isTooFew = totalGuests < 8;
  const isTooMany = totalGuests > 11;

  const handleSave = () => {
    const formattedGuests: string[] = [];
    if (numAdults > 0) formattedGuests.push(`• ${numAdults} adulto${numAdults !== 1 ? 's' : ''}`);
    if (numChildren > 0) formattedGuests.push(`• ${numChildren} niño${numChildren !== 1 ? 's' : ''}`);
    if (details) formattedGuests.push(`• Detalles: ${details}`);

    console.log('Guardando:', { tableId: table.id, guests: formattedGuests, descripcion: details.trim(), numAdults, numChildren, tableName });

    onSave(
      table.id,
      formattedGuests,
      details.trim(),
      numAdults,
      numChildren,
      table.isMain ? 'Principal' : (tableName.trim() || undefined)
    );
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div ref={modalRef} className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Mesa {table.isMain ? 'Principal' : table.id}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
          </div>

          {!table.isMain && (
            <div className="mb-4">
              <label htmlFor="tableName" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la mesa
              </label>
              <input
                type="text"
                id="tableName"
                placeholder="ej. Familia Pérez"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
              />
            </div>
          )}

          {table.isMain && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la mesa</label>
              <input
                type="text"
                value="Principal"
                disabled
                className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
              />
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="numAdults" className="block text-sm font-medium text-gray-700 mb-1">
              Cantidad de adultos
            </label>
            <input
              type="number"
              id="numAdults"
              min={0}
              className="w-full p-2 border border-gray-300 rounded-md"
              value={numAdults}
              onChange={(e) => setNumAdults(Number(e.target.value) || 0)}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="numChildren" className="block text-sm font-medium text-gray-700 mb-1">
              Cantidad de niños
            </label>
            <input
              type="number"
              id="numChildren"
              min={0}
              className="w-full p-2 border border-gray-300 rounded-md"
              value={numChildren}
              onChange={(e) => setNumChildren(Number(e.target.value) || 0)}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="details" className="block text-sm font-medium text-gray-700 mb-1">
              Detalles especiales (celíacos, etc.)
            </label>
            <textarea
              id="details"
              rows={2}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Ej. 2 celíacos, 1 vegano, 1 bebé..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            ></textarea>
          </div>

          {(isTooFew || isTooMany) && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-md">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                <div className="text-sm text-red-700">
                  {isTooFew
                    ? 'Cada mesa debe tener al menos 8 personas.'
                    : 'Esta mesa tiene más de 11 personas. Por favor reducí la cantidad.'}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isTooFew || isTooMany}
              className={`px-4 py-2 rounded-md text-white ${
                isTooFew || isTooMany
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#FF6B35] hover:bg-[#FF6B35]/90'
              }`}
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestAssigner;