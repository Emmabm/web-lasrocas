import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const Logo: React.FC = () => {
  return (
    <motion.div 
      className="flex items-center"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: 0.1
      }}
    >
      <div className="bg-gradient-to-r from-orange-600 to-orange-400 p-3 rounded-xl shadow-lg">
        <ShieldCheck className="h-8 w-8 text-black" strokeWidth={2} />
      </div>
      <div className="ml-3">
        <h2 className="text-2xl font-bold text-white">Secure<span className="text-orange-500">Login</span></h2>
      </div>
    </motion.div>
  );
};

export default Logo