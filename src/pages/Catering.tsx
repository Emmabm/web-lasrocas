import React, { useState } from 'react';
import { Check, ChevronRight } from 'lucide-react';

interface CateringOption {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'appetizer' | 'main' | 'dessert' | 'drink' | 'additional';
}

const cateringOptions: CateringOption[] = [
  // Entradas
  { id: 'a1', name: 'Tabla de quesos', description: 'Selección de quesos gourmet con frutos secos y mermeladas', price: 2500, category: 'appetizer' },
  { id: 'a2', name: 'Canapés variados', description: 'Surtido de canapés con diferentes coberturas', price: 1800, category: 'appetizer' },
  { id: 'a3', name: 'Empanadas gourmet', description: 'Mini empanadas en variedad de sabores', price: 2000, category: 'appetizer' },

  // Principales
  { id: 'm1', name: 'Lomo al horno', description: 'Lomo de ternera con guarnición de papas', price: 3500, category: 'main' },
  { id: 'm2', name: 'Pollo a la naranja', description: 'Pollo glaseado con salsa de naranja y arroz', price: 3000, category: 'main' },
  { id: 'm3', name: 'Risotto de hongos', description: 'Risotto cremoso con variedad de hongos', price: 2800, category: 'main' },

  // Postres
  { id: 'd1', name: 'Mini tortas', description: 'Variedad de mini tortas de chocolate, frutilla y vainilla', price: 1500, category: 'dessert' },
  { id: 'd2', name: 'Frutas de estación', description: 'Selección de frutas frescas de temporada', price: 1200, category: 'dessert' },

  // Bebidas
  { id: 'dr1', name: 'Barra de bebidas', description: 'Incluye agua, gaseosas, vino y cerveza', price: 2000, category: 'drink' },
  { id: 'dr2', name: 'Servicio de café', description: 'Café, té y petit fours', price: 800, category: 'drink' },
 

  // Adicionales
  { id: 'ad1', name: 'Panchos', description: 'Hot dogs estilo gourmet - mínimo 50 unidades', price: 400, category: 'additional' },
  { id: 'ad2', name: 'Hamburguesas', description: 'Hamburguesas premium - mínimo 50 unidades', price: 700, category: 'additional' },
  { id: 'ad3', name: 'Choripanes', description: 'Clásicos choripanes - mínimo 50 unidades', price: 500, category: 'additional' },
   { id: 'dr3', name: 'Tragos para adultos', description: 'Cócteles clásicos y de autor (adicional)', price: 1500, category: 'drink' },
  { id: 'dr4', name: 'Licuados sin alcohol', description: 'Licuados de frutas frescas (adicional)', price: 1000, category: 'drink' },
];

const TOTAL_STEPS = 5;

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
    setCurrentStep(prev => Math.min(prev + 1, TOTAL_STEPS));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const StepIndicator: React.FC = () => (
    <ol className="flex items-center w-full">
      {['Entrada', 'Principal', 'Postre', 'Bebidas', 'Adicionales'].map((label, index) => {
        const stepNumber = index + 1;
        const isActive = currentStep >= stepNumber;
        return (
          <React.Fragment key={label}>
            <li className={`flex items-center ${isActive ? 'text-[#FF6B35]' : 'text-gray-500'}`}>
              <span className={`flex items-center justify-center w-8 h-8 rounded-full ${isActive ? 'bg-[#FF6B35] text-white' : 'bg-gray-200'}`}>{stepNumber}</span>
              <span className="ml-2 text-sm whitespace-nowrap">{label}</span>
            </li>
            {stepNumber < TOTAL_STEPS && <span className="w-full h-1 mx-4 bg-gray-200"></span>}
          </React.Fragment>
        );
      })}
    </ol>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Selección de Catering</h1>

      <div className="max-w-4xl mx-auto">
        {/* Step indicator */}
        <div className="mb-8">
          <StepIndicator />
        </div>

        {/* Step content */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          {currentStep === 1 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Selecciona las entradas</h2>
              <div className="space-y-3">
                {cateringOptions.filter(opt => opt.category === 'appetizer').map(option => (
                  <OptionCard key={option.id} option={option} selected={selectedOptions.includes(option.id)} onToggle={toggleOption} />
                ))}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Selecciona los platos principales</h2>
              <div className="space-y-3">
                {cateringOptions.filter(opt => opt.category === 'main').map(option => (
                  <OptionCard key={option.id} option={option} selected={selectedOptions.includes(option.id)} onToggle={toggleOption} />
                ))}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Selecciona los postres</h2>
              <div className="space-y-3">
                {cateringOptions.filter(opt => opt.category === 'dessert').map(option => (
                  <OptionCard key={option.id} option={option} selected={selectedOptions.includes(option.id)} onToggle={toggleOption} />
                ))}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Selecciona las bebidas</h2>
              <p className="text-sm text-gray-500 mb-4 italic">Cada trago/licuado adicional se cobra por persona.</p>
              <div className="space-y-3">
                {cateringOptions.filter(opt => opt.category === 'drink').map(option => (
                  <OptionCard key={option.id} option={option} selected={selectedOptions.includes(option.id)} onToggle={toggleOption} />
                ))}
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Selecciona adicionales</h2>
              <p className="text-sm text-gray-500 mb-4 italic">Cada comida adicional se cobra por cantidad.</p>
              <div className="space-y-3">
                {cateringOptions.filter(opt => opt.category === 'additional').map(option => (
                  <OptionCard key={option.id} option={option} selected={selectedOptions.includes(option.id)} onToggle={toggleOption} />
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

          {currentStep < TOTAL_STEPS ? (
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

interface OptionCardProps {
  option: CateringOption;
  selected: boolean;
  onToggle: (id: string) => void;
}

const OptionCard: React.FC<OptionCardProps> = ({ option, selected, onToggle }) => (
  <div
    className={`border rounded-lg p-4 cursor-pointer transition-all ${selected ? 'border-[#FF6B35] bg-[#FF6B35]/5' : 'border-gray-200 hover:border-gray-300'}`}
    onClick={() => onToggle(option.id)}
  >
    <div className="flex items-start">
      <div className={`w-5 h-5 rounded-full border flex-shrink-0 flex items-center justify-center ${selected ? 'bg-[#FF6B35] border-[#FF6B35]' : 'border-gray-300'}`}>
        {selected && <Check className="w-3 h-3 text-white" />}
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
);

export default Catering;
