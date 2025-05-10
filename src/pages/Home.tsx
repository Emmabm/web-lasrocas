import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid, Utensils, Calendar } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Bienvenido a Las Rocas</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          La plataforma integral para planificar tu evento de manera fácil e interactiva.
        </p>
      </section>
      
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
        <div className="bg-white p-6 rounded-lg shadow-md text-center transition-transform hover:scale-105">
          <div className="w-16 h-16 bg-[#FF6B35]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <LayoutGrid className="h-8 w-8 text-[#FF6B35]" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Planificador de Mesas</h2>
          <p className="text-gray-600 mb-4">Organiza la distribución perfecta de tus invitados con nuestro planificador interactivo.</p>
          <Link to="/mesas" className="text-[#FF6B35] font-medium hover:underline">
            Organizar mesas
          </Link>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md text-center transition-transform hover:scale-105">
          <div className="w-16 h-16 bg-[#FF6B35]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Utensils className="h-8 w-8 text-[#FF6B35]" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Selección de Catering</h2>
          <p className="text-gray-600 mb-4">Explora nuestras opciones de catering y crea el menú perfecto para tus invitados.</p>
          <Link to="/catering" className="text-[#FF6B35] font-medium hover:underline">
            Ver opciones
          </Link>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md text-center transition-transform hover:scale-105">
          <div className="w-16 h-16 bg-[#FF6B35]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-8 w-8 text-[#FF6B35]" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Registro de Evento</h2>
          <p className="text-gray-600 mb-4">Finaliza tu planificación y recibe toda la información por WhatsApp.</p>
          <Link to="/contacto" className="text-[#FF6B35] font-medium hover:underline">
            Registrar evento
          </Link>
        </div>
      </section>
      
      <section className="bg-gray-100 rounded-lg p-8 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6">¿Cómo funciona?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 bg-[#FF6B35] text-white rounded-full flex items-center justify-center mb-4">
              1
            </div>
            <h3 className="text-lg font-medium mb-2">Diseña tu Salón</h3>
            <p className="text-center text-gray-600">Arrastra y coloca las mesas como desees en nuestro plano interactivo.</p>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 bg-[#FF6B35] text-white rounded-full flex items-center justify-center mb-4">
              2
            </div>
            <h3 className="text-lg font-medium mb-2">Elige tu Menú</h3>
            <p className="text-center text-gray-600">Selecciona las opciones de catering que mejor se adapten a tu evento.</p>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 bg-[#FF6B35] text-white rounded-full flex items-center justify-center mb-4">
              3
            </div>
            <h3 className="text-lg font-medium mb-2">Confirma los Detalles</h3>
            <p className="text-center text-gray-600">Finaliza tu registro y recibe la confirmación con todos los detalles.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;