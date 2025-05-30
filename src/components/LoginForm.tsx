import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormInput from './FormInput';
import Button from './Button';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { validateEmail, validatePassword } from '../utils/validation.tsx';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');
  
  const navigate = useNavigate();

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError(validateEmail(value));
  };
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordError(validatePassword(value));
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginError('');
    
    const emailValidationError = validateEmail(email);
    const passwordValidationError = validatePassword(password);
    
    setEmailError(emailValidationError);
    setPasswordError(passwordValidationError);
    
    if (!emailValidationError && !passwordValidationError) {
      setIsSubmitting(true);
      
      try {
        // Simulación de llamada a API
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Aquí iría la lógica real de autenticación
        // Por ahora simulamos un login exitoso
        const loginSuccess = true; // Cambiar a false para simular error
        
        if (loginSuccess) {
          console.log('Login successful, redirecting to home...');
          // Guardar en localStorage si "Remember me" está marcado
          if (rememberMe) {
            localStorage.setItem('rememberedEmail', email);
          }
          // Redirigir a Home
          navigate('/home');
        } else {
          setLoginError('Invalid email or password');
        }
      } catch (error) {
        setLoginError('An error occurred during login');
        console.error('Login error:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <motion.form 
      onSubmit={handleSubmit}
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      {loginError && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {loginError}
        </div>
      )}
      
      <FormInput
        id="email"
        type="email"
        label="Email"
        value={email}
        onChange={handleEmailChange}
        placeholder="your@email.com"
        error={emailError}
        disabled={isSubmitting}
        delay={0.1}
      />
      
      <div className="relative">
        <FormInput
          id="password"
          type={showPassword ? 'text' : 'password'}
          label="Password"
          value={password}
          onChange={handlePasswordChange}
          placeholder="••••••••"
          error={passwordError}
          disabled={isSubmitting}
          delay={0.2}
        />
        <button
          type="button"
          className="absolute right-3 top-[34px] text-orange-400/60 hover:text-orange-400 transition-colors"
          onClick={togglePasswordVisibility}
          disabled={isSubmitting}
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
      
      <div className="flex justify-between items-center">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={() => setRememberMe(!rememberMe)}
            className="w-4 h-4 rounded bg-zinc-800 border-orange-600/30 text-orange-500 focus:ring-orange-500"
            disabled={isSubmitting}
          />
          <span className="ml-2 text-sm text-orange-200/60">Remember me</span>
        </label>
        
        <button
          type="button"
          className="text-sm text-orange-500 hover:text-orange-400 transition-colors"
          disabled={isSubmitting}
        >
          Forgot password?
        </button>
      </div>
      
      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}
        loading={isSubmitting}
      >
        Sign In
      </Button>
    </motion.form>
  );
};

export default LoginForm;