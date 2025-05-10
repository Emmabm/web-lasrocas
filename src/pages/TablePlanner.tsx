import React, { useState } from 'react';
import { AlertCircle, Save } from 'lucide-react';
import FloorPlan from '../components/FloorPlan';
import GuestAssigner from '../components/GuestAssigner';
import TableSummary from '../components/TableSummary';
import { Table } from '../types/types';

// Initial tables data
const initialTables: Table[] = [
  { id: 'M1', position: { x: 100, y: 100 }, isUsed: false, guests: [], shape: 'circle' },
  { id: 'M2', position: { x: 250, y: 100 }, isUsed: false, guests: [], shape: 'circle' },
  { id: 'M3', position: { x: 400, y: 100 }, isUsed: false, guests: [], shape: 'circle' },
  { id: 'M4', position: { x: 100, y: 250 }, isUsed: false, guests: [], shape: 'circle' },
  { id: 'M5', position: { x: 250, y: 250 }, isUsed: false, guests: [], shape: 'circle' },
  { id: 'M6', position: { x: 400, y: 250 }, isUsed: false, guests: [], shape: 'circle' },
  { id: 'M7', position: { x: 100, y: 400 }, isUsed: false, guests: [], shape: 'square' },
  { id: 'M8', position: { x: 250, y: 400 }, isUsed: false, guests: [], shape: 'square' },
  { id: 'M9', position: { x: 400, y: 400 }, isUsed: false, guests: [], shape: 'square' },
  { id: 'M10', position: { x: 550, y: 250 }, isUsed: false, guests: [], shape: 'square' },
];

const TablePlanner: React.FC = () => {
  const [tables, setTables] = useState<Table[]>(initialTables);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [layoutSaved, setLayoutSaved] = useState(false);
  
  const handleTableMove = (id: string, newPosition: { x: number, y: number }) => {
    setTables(prevTables => 
      prevTables.map(table => 
        table.id === id ? { ...table, position: newPosition } : table
      )
    );
    setLayoutSaved(false);
  };
  
  const handleTableSelect = (tableId: string) => {
    const table = tables.find(t => t.id === tableId) || null;
    setSelectedTable(table);
    setShowGuestModal(true);
  };
  
  const handleGuestUpdate = (tableId: string, guests: string[]) => {
    setTables(prevTables => 
      prevTables.map(table => 
        table.id === tableId ? { ...table, guests, isUsed: guests.length > 0 } : table
      )
    );
    setShowGuestModal(false);
    setSelectedTable(null);
    setLayoutSaved(false);
  };
  
  const handleCloseModal = () => {
    setShowGuestModal(false);
    setSelectedTable(null);
  };
  
  const saveLayout = () => {
    // In a real app, this would save to backend
    setLayoutSaved(true);
    
    // Just for demo, hide the notification after 3 seconds
    setTimeout(() => {
      setLayoutSaved(false);
    }, 3000);
  };
  
  const usedTables = tables.filter(table => table.isUsed);
  const tableWarnings = tables.filter(table => 
    (table.guests.length > 0 && (table.guests.length < 8 || table.guests.length > 11))
  );
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">Planificador de Mesas</h1>
      <p className="text-center text-gray-600 mb-8">Organiza tus mesas: Arrástralas y agrega invitados. El sistema actualizará automáticamente la disponibilidad.</p>
      
      {/* Notification for saved layout */}
      {layoutSaved && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50 flex items-center">
          <span className="font-medium mr-2">¡Guardado exitosamente!</span>
          <button onClick={() => setLayoutSaved(false)} className="text-green-700">×</button>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left sidebar - Tables summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Resumen de Mesas</h2>
            <div className="p-4 bg-[#FF6B35]/10 rounded-lg mb-4">
              <p className="font-medium">Mesas utilizadas: {usedTables.length}/{tables.length}</p>
            </div>
            
            {tableWarnings.length > 0 && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-lg mb-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-red-800">Advertencias:</h3>
                    <ul className="mt-2 text-sm text-red-700 space-y-1">
                      {tableWarnings.map(table => (
                        <li key={table.id}>
                          {table.guests.length < 8 
                            ? `La mesa ${table.id} tiene menos de 8 invitados (${table.guests.length})` 
                            : `La mesa ${table.id} tiene más de 11 invitados (${table.guests.length})`}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            <TableSummary 
              tables={tables} 
              onTableSelect={handleTableSelect} 
            />
            
            <button 
              onClick={saveLayout}
              className="w-full mt-4 bg-[#FF6B35] text-white py-2 px-4 rounded-md hover:bg-[#FF6B35]/90 transition-colors flex items-center justify-center"
            >
              <Save className="w-4 h-4 mr-2" />
              Guardar distribución
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Leyenda</h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-[#FF6B35] mr-3"></div>
                <span>Mesa ocupada</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-gray-200 border border-gray-300 mr-3"></div>
                <span>Mesa libre</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-white border-2 border-red-500 mr-3"></div>
                <span>Mesa con advertencia</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Center and right - Floor plan */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Plano del Salón</h2>
            <p className="text-sm text-gray-600 mb-4">Haz clic en una mesa para asignar invitados o arrástrala para cambiar su posición.</p>
            
            <div className="bg-gray-100 rounded-lg border border-gray-200 overflow-hidden">
              <FloorPlan 
                tables={tables}
                onTableMove={handleTableMove}
                onTableSelect={handleTableSelect}
                tableWarnings={tableWarnings.map(t => t.id)}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Guest assignment modal */}
      {showGuestModal && selectedTable && (
        <GuestAssigner 
          table={selectedTable}
          onClose={handleCloseModal}
          onSave={handleGuestUpdate}
        />
      )}
    </div>
  );
};

export default TablePlanner;