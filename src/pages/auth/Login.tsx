import { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { Eye, EyeOff } from 'lucide-react';
import { useUserContext } from '../../hooks/useUserContext';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [keepSession, setKeepSession] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passError, setPassError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { setRole } = useUserContext();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setEmailError('');
    setPassError('');
    setLoading(true);

    const cleanedEmail = email.trim().replace(/['"]/g, '');
    let valid = true;

    if (!cleanedEmail.match(/^[\w.-]+@[\w.-]+\.\w{2,}$/)) {
      setEmailError('Formato de correo inválido');
      valid = false;
    }

    if (password.length < 6) {
      setPassError('Contraseña demasiado corta');
      valid = false;
    }

    if (!isLogin && password !== confirmPassword) {
      setFormError('Las contraseñas no coinciden');
      valid = false;
    }

    if (!valid) {
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: cleanedEmail,
          password,
        });
        if (loginError) throw loginError;

        const { data: userData } = await supabase.auth.getUser();
        const userId = userData?.user?.id;
        if (!userId) throw new Error('No se pudo obtener el ID del usuario');

        let { data: perfil } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single();

        if (!perfil) {
          const { error: insertError } = await supabase.from('profiles').insert([
            { id: userId, nombre: cleanedEmail, role: 'organizador' },
          ]);
          if (insertError) throw new Error('No se pudo generar el perfil correctamente.');

          const { data: perfilFinal } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single();
          perfil = perfilFinal;
        }

        if (!perfil || perfil.role !== 'organizador') {
          setFormError('Este usuario no tiene acceso al panel de organizador.');
          setLoading(false);
          return;
        }

        setRole(perfil.role);
        navigate('/organizador/panel');
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email: cleanedEmail,
          password,
        });
        if (signUpError) throw signUpError;

        setFormError('Cuenta creada. Verificá tu correo y luego iniciá sesión.');
      }
    } catch (error: any) {
      setFormError(error?.message || 'Error inesperado.');
    }

    setLoading(false);
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 to-white overflow-hidden">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6 border border-orange-100">

        {/* Logo y título */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-800">Las Rocas</h1>
          <p className="text-sm text-gray-500">Portal del Organizador</p>
          <p className="text-xs text-gray-400 italic mt-1">
            Accedé a la gestión completa de tus eventos y clientes.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 text-base font-medium text-center transition-all duration-200 ${
              isLogin ? 'border-b-2 border-orange-500 text-orange-500' : 'text-gray-500 hover:text-orange-400'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 text-base font-medium text-center transition-all duration-200 ${
              !isLogin ? 'border-b-2 border-orange-500 text-orange-500' : 'text-gray-500 hover:text-orange-400'
            }`}
          >
            Crear Cuenta
          </button>
        </div>

        {/* Información adicional solo para login */}
        {isLogin && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-gray-700 shadow-sm">
            <p className="font-semibold mb-1 text-orange-600">¿Qué podés hacer como organizador?</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Ver invitados y mesas por evento</li>
              <li>Consultar horarios de actividades</li>
              <li>Exportar informes del evento</li>
            </ul>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="organizador@eventos.com"
              className={`mt-1 w-full border rounded-md px-4 py-2 text-base focus:outline-none focus:ring-2 ${
                emailError ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-orange-400'
              }`}
              required
            />
            {emailError && <p className="text-xs text-red-500 mt-1">{emailError}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <div className="relative mt-1">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tu contraseña"
                className={`w-full border rounded-md px-4 py-2 text-base focus:outline-none focus:ring-2 ${
                  passError ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-orange-400'
                }`}
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {passError && <p className="text-xs text-red-500 mt-1">{passError}</p>}
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirmar Contraseña</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repetí tu contraseña"
                className="mt-1 w-full border border-gray-300 rounded-md px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-orange-400"
                required
              />
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-gray-600">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={keepSession}
                onChange={(e) => setKeepSession(e.target.checked)}
                className="accent-orange-500"
              />
              Mantener sesión
            </label>
            {isLogin && (
              <a href="#" className="text-orange-500 hover:underline">
                ¿Olvidaste tu contraseña?
              </a>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 text-base font-semibold text-white rounded-xl shadow-md ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'
            } transition-all duration-200`}
          >
            {loading ? 'Procesando...' : isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </button>

          {formError && (
            <p className="text-sm text-center text-red-500">{formError}</p>
          )}
        </form>
      </div>
    </div>
  );
}
