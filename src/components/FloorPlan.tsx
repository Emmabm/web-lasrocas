import React, { useState } from 'react';
import { Table } from '../types/types';

const FloorPlan: React.FC<{
  tables: Table[];
  onTableMove: (id: string, pos: { x: number; y: number }) => void;
  onTableSelect: (id: string) => void;
  tableWarnings: string[];
}> = ({ tables, onTableMove, onTableSelect, tableWarnings }) => {
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
    <div className="relative w-full h-[700px]" onMouseMove={onMove} onMouseUp={onUp}>
      {tables.map(t => {
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
                backgroundColor: t.isUsed ? '#FF6B35' : '#E5E7EB',
                border: tableWarnings.includes(t.id)
                  ? '3px solid #EF4444'
                  : '1px solid #9CA3AF',
                transition: dragId === t.id ? 'none' : 'transform 0.15s',
              }}
              onMouseDown={(e) => onDown(e, t)}
              onClick={() => t.isAssignable && onTableSelect(t.id)}
              title={`Mesa ${t.id}`}
            >
              <span
                className={
                  t.isUsed ? 'text-white font-medium' : 'text-gray-700 font-medium'
                }
              >
                {t.id}
              </span>
            </div>
          );
        }

        return (
          <div
            key={t.id}
            style={{
              ...style,
              backgroundColor: '#D1D5DB',
              border: '1px solid #9CA3AF',
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
