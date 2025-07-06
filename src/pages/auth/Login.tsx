import { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [modo, setModo] = useState<'login' | 'signup'>('login');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let result;

    if (modo === 'login') {
      result = await supabase.auth.signInWithPassword({ email, password });
    } else {
      result = await supabase.auth.signUp({ email, password });
    }

    if (result.error) {
      alert('Error: ' + result.error.message);
    } else {
      navigate('/admin');
    }
  };

  return (
    <div className="p-6 max-w-sm mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-center">
        {modo === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Correo electrónico"
          className="border p-2 rounded w-full"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          className="border p-2 rounded w-full"
          required
        />
        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded">
          {modo === 'login' ? 'Entrar' : 'Registrarme'}
        </button>
      </form>

      <button
        onClick={() => setModo(modo === 'login' ? 'signup' : 'login')}
        className="text-sm text-blue-600 underline"
      >
        {modo === 'login'
          ? '¿No tenés cuenta? Crear una'
          : '¿Ya tenés cuenta? Iniciar sesión'}
      </button>
    </div>
  );
}
