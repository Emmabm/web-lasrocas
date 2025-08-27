import { useState, useEffect } from 'react';
   import { useNavigate, useLocation } from 'react-router-dom';
   import { supabase } from '../../../../supabaseClient';
   import { useUserContext } from '../../../../hooks/useUserContext';

   const ReceptionSelectionMenu3: React.FC = () => {
     const [eventId, setEventId] = useState<string | null>(null);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState<string | null>(null);
     const { token, setPaso } = useUserContext();
     const navigate = useNavigate();
     const location = useLocation();

     useEffect(() => {
       const fetchEvent = async () => {
         setLoading(true);
         const params = new URLSearchParams(location.search);
         const urlToken = params.get('token');
         const finalToken = urlToken || token;
         if (!finalToken) {
           setError('No se proporcionó un token');
           setLoading(false);
           return;
         }

         const { data, error } = await supabase
           .from('eventos')
           .select('id')
           .eq('token_acceso', finalToken)
           .single();

         if (error || !data) {
           setError('Error al cargar el evento');
           setLoading(false);
           return;
         }

         setEventId(data.id);
         setPaso('catering');
         setLoading(false);
       };
       fetchEvent();
     }, [token, location.search, setPaso]);

     const continuar = async () => {
       if (!eventId) {
         setError('No se encontró el ID del evento');
         return;
       }

       const { error } = await supabase.rpc('upsert_menu3_formularios', {
         p_event_id: eventId,
         p_paso: 'entrada-menu3',
         p_datos: { tipo: 'bandejeo y mesa de fiambres' },
       });

       if (error) {
         setError(`No se pudo guardar: ${error.message}`);
         return;
       }

       navigate(`/catering/menu3/main?token=${token}`);
     };

     const volver = () => {
       navigate(`/catering?token=${token}`);
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
       <div className="bg-white flex justify-center pt-10 pb-6 px-6">
         <div className="max-w-3xl w-full bg-white rounded-2xl shadow-lg px-6 py-4">
           <h1 className="text-3xl sm:text-4xl font-serif font-bold text-center text-gray-800 mb-4 sm:mb-6">
             Recepción — Menú 3 (Parrillada)
           </h1>

           <p className="text-center text-gray-600 text-base sm:text-lg mb-4">
             La recepción incluye <span className="text-[#FF6B35] font-semibold">bandejeo y mesa de fiambres</span>:
           </p>

           <div className="bg-orange-50 border border-[#FF6B35] rounded-xl px-6 py-5 sm:py-6 mb-8 shadow-sm">
             <p className="text-gray-700 text-sm sm:text-base leading-relaxed text-center">
               Bandejeo de canapés fríos, calientes, pinchos de carnes y verduras, empanadas surtidas y una mesa
               de fiambres y quesos de estación.
             </p>
           </div>

           <div className="flex justify-center flex-col sm:flex-row gap-4 sm:gap-6 mt-4">
             <button
               onClick={volver}
               className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-100 transition"
             >
               ← Volver
             </button>
             <button
               onClick={continuar}
               className="bg-[#FF6B35] hover:bg-[#e65a23] text-white px-6 py-2 rounded-md shadow-md transition-all duration-300 hover:scale-[1.03]"
             >
               Confirmar y continuar →
             </button>
           </div>
         </div>
       </div>
     );
   };

   export default ReceptionSelectionMenu3;