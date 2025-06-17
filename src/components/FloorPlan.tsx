import React, { useState } from 'react';
import { Table } from '../types/types';

const FloorPlan: React.FC<{
  tables: Table[];
  onTableMove: (id: string, pos: { x: number; y: number }) => void;
  onTableSelect: (id: string) => void;
  tableWarnings: string[];
  tableGuests: Record<string, number>; // Nuevo prop para el número de invitados por mesa
  tableCapacity: number; // Capacidad máxima de cada mesa
}> = ({ tables, onTableMove, onTableSelect, tableWarnings, tableGuests, tableCapacity }) => {
  const [dragId, setDragId] = useState<string | null>(null);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const onDown = (e: React.MouseEvent, t: Table) => {
    if (!t.isAssignable) return;
    setDragId(t.id);
    setOffset({ x: e.clientX - t.position.x, y: e.clientY - t.position.y });
  };

  const onMove = (e: React.MouseEvent) => {
    if (dragId) {
      onTableMove(dragId, {
        x: e.clientX - offset.x,
        y: e.clientY - offset.y,
      });
    }
  };

  const onUp = () => setDragId(null);

  return (
    <div className="relative w-full h-[650px]" onMouseMove={onMove} onMouseUp={onUp}>
      {tables.map(t => {
        const guests = tableGuests[t.id] || 0;
        const isFull = guests >= tableCapacity;
        
        const style: React.CSSProperties = {
          left: t.position.x - (t.width ?? 0) / 2,
          top: t.position.y - (t.height ?? 0) / 2,
          width: t.width,
          height: t.height,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: t.isAssignable ? 'move' : 'default',
          zIndex: dragId === t.id ? 10 : undefined,
        };

        if (t.shape === 'circle') {
          return (
            <div
              key={t.id}
              style={{
                ...style,
                borderRadius: '50%',
                backgroundColor: isFull ? '#FF6B35' : '#F3F4F6',
                border: tableWarnings.includes(t.id)
                  ? '3px solid #EF4444'
                  : isFull 
                    ? '2px solid #FF6B35'
                    : '1px solid #9CA3AF',
                boxShadow: isFull ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                transition: dragId === t.id ? 'none' : 'all 0.2s ease',
              }}
              onMouseDown={(e) => onDown(e, t)}
              onClick={() => t.isAssignable && onTableSelect(t.id)}
              title={`Mesa ${t.id} - ${isFull ? 'Completada' : 'Disponible'} (${guests}/${tableCapacity})`}
            >
              <span
                className={
                  isFull 
                    ? 'text-white font-medium text-sm' 
                    : 'text-gray-600 font-medium text-sm'
                }
              >
                {t.id}
              </span>
              {/* Mostrar número de invitados si hay alguno */}
              {guests > 0 && (
                <span 
                  className={`absolute bottom-0 text-xs font-bold ${
                    isFull ? 'text-white' : 'text-gray-600'
                  }`}
                  style={{ transform: 'translateY(100%)' }}
                >
                  {guests}/{tableCapacity}
                </span>
              )}
            </div>
          );
        }

        return (
          <div
            key={t.id}
            style={{
              ...style,
              backgroundColor: '#D1D5DB',
              borderRadius: 4,
              pointerEvents: 'none',
              textAlign: 'center',
              fontWeight: 500,
              fontSize: '0.75rem',
              lineHeight: '1rem',
              padding: '5px',
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