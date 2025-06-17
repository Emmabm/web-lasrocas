import React, { useState, useEffect, useRef } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Table } from '../types/types';

interface GuestAssignerProps {
  table: Table;
  onClose: () => void;
  onSave: (tableId: string, guests: string[]) => void;
}

const GuestAssigner: React.FC<GuestAssignerProps> = ({ table, onClose, onSave }) => {
  const [tableName, setTableName] = useState('');
  const [numAdults, setNumAdults] = useState(table.numAdults || 0);
  const [numChildren, setNumChildren] = useState(table.numChildren || 0);
  const [details, setDetails] = useState(table.details || '');
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (table.guests.length > 0) {
      const [firstLine] = table.guests;
      const parts = firstLine.split(':');
      if (parts.length > 1) {
        setTableName(parts[0].trim());
      }
    }
  }, [table]);

  const handleClickOutside = (e: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalGuests = numAdults + numChildren;
  const isTooMany = totalGuests > 11;

  const handleSave = () => {
    const formattedGuests: string[] = [];
    table.tableName = tableName;
    table.numAdults = numAdults;
    table.numChildren = numChildren;
    table.details = details;

    onSave(table.id, formattedGuests);
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Mesa {table.id}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="tableName">
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

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="numAdults">
              Cantidad de adultos
            </label>
            <input
              type="number"
              id="numAdults"
              min={0}
              className="w-full p-2 border border-gray-300 rounded-md"
              value={numAdults}
              onChange={(e) => setNumAdults(Number(e.target.value))}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="numChildren">
              Cantidad de niños
            </label>
            <input
              type="number"
              id="numChildren"
              min={0}
              className="w-full p-2 border border-gray-300 rounded-md"
              value={numChildren}
              onChange={(e) => setNumChildren(Number(e.target.value))}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="details">
              Detalles especiales (celíacos, etc.)
            </label>
            <textarea
              id="details"
              rows={2}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Ej. 2 celíacos, 1 vegano..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            ></textarea>
          </div>

          {isTooMany && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-md">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                <div className="text-sm text-red-700">
                  Esta mesa tiene más de 11 personas. Por favor reducí la cantidad.
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
              disabled={isTooMany}
              className={`px-4 py-2 rounded-md text-white ${
                isTooMany
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