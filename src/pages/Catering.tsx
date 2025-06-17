import React, { useState } from 'react';
import { Check, ChevronRight } from 'lucide-react';

interface MenuOption {
  id: string;
  name: string;
  description: string;
  price: number;
  includes: string[];
  allowCustomization: boolean;
}

const menuOptions: MenuOption[] = [
  {
    id: 'menu1',
    name: 'Menú 1',
    description: 'Menu Formal servido en mesa',
    price: 8000,
    includes: [
      'Recepcion basica + cazuelas',
      'Plato principal',
      'Postre',
      'Bebidas de recepción y cena/almuerzo',
      'Bebidas de barra y comidas para el baile'
    ],
    allowCustomization: true
  },
  {
    id: 'menu2',
    name: 'Menú 2',
    description: 'Menu Formal servido en mesa',
    price: 9500,
    includes: [
      'Recepcion basica',
      'Plato de entrada',
      'Plato principal',
      'Postre',
      'Bebidas de recepción y cena/almuerzo',
      'Bebidas de barra y comidas para el baile'
    ],
    allowCustomization: true
  },
  {
    id: 'menu-parrillada',
    name: 'Menú Parrillada',
    description: 'Menu Formal servido en mesa',
    price: 7500,
    includes: [
      'Recepcion basica',
      'Mesa de Fiambres',
      'Parrillada',
      'Postre',
      'Bebidas de recepción y cena/almuerzo',
      'Bebidas de barra y comidas para el baile'
    ],
    allowCustomization: false
  },
  {
    id: 'menu-lunch',
    name: 'Menú Lunch',
    description: 'Opción ligera para reuniones de trabajo',
    price: 6500,
    includes: [
      'Recepcion basica',
      'Mesa de Fiambres',
      'Variedades surtidas de mini postres',
      'Bebidas de recepción y cena/almuerzo',
      'Bebidas de barra y comidas para el baile'
    ],
    allowCustomization: true
  }
];

interface CateringOption {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'entrada' | 'principal' | 'postre';
}

const cateringOptions: CateringOption[] = [
  // Entradas (6)
  { id: 'entrada1', name: 'Seleccion de Fiambres y queso', description: 'Jamon Serrano, bondiola de cerdo, lomito braseado a las hierbas, salame tandilero. Queso pategras, reggianito, provolone y feta de cabra, con nueces,pasas negras y rubias y totadas con pan de campo', price: 2000, category: 'entrada' },
  { id: 'entrada2', name: 'Lasagna Bolognesa', description: 'mozarella, espinaca, jamon y queso y salsa bolognesa', price: 1800, category: 'entrada' },
  { id: 'entrada3', name: 'Ensalada Caesar', description: 'Hojas verdes, pollo grillé, croutons, hebras de parmesano y aderezo Caesar', price: 1700, category: 'entrada' },
  { id: 'entrada4', name: 'Toston de Campo', description: 'Toston de Campo con Jamon serrano y ensalada caponata', price: 1600, category: 'entrada' },
  { id: 'entrada5', name: 'Provoleta', description: 'Provoleta a la plancha con vegetales grillados y chimichurri de hierbas', price: 1900, category: 'entrada' },
  { id: 'entrada6', name: 'Milhojas de vegetales', description: 'milhojas de vegetales asados y queso fontinacon coulis de morrones y tomates asados ', price: 1800, category: 'entrada' },

  // Principales (3)
  { id: 'principal1', name: 'Lomo de ternera grillado ', description: 'Corte de lomo cocinado al horno con hierbas', price: 3500, category: 'principal' },
  { id: 'principal2', name: 'Bondiola de cerdo', description: 'Risotto cremoso con hongos de estación', price: 3200, category: 'principal' },
  { id: 'principal3', name: 'Pollo relleno don mozarella y jamon cocido', description: 'Suprema grillada con salsa de mostaza', price: 3100, category: 'principal' },

  // Postres (8)
  { id: 'postre1', name: 'Brownie', description: 'Brownie con dulce de leche, merengue y frutilla', price: 1500, category: 'postre' },
  { id: 'postre2', name: 'Cheesecake', description: 'Cheese cake de frutos rojos', price: 1300, category: 'postre' },
  { id: 'postre3', name: 'Tiramisú', description: 'Clásico postre italiano con café y mascarpone', price: 1700, category: 'postre' },
  { id: 'postre4', name: 'Chocotorta', description: 'Clásica chocotorta', price: 1600, category: 'postre' },
  { id: 'postre5', name: 'Flan', description: 'Flan casero con dulce de leche', price: 1600, category: 'postre' },
  { id: 'postre6', name:  'Helado', description: 'Helado de chocolate y limon cocado relleno de dulce de leche, con base de choclate ', price: 1500, category: 'postre' },
  { id: 'postre7', name: 'Torta Oreo', description: 'Clásica torta hecha con la famosa galñleta oreo', price: 1800, category: 'postre' },
  { id: 'postre8', name: 'Helado artesanal', description: 'Variedad de sabores de helado casero', price: 1400, category: 'postre' }
];

const Catering: React.FC = () => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<MenuOption | null>(null);

  const totalPrice = selectedOptions.reduce((sum, id) => {
    const option = cateringOptions.find(opt => opt.id === id);
    return option ? sum + option.price : sum;
  }, 0);

  const nextStep = () => setCurrentStep(prev => prev + 1);

  const selectMenu = (menu: MenuOption) => {
    setSelectedMenu(menu);
    setSelectedOptions([]);
    if (!menu.allowCustomization) {
      setShowSummary(true);
    } else {
      setCurrentStep(1);
    }
  };

  if (showSummary && selectedMenu) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Resumen de Catering</h1>
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Menú seleccionado</h2>
            <div className="border-b pb-4">
              <h3 className="font-medium">{selectedMenu.name}</h3>
              <p className="text-sm text-gray-600">{selectedMenu.description}</p>
              <div className="mt-2">
                <h4 className="font-medium text-sm">Incluye:</h4>
                <ul className="text-sm text-gray-600 mt-1 space-y-1">
                  {selectedMenu.includes.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="w-4 h-4 text-[#FF6B35] mr-2 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="text-[#FF6B35] font-medium mt-2">${selectedMenu.price.toLocaleString()}</p>
            </div>
          </div>

          {selectedMenu.allowCustomization && selectedOptions.length > 0 && (
            <>
              <h2 className="text-xl font-semibold mb-4">Tu selección adicional</h2>
              <div className="mb-6 space-y-3">
                {selectedOptions.map(id => {
                  const option = cateringOptions.find(opt => opt.id === id);
                  return option ? (
                    <div key={id} className="border-b pb-2">
                      <h3 className="font-medium">{option.name}</h3>
                      <p className="text-sm text-gray-600">{option.description}</p>
                    </div>
                  ) : null;
                })}
              </div>
            </>
          )}

          <div className="border-t pt-4 text-xl font-bold text-[#FF6B35] text-right">
            Total: ${(
              selectedMenu.price + 
              (selectedMenu.allowCustomization ? totalPrice : 0)
            ).toLocaleString()}
          </div>

          <button
            onClick={() => {
              setShowSummary(false);
              if (!selectedMenu.allowCustomization) {
                setCurrentStep(0);
              }
            }}
            className="mt-6 px-4 py-2 rounded-md bg-[#FF6B35] text-white hover:bg-[#FF6B35]/90"
          >
            Volver a editar
          </button>
        </div>
      </div>
    );
  }

  if (currentStep === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Selecciona tu menú</h1>
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {menuOptions.map(menu => (
              <div 
                key={menu.id}
                className={`border rounded-lg p-6 cursor-pointer transition-all ${
                  selectedMenu?.id === menu.id ? 'border-[#FF6B35] bg-[#FF6B35]/5' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => selectMenu(menu)}
              >
                <h2 className="text-xl font-bold text-[#FF6B35] mb-2">{menu.name}</h2>
                <p className="text-gray-600 mb-4">{menu.description}</p>
                <div className="mb-4">
                  <h3 className="font-medium mb-2">Incluye:</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {menu.includes.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="w-4 h-4 text-[#FF6B35] mr-2 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {!menu.allowCustomization && (
                  <div className="mt-2 text-sm text-gray-500 italic">
                    Este menú no permite personalización adicional
                  </div>
                )}
                <div className="text-xl font-bold text-right text-[#FF6B35]">
                  ${menu.price.toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => selectedMenu && selectedMenu.allowCustomization && nextStep()}
              className={`px-4 py-2 rounded-md bg-[#FF6B35] text-white hover:bg-[#FF6B35]/90 flex items-center ${
                !selectedMenu || !selectedMenu.allowCustomization ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={!selectedMenu || !selectedMenu.allowCustomization}
            >
              Personalizar menú
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 1 && selectedMenu) {
    const groupedOptions = {
      entrada: cateringOptions.filter(opt => opt.category === 'entrada'),
      principal: cateringOptions.filter(opt => opt.category === 'principal'),
      postre: cateringOptions.filter(opt => opt.category === 'postre')
    };

    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Personaliza tu menú</h1>
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 space-y-6">
          {(['entrada', 'principal', 'postre'] as const).map(category => (
            <div key={category}>
              <h2 className="text-2xl font-semibold text-gray-700 mb-4 capitalize">{category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groupedOptions[category].map(option => {
                  const isSelected = selectedOptions.includes(option.id);
                  return (
                    <div
                      key={option.id}
                      onClick={() => {
                        setSelectedOptions(prev =>
                          isSelected
                            ? prev.filter(id => id !== option.id)
                            : [...prev, option.id]
                        );
                      }}
                      className={`border rounded-lg p-4 cursor-pointer transition ${
                        isSelected ? 'border-[#FF6B35] bg-[#FF6B35]/10' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <h3 className="text-lg font-semibold text-[#FF6B35]">{option.name}</h3>
                      <p className="text-sm text-gray-600">{option.description}</p>
                      <p className="text-right font-bold text-[#FF6B35]">${option.price.toLocaleString()}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="flex justify-between mt-6">
            <button
              onClick={() => setCurrentStep(0)}
              className="px-4 py-2 rounded-md bg-gray-300 text-gray-800 hover:bg-gray-400"
            >
              Volver
            </button>
            <button
              onClick={() => setShowSummary(true)}
              className="px-4 py-2 rounded-md bg-[#FF6B35] text-white hover:bg-[#FF6B35]/90"
            >
              Ver resumen
            </button>
          </div>
        </div>
      </div>
    );
  }
  

  return null;
};

export default Catering;
