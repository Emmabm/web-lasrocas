import React from 'react';
import { AlertCircle, Edit2 } from 'lucide-react';

// Se asume que 'types.ts' está disponible en el entorno.
type GuestGroup = {
  name: string;
};

type Table = {
  id: string;
  isAssignable: boolean;
  isUsed: boolean;
  isMain?: boolean;
  tableName?: string;
  numAdults?: number;
  numChildren?: number;
  descripcion?: string;
  guestGroups?: GuestGroup[];
};

interface Props {
  tables: Table[];
  selectTable: (tableId: string) => void;
  setShowModal: (state: boolean) => void;
  token: string | null;
  isBlocked: boolean;
  onBlockedAction: () => void; // Nuevo callback para notificar acciones bloqueadas
}

const TableSummary: React.FC<Props> = ({ tables, selectTable, setShowModal, isBlocked, onBlockedAction }) => {
  const totalMesas = 24;

  const used = tables.filter(t => t.isAssignable && t.isUsed);

  const orderedUsed = [...used].sort((a, b) => {
    if (a.isMain) return -1;
    if (b.isMain) return 1;
    const numA = parseInt(a.id.replace('M', '')) || 0;
    const numB = parseInt(b.id.replace('M', '')) || 0;
    return numA - numB;
  });

  const warnings = tables.filter(t => {
    const total = (t.numAdults ?? 0) + (t.numChildren ?? 0);
    return t.isAssignable && total > 0 && total < 8;
  });

  const handleEdit = (tableId: string) => {
    if (isBlocked) {
      onBlockedAction();
      return;
    }
    console.log('TableSummary - Intentando editar mesa:', { tableId, isAssignable: tables.find(t => t.id === tableId)?.isAssignable });
    const table = tables.find(t => t.id === tableId && t.isAssignable);
    if (!table) {
      console.error('TableSummary - Mesa no encontrada o no asignable:', tableId);
      return;
    }
    selectTable(tableId);
    setShowModal(true);
  };

  return (
    <section className="bg-gray-50 rounded-2xl shadow-xl p-6 border border-gray-100">
      {/* Sección principal de mesas utilizadas */}
      <div className="bg-white rounded-xl shadow-inner p-5 mb-6 border border-gray-200">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 text-center">
          Resumen de Mesas
        </h2>
        <p className="font-semibold text-gray-600 mb-4 text-center">
          Mesas utilizadas: <span className="text-blue-600">{used.length}</span> / {totalMesas}
        </p>

        {orderedUsed.length > 0 ? (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
            {orderedUsed.map(t => {
              const adultos = t.numAdults ?? 0;
              const niños = t.numChildren ?? 0;
              const total = adultos + niños;
              const groupNames = t.guestGroups?.map(g => g.name).filter(Boolean).join(', ') || 'Sin grupos asignados';
              
              const isWarning = warnings.some(w => w.id === t.id);

              return (
                <div
                  key={t.id}
                  className={`relative bg-white rounded-xl p-5 shadow-sm border ${isWarning ? 'border-red-400' : 'border-gray-200'} transition-all hover:shadow-lg`}
                >
                  {isWarning && (
                    <div className="absolute top-3 right-3 text-red-500">
                      <AlertCircle size={20} />
                    </div>
                  )}
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Mesa {t.isMain ? 'Principal' : t.tableName ?? t.id}
                    </h3>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Adultos:</span> {adultos}
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Niños:</span> {niños}
                    </div>
                    <div className="text-sm font-bold text-gray-700">
                      Total: {total} persona{total !== 1 ? 's' : ''}
                    </div>
                    {t.descripcion && (
                      <div className="mt-2 text-xs text-gray-500 font-medium italic">
                        <span className="block font-bold not-italic">Detalles:</span>
                        <p className="line-clamp-2">{t.descripcion}</p>
                      </div>
                    )}
                    <div className="mt-2 text-xs text-gray-500 font-medium italic">
                      <span className="block font-bold not-italic">Grupos:</span>
                      <p className="line-clamp-2">{groupNames}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleEdit(t.id)}
                    className={`mt-4 w-full flex items-center justify-center gap-2 py-2 px-4 text-sm font-semibold text-white rounded-lg shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isBlocked ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                    disabled={isBlocked}
                  >
                    <Edit2 size={16} /> Editar
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-center italic">No hay mesas en uso en este momento.</p>
        )}
      </div>

      {/* Sección de advertencias */}
      {warnings.length > 0 && (
        <div className="p-5 bg-red-50 rounded-xl border border-red-200 shadow-md">
          <div className="flex items-start">
            <AlertCircle className="w-6 h-6 text-red-500 mr-3 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-lg text-red-800 mb-3">Advertencias</h3>
              <ul className="text-sm text-red-700 space-y-2">
                {warnings.map(t => {
                  const total = (t.numAdults ?? 0) + (t.numChildren ?? 0);
                  return (
                    <li key={t.id}>
                      Mesa <strong>{t.isMain ? 'Principal' : t.tableName ?? t.id}</strong>: {total} persona{total !== 1 ? 's' : ''}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default TableSummary;