import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Table } from '../types/types';

interface GuestGroup {
  id?: string;
  name: string;
  numAdults: number;
  numChildren: number;
  numBabies: number;
  details: string;
}

interface GuestAssignerProps {
  table: Table;
  onClose: () => void;
  onSave: (
    tableId: string,
    guestGroups: GuestGroup[],
    numAdults: number,
    numChildren: number,
    numBabies: number
  ) => void;
  isBlocked: boolean;
  onBlockedAction: () => void;
}

const MIN_GUESTS = 8;
const MAX_GUESTS = 11;
const MIN_GUESTS_MAIN = 2;
const MAX_GUESTS_MAIN = 15;

const GuestAssigner: React.FC<GuestAssignerProps> = ({ table, onClose, onSave, isBlocked, onBlockedAction }) => {
  const [guestGroups, setGuestGroups] = useState<GuestGroup[]>([]);
  const [newGroup, setNewGroup] = useState<Omit<GuestGroup, 'id'>>({
    name: '',
    numAdults: 0,
    numChildren: 0,
    numBabies: 0,
    details: ''
  });
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (table.guestGroups && table.guestGroups.length > 0) {
      setGuestGroups(table.guestGroups);
    } else {
      setGuestGroups([]);
    }
    setNewGroup({
      name: '',
      numAdults: 0,
      numChildren: 0,
      numBabies: 0,
      details: ''
    });
  }, [table]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const totalGuests = useMemo(() =>
    guestGroups.reduce((sum, group) => sum + group.numAdults + group.numChildren + group.numBabies, 0),
    [guestGroups]
  );

  const totalNewGroupGuests = useMemo(() =>
    newGroup.numAdults + newGroup.numChildren + newGroup.numBabies,
    [newGroup.numAdults, newGroup.numChildren, newGroup.numBabies]
  );

  const handleAddGroup = () => {
    if (isBlocked) {
      onBlockedAction();
      return;
    }
    const totalNewGroup = newGroup.numAdults + newGroup.numChildren + newGroup.numBabies;
    if (newGroup.name.trim() === '' || totalNewGroup === 0) {
      return;
    }
    setGuestGroups(prev => [
      ...prev,
      {
        ...newGroup,
        id: Math.random().toString(36).substring(7),
        name: newGroup.name.trim()
      }
    ]);
    setNewGroup({
      name: '',
      numAdults: 0,
      numChildren: 0,
      numBabies: 0,
      details: ''
    });
  };

  const handleRemoveGroup = (idToRemove: string) => {
    if (isBlocked) {
      onBlockedAction();
      return;
    }
    setGuestGroups(prev => prev.filter(group => group.id !== idToRemove));
  };

  const handleSave = () => {
    if (isBlocked) {
      onBlockedAction();
      return;
    }
    const totalAdults = guestGroups.reduce((sum, group) => sum + group.numAdults, 0);
    const totalChildren = guestGroups.reduce((sum, group) => sum + group.numChildren, 0);
    const totalBabies = guestGroups.reduce((sum, group) => sum + group.numBabies, 0);

    const minGuests = table.isMain ? MIN_GUESTS_MAIN : MIN_GUESTS;
    const maxGuests = table.isMain ? MAX_GUESTS_MAIN : MAX_GUESTS;

    // Allow saving if totalGuests is 0 or within valid range
    if (totalGuests > 0 && (totalGuests < minGuests || totalGuests > maxGuests)) {
      return;
    }

    onSave(
      table.id,
      guestGroups,
      totalAdults,
      totalChildren,
      totalBabies
    );
  };

  const minGuests = table.isMain ? MIN_GUESTS_MAIN : MIN_GUESTS;
  const maxGuests = table.isMain ? MAX_GUESTS_MAIN : MAX_GUESTS;

  const isAddButtonDisabled = isBlocked ||
    newGroup.name.trim() === '' ||
    (newGroup.numAdults + newGroup.numChildren + newGroup.numBabies) === 0 ||
    (totalGuests + (newGroup.numAdults + newGroup.numChildren + newGroup.numBabies) > maxGuests);

  const isSaveButtonDisabled = isBlocked || (totalGuests > 0 && (totalGuests < minGuests || totalGuests > maxGuests));

  const getLimitMessage = () => {
    if (isBlocked) return 'El evento está inactivo. No podés realizar modificaciones.';
    return `Total de personas por mesa: mínimo ${minGuests}, máximo ${maxGuests}. Actualmente: ${totalGuests + totalNewGroupGuests} persona(s).`;
  };

  const getSaveMessage = () => {
    if (isBlocked) return 'El evento está inactivo. No podés realizar modificaciones.';
    if (totalGuests > 0 && totalGuests < minGuests) return `No se puede guardar una mesa con menos de ${minGuests} personas.`;
    if (totalGuests > maxGuests) return `No se puede guardar una mesa con más de ${maxGuests} personas.`;
    return '';
  };

  const limitMessage = getLimitMessage();
  const saveMessage = getSaveMessage();

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-[60] p-4">
      <div ref={modalRef} className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {table.isMain ? 'Mesa Principal' : table.tableName ? `Mesa ${table.tableName}` : 'Mesa sin asignar'}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-800">Grupos asignados ({totalGuests}/{maxGuests})</h3>
            <ul className="mt-2 space-y-2">
              {guestGroups.length > 0 ? (
                guestGroups.map((group) => (
                  <li key={group.id} className="flex justify-between items-center p-3 bg-gray-100 rounded-md">
                    <div>
                      <p className="font-semibold">{group.name}</p>
                      <p className="text-sm text-gray-600">
                        {group.numAdults} adulto(s), {group.numChildren} niño(s), {group.numBabies} bebé(s)
                      </p>
                      {group.details && <p className="text-xs text-gray-500 mt-1">Detalles: {group.details}</p>}
                    </div>
                    <button
                      onClick={() => handleRemoveGroup(group.id!)}
                      className={`text-red-500 hover:text-red-700 ${isBlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={isBlocked}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))
              ) : (
                <p className="text-gray-500 text-sm italic">Esta mesa no tiene invitados asignados.</p>
              )}
            </ul>
          </div>
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-medium text-gray-800 mb-3">Agregar nuevo grupo</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nombre y apellido"
                className={`w-full p-2 border border-gray-300 rounded-md ${isBlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                value={newGroup.name}
                onChange={(e) => isBlocked ? onBlockedAction() : setNewGroup({ ...newGroup, name: e.target.value })}
                disabled={isBlocked}
              />
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adultos</label>
                  <input
                    type="number"
                    min={0}
                    className={`w-full p-2 border border-gray-300 rounded-md ${isBlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                    value={newGroup.numAdults}
                    onChange={(e) => isBlocked ? onBlockedAction() : setNewGroup({ ...newGroup, numAdults: Number(e.target.value) || 0 })}
                    disabled={isBlocked}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Niños</label>
                  <input
                    type="number"
                    min={0}
                    className={`w-full p-2 border border-gray-300 rounded-md ${isBlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                    value={newGroup.numChildren}
                    onChange={(e) => isBlocked ? onBlockedAction() : setNewGroup({ ...newGroup, numChildren: Number(e.target.value) || 0 })}
                    disabled={isBlocked}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bebés</label>
                  <input
                    type="number"
                    min={0}
                    className={`w-full p-2 border border-gray-300 rounded-md ${isBlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                    value={newGroup.numAdults}
                    onChange={(e) => isBlocked ? onBlockedAction() : setNewGroup({ ...newGroup, numBabies: Number(e.target.value) || 0 })}
                    disabled={isBlocked}
                  />
                </div>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-md">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                  <div className="text-sm text-blue-700">
                    {limitMessage}
                  </div>
                </div>
              </div>
              <textarea
                rows={2}
                className={`w-full p-2 border border-gray-300 rounded-md ${isBlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                placeholder="Detalles especiales (celíacos, veganos, etc.)"
                value={newGroup.details}
                onChange={(e) => isBlocked ? onBlockedAction() : setNewGroup({ ...newGroup, details: e.target.value })}
                disabled={isBlocked}
              />
              <button
                onClick={handleAddGroup}
                className={`w-full px-4 py-2 rounded-md font-medium transition-colors ${isAddButtonDisabled ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#FF6B35] text-white hover:bg-[#FF6B35]/90'}`}
                disabled={isAddButtonDisabled}
              >
                Agregar Grupo
              </button>
            </div>
          </div>
          {saveMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-md mt-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                <div className="text-sm text-red-700">
                  {saveMessage}
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-between mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaveButtonDisabled}
              className={`px-4 py-2 rounded-md text-white ${isSaveButtonDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#FF6B35] hover:bg-[#FF6B35]/90'}`}
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