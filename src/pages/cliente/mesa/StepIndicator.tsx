import React from 'react';

interface Props {
  step: number;
}

const StepIndicator: React.FC<Props> = ({ step }) => {
  const steps = ['Distribución', 'Decoración'];

  return (
    <div className="mb-6 flex items-center space-x-4">
      {steps.map((label, i) => {
        const active = step === i + 1;
        return (
          <div key={i} className="flex items-center space-x-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                active ? 'bg-[#FF6B35] text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              {i + 1}
            </div>
            <span className={`text-sm font-medium ${active ? 'text-[#FF6B35]' : 'text-gray-500'}`}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default StepIndicator;
