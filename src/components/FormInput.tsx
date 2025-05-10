import React from 'react';
import { motion } from 'framer-motion';

interface FormInputProps {
  id: string;
  type: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  delay?: number;
}

const FormInput: React.FC<FormInputProps> = ({
  id,
  type,
  label,
  value,
  onChange,
  placeholder,
  error,
  disabled = false,
  delay = 0
}) => {
  return (
    <motion.div
      className="space-y-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + delay, duration: 0.4 }}
    >
      <label htmlFor={id} className="block text-sm font-medium text-orange-200/60">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-4 py-2 bg-zinc-800/50 border ${
          error ? 'border-red-500' : 'border-orange-900/30'
        } rounded-lg placeholder-orange-200/30 text-orange-100 focus:outline-none 
        focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200`}
      />
      {error && (
        <motion.p
          className="text-red-500 text-xs mt-1"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.2 }}
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
};

export default FormInput;