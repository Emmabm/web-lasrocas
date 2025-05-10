import React, { useState } from 'react';
import { Table } from '../types/types';

interface FloorPlanProps {
  tables: Table[];
  onTableMove: (id: string, newPosition: { x: number, y: number }) => void;
  onTableSelect: (tableId: string) => void;
  tableWarnings: string[];
}

const FloorPlan: React.FC<FloorPlanProps> = ({ tables, onTableMove, onTableSelect, tableWarnings }) => {
  const [draggedTable, setDraggedTable] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const handleMouseDown = (
    e: React.MouseEvent<HTMLDivElement>,
    tableId: string,
    currentPosition: { x: number, y: number }
  ) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Get the position of the click relative to the table element
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    setDraggedTable(tableId);
    setDragOffset({ x: offsetX, y: offsetY });
    
    // Add event listeners to track mouse movement
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  const handleMouseMove = (e: MouseEvent) => {
    if (!draggedTable) return;
    
    // Get the container's position and dimensions
    const container = document.getElementById('floor-plan-container');
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    
    // Calculate the new position, considering the drag offset
    let newX = e.clientX - rect.left - dragOffset.x;
    let newY = e.clientY - rect.top - dragOffset.y;
    
    // Ensure the table stays within the container boundaries
    // Table radius/width is 30px
    const tableSize = 30;
    newX = Math.max(tableSize, Math.min(newX, rect.width - tableSize));
    newY = Math.max(tableSize, Math.min(newY, rect.height - tableSize));
    
    onTableMove(draggedTable, { x: newX, y: newY });
  };
  
  const handleMouseUp = () => {
    setDraggedTable(null);
    
    // Remove event listeners
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };
  
  const handleTableClick = (e: React.MouseEvent, tableId: string) => {
    // Only trigger click if we're not dragging
    if (!draggedTable) {
      e.stopPropagation();
      onTableSelect(tableId);
    }
  };
  
  return (
    <div 
      id="floor-plan-container"
      className="relative w-full h-[600px] overflow-hidden"
      style={{ 
        backgroundImage: 'linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }}
    >
      {/* Entry door at the bottom */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-2 bg-gray-500"></div>
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-gray-500">Entrada</div>
      
      {/* Walls */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gray-700"></div>
      <div className="absolute bottom-0 left-0 w-full h-2 bg-gray-700"></div>
      <div className="absolute top-0 left-0 w-2 h-full bg-gray-700"></div>
      <div className="absolute top-0 right-0 w-2 h-full bg-gray-700"></div>
      
      {/* Tables */}
      {tables.map((table) => {
        const isWarning = tableWarnings.includes(table.id);
        const isDragging = draggedTable === table.id;
        
        return table.shape === 'circle' ? (
          <div 
            key={table.id}
            className={`absolute rounded-full flex items-center justify-center cursor-move transition-transform ${
              isDragging ? 'z-10 scale-110' : 'hover:scale-105'
            } ${
              isWarning 
                ? 'bg-white border-2 border-red-500' 
                : table.isUsed 
                  ? 'bg-[#FF6B35] text-white' 
                  : 'bg-gray-200 border border-gray-300 text-gray-700'
            }`}
            style={{ 
              left: `${table.position.x - 30}px`, 
              top: `${table.position.y - 30}px`,
              width: '60px',
              height: '60px',
            }}
            onMouseDown={(e) => handleMouseDown(e, table.id, table.position)}
            onClick={(e) => handleTableClick(e, table.id)}
            title={`${table.isUsed ? 'Mesa ocupada' : 'Mesa libre'} - Haz clic para asignar invitados`}
          >
            <span className="font-medium">{table.id}</span>
          </div>
        ) : (
          // Square table
          <div 
            key={table.id}
            className={`absolute flex items-center justify-center cursor-move transition-transform ${
              isDragging ? 'z-10 scale-110' : 'hover:scale-105'
            } ${
              isWarning 
                ? 'bg-white border-2 border-red-500' 
                : table.isUsed 
                  ? 'bg-[#FF6B35] text-white' 
                  : 'bg-gray-200 border border-gray-300 text-gray-700'
            }`}
            style={{ 
              left: `${table.position.x - 30}px`, 
              top: `${table.position.y - 30}px`,
              width: '60px',
              height: '60px',
            }}
            onMouseDown={(e) => handleMouseDown(e, table.id, table.position)}
            onClick={(e) => handleTableClick(e, table.id)}
            title={`${table.isUsed ? 'Mesa ocupada' : 'Mesa libre'} - Haz clic para asignar invitados`}
          >
            <span className="font-medium">{table.id}</span>
          </div>
        );
      })}
    </div>
  );
};

export default FloorPlan;