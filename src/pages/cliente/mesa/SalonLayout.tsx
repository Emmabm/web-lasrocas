import React from 'react';
import FloorPlan from '../../../components/FloorPlan';
import { Table } from '../../../types/types';

interface Props {
  tables: Table[];
  selectTable: (id: string) => void;
  warnings: Table[];
}

const SalonLayout: React.FC<Props> = ({ tables, selectTable, warnings }) => {
  const tableWarnings = warnings.map(t => t.id);
  const tableGuests = Object.fromEntries(
    tables
      .filter(t => t.isAssignable)
      .map(t => [t.id, t.guests.length])
  );

  const tableCapacity = 10;

  return (
    <section className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
      <h2 className="text-xl font-semibold mb-4">Plano del Salón</h2>
      <p className="text-sm text-gray-600 mb-4">
        Hacé clic en una mesa para asignar invitados.
      </p>

      <div className="bg-gray-100 rounded-lg border border-gray-200 overflow-hidden">
        <FloorPlan
          tables={tables}
          onTableSelect={selectTable}
          tableWarnings={tableWarnings}
          tableGuests={tableGuests}
          tableCapacity={tableCapacity}
        />
      </div>
    </section>
  );
};

export default SalonLayout;