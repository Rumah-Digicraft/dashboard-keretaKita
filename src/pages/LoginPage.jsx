import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { TrainFront, Lock, Mail } from 'lucide-react';
import Swal from 'sweetalert2';

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await login(data.email, data.password);
      navigate('/');
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Login Gagal',
        text: 'Email atau password salah. Silakan coba lagi.',
        confirmButtonColor: '#1e40af'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-kai-blue p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-4 backdrop-blur-sm">
            <TrainFront className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">Admin Login</h2>
          <p className="text-blue-100/80 text-sm">Masuk untuk mengelola Dashboard</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  {...register("email", { required: "Email wajib diisi" })}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-kai-blue focus:border-kai-blue transition-all"
                  placeholder="admin@keretakita.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  {...register("password", { required: "Password wajib diisi", minLength: { value: 6, message: "Password minimal 6 karakter" } })}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-kai-blue focus:border-kai-blue transition-all"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-kai-orange hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kai-orange disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Memproses...' : 'Masuk Dashboard'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
