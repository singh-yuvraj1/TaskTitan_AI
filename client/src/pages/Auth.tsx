import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Mail, Lock, LogIn, Sparkles, UserPlus } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';

export const Auth: React.FC = () => {
  const { login, signup, showToast } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('ninja@gmail.com');
  const [password, setPassword] = useState('password');
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && password.trim()) {
      if (isLogin) {
        await login(email.trim(), password.trim());
      } else {
        await signup(email.trim(), password.trim(), name.trim());
      }
    }
  };

  const handleGoogleLogin = async () => {
    const ssoEmail = 'hacker.ninja@gmail.com';
    const ssoPassword = 'sso_google_secret_password_1337';
    // Attempt standard login first
    const success = await login(ssoEmail, ssoPassword);
    if (!success) {
      // Auto-register mock SSO profile
      const signupSuccess = await signup(ssoEmail, ssoPassword, 'Hacker Ninja');
      if (signupSuccess) {
        await login(ssoEmail, ssoPassword);
      }
    }
  };

  return (
    <div className="min-h-screen text-white flex items-center justify-center bg-darkBg px-4 relative">
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-neonCyan/5 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-neonViolet/5 rounded-full blur-[90px] pointer-events-none" />

      <GlassCard className="w-full max-w-md p-8 bg-[#0a0c16]/95 border border-white/20" glowColor="cyan">
        {/* Branding header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-neonCyan to-neonViolet items-center justify-center shadow-glass-cyan text-2xl mb-3">
            🥷
          </div>
          <h2 className="text-2xl font-black text-white tracking-wide">
            Coding<span className="text-neonCyan">Ninja</span>
          </h2>
          <p className="text-xs text-white/50 mt-1 uppercase tracking-widest font-mono">Productivity Operating System</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-[10px] uppercase font-mono tracking-wider text-white/40 mb-1">Full Name</label>
              <div className="flex bg-white/5 rounded-xl border border-white/10 px-3 py-2.5 focus-within:border-neonCyan/40 transition-all">
                <input
                  type="text"
                  placeholder="Enter name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-transparent border-0 outline-none text-xs text-white placeholder-white/20 w-full"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] uppercase font-mono tracking-wider text-white/40 mb-1">Email Address</label>
            <div className="flex bg-white/5 rounded-xl border border-white/10 px-3 py-2.5 focus-within:border-neonCyan/40 transition-all">
              <Mail size={16} className="text-white/30 mr-2 self-center" />
              <input
                type="email"
                placeholder="ninja@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-transparent border-0 outline-none text-xs text-white placeholder-white/20 w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-mono tracking-wider text-white/40 mb-1">Password</label>
            <div className="flex bg-white/5 rounded-xl border border-white/10 px-3 py-2.5 focus-within:border-neonCyan/40 transition-all">
              <Lock size={16} className="text-white/30 mr-2 self-center" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-transparent border-0 outline-none text-xs text-white placeholder-white/20 w-full"
              />
            </div>
          </div>

          {isLogin && (
            <div className="text-right">
              <button 
                type="button"
                onClick={() => showToast("Simulated: Password reset link generated and printed to console logs.", "info")}
                className="text-[10px] font-mono text-neonCyan hover:underline"
              >
                Forgot Password?
              </button>
            </div>
          )}

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-neonCyan via-neonViolet to-neonRose text-black font-extrabold py-3 rounded-xl hover:opacity-95 transition-all text-xs shadow-glass-cyan"
          >
            {isLogin ? (
              <>
                <LogIn size={14} />
                <span>Enter Workspace</span>
              </>
            ) : (
              <>
                <UserPlus size={14} />
                <span>Create Sandbox Profile</span>
              </>
            )}
          </button>
        </form>

        {/* Separator */}
        <div className="relative my-6 text-center">
          <hr className="border-white/10" />
          <span className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 px-2 bg-[#0a0c16] text-[9px] font-mono text-white/30 uppercase tracking-widest">
            or connect with
          </span>
        </div>

        {/* Google SSO Login */}
        <button
          onClick={handleGoogleLogin}
          type="button"
          className="w-full flex items-center justify-center gap-2 border border-white/15 bg-white/5 text-white/80 font-bold py-2.5 rounded-xl hover:bg-white/10 hover:text-white transition-all text-xs"
        >
          <span className="text-sm">🌐</span>
          <span>Sign In with Google</span>
        </button>

        {/* Mode Toggle */}
        <div className="text-center mt-6 text-xs text-white/40">
          {isLogin ? (
            <p>
              New here?{' '}
              <button onClick={() => setIsLogin(false)} className="text-neonCyan font-bold hover:underline">
                Create an account
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button onClick={() => setIsLogin(true)} className="text-neonCyan font-bold hover:underline">
                Sign in
              </button>
            </p>
          )}
        </div>
      </GlassCard>
    </div>
  );
};
