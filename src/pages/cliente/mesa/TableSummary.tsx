import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Table } from '../../../types/types';

type Props = {
  tables: Table[];
  selectTable: (tableId: string) => void;
  setShowModal: (state: boolean) => void;
  token: string | null;
};

const TableSummary: React.FC<Props> = ({ tables, selectTable, setShowModal }) => {
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

  return (
    <section className="bg-white rounded-xl shadow-lg p-2 border border-gray-100">
      <div className="p-3 bg-orange-50 rounded-lg mb-2 border border-orange-100">
        <p className="font-semibold text-orange-800 mb-4">
          Mesas utilizadas: <span className="text-orange-600">{used.length}</span> / {totalMesas}
        </p>

        {orderedUsed.length > 0 && (
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 auto-rows-min">
            {orderedUsed.map(t => {
              const adultos = t.numAdults ?? 0;
              const niños = t.numChildren ?? 0;
              const total = adultos + niños;
              return (
                <div
                  key={t.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col justify-between min-h-[160px]"
                >
                  <div className="space-y-1">
                    <div className="text-gray-800 font-semibold">
                      Mesa {t.isMain ? 'Principal' : t.id}
                    </div>
                    {t.tableName && !t.isMain && (
                      <div className="text-gray-600 text-sm">{t.tableName}</div>
                    )}
                    <div className="text-sm text-gray-600">Adultos: {adultos}</div>
                    <div className="text-sm text-gray-600">Niños: {niños}</div>
                    <div className="text-sm text-gray-600">
                      Total: {total} persona{total !== 1 ? 's' : ''}
                    </div>
                    {t.descripcion && (
                      <>
                        <div className="text-xs text-gray-500 font-medium italic">Detalles:</div>
                        <div className="text-xs text-gray-500 line-clamp-2">
                          {t.descripcion}
                        </div>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      selectTable(t.id);
                      setShowModal(true);
                    }}
                    className="mt-4 flex items-center justify-center w-20 py-1 text-sm font-medium text-blue-500 border border-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-colors"
                  >
                    <span className="mr-1">✏️</span> Editar
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {warnings.length > 0 && (
        <div className="p-5 bg-red-50 rounded-lg border border-red-100">
          <div className="flex items-start">
            <AlertCircle className="w-6 h-6 text-red-500 mr-3 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-800 mb-3">Advertencias</h3>
              <ul className="text-sm text-red-700 space-y-2">
                {warnings.map(t => {
                  const total = (t.numAdults ?? 0) + (t.numChildren ?? 0);
                  return (
                    <li key={t.id}>
                      Mesa <strong>{t.isMain ? 'Principal' : t.id}</strong>
                      {t.tableName && !t.isMain && (
                        <span className="ml-1">({t.tableName})</span>
                      )}
                      : {total} persona{total !== 1 ? 's' : ''}
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