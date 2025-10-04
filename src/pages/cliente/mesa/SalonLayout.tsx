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
      .map(t => [t.id, t.guestGroups?.length || 0])
  );

  const tableCapacity = 10;

  return (
    <section className="bg-white rounded-2xl shadow-md p-8 mb-8 border border-gray-200">
      {/* Título */}
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Plano del Salón</h2>
      <p className="text-sm text-gray-600 mb-6">
        Hacé clic en una mesa para asignar invitados.
      </p>

      {/* Caja de recomendaciones */}
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 mb-8 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Info className="h-6 w-6 text-orange-600" />
          <h3 className="text-lg font-semibold text-orange-700">
            Recomendaciones para la distribución de mesas
          </h3>
        </div>

        <div className="divide-y divide-orange-200 text-sm text-gray-700 space-y-4">
          {/* Mesas aisladas */}
          <div className="pb-3">
            <p>
              <span className="font-semibold">Mesas aisladas (arriba a la izquierda):</span>{" "}
              se utilizan únicamente en eventos con más de{" "}
              <span className="bg-orange-100 text-orange-800 rounded-full px-2 py-0.5 text-xs font-medium">
                200 invitados
              </span>{" "}
              a la cena, ya que suelen destinarse a tortas y dulces por estar apartadas del resto.
            </p>
          </div>

          {/* Mesas que se desarman */}
          <div className="pt-3">
            <p className="font-semibold mb-2">
              Según la cantidad total de invitados entre cena y baile, algunas mesas se desmontarán:
            </p>
            <ul className="space-y-1">
              <li>
                60 a 80 personas → se desmontan varias mesas del{" "}
                <span className="bg-orange-100 text-orange-800 rounded-full px-2 text-xs font-medium">
                  centro del salón
                </span>
              </li>
              <li>
                81 a 120 personas → se desmontan mesas{" "}
                <span className="bg-orange-100 text-orange-800 rounded-full px-2 text-xs font-medium">
                  desde el centro hacia el fondo
                </span>
              </li>
              <li>
                121 a 160 personas → se desmonta{" "}
                <span className="bg-orange-100 text-orange-800 rounded-full px-2 text-xs font-medium">
                  la mayoría de las mesas centrales
                </span>
              </li>
              <li>
                161 a 200 personas → se mantienen solo{" "}
                <span className="bg-orange-100 text-orange-800 rounded-full px-2 text-xs font-medium">
                  las mesas cercanas al escenario y a los costados
                </span>
              </li>
              <li>
                201 a 260 personas → se conservan principalmente{" "}
                <span className="bg-orange-100 text-orange-800 rounded-full px-2 text-xs font-medium">
                  las mesas perimetrales (junto a la oficina y al DJ)
                </span>
              </li>
              <li>
                Más de 261 personas → probablemente se desarmen{" "}
                <span className="bg-orange-100 text-orange-800 rounded-full px-2 text-xs font-medium">
                  todas las mesas
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Plano del salón */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden p-4 shadow-inner">
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
