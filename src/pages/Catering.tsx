import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Check, ArrowLeft } from 'lucide-react';

interface MenuOption {
  id: string;
  name: string;
  description: string;
  price: number;
  includes: string[];
  allowCustomization: boolean;
  requiresDishSelection: boolean;
  image: string;
}

interface DishOption {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'entrada' | 'principal' | 'postre';
  image: string;
}

interface SideOption {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'guarnicion' | 'salsa' | 'bebida';
  image: string;
}
interface ExtraOption {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'comida' | 'bebida';
  image: string;
}


const menuOptions: MenuOption[] = [
  {
    id: 'menu1',
    name: 'Menú 1',
    description: 'Menu Formal servido en mesa',
    price: 8000,
    includes: [
      'Recepcion básica + cazuelas',
      'Plato principal',
      'Postre',
      'Bebidas de recepción y cena/almuerzo',
      'Bebidas de barra y comidas para el baile',
    ],
    allowCustomization: true,
    requiresDishSelection: true,
    image: 'https://via.placeholder.com/400x200?text=Menú+1',
  },
  {
    id: 'menu2',
    name: 'Menú 2',
    description: 'Menu Formal con entrada',
    price: 9500,
    includes: [
      'Recepcion básica',
      'Plato de entrada',
      'Plato principal',
      'Postre',
      'Bebidas varias',
    ],
    allowCustomization: true,
    requiresDishSelection: true,
    image: 'https://via.placeholder.com/400x200?text=Menú+2',
  },
  {
    id: 'menu-parrillada',
    name: 'Menú Parrillada',
    description: 'Carnes a la parrilla',
    price: 7500,
    includes: [
      'Mesa de fiambres',
      'Parrillada',
      'Postre',
      'Bebidas variadas',
    ],
    allowCustomization: false,
    requiresDishSelection: false,
    image: 'https://via.placeholder.com/400x200?text=Parrillada',
  },
  {
    id: 'menu-lunch',
    name: 'Menú Lunch',
    description: 'Stands de comidas atendidos por mozos en donde cada invitado se debera acercar a los mismos para servirse',
    price: 7500,
    includes: [
      'Recepcion',
      'Cena/almuerzo',
      'Postre',
      'Bebidas variadas',
    ],
    allowCustomization: false,
    requiresDishSelection: false,
    image: 'https://via.placeholder.com/400x200?text=Parrillada',
  },
];

const dishOptions: DishOption[] = [

  { 
    id: 'entrada1', 
    name: 'Tabla de Fiambres', 
    description: 'Selección de jamón crudo, salame, queso brie y aceitunas', 
    price: 2200, 
    category: 'entrada', 
    image: 'https://via.placeholder.com/300x150?text=Tabla+Fiambres' 
  },
  { 
    id: 'entrada2', 
    name: 'Bruschettas Variadas', 
    description: 'Pan tostado con tomate, albahaca, mozzarella y jamón', 
    price: 1800, 
    category: 'entrada', 
    image: 'https://via.placeholder.com/300x150?text=Bruschettas' 
  },
  { 
    id: 'entrada3', 
    name: 'Empanadas de Carne', 
    description: 'Empanadas caseras de carne cortada a cuchillo', 
    price: 1500, 
    category: 'entrada', 
    image: 'https://via.placeholder.com/300x150?text=Empanadas' 
  },
  { 
    id: 'entrada4', 
    name: 'Tartaleta de Champiñones', 
    description: 'Tartaletas con relleno de champiñones salteados', 
    price: 1900, 
    category: 'entrada', 
    image: 'https://via.placeholder.com/300x150?text=Tartaletas' 
  },
  { 
    id: 'entrada5', 
    name: 'Ceviche de Pescado', 
    description: 'Pescado marinado en limón con cebolla morada y cilantro', 
    price: 2100, 
    category: 'entrada', 
    image: 'https://via.placeholder.com/300x150?text=Ceviche' 
  },
  { 
    id: 'entrada6', 
    name: 'Rollitos de Primavera', 
    description: 'Rollitos crujientes con verduras y salsa agridulce', 
    price: 1700, 
    category: 'entrada', 
    image: 'https://via.placeholder.com/300x150?text=Rollitos' 
  },
  { 
    id: 'entrada7', 
    name: 'Caprese Skewers', 
    description: 'Brochetas de mozzarella, tomate cherry y albahaca', 
    price: 2000, 
    category: 'entrada', 
    image: 'https://via.placeholder.com/300x150?text=Caprese' 
  },
  { 
    id: 'entrada8', 
    name: 'Tartar de Salmón', 
    description: 'Salmón fresco con aguacate y tostadas', 
    price: 2300, 
    category: 'entrada', 
    image: 'https://via.placeholder.com/300x150?text=Tartar' 
  },

  // 3 Platos principales diferentes
  { 
    id: 'principal1', 
    name: 'Lomo Grillado', 
    description: 'Lomo al horno con hierbas provenzales y papas rústicas', 
    price: 3800, 
    category: 'principal', 
    image: '../public/images/lomo-de-ternera.jfif'
  },
  { 
    id: 'principal2', 
    name: 'Risotto de Hongos', 
    description: 'Risotto cremoso con mix de hongos silvestres', 
    price: 3200, 
    category: 'principal', 
    image: 'https://via.placeholder.com/300x150?text=Risotto' 
  },
  { 
    id: 'principal3', 
    name: 'Salmón a la Parrilla', 
    description: 'Salmón con costra de almendras y vegetales al vapor', 
    price: 3500, 
    category: 'principal', 
    image: 'https://via.placeholder.com/300x150?text=Salmon' 
  },


  { 
    id: 'postre1', 
    name: 'Brownie con Helado', 
    description: 'Brownie casero con helado de vainilla y salsa de chocolate', 
    price: 1800, 
    category: 'postre', 
    image: 'https://via.placeholder.com/300x150?text=Brownie' 
  },
  { 
    id: 'postre2', 
    name: 'Cheesecake de Frutos Rojos', 
    description: 'Cheesecake con coulis de frutos rojos y frambuesas frescas', 
    price: 1900, 
    category: 'postre', 
    image: 'https://via.placeholder.com/300x150?text=Cheesecake' 
  },
  { 
    id: 'postre3', 
    name: 'Tiramisú Clásico', 
    description: 'Postre italiano con café, mascarpone y cacao', 
    price: 1700, 
    category: 'postre', 
    image: 'https://via.placeholder.com/300x150?text=Tiramisu' 
  },
  { 
    id: 'postre4', 
    name: 'Volcán de Chocolate', 
    description: 'Torta de chocolate con centro líquido y helado', 
    price: 2000, 
    category: 'postre', 
    image: 'https://via.placeholder.com/300x150?text=Volcan' 
  },
  { 
    id: 'postre5', 
    name: 'Mousse de Maracuyá', 
    description: 'Mousse ligera con salsa de maracuyá y merengue', 
    price: 1600, 
    category: 'postre', 
    image: 'https://via.placeholder.com/300x150?text=Mousse' 
  },
  { 
    id: 'postre6', 
    name: 'Tarta de Manzana', 
    description: 'Tarta casera con manzanas caramelizadas y canela', 
    price: 1500, 
    category: 'postre', 
    image: 'https://via.placeholder.com/300x150?text=Tarta' 
  },
  { 
    id: 'postre7', 
    name: 'Profiteroles', 
    description: 'Bolitas de hojaldre rellenas de crema y bañadas en chocolate', 
    price: 1900, 
    category: 'postre', 
    image: 'https://via.placeholder.com/300x150?text=Profiteroles' 
  },
  { 
    id: 'postre8', 
    name: 'Coulant de Dulce de Leche', 
    description: 'Torta con corazón de dulce de leche y nueces', 
    price: 1800, 
    category: 'postre', 
    image: 'https://via.placeholder.com/300x150?text=Coulant' 
  }
];
const sideOptions: SideOption[] = [

  { 
    id: 'guarnicion1', 
    name: 'Papas Rústicas', 
    description: 'Papas asadas con romero y ajo', 
    price: 800, 
    category: 'guarnicion', 
    image: 'https://via.placeholder.com/300x150?text=Papas+Rusticas' 
  },
  { 
    id: 'guarnicion2', 
    name: 'Verduras al Vapor', 
    description: 'Mix de verduras frescas al vapor', 
    price: 700, 
    category: 'guarnicion', 
    image: 'https://via.placeholder.com/300x150?text=Verduras+Vapor' 
  },
  { 
    id: 'guarnicion3', 
    name: 'Puré de Papas', 
    description: 'Puré cremoso con mantequilla y leche', 
    price: 750, 
    category: 'guarnicion', 
    image: 'https://via.placeholder.com/300x150?text=Puré+Papas' 
  },
  { 
    id: 'guarnicion4', 
    name: 'Arroz Primavera', 
    description: 'Arroz con verduras salteadas', 
    price: 650, 
    category: 'guarnicion', 
    image: 'https://via.placeholder.com/300x150?text=Arroz+Primavera' 
  },

  
  { 
    id: 'salsa1', 
    name: 'Salsa de Hongos', 
    description: 'Salsa cremosa con hongos silvestres', 
    price: 500, 
    category: 'salsa', 
    image: 'https://via.placeholder.com/300x150?text=Salsa+Hongos' 
  },
  { 
    id: 'salsa2', 
    name: 'Salsa de Vino Tinto', 
    description: 'Reducción de vino tinto con especias', 
    price: 550, 
    category: 'salsa', 
    image: 'https://via.placeholder.com/300x150?text=Salsa+Vino' 
  },
  { 
    id: 'salsa3', 
    name: 'Salsa Béarnaise', 
    description: 'Salsa clásica francesa', 
    price: 600, 
    category: 'salsa', 
    image: 'https://via.placeholder.com/300x150?text=Salsa+Bearnaise' 
  },

  { 
    id: 'bebida1', 
    name: 'Agua Mineral', 
    description: 'Botella 750ml', 
    price: 400, 
    category: 'bebida', 
    image: 'https://via.placeholder.com/300x150?text=Agua+Mineral' 
  },
  { 
    id: 'bebida2', 
    name: 'Gaseosa', 
    description: 'Lata 350ml', 
    price: 450, 
    category: 'bebida', 
    image: 'https://via.placeholder.com/300x150?text=Gaseosa' 
  },
  { 
    id: 'bebida3', 
    name: 'Jugo Natural', 
    description: 'Vaso 300ml', 
    price: 500, 
    category: 'bebida', 
    image: 'https://via.placeholder.com/300x150?text=Jugo+Natural' 
  },
  { 
    id: 'bebida4', 
    name: 'Cerveza Artesanal', 
    description: 'Botella 500ml', 
    price: 800, 
    category: 'bebida', 
    image: 'https://via.placeholder.com/300x150?text=Cerveza+Artesanal' 
  },
];

const extraOptions: ExtraOption[] = [

  { 
    id: 'extra-comida1', 
    name: 'Porción de Queso', 
    description: 'Selección de quesos finos', 
    price: 1200, 
    category: 'comida', 
    image: 'https://via.placeholder.com/300x150?text=Porción+Queso' 
  },
  { 
    id: 'extra-comida2', 
    name: 'Panadería', 
    description: 'Selección de panes artesanales', 
    price: 900, 
    category: 'comida', 
    image: 'https://via.placeholder.com/300x150?text=Panadería' 
  },
  { 
    id: 'extra-comida3', 
    name: 'Ensalada Extra', 
    description: 'Ensalada fresca de temporada', 
    price: 1100, 
    category: 'comida', 
    image: 'https://via.placeholder.com/300x150?text=Ensalada+Extra' 
  },


  { 
    id: 'extra-bebida1', 
    name: 'Vino Tinto', 
    description: 'Copa de vino tinto reserva', 
    price: 1000, 
    category: 'bebida', 
    image: 'https://via.placeholder.com/300x150?text=Vino+Tinto' 
  },
  { 
    id: 'extra-bebida2', 
    name: 'Vino Blanco', 
    description: 'Copa de vino blanco reserva', 
    price: 1000, 
    category: 'bebida', 
    image: 'https://via.placeholder.com/300x150?text=Vino+Blanco' 
  },
  { 
    id: 'extra-bebida3', 
    name: 'Cóctel Especial', 
    description: 'Cóctel de la casa', 
    price: 1200, 
    category: 'bebida', 
    image: 'https://via.placeholder.com/300x150?text=Cóctel+Especial' 
  },
];

export const Catering: React.FC = () => {
  const navigate = useNavigate();

  const handleSelectMenu = (menu: MenuOption) => {
    if (menu.requiresDishSelection) {
      navigate(`/catering/${menu.id}/platos`);
    } else {
      alert(`Has seleccionado el menú ${menu.name}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Selecciona tu menú</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {menuOptions.map((menu) => (
          <div
            key={menu.id}
            className="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
            onClick={() => handleSelectMenu(menu)}
          >
            <img src={menu.image} alt={menu.name} className="w-full h-48 object-cover" />
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-bold text-[#FF6B35] mb-2">{menu.name}</h2>
              </div>
              <p className="text-gray-600 mb-4">{menu.description}</p>
              <ul className="text-sm text-gray-600 space-y-2 mb-2">
                {menu.includes.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="w-4 h-4 text-[#FF6B35] mr-2 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              {menu.requiresDishSelection && (
                <div className="text-center">
                  <span className="inline-block px-3 py-1 bg-[#FF6B35]/10 text-[#FF6B35] rounded-full text-sm">
                    Selección de platos requerida
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


export const DishSelection: React.FC = () => {
  const { menuId } = useParams<{ menuId: string }>();
  const navigate = useNavigate();

  const [selectedDishes, setSelectedDishes] = useState<Record<string, string[]>>({
    entrada: [],
    principal: [],
    postre: []
  });

  const menu = menuOptions.find((m) => m.id === menuId);
  const groupedDishes = {
    entrada: dishOptions.filter((d) => d.category === 'entrada'),
    principal: dishOptions.filter((d) => d.category === 'principal'),
    postre: dishOptions.filter((d) => d.category === 'postre')
  };

  const handleDishSelection = (category: string, dishId: string) => {
    setSelectedDishes((prev) => {
      const currentSelected = [...prev[category]];
      const index = currentSelected.indexOf(dishId);
      if (index === -1) currentSelected.push(dishId);
      else currentSelected.splice(index, 1);
      return { ...prev, [category]: currentSelected };
    });
  };

  const handleContinue = () => {
    navigate(`/catering/${menuId}/acompanamientos`);
  };

  if (!menu) return <div>Menú no encontrado</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/catering')}
        className="flex items-center text-[#FF6B35] mb-6 hover:underline"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Volver a selección de menús
      </button>

      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Personaliza tu {menu.name}</h1>
        <p className="text-gray-600 mb-6">Paso 1 de 3: Selecciona tus platos</p>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Resumen */}
          <div className="md:w-1/3 sticky top-4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-2">Resumen</h3>
              <p className="text-gray-600">{menu.description}</p>

              <div className="my-4 border-t pt-3 space-y-2">
                {Object.entries(selectedDishes).map(([category, dishes]) =>
                  dishes.length > 0 ? (
                    <div key={category}>
                      <h4 className="font-semibold capitalize">{category}</h4>
                      <ul className="pl-4 list-disc">
                        {dishes.map((dishId) => {
                          const dish = dishOptions.find((d) => d.id === dishId);
                          return dish ? (
                            <li key={dishId} className="text-sm">
                              {dish.name}
                            </li>
                          ) : null;
                        })}
                      </ul>
                    </div>
                  ) : null
                )}
              </div>

              <button
                onClick={handleContinue}
                disabled={!selectedDishes.principal.length}
                className={`mt-4 w-full py-2 rounded ${
                  selectedDishes.principal.length
                    ? 'bg-[#FF6B35] text-white hover:bg-[#FF6B35]/90'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Continuar a acompañamientos
              </button>
            </div>
          </div>

          {/* Selección de platos */}
          <div className="md:w-2/3 space-y-8">
            {/* Entradas - Checkbox List */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Entradas</h2>
              <div className="space-y-2">
                {groupedDishes.entrada.map((dish) => (
                  <label key={dish.id} className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedDishes.entrada.includes(dish.id)}
                      onChange={() => handleDishSelection('entrada', dish.id)}
                      className="mt-1 h-4 w-4 text-[#FF6B35] border-gray-300 rounded focus:ring-[#FF6B35]"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-900">{dish.name}</span>
                      </div>
                      <p className="text-sm text-gray-600">{dish.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Platos principales - Cards */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Platos principales</h2>
              <p className="text-sm text-gray-500">Selecciona al menos 1 opción</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedDishes.principal.map((dish) => (
                  <div
                    key={dish.id}
                    className={`border rounded-lg overflow-hidden shadow-sm cursor-pointer transition-all ${
                      selectedDishes.principal.includes(dish.id)
                        ? 'border-[#FF6B35] ring-2 ring-[#FF6B35]/30'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleDishSelection('principal', dish.id)}
                  >
                    <img 
                      src={dish.image} 
                      alt={dish.name} 
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-semibold text-[#FF6B35]">{dish.name}</h3>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{dish.description}</p>
                      {selectedDishes.principal.includes(dish.id) && (
                        <div className="mt-2 text-right">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#FF6B35]/10 text-[#FF6B35]">
                            Seleccionado
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Postres - Checkbox List */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Postres</h2>
              <div className="space-y-2">
                {groupedDishes.postre.map((dish) => (
                  <label key={dish.id} className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedDishes.postre.includes(dish.id)}
                      onChange={() => handleDishSelection('postre', dish.id)}
                      className="mt-1 h-4 w-4 text-[#FF6B35] border-gray-300 rounded focus:ring-[#FF6B35]"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-900">{dish.name}</span>
                      </div>
                      <p className="text-sm text-gray-600">{dish.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export const SideSelection: React.FC = () => {
  const { menuId } = useParams<{ menuId: string }>();
  const navigate = useNavigate();

  const [selectedSides, setSelectedSides] = useState<Record<string, string[]>>({
    guarnicion: [],
    salsa: [],
    bebida: []
  });

  const menu = menuOptions.find((m) => m.id === menuId);
  const groupedSides = {
    guarnicion: sideOptions.filter((d) => d.category === 'guarnicion'),
    salsa: sideOptions.filter((d) => d.category === 'salsa'),
    bebida: sideOptions.filter((d) => d.category === 'bebida')
  };

  const handleSideSelection = (category: string, sideId: string) => {
    setSelectedSides((prev) => {
      const currentSelected = [...prev[category]];
      const index = currentSelected.indexOf(sideId);
      if (index === -1) currentSelected.push(sideId);
      else currentSelected.splice(index, 1);
      return { ...prev, [category]: currentSelected };
    });
  };

  const handleContinue = () => {
    navigate(`/catering/${menuId}/extras`);
  };

  if (!menu) return <div>Menú no encontrado</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate(`/catering/${menuId}/platos`)}
        className="flex items-center text-[#FF6B35] mb-6 hover:underline"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Volver a selección de platos
      </button>

      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Personaliza tu {menu.name}</h1>
        <p className="text-gray-600 mb-6">Paso 2 de 3: Selecciona acompañamientos</p>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/3 sticky top-4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-2">Resumen</h3>
              <p className="text-gray-600">{menu.description}</p>

              <div className="my-4 border-t pt-3 space-y-2">
                {Object.entries(selectedSides).map(([category, sides]) =>
                  sides.length > 0 ? (
                    <div key={category}>
                      <h4 className="font-semibold capitalize">
                        {category === 'guarnicion' ? 'Guarniciones' : 
                         category === 'salsa' ? 'Salsas' : 'Bebidas'}
                      </h4>
                      <ul className="pl-4 list-disc">
                        {sides.map((sideId) => {
                          const side = sideOptions.find((d) => d.id === sideId);
                          return side ? (
                            <li key={sideId} className="text-sm">
                              {side.name}
                            </li>
                          ) : null;
                        })}
                      </ul>
                    </div>
                  ) : null
                )}
              </div>

              <button
                onClick={handleContinue}
                className="mt-4 w-full bg-[#FF6B35] text-white py-2 rounded hover:bg-[#FF6B35]/90"
              >
                Continuar a extras
              </button>
            </div>
          </div>

          <div className="md:w-2/3 space-y-8">
            {(['guarnicion', 'salsa', 'bebida'] as const).map((category) => (
              <div key={category} className="space-y-4">
                <h2 className="text-xl font-semibold capitalize">
                  {category === 'guarnicion' ? 'Guarniciones' : 
                   category === 'salsa' ? 'Salsas para el plato principal' : 'Bebidas'}
                </h2>
                <div className="space-y-3">
                  {groupedSides[category].map((side) => (
                    <label key={side.id} className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedSides[category].includes(side.id)}
                        onChange={() => handleSideSelection(category, side.id)}
                        className="mt-1 h-4 w-4 text-[#FF6B35] border-gray-300 rounded focus:ring-[#FF6B35]"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-900">{side.name}</span>
                        </div>
                        <p className="text-sm text-gray-600">{side.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const ExtraSelection: React.FC = () => {
  const { menuId } = useParams<{ menuId: string }>();
  const navigate = useNavigate();

  const [selectedExtras, setSelectedExtras] = useState<Record<string, string[]>>({
    comida: [],
    bebida: []
  });

  const menu = menuOptions.find((m) => m.id === menuId);
  const groupedExtras = {
    comida: extraOptions.filter((d) => d.category === 'comida'),
    bebida: extraOptions.filter((d) => d.category === 'bebida')
  };

  const handleExtraSelection = (category: string, extraId: string) => {
    setSelectedExtras((prev) => {
      const currentSelected = [...prev[category]];
      const index = currentSelected.indexOf(extraId);
      if (index === -1) currentSelected.push(extraId);
      else currentSelected.splice(index, 1);
      return { ...prev, [category]: currentSelected };
    });
  };

  const handleFinish = () => {
    alert('Selección completada con éxito!');
    navigate('/catering');
  };

  if (!menu) return <div>Menú no encontrado</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate(`/catering/${menuId}/acompanamientos`)}
        className="flex items-center text-[#FF6B35] mb-6 hover:underline"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Volver a acompañamientos
      </button>

      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Personaliza tu {menu.name}</h1>
        <p className="text-gray-600 mb-6">Paso 3 de 3: Selecciona extras</p>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/3 sticky top-4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-2">Resumen</h3>
              <p className="text-gray-600">{menu.description}</p>

              <div className="my-4 border-t pt-3 space-y-2">
                {Object.entries(selectedExtras).map(([category, extras]) =>
                  extras.length > 0 ? (
                    <div key={category}>
                      <h4 className="font-semibold capitalize">
                        {category === 'comida' ? 'Comidas adicionales' : 'Bebidas adicionales'}
                      </h4>
                      <ul className="pl-4 list-disc">
                        {extras.map((extraId) => {
                          const extra = extraOptions.find((d) => d.id === extraId);
                          return extra ? (
                            <li key={extraId} className="text-sm">
                              {extra.name}
                            </li>
                          ) : null;
                        })}
                      </ul>
                    </div>
                  ) : null
                )}
              </div>

              <button
                onClick={handleFinish}
                className="mt-4 w-full bg-[#FF6B35] text-white py-2 rounded hover:bg-[#FF6B35]/90"
              >
                Finalizar selección
              </button>
            </div>
          </div>

          {/* Selección de extras */}
          <div className="md:w-2/3 space-y-8">
            {(['comida', 'bebida'] as const).map((category) => (
              <div key={category} className="space-y-4">
                <h2 className="text-xl font-semibold capitalize">
                  {category === 'comida' ? 'Comidas adicionales' : 'Bebidas adicionales'}
                </h2>
                
                {/* Cartel informativo */}
                <div className={`p-4 rounded-lg mb-4 ${
                  category === 'comida' 
                    ? 'bg-blue-50 border border-blue-200 text-blue-800'
                    : 'bg-green-50 border border-green-200 text-green-800'
                }`}>
                  {category === 'comida' ? (
                    <p className="font-medium">Las comidas extras se cobran por un mínimo de 50 unidades</p>
                  ) : (
                    <p className="font-medium">Las bebidas extra se cobran por adulto mayor</p>
                  )}
                </div>

                <div className="space-y-3">
                  {groupedExtras[category].map((extra) => (
                    <label key={extra.id} className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedExtras[category].includes(extra.id)}
                        onChange={() => handleExtraSelection(category, extra.id)}
                        className="mt-1 h-4 w-4 text-[#FF6B35] border-gray-300 rounded focus:ring-[#FF6B35]"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-900">{extra.name}</span>
                        </div>
                        <p className="text-sm text-gray-600">{extra.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
    </div>
    
  );
};

export default Catering;