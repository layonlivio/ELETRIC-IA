import { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

type Mode = 'signin' | 'signup' | 'reset';

export default function AuthScreen() {
  const { signIn, signUp, resetPassword } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  async function handleSubmit() {
    setError(null);
    setLoading(true);

    if (mode === 'signin') {
      const { error } = await signIn(email, password);
      if (error) setError(error);
    } else if (mode === 'signup') {
      if (password.length < 6) {
        setError('A senha deve ter no mínimo 6 caracteres');
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password, name);
      if (error) setError(error);
      else setError(null);
    } else if (mode === 'reset') {
      const { error } = await resetPassword(email);
      if (error) setError(error);
      else setResetSent(true);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500 mb-3">
            <Zap size={32} className="text-white" fill="white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Eletricista IA</h1>
          <p className="text-slate-400 text-sm mt-1">Sua ferramenta de engenharia elétrica</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-xl">
          {mode === 'reset' && resetSent ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                <Mail size={24} className="text-green-600" />
              </div>
              <h2 className="font-bold text-slate-900 mb-1">E-mail enviado</h2>
              <p className="text-sm text-slate-500 mb-4">Verifique sua caixa de entrada para redefinir a senha.</p>
              <button onClick={() => { setMode('signin'); setResetSent(false); }} className="btn-primary w-full">
                Voltar ao login
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                {mode === 'signin' ? 'Entrar' : mode === 'signup' ? 'Criar conta' : 'Recuperar senha'}
              </h2>

              <div className="space-y-3">
                {mode === 'signup' && (
                  <div className="relative">
                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input-field pl-10"
                      placeholder="Seu nome"
                    />
                  </div>
                )}

                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-10"
                    placeholder="E-mail"
                  />
                </div>

                {mode !== 'reset' && (
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                      className="input-field pl-10 pr-10"
                      placeholder="Senha"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                )}

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">{error}</p>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={loading || (!email || (mode !== 'reset' && !password))}
                  className="btn-primary w-full"
                >
                  {loading ? 'Aguarde...' : mode === 'signin' ? 'Entrar' : mode === 'signup' ? 'Criar conta' : 'Enviar e-mail'}
                </button>
              </div>

              <div className="mt-4 text-center space-y-1">
                {mode === 'signin' && (
                  <>
                    <button onClick={() => setMode('signup')} className="text-sm text-blue-600 font-medium">
                      Não tem conta? Criar agora
                    </button>
                    <br />
                    <button onClick={() => setMode('reset')} className="text-sm text-slate-500">
                      Esqueci minha senha
                    </button>
                  </>
                )}
                {mode === 'signup' && (
                  <button onClick={() => setMode('signin')} className="text-sm text-blue-600 font-medium">
                    Já tem conta? Entrar
                  </button>
                )}
                {mode === 'reset' && (
                  <button onClick={() => setMode('signin')} className="text-sm text-blue-600 font-medium">
                    Voltar ao login
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
