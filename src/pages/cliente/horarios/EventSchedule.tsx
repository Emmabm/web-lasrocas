import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../../supabaseClient';
import { useUserContext } from '../../../hooks/useUserContext';
import { Plus, Trash, Pencil } from 'lucide-react';

interface ScheduleBlock {
  id: string;
  title: string;
  time: string;
  evento_id: string;
}

interface ExternalStaff {
  id: string;
  name: string;
  role: string;
  contact: string;
  evento_id: string;
}

const EventSchedule: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setToken } = useUserContext();
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
  const [error, setError] = useState<string | null>(null);
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [staffError, setStaffError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [eventoEstado, setEventoEstado] = useState<'activo' | 'inactivo' | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [organizadorId, setOrganizadorId] = useState<string | null>(null);

  const idGen = useRef(() => crypto.randomUUID());

  useEffect(() => {
    const verifyTokenAndFetchData = async () => {
      const params = new URLSearchParams(location.search);
      const tokenParam = params.get('token');

      if (!tokenParam) {
        setError('No se proporcionó un token');
        setLoading(false);
        return;
      }

      try {
        const { data: session } = await supabase.auth.getSession();
        const currentUserId = session.session?.user.id || null;
        setUserId(currentUserId);
        setToken(tokenParam);

        const { data: eventData, error: eventError } = await supabase
          .from('eventos')
          .select('id, tipo, organizador_id, estado')
          .eq('token_acceso', tokenParam)
          .single();

        if (eventError || !eventData) {
          throw new Error('Evento no encontrado');
        }

        setEventId(eventData.id);
        setEventType(eventData.tipo);
        setOrganizadorId(eventData.organizador_id);
        setEventoEstado(eventData.estado);

        // Bloquear si el evento ya está inactivo al cargar la página
        if (eventData.estado === 'inactivo' && (!currentUserId || currentUserId !== eventData.organizador_id)) {
          setModalMessage('El evento está inactivo. No podés realizar modificaciones.');
        }

        setLoading(false);
      } catch (err) {
        if (err instanceof Error) {
          setError(`Error al conectar con la base de datos: ${err.message}`);
        } else {
          setError('Ocurrió un error desconocido.');
          console.error(err);
        }
        setLoading(false);
      }
    };

    verifyTokenAndFetchData();
  }, [location.search, setToken]);

  useEffect(() => {
    if (!eventId) return;

    const subscription = supabase
      .channel('eventos-channel')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'eventos',
          filter: `id=eq.${eventId}`,
        },
        (payload) => {
          if (payload.new.estado !== eventoEstado) {
            setEventoEstado(payload.new.estado);
            if (payload.new.estado === 'inactivo' && (!userId || userId !== organizadorId)) {
              setModalMessage('El evento está inactivo. No podés realizar modificaciones.');
            } else if (payload.new.estado === 'activo') {
              setModalMessage(null);
            }
          }
        }
      )
      .subscribe();

    const fetchItems = async () => {
      const { data: sched, error: schedError } = await supabase
        .from('schedule_blocks')
        .select('*')
        .eq('evento_id', String(eventId));

      const { data: staff, error: staffError } = await supabase
        .from('external_staff')
        .select('*')
        .eq('evento_id', String(eventId));

      if (schedError) {
        setError(`Error al obtener horarios: ${schedError.message}`);
      }
      if (staffError) {
        setError(`Error al obtener personal: ${staffError.message}`);
      }
      if (sched) setSchedule(sched);
      if (staff) setExternalStaff(staff);
    };

    fetchItems();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [eventId, eventoEstado, userId, organizadorId]);

  const isBlocked = eventoEstado === 'inactivo' && (!userId || userId !== organizadorId);

  const handleAddOrEditSchedule = async () => {
    if (isBlocked) {
      setModalMessage('El evento está inactivo. No podés realizar modificaciones.');
      return;
    }

    if (!title.trim() || !time) {
      setScheduleError('Completá todos los campos.');
      return;
    }

    setScheduleError(null);

    if (editingScheduleId !== null) {
      const { error } = await supabase
        .from('schedule_blocks')
        .update({ title, time })
        .eq('id', editingScheduleId)
        .eq('evento_id', String(eventId));
      if (!error) {
        setSchedule(prev =>
          prev.map(block =>
            block.id === editingScheduleId ? { ...block, title, time } : block
          ) as ScheduleBlock[]
        );
      } else {
        setError(`Error al actualizar horario: ${error.message}`);
      }
    } else {
      const newBlock = { id: idGen.current(), title, time, evento_id: String(eventId) };
      const { error } = await supabase.from('schedule_blocks').insert([newBlock]);
      if (!error) {
        setSchedule(prev => [...prev, newBlock]);
      } else {
        setError(`Error al agregar horario: ${error.message}`);
      }
    }

    setTitle('');
    setTime('');
    setEditingScheduleId(null);
  };

  const handleAddOrEditStaff = async () => {
    if (isBlocked) {
      setModalMessage('El evento está inactivo. No podés realizar modificaciones.');
      return;
    }

    if (!name.trim() || !role.trim() || !contact.trim()) {
      setStaffError('Completá todos los campos.');
      return;
    }

    setStaffError(null);

    if (editingStaffId !== null) {
      const { error } = await supabase
        .from('external_staff')
        .update({ name, role, contact })
        .eq('id', editingStaffId)
        .eq('evento_id', String(eventId));
      if (!error) {
        setExternalStaff(prev =>
          prev.map(staff =>
            staff.id === editingStaffId ? { ...staff, name, role, contact } : staff
          ) as ExternalStaff[]
        );
      } else {
        setError(`Error al actualizar colaborador: ${error.message}`);
      }
    } else {
      const newStaff = { id: idGen.current(), name, role, contact, evento_id: String(eventId) };
      const { error } = await supabase.from('external_staff').insert([newStaff]);
      if (!error) {
        setExternalStaff(prev => [...prev, newStaff]);
      } else {
        setError(`Error al agregar colaborador: ${error.message}`);
      }
    }

    setName('');
    setRole('');
    setContact('');
    setEditingStaffId(null);
  };

  const handleDeleteSchedule = async (id: string) => {
    if (isBlocked) {
      setModalMessage('El evento está inactivo. No podés realizar modificaciones.');
      return;
    }
    if (!eventId) {
      setError('No hay ID de evento para eliminar');
      return;
    }

    const { error } = await supabase
      .from('schedule_blocks')
      .delete()
      .eq('id', id)
      .eq('evento_id', String(eventId));

    if (!error) {
      setSchedule(prev => prev.filter(b => b.id !== id));
    } else {
      setError(`Error al eliminar horario: ${error.message}`);
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (isBlocked) {
      setModalMessage('El evento está inactivo. No podés realizar modificaciones.');
      return;
    }
    if (!eventId) {
      setError('No hay ID de evento para eliminar');
      return;
    }

    const { error } = await supabase
      .from('external_staff')
      .delete()
      .eq('id', id)
      .eq('evento_id', String(eventId));

    if (!error) {
      setExternalStaff(prev => prev.filter(s => s.id !== id));
    } else {
      setError(`Error al eliminar colaborador: ${error.message}`);
    }
  };

  const handleFinalize = async () => {
    if (isBlocked) {
      setModalMessage('El evento está inactivo. No podés realizar modificaciones.');
      return;
    }

    const params = new URLSearchParams(location.search);
    const tokenParam = params.get('token');
    if (!eventId || !tokenParam) {
      setError('No hay datos suficientes para finalizar');
      return;
    }

    if (schedule.length === 0) {
      setError('Debes agregar al menos un horario antes de finalizar');
      return;
    }

    await supabase.from('schedule_blocks').delete().eq('evento_id', String(eventId));
    await supabase.from('external_staff').delete().eq('evento_id', String(eventId));

    if (schedule.length > 0) {
      const { error } = await supabase.from('schedule_blocks').insert(
        schedule.map(block => ({
          id: block.id,
          title: block.title,
          time: block.time,
          evento_id: String(eventId),
        }))
      );
      if (error) {
        setError(`Error al guardar horarios: ${error.message}`);
        return;
      }
    }

    if (externalStaff.length > 0) {
      const { error } = await supabase.from('external_staff').insert(
        externalStaff.map(staff => ({
          id: staff.id,
          name: staff.name,
          role: staff.role,
          contact: staff.contact,
          evento_id: String(eventId),
        }))
      );
      if (error) {
        setError(`Error al guardar personal: ${error.message}`);
        return;
      }
    }

    if (eventType?.toLowerCase() === 'fiesta15') {
      navigate(`/invitados?token=${tokenParam}`);
    } else {
      navigate(`/thank-you?token=${tokenParam}`);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center text-gray-700 text-xl">Cargando...</div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center text-red-500 text-xl">{error}</div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 bg-white" style={{ pointerEvents: isBlocked ? 'none' : 'auto' }}>
      {modalMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style={{ pointerEvents: 'auto' }}>
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Atención</h3>
            <p className="text-gray-600 mb-6">{modalMessage}</p>
            <button
              className="bg-[#FF6B35] text-white px-4 py-2 rounded-md hover:bg-[#FF6B35]/90 w-full transition-colors"
              onClick={() => setModalMessage(null)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
      {isBlocked && !modalMessage && (
        <div className="fixed inset-0 z-40 bg-transparent" />
      )}
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Organizador del Evento
      </h1>
      {error && (
        <div className="max-w-2xl mx-auto bg-red-100 text-red-800 p-4 rounded-md mb-4">
          {error}
        </div>
      )}
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">{editingScheduleId ? 'Editar bloque horario' : 'Agregar nuevo horario'}</h2>
        <p className="text-sm text-gray-800 font-bold mb-4">
          "Agendá solo lo esencial (evento aprox. 8 horas): recepción, civil, cena, brindis, vals, torta, baile y final."
        </p>
        <div className="flex flex-col gap-4">
          <input
            type="text"
            className={`border px-4 py-2 rounded-md ${isBlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
            placeholder="Ej: Llegada de invitados"
            value={title}
            onChange={e => !isBlocked && setTitle(e.target.value)}
            disabled={isBlocked}
          />
          <input
            type="time"
            className={`border px-4 py-2 rounded-md ${isBlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
            value={time}
            onChange={e => !isBlocked && setTime(e.target.value)}
            disabled={isBlocked}
          />
          <button
            onClick={() => {
              if (isBlocked) {
                setModalMessage('El evento está inactivo. No podés realizar modificaciones.');
                return;
              }
              handleAddOrEditSchedule();
            }}
            className={`bg-[#FF6B35] text-white px-4 py-2 rounded-md hover:bg-[#FF6B35]/90 flex items-center justify-center ${isBlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isBlocked}
          >
            <Plus className="w-4 h-4 mr-2" />
            {editingScheduleId ? 'Guardar cambios' : 'Agregar horario'}
          </button>
          {scheduleError && (
            <p className="text-red-500 text-sm">{scheduleError}</p>
          )}
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
                      if (isBlocked) {
                        setModalMessage('El evento está inactivo. No podés realizar modificaciones.');
                        return;
                      }
                      setTitle(block.title);
                      setTime(block.time);
                      setEditingScheduleId(block.id);
                    }}
                    className={`text-blue-600 ${isBlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isBlocked}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (isBlocked) {
                        setModalMessage('El evento está inactivo. No podés realizar modificaciones.');
                        return;
                      }
                      handleDeleteSchedule(block.id);
                    }}
                    className={`text-red-600 ${isBlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isBlocked}
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">{editingStaffId ? 'Editar colaborador externo' : 'Agregar colaborador externo'}</h2>
        <div className="flex flex-col gap-4">
          <input
            type="text"
            className={`border px-4 py-2 rounded-md ${isBlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
            placeholder="Nombre"
            value={name}
            onChange={e => !isBlocked && setName(e.target.value)}
            disabled={isBlocked}
          />
          <input
            type="text"
            className={`border px-4 py-2 rounded-md ${isBlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
            placeholder="Rol"
            value={role}
            onChange={e => !isBlocked && setRole(e.target.value)}
            disabled={isBlocked}
          />
          <input
            type="text"
            className={`border px-4 py-2 rounded-md ${isBlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
            placeholder="Contacto"
            value={contact}
            onChange={e => !isBlocked && setContact(e.target.value)}
            disabled={isBlocked}
          />
          <button
            onClick={() => {
              if (isBlocked) {
                setModalMessage('El evento está inactivo. No podés realizar modificaciones.');
                return;
              }
              handleAddOrEditStaff();
            }}
            className={`bg-[#FF6B35] text-white px-4 py-2 rounded-md hover:bg-[#FF6B35]/90 flex items-center justify-center ${isBlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isBlocked}
          >
            <Plus className="w-4 h-4 mr-2" />
            {editingStaffId ? 'Guardar cambios' : 'Agregar colaborador'}
          </button>
          {staffError && (
            <p className="text-red-500 text-sm">{staffError}</p>
          )}
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
                      if (isBlocked) {
                        setModalMessage('El evento está inactivo. No podés realizar modificaciones.');
                        return;
                      }
                      setName(staff.name);
                      setRole(staff.role);
                      setContact(staff.contact);
                      setEditingStaffId(staff.id);
                    }}
                    className={`text-blue-600 ${isBlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isBlocked}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (isBlocked) {
                        setModalMessage('El evento está inactivo. No podés realizar modificaciones.');
                        return;
                      }
                      handleDeleteStaff(staff.id);
                    }}
                    className={`text-red-600 ${isBlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isBlocked}
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
          onClick={() => {
            if (isBlocked) {
              setModalMessage('El evento está inactivo. No podés realizar modificaciones.');
              return;
            }
            handleFinalize();
          }}
          className={`bg-[#FF6B35] text-white px-6 py-3 rounded-md w-full hover:bg-[#FF6B35]/90 transition-colors ${isBlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isBlocked}
        >
          Finalizar
        </button>
      </div>
    </div>
  );
};

export default EventSchedule;