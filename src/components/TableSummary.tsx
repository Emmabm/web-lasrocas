import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Edit, Users } from 'lucide-react';
import { Table } from '../types/types';

interface TableSummaryProps {
  tables: Table[];
  onTableSelect: (tableId: string) => void;
}

const TableSummary: React.FC<TableSummaryProps> = ({ tables, onTableSelect }) => {
  const [expandedTables, setExpandedTables] = useState<string[]>([]);
  
  const toggleTableExpansion = (tableId: string) => {
    setExpandedTables(prev => 
      prev.includes(tableId) 
        ? prev.filter(id => id !== tableId)
        : [...prev, tableId]
    );
  };
  
  // Sort tables: used first, then by ID
  const sortedTables = [...tables].sort((a, b) => {
    if (a.isUsed && !b.isUsed) return -1;
    if (!a.isUsed && b.isUsed) return 1;
    return a.id.localeCompare(b.id, undefined, { numeric: true });
  });
  
  return (
    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
      {sortedTables.length > 0 ? (
        sortedTables.map(table => {
          const isExpanded = expandedTables.includes(table.id);
          const hasGuests = table.guests.length > 0;
          
          return (
            <div 
              key={table.id}
              className={`border rounded-md overflow-hidden transition-all ${
                table.isUsed 
                  ? 'border-[#FF6B35]/30 bg-[#FF6B35]/5' 
                  : 'border-gray-200'
              }`}
            >
              <div 
                className="flex items-center justify-between p-3 cursor-pointer"
                onClick={() => hasGuests && toggleTableExpansion(table.id)}
              >
                <div className="flex items-center">
                  <div 
                    className={`w-3 h-3 rounded-full mr-2 ${
                      table.isUsed ? 'bg-[#FF6B35]' : 'bg-gray-300'
                    }`}
                  ></div>
                  <span className="font-medium">Mesa {table.id}</span>
                  {hasGuests && (
                    <span className="ml-2 text-sm text-gray-500">
                      ({table.guests.length - 1} invitados)
                    </span>
                  )}
                </div>
                
                <div className="flex items-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTableSelect(table.id);
                    }}
                    className="p-1 text-gray-500 hover:text-[#FF6B35] transition-colors"
                    title="Editar invitados"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  {hasGuests && (
                    <button 
                      className="ml-1 p-1 text-gray-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTableExpansion(table.id);
                      }}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>
              
              {/* Guest details (expandable) */}
              {hasGuests && isExpanded && (
                <div className="px-4 pb-3 pt-1 border-t border-gray-100 bg-white">
                  <ul className="text-sm space-y-1 text-gray-700">
                    {table.guests.map((guest, index) => (
                      <li 
                        key={index}
                        className={`${index === 0 ? 'font-medium text-gray-800' : ''}`}
                      >
                        {guest}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Empty state for unused tables */}
              {!hasGuests && (
                <div className="px-4 py-2 text-sm text-gray-500 italic flex items-center border-t border-gray-100">
                  <Users className="w-3 h-3 mr-1 text-gray-400" />
                  Sin invitados asignados
                </div>
              )}
            </div>
          );
        })
      ) : (
        <div className="text-center py-6 text-gray-500">
          No hay mesas disponibles.
        </div>
      )}
    </div>
  );
};

export default TableSummary;