import React, { useState } from 'react';
import { Check, ChevronRight } from 'lucide-react';

interface CateringOption {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'appetizer' | 'main' | 'dessert' | 'drink';
}

const cateringOptions: CateringOption[] = [
  { id: 'a1', name: 'Tabla de quesos', description: 'Selección de quesos gourmet con frutos secos y mermeladas', price: 2500, category: 'appetizer' },
  { id: 'a2', name: 'Canapés variados', description: 'Surtido de canapés con diferentes coberturas', price: 1800, category: 'appetizer' },
  { id: 'a3', name: 'Empanadas gourmet', description: 'Mini empanadas en variedad de sabores', price: 2000, category: 'appetizer' },
  
  { id: 'm1', name: 'Lomo al horno', description: 'Lomo de ternera con guarnición de papas', price: 3500, category: 'main' },
  { id: 'm2', name: 'Pollo a la naranja', description: 'Pollo glaseado con salsa de naranja y arroz', price: 3000, category: 'main' },
  { id: 'm3', name: 'Risotto de hongos', description: 'Risotto cremoso con variedad de hongos', price: 2800, category: 'main' },
  
  { id: 'd1', name: 'Mini tortas', description: 'Variedad de mini tortas de chocolate, frutilla y vainilla', price: 1500, category: 'dessert' },
  { id: 'd2', name: 'Frutas de estación', description: 'Selección de frutas frescas de temporada', price: 1200, category: 'dessert' },
  
  { id: 'dr1', name: 'Barra de bebidas', description: 'Incluye agua, gaseosas, vino y cerveza', price: 2000, category: 'drink' },
  { id: 'dr2', name: 'Servicio de café', description: 'Café, té y petit fours', price: 800, category: 'drink' },
];

const Catering: React.FC = () => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);

  const toggleOption = (id: string) => {
    setSelectedOptions(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id]
    );
  };

  const totalPrice = selectedOptions.reduce((sum, id) => {
    const option = cateringOptions.find(opt => opt.id === id);
    return sum + (option?.price || 0);
  }, 0);

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Selección de Catering</h1>
      
      <div className="max-w-4xl mx-auto">
        {/* Step indicator */}
        <div className="mb-8">
          <ol className="flex items-center w-full">
            <li className={`flex items-center ${currentStep >= 1 ? "text-[#FF6B35]" : "text-gray-500"}`}>
              <span className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 1 ? "bg-[#FF6B35] text-white" : "bg-gray-200"}`}>
                1
              </span>
              <span className="ml-2 text-sm">Entrada</span>
              <span className="w-full h-1 mx-4 bg-gray-200"></span>
            </li>
            <li className={`flex items-center ${currentStep >= 2 ? "text-[#FF6B35]" : "text-gray-500"}`}>
              <span className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 2 ? "bg-[#FF6B35] text-white" : "bg-gray-200"}`}>
                2
              </span>
              <span className="ml-2 text-sm">Principal</span>
              <span className="w-full h-1 mx-4 bg-gray-200"></span>
            </li>
            <li className={`flex items-center ${currentStep >= 3 ? "text-[#FF6B35]" : "text-gray-500"}`}>
              <span className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 3 ? "bg-[#FF6B35] text-white" : "bg-gray-200"}`}>
                3
              </span>
              <span className="ml-2 text-sm">Postre</span>
              <span className="w-full h-1 mx-4 bg-gray-200"></span>
            </li>
            <li className={`flex items-center ${currentStep >= 4 ? "text-[#FF6B35]" : "text-gray-500"}`}>
              <span className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 4 ? "bg-[#FF6B35] text-white" : "bg-gray-200"}`}>
                4
              </span>
              <span className="ml-2 text-sm">Bebidas</span>
            </li>
          </ol>
        </div>

        {/* Step content */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          {currentStep === 1 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Selecciona las entradas</h2>
              <div className="space-y-3">
                {cateringOptions.filter(opt => opt.category === 'appetizer').map(option => (
                  <div 
                    key={option.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedOptions.includes(option.id) ? 'border-[#FF6B35] bg-[#FF6B35]/5' : 'border-gray-200 hover:border-gray-300'}`}
                    onClick={() => toggleOption(option.id)}
                  >
                    <div className="flex items-start">
                      <div className={`w-5 h-5 rounded-full border flex-shrink-0 flex items-center justify-center ${selectedOptions.includes(option.id) ? 'bg-[#FF6B35] border-[#FF6B35]' : 'border-gray-300'}`}>
                        {selectedOptions.includes(option.id) && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="ml-3 flex-grow">
                        <h3 className="font-medium">{option.name}</h3>
                        <p className="text-sm text-gray-600">{option.description}</p>
                      </div>
                      <div className="ml-2 text-[#FF6B35] font-medium">
                        ${option.price}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Selecciona los platos principales</h2>
              <div className="space-y-3">
                {cateringOptions.filter(opt => opt.category === 'main').map(option => (
                  <div 
                    key={option.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedOptions.includes(option.id) ? 'border-[#FF6B35] bg-[#FF6B35]/5' : 'border-gray-200 hover:border-gray-300'}`}
                    onClick={() => toggleOption(option.id)}
                  >
                    <div className="flex items-start">
                      <div className={`w-5 h-5 rounded-full border flex-shrink-0 flex items-center justify-center ${selectedOptions.includes(option.id) ? 'bg-[#FF6B35] border-[#FF6B35]' : 'border-gray-300'}`}>
                        {selectedOptions.includes(option.id) && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="ml-3 flex-grow">
                        <h3 className="font-medium">{option.name}</h3>
                        <p className="text-sm text-gray-600">{option.description}</p>
                      </div>
                      <div className="ml-2 text-[#FF6B35] font-medium">
                        ${option.price}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Selecciona los postres</h2>
              <div className="space-y-3">
                {cateringOptions.filter(opt => opt.category === 'dessert').map(option => (
                  <div 
                    key={option.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedOptions.includes(option.id) ? 'border-[#FF6B35] bg-[#FF6B35]/5' : 'border-gray-200 hover:border-gray-300'}`}
                    onClick={() => toggleOption(option.id)}
                  >
                    <div className="flex items-start">
                      <div className={`w-5 h-5 rounded-full border flex-shrink-0 flex items-center justify-center ${selectedOptions.includes(option.id) ? 'bg-[#FF6B35] border-[#FF6B35]' : 'border-gray-300'}`}>
                        {selectedOptions.includes(option.id) && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="ml-3 flex-grow">
                        <h3 className="font-medium">{option.name}</h3>
                        <p className="text-sm text-gray-600">{option.description}</p>
                      </div>
                      <div className="ml-2 text-[#FF6B35] font-medium">
                        ${option.price}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Selecciona las bebidas</h2>
              <div className="space-y-3">
                {cateringOptions.filter(opt => opt.category === 'drink').map(option => (
                  <div 
                    key={option.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedOptions.includes(option.id) ? 'border-[#FF6B35] bg-[#FF6B35]/5' : 'border-gray-200 hover:border-gray-300'}`}
                    onClick={() => toggleOption(option.id)}
                  >
                    <div className="flex items-start">
                      <div className={`w-5 h-5 rounded-full border flex-shrink-0 flex items-center justify-center ${selectedOptions.includes(option.id) ? 'bg-[#FF6B35] border-[#FF6B35]' : 'border-gray-300'}`}>
                        {selectedOptions.includes(option.id) && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="ml-3 flex-grow">
                        <h3 className="font-medium">{option.name}</h3>
                        <p className="text-sm text-gray-600">{option.description}</p>
                      </div>
                      <div className="ml-2 text-[#FF6B35] font-medium">
                        ${option.price}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Resumen de selección</h2>
          {selectedOptions.length > 0 ? (
            <div>
              <div className="mb-4 space-y-2">
                {selectedOptions.map(id => {
                  const option = cateringOptions.find(opt => opt.id === id);
                  return option ? (
                    <div key={id} className="flex justify-between">
                      <span>{option.name}</span>
                      <span>${option.price}</span>
                    </div>
                  ) : null;
                })}
                <div className="border-t pt-2 mt-2 font-medium flex justify-between">
                  <span>Total</span>
                  <span>${totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 italic">No has seleccionado ninguna opción todavía.</p>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between">
          <button
            onClick={prevStep}
            className={`px-4 py-2 rounded-md border border-gray-300 ${currentStep === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
            disabled={currentStep === 1}
          >
            Anterior
          </button>
          
          {currentStep < 4 ? (
            <button
              onClick={nextStep}
              className="px-4 py-2 rounded-md bg-[#FF6B35] text-white hover:bg-[#FF6B35]/90"
            >
              Siguiente
            </button>
          ) : (
            <button
              className="px-4 py-2 rounded-md bg-[#FF6B35] text-white hover:bg-[#FF6B35]/90 flex items-center"
            >
              Confirmar selección
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Catering;