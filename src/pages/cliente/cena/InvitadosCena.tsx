import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../../supabaseClient';
import { useUserContext } from '../../../hooks/useUserContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, CheckCircle, Eye, Trash, X, ChevronRight } from 'lucide-react';

interface InvitadoCena {
    id: string;
    nombre_apellido: string;
    num_adultos: number;
    num_ninos: number;
    num_bebes: number;
    observaciones?: string | null;
}

const InvitadosCena: React.FC = () => {
    const { token: contextToken, setPaso, setMenuSeleccionado } = useUserContext();
    const navigate = useNavigate();
    const location = useLocation();

    const [invitados, setInvitados] = useState<InvitadoCena[]>([]);
    const [nombreApellido, setNombreApellido] = useState('');
    const [numAdultos, setNumAdultos] = useState(1);
    const [numNinos, setNumNinos] = useState(0);
    const [numBebes, setNumBebes] = useState(0);
    const [observaciones, setObservaciones] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [eventoId, setEventoId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isOrganizer, setIsOrganizer] = useState(false);
    const [eventoEstado, setEventoEstado] = useState<'activo' | 'inactivo' | null>(null);

    // Calcular totales de adultos, niños y bebés
    const totales = useMemo(() => {
        return invitados.reduce(
            (acc, inv) => ({
                adultos: acc.adultos + (inv.num_adultos || 0),
                ninos: acc.ninos + (inv.num_ninos || 0),
                bebes: acc.bebes + (inv.num_bebes || 0),
            }),
            { adultos: 0, ninos: 0, bebes: 0 }
        );
    }, [invitados]);

    useEffect(() => {
        setPaso('cena');
        setMenuSeleccionado('menu4');

        const fetchEventAndInvitados = async () => {
            setLoading(true);
            
            const params = new URLSearchParams(location.search);
            const urlToken = params.get('token');
            const finalToken = urlToken || contextToken;

            if (!finalToken) {
                setError('No se proporcionó un token de acceso. Por favor, volvé al inicio.');
                setLoading(false);
                navigate('/cliente');
                return;
            }

            // Determinar si el usuario es organizador (sin urlToken)
            setIsOrganizer(!urlToken);

            try {
                const { data: eventData, error: eventError } = await supabase
                    .from('eventos')
                    .select('id, catering_confirmado, estado')
                    .eq('token_acceso', finalToken)
                    .single();

                if (eventError || !eventData) {
                    throw new Error(eventError?.message || 'Evento no encontrado. Verificá el token de acceso.');
                }

                setEventoId(eventData.id);
                setEventoEstado(eventData.estado);

                if (!isOrganizer && eventData.estado === 'inactivo') {
                    setError('El evento está inactivo. No podés realizar modificaciones.');
                    // Continúa cargando datos para visualización
                }

                if (!eventData.catering_confirmado) {
                    setError('El catering no ha sido confirmado aún. Por favor, completa el resumen del catering primero.');
                    setLoading(false);
                    return;
                }

                const { data: invitadosData, error: invitadosError } = await supabase
                    .from('invitados_cena')
                    .select('id, nombre_apellido, num_adultos, num_ninos, num_bebes, observaciones')
                    .eq('evento_id', eventData.id);

                if (invitadosError) {
                    throw invitadosError;
                }

                setInvitados(invitadosData || []);

            } catch (err: any) {
                console.error('Error al cargar datos:', err.message);
                setError(`Error al cargar datos: ${err.message}.`);
            } finally {
                setLoading(false);
            }
        };
        fetchEventAndInvitados();
    }, [contextToken, location.search, setPaso, setMenuSeleccionado, navigate]);

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!eventoId || !nombreApellido.trim()) {
            setError('Por favor, completa el nombre y apellido.');
            return;
        }

        if (!isOrganizer && eventoEstado === 'inactivo') {
            setError('El evento está inactivo. No podés realizar modificaciones.');
            return;
        }

        try {
            const { error } = await supabase.from('invitados_cena').insert({
                evento_id: eventoId,
                nombre_apellido: nombreApellido.trim(),
                num_adultos: numAdultos,
                num_ninos: numNinos,
                num_bebes: numBebes,
                observaciones: observaciones.trim() || null,
            });
            if (error) throw error;
            setNombreApellido('');
            setNumAdultos(1);
            setNumNinos(0);
            setNumBebes(0);
            setObservaciones('');
            const { data, error: fetchError } = await supabase
                .from('invitados_cena')
                .select('id, nombre_apellido, num_adultos, num_ninos, num_bebes, observaciones')
                .eq('evento_id', eventoId);
            if (fetchError) throw fetchError;
            setInvitados(data || []);
        } catch (error: any) {
            console.error('Error al guardar invitado:', error.message);
            setError('Error al guardar el invitado. Por favor, intentá de nuevo.');
        }
    };

    const handleDelete = async (id: string) => {
        if (!isOrganizer && eventoEstado === 'inactivo') {
            setError('El evento está inactivo. No podés realizar modificaciones.');
            return;
        }

        try {
            const { error } = await supabase
                .from('invitados_cena')
                .delete()
                .eq('id', id);

            if (error) {
                throw error;
            }
            setInvitados(prevInvitados => prevInvitados.filter(inv => inv.id !== id));
        } catch (error: any) {
            console.error('Error al eliminar el invitado:', error.message);
            setError('Error al eliminar el invitado. Por favor, intentá de nuevo.');
        }
    };

    const handleNavigateToHorarios = async () => {
        const params = new URLSearchParams(location.search);
        const urlToken = params.get('token');
        const finalToken = urlToken || contextToken;

        if (!finalToken) {
            setError('No se proporcionó un token de acceso.');
            return;
        }

        if (!eventoId) {
            setError('La aplicación aún está cargando. Por favor, esperá un momento y volvé a intentar.');
            return;
        }

        if (!isOrganizer && eventoEstado === 'inactivo') {
            setError('El evento está inactivo. No podés realizar modificaciones.');
            return;
        }

        navigate(`/horarios?token=${encodeURIComponent(finalToken)}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 to-white">
                <div className="text-center text-gray-700 text-xl font-serif">Cargando...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 to-white">
                <div className="text-center text-red-500 text-xl font-serif">{error}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex justify-center p-6">
            <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl p-10">
                <h1 className="text-5xl font-serif font-bold text-center text-gray-800 mb-8">
                    Invitados a la Cena
                </h1>
                <p className="text-center text-gray-600 text-lg mb-8">
                    "Esta sección está destinada a los invitados que participarán de la cena.
                    Aquí podrán registrar el nombre del responsable de la familia y la cantidad de
                    adultos, niños y bebés que lo acompañarán."
                </p>
                <div className="bg-orange-100 border-2 border-[#FF6B35] rounded-2xl p-8 shadow-md mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Agregar invitado</h2>
                    <form onSubmit={handleSave} className="space-y-6">
                        <div>
                            <label htmlFor="nombreApellido" className="block text-sm font-semibold text-gray-700 mb-2">
                                Nombre y Apellido
                            </label>
                            <input
                                id="nombreApellido"
                                type="text"
                                value={nombreApellido}
                                onChange={(e) => setNombreApellido(e.target.value)}
                                placeholder="Ej. Juan Pérez"
                                className="w-full border-2 border-gray-300 rounded-md p-3 focus:outline-none focus:border-[#FF6B35] transition-colors"
                                required
                                disabled={!isOrganizer && eventoEstado === 'inactivo'}
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div>
                                <label htmlFor="numAdultos" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Adultos
                                </label>
                                <input
                                    id="numAdultos"
                                    type="number"
                                    min="1"
                                    value={numAdultos}
                                    onChange={(e) => setNumAdultos(Math.max(1, parseInt(e.target.value) || 1))}
                                    className="w-full border-2 border-gray-300 rounded-md p-3 focus:outline-none focus:border-[#FF6B35] transition-colors"
                                    disabled={!isOrganizer && eventoEstado === 'inactivo'}
                                />
                            </div>
                            <div>
                                <label htmlFor="numNinos" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Niños
                                </label>
                                <input
                                    id="numNinos"
                                    type="number"
                                    min="0"
                                    value={numNinos}
                                    onChange={(e) => setNumNinos(Math.max(0, parseInt(e.target.value) || 0))}
                                    className="w-full border-2 border-gray-300 rounded-md p-3 focus:outline-none focus:border-[#FF6B35] transition-colors"
                                    disabled={!isOrganizer && eventoEstado === 'inactivo'}
                                />
                            </div>
                            <div>
                                <label htmlFor="numBebes" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Bebés
                                </label>
                                <input
                                    id="numBebes"
                                    type="number"
                                    min="0"
                                    value={numBebes}
                                    onChange={(e) => setNumBebes(Math.max(0, parseInt(e.target.value) || 0))}
                                    className="w-full border-2 border-gray-300 rounded-md p-3 focus:outline-none focus:border-[#FF6B35] transition-colors"
                                    disabled={!isOrganizer && eventoEstado === 'inactivo'}
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="observaciones" className="block text-sm font-semibold text-gray-700 mb-2">
                                Observaciones
                            </label>
                            <input
                                id="observaciones"
                                type="text"
                                value={observaciones}
                                onChange={(e) => setObservaciones(e.target.value)}
                                placeholder="Ej. Alergia al maní, menú vegetariano, etc."
                                className="w-full border-2 border-gray-300 rounded-md p-3 focus:outline-none focus:border-[#FF6B35] transition-colors"
                                disabled={!isOrganizer && eventoEstado === 'inactivo'}
                            />
                        </div>
                        <div className="flex justify-end items-center gap-4">
                            <button
                                type="submit"
                                className="bg-[#FF6B35] text-white px-8 py-3 rounded-lg flex items-center gap-2 shadow-md hover:bg-[#e65a23] transition-all duration-300 hover:scale-105"
                                disabled={!isOrganizer && eventoEstado === 'inactivo'}
                            >
                                <CheckCircle className="h-5 w-5" />
                                Guardar invitado
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowModal(true)}
                                className="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg flex items-center gap-2 shadow-md hover:bg-gray-300 transition-all duration-300 hover:scale-105"
                            >
                                <Eye className="h-5 w-5" /> Ver Resumen
                            </button>
                        </div>
                    </form>
                </div>

                <div className="flex justify-center mt-8">
                    <button
                        onClick={handleNavigateToHorarios}
                        className="bg-[#FF6B35] text-white px-8 py-3 rounded-lg flex items-center gap-2 shadow-md hover:bg-[#e65a23] transition-all duration-300 hover:scale-105"
                        disabled={!isOrganizer && eventoEstado === 'inactivo'}
                    >
                        Finalizar y continuar
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>

                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full relative transform transition-all scale-100 opacity-100">
                            <button
                                onClick={() => setShowModal(false)}
                                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                            <h2 className="text-3xl font-serif font-bold text-gray-800 mb-4 text-center">Resumen</h2>
                            <div className="text-lg text-gray-700 mb-6 border-b pb-4">
                                <p className="font-semibold text-gray-800">
                                    Total de personas: {totales.adultos + totales.ninos + totales.bebes}
                                </p>
                                <p>Adultos: {totales.adultos}</p>
                                <p>Niños: {totales.ninos}</p>
                                <p>Bebés: {totales.bebes}</p>
                            </div>
                            <div className="overflow-y-auto max-h-80">
                                {invitados.length > 0 ? (
                                    <ul className="space-y-4">
                                        {invitados.map((inv) => (
                                            <li key={inv.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-4 shadow-sm">
                                                <div className="flex items-center gap-4">
                                                    <User className="h-8 w-8 text-gray-500" />
                                                    <div>
                                                        <p className="font-bold text-gray-800">{inv.nombre_apellido}</p>
                                                        <p className="text-sm text-gray-600">
                                                            Adultos: {inv.num_adultos} | Niños: {inv.num_ninos} | Bebés: {inv.num_bebes}
                                                        </p>
                                                        {inv.observaciones && (
                                                            <p className="text-sm italic text-gray-500 mt-1">Obs: {inv.observaciones}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleDelete(inv.id)}
                                                    className="text-red-500 hover:text-red-700 transition-colors"
                                                    disabled={!isOrganizer && eventoEstado === 'inactivo'}
                                                >
                                                    <Trash className="h-5 w-5" />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-600 text-center">No hay invitados registrados aún.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InvitadosCena;