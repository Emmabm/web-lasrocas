import React from 'react';
import FloorPlan from '../../../components/FloorPlan';
import { Table } from '../../../types/types';
import { Info } from 'lucide-react';

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
      <p className="text-sm text-gray-600 mb-6">
        Hacé clic en una mesa para asignar invitados.
      </p>

      {/* Caja de recomendaciones */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6 shadow-sm">
        <div className="flex items-center mb-4">
          <Info className="h-6 w-6 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-blue-700">
            Recomendaciones para la distribución de mesas
          </h3>
        </div>

        <div className="divide-y divide-blue-200 text-sm text-gray-700 space-y-3">
          {/* Mesas 1 y 2 */}
          <div className="pb-3">
            <p>
              <span className="font-semibold">Mesas 1 y 2:</span> usar solo en
              eventos con más de{" "}
              <span className="bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 text-xs font-medium">
                200 invitados
              </span>{" "}
              a la cena, ya que suelen destinarse a tortas y dulces por estar más aisladas.
            </p>
          </div>

          {/* Mesas que se desarman */}
          <div className="pt-3">
            <p className="font-semibold mb-2">
              Mesas que se desarman al iniciar el baile:
            </p>
            <ul className="space-y-1">
              <li>
                60 a 80 personas → mesas{" "}
                <span className="bg-blue-100 text-blue-800 rounded-full px-2 text-xs font-medium">
                  8 a 13
                </span>
              </li>
              <li>
                81 a 120 personas → mesas{" "}
                <span className="bg-blue-100 text-blue-800 rounded-full px-2 text-xs font-medium">
                  6 a 13
                </span>
              </li>
              <li>
                121 a 160 personas → mesas{" "}
                <span className="bg-blue-100 text-blue-800 rounded-full px-2 text-xs font-medium">
                  3 a 13
                </span>
              </li>
              <li>
                161 a 200 personas → mesas{" "}
                <span className="bg-blue-100 text-blue-800 rounded-full px-2 text-xs font-medium">
                  3 a 17
                </span>
              </li>
              <li>
                201 a 260 personas → mesas{" "}
                <span className="bg-blue-100 text-blue-800 rounded-full px-2 text-xs font-medium">
                  3 a 18
                </span>
              </li>
              <li>
                Más de 261 personas → probablemente se desarmen{" "}
                <span className="bg-blue-100 text-blue-800 rounded-full px-2 text-xs font-medium">
                  todas las mesas
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Plano del salón */}
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
