import React, { useState } from 'react';
import { Plus, Trash, Pencil } from 'lucide-react';

interface ScheduleBlock {
  id: number;
  title: string;
  time: string;
}

interface ExternalStaff {
  id: number;
  name: string;
  role: string;
  contact: string;
}

const EventSchedule: React.FC = () => {
  const [schedule, setSchedule] = useState<ScheduleBlock[]>([]);
  const [externalStaff, setExternalStaff] = useState<ExternalStaff[]>([]);

  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('');
  const [editId, setEditId] = useState<number | null>(null);

  const [staffName, setStaffName] = useState('');
  const [staffRole, setStaffRole] = useState('');
  const [staffContact, setStaffContact] = useState('');
  const [editStaffId, setEditStaffId] = useState<number | null>(null);

  const handleAddOrEditSchedule = () => {
    if (!newTitle || !newTime) return;

    if (editId !== null) {
      setSchedule(prev =>
        prev.map(block =>
          block.id === editId ? { ...block, title: newTitle, time: newTime } : block
        )
      );
      setEditId(null);
    } else {
      setSchedule(prev => [
        ...prev,
        { id: Date.now(), title: newTitle, time: newTime }
      ]);
    }

    setNewTitle('');
    setNewTime('');
  };

  const handleEditSchedule = (block: ScheduleBlock) => {
    setNewTitle(block.title);
    setNewTime(block.time);
    setEditId(block.id);
  };

  const handleDeleteSchedule = (id: number) => {
    setSchedule(prev => prev.filter(block => block.id !== id));
  };

  const handleAddOrEditStaff = () => {
    if (!staffName || !staffRole || !staffContact) return;

    if (editStaffId !== null) {
      setExternalStaff(prev =>
        prev.map(staff =>
          staff.id === editStaffId
            ? { ...staff, name: staffName, role: staffRole, contact: staffContact }
            : staff
        )
      );
      setEditStaffId(null);
    } else {
      setExternalStaff(prev => [
        ...prev,
        { id: Date.now(), name: staffName, role: staffRole, contact: staffContact }
      ]);
    }

    setStaffName('');
    setStaffRole('');
    setStaffContact('');
  };

  const handleEditStaff = (staff: ExternalStaff) => {
    setStaffName(staff.name);
    setStaffRole(staff.role);
    setStaffContact(staff.contact);
    setEditStaffId(staff.id);
  };

  const handleDeleteStaff = (id: number) => {
    setExternalStaff(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Organizador del Evento
      </h1>

      {/* Horarios */}
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">{editId ? 'Editar bloque horario' : 'Agregar nuevo horario'}</h2>
        <div className="flex flex-col gap-4">
          <input
            type="text"
            className="border border-gray-300 rounded-md px-4 py-2"
            placeholder="Ej: Llegada de invitados"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
          />
          <input
            type="time"
            className="border border-gray-300 rounded-md px-4 py-2"
            value={newTime}
            onChange={e => setNewTime(e.target.value)}
          />
          <button
            onClick={handleAddOrEditSchedule}
            className="bg-[#FF6B35] text-white px-4 py-2 rounded-md hover:bg-[#FF6B35]/90 flex items-center justify-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            {editId ? 'Guardar cambios' : 'Agregar horario'}
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Horarios Programados</h2>
        {schedule.length === 0 ? (
          <p className="text-gray-500 italic">No has agregado ningún horario.</p>
        ) : (
          <ul className="space-y-4">
            {schedule.map(block => (
              <li key={block.id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-medium">{block.title}</p>
                  <p className="text-sm text-gray-600">{block.time}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEditSchedule(block)} className="text-blue-600">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteSchedule(block.id)} className="text-red-600">
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Staff externo */}
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {editStaffId ? 'Editar colaborador externo' : 'Agregar colaborador externo'}
        </h2>
        <div className="flex flex-col gap-4">
          <input
            type="text"
            className="border border-gray-300 rounded-md px-4 py-2"
            placeholder="Nombre"
            value={staffName}
            onChange={e => setStaffName(e.target.value)}
          />
          <input
            type="text"
            className="border border-gray-300 rounded-md px-4 py-2"
            placeholder="Rol (Ej: Camarógrafo, DJ)"
            value={staffRole}
            onChange={e => setStaffRole(e.target.value)}
          />
          <input
            type="text"
            className="border border-gray-300 rounded-md px-4 py-2"
            placeholder="Contacto (Ej: teléfono o email)"
            value={staffContact}
            onChange={e => setStaffContact(e.target.value)}
          />
          <button
            onClick={handleAddOrEditStaff}
            className="bg-[#FF6B35] text-white px-4 py-2 rounded-md hover:bg-[#FF6B35]/90 flex items-center justify-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            {editStaffId ? 'Guardar cambios' : 'Agregar colaborador'}
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Colaboradores Externos</h2>
        {externalStaff.length === 0 ? (
          <p className="text-gray-500 italic">No has agregado colaboradores aún.</p>
        ) : (
          <ul className="space-y-4">
            {externalStaff.map(staff => (
              <li key={staff.id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-medium">{staff.name}</p>
                  <p className="text-sm text-gray-600">{staff.role} – {staff.contact}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEditStaff(staff)} className="text-blue-600">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteStaff(staff.id)} className="text-red-600">
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default EventSchedule;

