import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../../supabaseClient';
import { useUserContext } from '../../../hooks/useUserContext';
import { Plus, Trash, Pencil } from 'lucide-react';

interface ScheduleBlock {
  id: string;
  title: string;
  time: string;
  user_id: string;
}

interface ExternalStaff {
  id: string;
  name: string;
  role: string;
  contact: string;
  user_id: string;
}

const EventSchedule: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token, setToken } = useUserContext();
  const [schedule, setSchedule] = useState<ScheduleBlock[]>([]);
  const [externalStaff, setExternalStaff] = useState<ExternalStaff[]>([]);
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [contact, setContact] = useState('');
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [eventId, setEventId] = useState<string | null>(null);
  const [eventType, setEventType] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);

  const idGen = useRef(() => crypto.randomUUID());

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error checking auth:', error.message);
        setErrorMessage('Error al verificar autenticación: ' + error.message);
        return;
      }
      setIsAuthenticated(!!session);
      if (session) {
        console.log('Usuario autenticado:', session.user.id);
        setUserId(session.user.id);
      } else {
        setErrorMessage('Usuario no autenticado. Por favor, inicia sesión.');
      }
    };

    const fetchEvent = async () => {
      const params = new URLSearchParams(location.search);
      const tokenParam = params.get('token');
      console.log('Horarios.tsx - Estado del token:', { tokenParam, token });
      
      // Persistir el token en el contexto
      if (tokenParam && token !== tokenParam) {
        setToken(tokenParam);
      }

      if (!tokenParam) {
        setErrorMessage('No se proporcionó un token');
        return;
      }

      const { data, error } = await supabase
        .from('eventos')
        .select('id, tipo, organizador_id')
        .eq('token_acceso', tokenParam)
        .single();

      if (error || !data) {
        console.error('Error fetching event:', error?.message);
        setErrorMessage(`Error al obtener evento: ${error?.message || 'No data'}`);
        return;
      }

      console.log('Evento encontrado:', { id: data.id, tipo: data.tipo, organizador_id: data.organizador_id });
      if (userId && data.organizador_id !== userId) {
        console.error('Mismatch organizador_id:', { event_organizador_id: data.organizador_id, user_id: userId });
        setErrorMessage('No tienes permiso para este evento.');
        return;
      }

      setEventId(data.id);
      setEventType(data.tipo);
    };

    checkAuth();
    if (userId) fetchEvent();
  }, [location.search, userId, setToken, token]);

  useEffect(() => {
    if (!eventId || !isAuthenticated) return;

    const fetchData = async () => {
      console.log('Fetching data for eventId:', eventId);
      const { data: sched, error: schedError } = await supabase
        .from('schedule_blocks')
        .select('*')
        .eq('user_id', String(eventId));
      const { data: staff, error: staffError } = await supabase
        .from('external_staff')
        .select('*')
        .eq('user_id', String(eventId));

      if (schedError) {
        console.error('Error fetching schedule:', schedError.message);
        setErrorMessage(`Error al obtener horarios: ${schedError.message}`);
      }
      if (staffError) {
        console.error('Error fetching staff:', staffError.message);
        setErrorMessage(`Error al obtener personal: ${staffError.message}`);
      }
      if (sched) {
        console.log('Horarios cargados:', sched);
        setSchedule(sched);
      }
      if (staff) {
        console.log('Personal cargado:', staff);
        setExternalStaff(staff);
      }
    };

    fetchData();
  }, [eventId, isAuthenticated]);

  const handleAddOrEditSchedule = () => {
    if (!title || !time || !eventId || !isAuthenticated) {
      const msg = 'Faltan datos: ' + (!title ? 'título, ' : '') + (!time ? 'hora, ' : '') + (!eventId ? 'ID del evento, ' : '') + (!isAuthenticated ? 'autenticación' : '');
      console.error('Error en handleAddOrEditSchedule:', msg);
      setErrorMessage(msg);
      return;
    }

    if (editingScheduleId !== null) {
      console.log('Editando horario en estado:', { id: editingScheduleId, title, time });
      setSchedule(prev =>
        prev.map(block =>
          block.id === editingScheduleId ? { ...block, title, time } : block
        )
      );
    } else {
      const newBlock = { id: idGen.current(), title, time, user_id: String(eventId) };
      console.log('Agregando horario a estado:', newBlock);
      setSchedule(prev => [...prev, newBlock]);
    }

    setTitle('');
    setTime('');
    setEditingScheduleId(null);
    setErrorMessage(null);
  };

  const handleAddOrEditStaff = () => {
    if (!name || !role || !contact || !eventId || !isAuthenticated) {
      const msg = 'Faltan datos: ' + (!name ? 'nombre, ' : '') + (!role ? 'rol, ' : '') + (!contact ? 'contacto, ' : '') + (!eventId ? 'ID del evento, ' : '') + (!isAuthenticated ? 'autenticación' : '');
      console.error('Error en handleAddOrEditStaff:', msg);
      setErrorMessage(msg);
      return;
    }

    if (editingStaffId !== null) {
      console.log('Editando personal en estado:', { id: editingStaffId, name, role, contact });
      setExternalStaff(prev =>
        prev.map(staff =>
          staff.id === editingStaffId ? { ...staff, name, role, contact } : staff
        )
      );
    } else {
      const newStaff = { id: idGen.current(), name, role, contact, user_id: String(eventId) };
      console.log('Agregando personal a estado:', newStaff);
      setExternalStaff(prev => [...prev, newStaff]);
    }

    setName('');
    setRole('');
    setContact('');
    setEditingStaffId(null);
    setErrorMessage(null);
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!eventId || !isAuthenticated) {
      console.error('Error en handleDeleteSchedule: No hay ID de evento o autenticación');
      setErrorMessage('No hay ID de evento o autenticación para eliminar');
      return;
    }
    console.log('Eliminando horario:', { id, user_id: String(eventId) });
    const { error } = await supabase
      .from('schedule_blocks')
      .delete()
      .eq('id', id)
      .eq('user_id', String(eventId));

    if (error) {
      console.error('Error deleting schedule:', error.message);
      setErrorMessage(`Error al eliminar horario: ${error.message}`);
      return;
    }

    setSchedule(prev => prev.filter(b => b.id !== id));
    setErrorMessage(null);
  };

  const handleDeleteStaff = async (id: string) => {
    if (!eventId || !isAuthenticated) {
      console.error('Error en handleDeleteStaff: No hay ID de evento o autenticación');
      setErrorMessage('No hay ID de evento o autenticación para eliminar');
      return;
    }
    console.log('Eliminando personal:', { id, user_id: String(eventId) });
    const { error } = await supabase
      .from('external_staff')
      .delete()
      .eq('id', id)
      .eq('user_id', String(eventId));

    if (error) {
      console.error('Error deleting staff:', error.message);
      setErrorMessage(`Error al eliminar personal: ${error.message}`);
      return;
    }

    setExternalStaff(prev => prev.filter(s => s.id !== id));
    setErrorMessage(null);
  };

  const handleFinalize = async () => {
    const params = new URLSearchParams(location.search);
    const tokenParam = params.get('token');
    if (!eventId || !isAuthenticated || !tokenParam) {
      console.error('Error en handleFinalize: Faltan datos', { eventId, isAuthenticated, token: tokenParam });
      setErrorMessage('No hay ID de evento, autenticación o token para finalizar');
      return;
    }

    if (schedule.length === 0) {
      setErrorMessage('Debes agregar al menos un horario antes de finalizar');
      return;
    }

    console.log('Finalizando evento, guardando:', { schedule, externalStaff });

    // Limpiar datos previos para evitar conflictos
    console.log('Eliminando datos previos para eventId:', eventId);
    await supabase.from('schedule_blocks').delete().eq('user_id', String(eventId));
    await supabase.from('external_staff').delete().eq('user_id', String(eventId));

    // Guardar horarios
    if (schedule.length > 0) {
      console.log('Insertando horarios en Supabase:', schedule);
      const { error } = await supabase.from('schedule_blocks').insert(
        schedule.map(block => ({
          id: block.id,
          title: block.title,
          time: block.time,
          user_id: String(eventId),
        }))
      );
      if (error) {
        console.error('Error al guardar horarios:', error.message);
        setErrorMessage(`Error al guardar horarios: ${error.message}`);
        return;
      }
    }

    // Guardar personal
    if (externalStaff.length > 0) {
      console.log('Insertando personal en Supabase:', externalStaff);
      const { error } = await supabase.from('external_staff').insert(
        externalStaff.map(staff => ({
          id: staff.id,
          name: staff.name,
          role: staff.role,
          contact: staff.contact,
          user_id: String(eventId),
        }))
      );
      if (error) {
        console.error('Error al guardar personal:', error.message);
        setErrorMessage(`Error al guardar personal: ${error.message}`);
        return;
      }
    }

    console.log('Datos guardados correctamente');
    if (eventType?.toLowerCase() === 'fiesta15') {
      console.log('Redirigiendo a /invitados con token:', tokenParam);
      navigate(`/invitados?token=${tokenParam}`);
    } else {
      console.log('Redirigiendo a /thank-you con token:', tokenParam);
      navigate(`/thank-you?token=${tokenParam}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-white">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Organizador del Evento
      </h1>
      {errorMessage && (
        <div className="max-w-2xl mx-auto bg-red-100 text-red-800 p-4 rounded-md mb-4">
          {errorMessage}
        </div>
      )}

      {/* Bloque horario */}
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">{editingScheduleId ? 'Editar bloque horario' : 'Agregar nuevo horario'}</h2>
        <div className="flex flex-col gap-4">
          <input
            type="text"
            className="border px-4 py-2 rounded-md"
            placeholder="Ej: Llegada de invitados"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <input
            type="time"
            className="border px-4 py-2 rounded-md"
            value={time}
            onChange={e => setTime(e.target.value)}
          />
          <button
            onClick={handleAddOrEditSchedule}
            className="bg-[#FF6B35] text-white px-4 py-2 rounded-md hover:bg-[#FF6B35]/90 flex items-center justify-center"
            disabled={!eventId || !isAuthenticated}
          >
            <Plus className="w-4 h-4 mr-2" />
            {editingScheduleId ? 'Guardar cambios' : 'Agregar horario'}
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
                  <button
                    onClick={() => {
                      setTitle(block.title);
                      setTime(block.time);
                      setEditingScheduleId(block.id);
                    }}
                    className="text-blue-600"
                    disabled={!isAuthenticated}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteSchedule(block.id)}
                    className="text-red-600"
                    disabled={!isAuthenticated}
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Colaboradores externos */}
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">{editingStaffId ? 'Editar colaborador externo' : 'Agregar colaborador externo'}</h2>
        <div className="flex flex-col gap-4">
          <input
            type="text"
            className="border px-4 py-2 rounded-md"
            placeholder="Nombre"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <input
            type="text"
            className="border px-4 py-2 rounded-md"
            placeholder="Rol"
            value={role}
            onChange={e => setRole(e.target.value)}
          />
          <input
            type="text"
            className="border px-4 py-2 rounded-md"
            placeholder="Contacto"
            value={contact}
            onChange={e => setContact(e.target.value)}
          />
          <button
            onClick={handleAddOrEditStaff}
            className="bg-[#FF6B35] text-white px-4 py-2 rounded-md hover:bg-[#FF6B35]/90 flex items-center justify-center"
            disabled={!eventId || !isAuthenticated}
          >
            <Plus className="w-4 h-4 mr-2" />
            {editingStaffId ? 'Guardar cambios' : 'Agregar colaborador'}
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6 mb-8">
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
                  <button
                    onClick={() => {
                      setName(staff.name);
                      setRole(staff.role);
                      setContact(staff.contact);
                      setEditingStaffId(staff.id);
                    }}
                    className="text-blue-600"
                    disabled={!isAuthenticated}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteStaff(staff.id)}
                    className="text-red-600"
                    disabled={!isAuthenticated}
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="max-w-2xl mx-auto">
        <button
          onClick={handleFinalize}
          className="bg-[#FF6B35] text-white px-6 py-3 rounded-md hover:bg-[#FF6B35]/90 w-full"
          disabled={!eventId || !isAuthenticated}
        >
          Finalizar
        </button>
      </div>
    </div>
  );
};

export default EventSchedule;
