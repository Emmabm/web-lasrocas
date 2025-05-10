import React, { useState, useEffect, useRef } from 'react';
import { X, Users, AlertCircle } from 'lucide-react';
import { Table } from '../types/types';

interface GuestAssignerProps {
  table: Table;
  onClose: () => void;
  onSave: (tableId: string, guests: string[]) => void;
}

const GuestAssigner: React.FC<GuestAssignerProps> = ({ table, onClose, onSave }) => {
  const [tableName, setTableName] = useState('');
  const [guestList, setGuestList] = useState<string[]>(table.guests);
  const [newGuest, setNewGuest] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Initialize with existing table name if guests exist
  useEffect(() => {
    if (table.guests.length > 0) {
      setTableName(table.guests[0].split(':')[0] || '');
    }
  }, [table]);
  
  const handleClickOutside = (e: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };
  
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleAddGuest = () => {
    if (newGuest.trim()) {
      setGuestList(prev => [...prev, newGuest.trim()]);
      setNewGuest('');
    }
  };
  
  const handleRemoveGuest = (index: number) => {
    setGuestList(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddGuest();
    }
  };
  
  const handleSave = () => {
    let formattedGuests: string[] = [];
    
    if (tableName && guestList.length > 0) {
      formattedGuests = [`${tableName}: ${guestList.length} invitados`, ...guestList.map(g => `- ${g}`)];
    } else if (guestList.length > 0) {
      formattedGuests = guestList;
    }
    
    onSave(table.id, formattedGuests);
  };
  
  const tooFewGuests = guestList.length > 0 && guestList.length < 8;
  const tooManyGuests = guestList.length > 11;
  const hasWarning = tooFewGuests || tooManyGuests;
  
  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              Mesa {table.id}
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="tableName">
              Nombre de la mesa (opcional)
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
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700" htmlFor="guestInput">
                Invitados
              </label>
              <span className="text-xs text-gray-500">
                {guestList.length} {guestList.length === 1 ? 'invitado' : 'invitados'}
              </span>
            </div>
            <div className="flex">
              <input
                type="text"
                id="guestInput"
                placeholder="Agregar invitado"
                className="flex-1 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
                value={newGuest}
                onChange={(e) => setNewGuest(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button 
                onClick={handleAddGuest}
                className="bg-[#FF6B35] text-white py-2 px-4 rounded-r-md hover:bg-[#FF6B35]/90"
              >
                Agregar
              </button>
            </div>
          </div>
          
          {hasWarning && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-md">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                <div className="text-sm text-red-700">
                  {tooFewGuests && <p>Esta mesa tiene menos de 8 invitados.</p>}
                  {tooManyGuests && <p>Esta mesa tiene más de 11 invitados.</p>}
                </div>
              </div>
            </div>
          )}
          
          {guestList.length > 0 ? (
            <div className="mb-6">
              <div className="bg-gray-50 border border-gray-200 rounded-md overflow-hidden">
                <ul className="divide-y divide-gray-200">
                  {guestList.map((guest, index) => (
                    <li key={index} className="flex items-center justify-between p-3">
                      <span>{guest}</span>
                      <button 
                        onClick={() => handleRemoveGuest(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="mb-6 py-8 flex flex-col items-center justify-center bg-gray-50 border border-dashed border-gray-300 rounded-md">
              <Users className="h-8 w-8 text-gray-400 mb-2" />
              <p className="text-gray-500 text-center">
                No hay invitados asignados a esta mesa
              </p>
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
              className="px-4 py-2 bg-[#FF6B35] text-white rounded-md hover:bg-[#FF6B35]/90"
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