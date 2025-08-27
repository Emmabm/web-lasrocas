import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../../supabaseClient';
import { useUserContext } from '../../../hooks/useUserContext';
import { useTablePlanner } from '../../../hooks/useTablePlanner';
import StepIndicator from './StepIndicator';
import SalonLayout from './SalonLayout';
import TableSummary from './TableSummary';
import DecorationPanel from './DecorationPanel';
import GuestAssigner from '../../../components/GuestAssigner';
import { List } from 'lucide-react';

const TablePlanner: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { menuSeleccionado, token: contextToken, setToken, setPaso } = useUserContext();
  const query = new URLSearchParams(location.search);
  const urlToken = query.get('token');
  const [loading, setLoading] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);
  const [eventoId, setEventoId] = useState<string | null>(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  const {
    tables,
    selected,
    showModal,
    currentStep,
    globalDecoration,
    warnings,
    selectTable,
    updateMesaCompleta,
    updateGlobalDecoration,
    nextStep,
    prevStep,
    setShowModal,
    setSelected,
    guardarDistribucion,
    guardarDecoracion
  } = useTablePlanner(eventoId || '');

  useEffect(() => {
    const verifyToken = async () => {
      if (urlToken && contextToken !== urlToken) {
        console.log('TablePlanner.tsx - Persistiendo token:', { contextToken, urlToken });
        setToken(urlToken);
      }

      const activeToken = contextToken || urlToken;
      if (!activeToken) {
        setLocalError('No se proporcionó un token de acceso.');
        setLoading(false);
        return;
      }

      if (menuSeleccionado === 'menu4') {
        setLocalError('La sección de mesas no está disponible para el Menú 4 - Lunch.');
        navigate(`/horarios?token=${activeToken}`);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('eventos')
          .select('id')
          .eq('token_acceso', activeToken)
          .single();

        if (error || !data) {
          setLocalError('Evento no encontrado.');
          navigate(`/cliente${activeToken ? `?token=${activeToken}` : ''}`);
          setLoading(false);
          return;
        }

        setEventoId(data.id);
        setPaso('mesas');
        setLoading(false);
      } catch (err) {
        setLocalError('Error al conectar con la base de datos.');
        setLoading(false);
      }
    };

    verifyToken();
  }, [contextToken, urlToken, menuSeleccionado, navigate, setPaso, setToken]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        Cargando...
      </div>
    );
  }

  if (localError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-red-500">
        {localError}
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      <StepIndicator step={currentStep} />

      {currentStep === 1 && (
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-[25%] w-full">
            <button
              onClick={() => setShowSummaryModal(true)}
              className="bg-[#FF6B35] text-white px-6 py-3 rounded-lg shadow-md hover:bg-[#FF6B35]/90 transition-all duration-300 transform hover:scale-105 flex items-center justify-center w-full mt-6"
            >
              <List className="w-5 h-5 mr-2" />
              Resumen de Mesas
            </button>
          </div>
          <div className="md:w-[75%] w-full overflow-auto">
            <SalonLayout
              tables={tables}
              selectTable={selectTable}
              warnings={warnings}
            />
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <DecorationPanel
          globalDecoration={globalDecoration}
          updateGlobalDecoration={updateGlobalDecoration}
          guardarDistribucionYDecoracion={async () => {
            if (!eventoId) return;
            await guardarDistribucion();
            await guardarDecoracion();
            navigate(`/horarios?token=${contextToken || urlToken}`);
          }}
          token={contextToken || urlToken}
        />
      )}

      <div className="flex justify-between items-center mt-6">
        {currentStep > 1 ? (
          <button
            onClick={prevStep}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            ← Anterior
          </button>
        ) : (
          <div />
        )}

        {currentStep < 2 ? (
          <button
            onClick={nextStep}
            className="px-4 py-2 bg-[#FF6B35] text-white rounded hover:bg-[#FF6B35]/90"
          >
            Siguiente →
          </button>
        ) : (
          <div />
        )}
      </div>

      {showModal && selected && (
        <GuestAssigner
          table={tables.find(t => t.id === selected.id) || selected}
          onClose={() => {
            setShowModal(false);
            setSelected(null);
          }}
          onSave={updateMesaCompleta}
        />
      )}

      {showSummaryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ease-in-out">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto transform transition-transform duration-300 ease-in-out scale-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Resumen de Mesas</h2>
              <button
                onClick={() => setShowSummaryModal(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                ✕
              </button>
            </div>
            <TableSummary
              tables={tables}
              selectTable={selectTable}
              setShowModal={setShowModal}
              token={contextToken || urlToken}
            />
          </div>
        </div>
      )}
    </main>
  );
};

export default TablePlanner;