import React, { useState } from 'react';
import { Send } from 'lucide-react';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar el formulario
    const message = `Hola! Me gustaría obtener más información sobre la organización de un evento en Las Pocas.\n\nNombre: ${formData.name}\nFecha del evento: ${formData.date}\n\n${formData.message}`;
    
    // Abrir WhatsApp con mensaje predefinido
    const whatsappUrl = `https://wa.me/5491112345678?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Contacta con nosotros</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="name">
                Nombre completo
              </label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="email">
                Correo electrónico
              </label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="phone">
                Teléfono
              </label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
                id="phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="date">
                Fecha del evento
              </label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
                id="date"
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="message">
                Mensaje
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
                id="message"
                name="message"
                rows={4}
                value={formData.message}
                onChange={handleChange}
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-[#FF6B35] text-white py-2 px-4 rounded-md hover:bg-[#FF6B35]/90 transition-colors flex items-center justify-center"
            >
              <Send className="w-4 h-4 mr-2" />
              Enviar por WhatsApp
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Información de contacto</h2>
          <div className="space-y-3">
            <p className="flex items-start">
              <span className="font-medium w-24">Dirección:</span>
              <span>Av. Corrientes 1234, Buenos Aires</span>
            </p>
            <p className="flex items-start">
              <span className="font-medium w-24">Teléfono:</span>
              <span>+54 9 11 1234-5678</span>
            </p>
            <p className="flex items-start">
              <span className="font-medium w-24">Email:</span>
              <span>info@laspocas.com</span>
            </p>
            <p className="flex items-start">
              <span className="font-medium w-24">Horario:</span>
              <span>Lunes a Viernes: 9:00 - 18:00</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;