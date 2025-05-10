import React from 'react';
import LoginForm from '../components/LoginForm';
import Logo from '../components/logo';
import { motion } from 'framer-motion';

const Login: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-900">
      <motion.div 
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-black/50 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-orange-900/20">
          <div className="p-8">
            <div className="flex justify-center mb-6">
              <Logo />
            </div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h1 className="text-2xl font-bold text-orange-500 text-center mb-2">Welcome Back</h1>
              <p className="text-orange-200/60 text-center mb-8">Please sign in to continue</p>
            </motion.div>
            
            <LoginForm />
          </div>
          
          <div className="bg-black/40 p-6 text-center">
            <p className="text-orange-200/60">
              Don't have an account?{' '}
              <button className="text-orange-500 hover:text-orange-400 font-semibold transition-colors">
                Create Account
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;