import React from 'react';

const faqs = [
  {
    question: '¿Cuál es el horario de atención?',
    answer: 'Nuestro horario de atención es de lunes a viernes de 9:00 a 18:00 horas.',
  },
  {
    question: '¿Dónde están ubicados?',
    answer: 'Estamos ubicados en Calle Ficticia 123, Ciudad, País.',
  },
  {
    question: '¿Cómo puedo reservar una mesa?',
    answer: 'Puedes reservar una mesa a través de nuestra página web en la sección de Mesas.',
  },
  {
    question: '¿Ofrecen menús para eventos?',
    answer: 'Sí, contamos con menús especiales para eventos. Consulta la sección de Catering para más información.',
  },
];

const Faqs: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Preguntas Frecuentes (FAQ)</h1>
      <div className="space-y-6">
        {faqs.map((faq, idx) => (
          <div key={idx} className="bg-white rounded shadow p-4">
            <h2 className="font-semibold text-lg mb-2">{faq.question}</h2>
            <p className="text-gray-700">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Faqs;