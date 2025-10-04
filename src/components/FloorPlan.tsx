import React from 'react';
import { Table } from '../types/types';

interface FloorPlanProps {
  tables: Table[];
  onTableMove?: (id: string, pos: { x: number; y: number }) => void; // Opcional, para mover mesas
  onTableSelect: (id: string) => void;
  tableWarnings: string[];
  tableGuests: Record<string, number>;
  tableCapacity: number;
}

const FloorPlan: React.FC<FloorPlanProps> = ({
  tables,
  onTableSelect,
  tableWarnings,
  tableGuests,
  tableCapacity
}) => {
  return (
    <div
      className="relative w-full bg-white rounded-lg border border-gray-400 p-4 shadow-sm"
      style={{ height: 580 }}
    >
      {tables.map(t => {
        const guests = tableGuests[t.id] || 0;
        const isUsed = t.isUsed;

        const left = isFinite(t.position?.x) && isFinite(t.width)
          ? t.position.x - (t.width || 0) / 2
          : 0;

        const top = isFinite(t.position?.y) && isFinite(t.height)
          ? t.position.y - (t.height || 0) / 2
          : 0;

        const baseStyle: React.CSSProperties = {
          left,
          top,
          width: t.width,
          height: t.height,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        };

        if (t.isAssignable) {
          return (
            <div
              key={t.id}
              style={{
                ...baseStyle,
                borderRadius: t.shape === 'circle' ? '50%' : '4px',
                backgroundColor: isUsed ? '#FF6B35' : '#F3F4F6',
                border: tableWarnings.includes(t.id)
                  ? '3px solid #EF4444'
                  : isUsed
                    ? '2px solid #FF6B35'
                    : '1px solid #9CA3AF',
                cursor: 'pointer',
                boxShadow: isUsed ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s ease',
              }}
              onClick={() => onTableSelect(t.id)}
              title={`Mesa ${t.tableName || ''} - ${guests}/${tableCapacity}`}
            >
              <span className={isUsed ? 'text-white text-sm font-semibold' : 'text-gray-700 text-sm font-semibold'}>
                {t.tableName || ''}
              </span>

              {guests > 0 && (
                <span
                  className={`absolute bottom-0 text-xs font-bold ${isUsed ? 'text-white' : 'text-gray-600'}`}
                  style={{ transform: 'translateY(100%)' }}
                >
                  {guests}/{tableCapacity}
                </span>
              )}
            </div>
          );
        }

        // Mesas no asignables (solo muestra de referencia)
        return (
          <div
            key={t.id}
            style={{
              ...baseStyle,
              backgroundColor: '#E5E7EB',
              borderRadius: 6,
              pointerEvents: 'none',
              color: '#374151',
              fontWeight: 600,
              fontSize: '0.75rem',
              lineHeight: '1rem',
              padding: '4px',
              textAlign: 'center',
            }}
          >
            {t.id}
          </div>
        );
      })}
    </div>
  );
};

export default FloorPlan;