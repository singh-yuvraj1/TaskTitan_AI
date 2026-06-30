import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Lock, Eye, EyeOff, LogIn, UserPlus, ArrowLeft,
  CheckCircle2, AlertCircle, Loader2, Zap, Shield, User
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

/* ─── Password Strength Utility ─────────────────────────────────────────── */
function getPasswordStrength(pwd: string): { score: number; label: string; color: string } {
  if (!pwd) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pwd.length >= 6) score++;
  if (pwd.length >= 10) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 1) return { score, label: 'Weak', color: '#ef4444' };
  if (score <= 2) return { score, label: 'Fair', color: '#f59e0b' };
  if (score <= 3) return { score, label: 'Good', color: '#3b82f6' };
  if (score <= 4) return { score, label: 'Strong', color: '#8b5cf6' };
  return { score, label: 'Excellent', color: '#06b6d4' };
}

/* ─── Animated Blob Background ──────────────────────────────────────────── */
const Blobs: React.FC = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
    <motion.div
      className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-20"
      style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }}
      animate={{ x: [0, 60, -30, 0], y: [0, -40, 60, 0], scale: [1, 1.1, 0.95, 1] }}
      transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full opacity-15"
      style={{ background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)' }}
      animate={{ x: [0, -50, 30, 0], y: [0, 50, -40, 0], scale: [1, 0.9, 1.1, 1] }}
      transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-5"
      style={{ background: 'radial-gradient(circle, #ec4899 0%, transparent 70%)' }}
      animate={{ rotate: [0, 360] }}
      transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
    />
  </div>
);

/* ─── Input Field Component ─────────────────────────────────────────────── */
interface InputFieldProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
  error?: string;
  autoComplete?: string;
}
const InputField: React.FC<InputFieldProps> = ({
  id, label, type = 'text', value, onChange, placeholder, icon, rightElement, error, autoComplete
}) => (
  <div>
    <label htmlFor={id} className="block text-[11px] font-semibold uppercase tracking-widest text-white/40 mb-1.5">
      {label}
    </label>
    <div className={`relative flex items-center bg-white/[0.04] border ${error ? 'border-red-500/60' : 'border-white/[0.1]'} rounded-2xl transition-all duration-200 focus-within:border-violet-500/50 focus-within:bg-white/[0.06] focus-within:shadow-[0_0_0_3px_rgba(124,58,237,0.1)]`}>
      {icon && <div className="pl-4 pr-1 text-white/25 flex-shrink-0">{icon}</div>}
      <input
        id={id}
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="flex-1 bg-transparent py-3.5 px-4 text-sm text-white placeholder-white/20 outline-none"
      />
      {rightElement && <div className="pr-3 flex-shrink-0">{rightElement}</div>}
    </div>
    <AnimatePresence>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          className="flex items-center gap-1 mt-1.5 text-[11px] text-red-400"
        >
          <AlertCircle size={11} /> {error}
        </motion.p>
      )}
    </AnimatePresence>
  </div>
);

/* ─── Google Sign-In Button ─────────────────────────────────────────────── */
const GoogleButton: React.FC = () => (
  <button
    type="button"
    onClick={() => { window.location.href = `${API_BASE}/auth/google`; }}
    className="w-full flex items-center justify-center gap-3 bg-white text-[#1f1f1f] font-semibold py-3 px-4 rounded-2xl text-sm hover:bg-white/90 active:scale-[0.98] transition-all duration-150 shadow-sm"
    aria-label="Sign in with Google"
  >
    {/* Official Google G logo SVG */}
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path d="M17.64 9.20c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
    <span>Continue with Google</span>
  </button>
);

/* ─── Main Auth Component ───────────────────────────────────────────────── */
type AuthMode = 'login' | 'signup' | 'forgot' | 'reset';

export const Auth: React.FC = () => {
  const { login, signup, showToast, setActiveTab } = useApp();

  // Detect reset mode from URL query params
  const [mode, setMode] = useState<AuthMode>(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'reset' && params.get('token')) return 'reset';
    return 'login';
  });
  const [resetToken] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('token') || '';
  });

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [devResetUrl, setDevResetUrl] = useState('');

  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const strength = getPasswordStrength(password);

  // Clear URL params after reading them
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('tab') || params.get('mode') || params.get('token')) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (mode === 'login' || mode === 'signup' || mode === 'forgot') {
      if (!email.trim()) e.email = 'Email is required.';
      else if (!emailRx.test(email.trim())) e.email = 'Enter a valid email address.';
    }
    if (mode === 'login') {
      if (!password) e.password = 'Password is required.';
    }
    if (mode === 'signup') {
      if (!name.trim()) e.name = 'Full name is required.';
      if (!password) e.password = 'Password is required.';
      else if (password.length < 6) e.password = 'Password must be at least 6 characters.';
      if (!confirmPassword) e.confirmPassword = 'Please confirm your password.';
      else if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match.';
    }
    if (mode === 'reset') {
      if (!password) e.password = 'New password is required.';
      else if (password.length < 6) e.password = 'Password must be at least 6 characters.';
      if (!confirmPassword) e.confirmPassword = 'Please confirm your password.';
      else if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    const ok = await login(email.trim(), password);
    if (!ok) {
      setErrors({ general: 'Invalid email or password. Please try again.' });
    }
  };

  const handleSignup = async () => {
    const ok = await signup(email.trim(), password, name.trim());
    if (!ok) {
      setErrors({ general: 'Registration failed. This email may already be in use.' });
    }
  };

  const handleForgotPassword = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });
      const data = await res.json();

      if (data.success) {
        if (data.data?.devMode && data.data?.resetUrl) {
          setDevResetUrl(data.data.resetUrl);
        }
        setSuccess(true);
        setSuccessMsg(data.message || 'Recovery link generated successfully.');
      } else {
        setErrors({ general: data.message || 'Failed to send reset link. Please try again.' });
      }
    } catch {
      setErrors({ general: 'Could not reach the server. Please try again.' });
    }
  };

  const handleResetPassword = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token: resetToken, password })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess(true);
        setSuccessMsg('Password reset successful! You are now logged in.');
        setTimeout(() => {
          setActiveTab('dashboard');
        }, 2000);
      } else {
        setErrors({ general: data.message || 'Reset token is invalid or expired. Please request a new link.' });
      }
    } catch {
      setErrors({ general: 'Could not reach the server. Please try again.' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (!validate()) return;

    setIsLoading(true);
    try {
      if (mode === 'login') await handleLogin();
      else if (mode === 'signup') await handleSignup();
      else if (mode === 'forgot') await handleForgotPassword();
      else if (mode === 'reset') await handleResetPassword();
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setErrors({});
    setSuccess(false);
    setDevResetUrl('');
    setPassword('');
    setConfirmPassword('');
  };

  /* ── Render ─────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #050709 0%, #0b0f1a 40%, #0a0616 100%)' }}>
      <Blobs />

      {/* Noise texture overlay */}
      <div className="fixed inset-0 opacity-[0.015] pointer-events-none z-[1]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")" }}
      />

      <motion.div
        key={mode}
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -24, scale: 0.97 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Card */}
        <div className="relative backdrop-blur-2xl rounded-3xl overflow-hidden"
          style={{
            background: 'rgba(11, 15, 25, 0.85)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(124,58,237,0.08), inset 0 1px 0 rgba(255,255,255,0.05)'
          }}>

          {/* Top gradient bar */}
          <div className="h-[2px] w-full" style={{ background: 'linear-gradient(90deg, #7c3aed, #06b6d4, #7c3aed)' }} />

          <div className="p-8">
            {/* Logo */}
            <motion.div className="flex flex-col items-center mb-8"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}>
              <div className="w-14 h-14 rounded-2xl mb-4 flex items-center justify-center text-3xl relative"
                style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(6,182,212,0.3))', border: '1px solid rgba(255,255,255,0.1)' }}>
                ⚡
                <div className="absolute -inset-1 rounded-2xl opacity-20 blur-sm"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }} />
              </div>
              <h1 className="text-xl font-black text-white tracking-tight">
                Task<span style={{ color: '#06b6d4' }}>Titan-AI</span>
              </h1>
              <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] mt-1 font-mono">AI Productivity OS</p>
            </motion.div>

            {/* Mode heading */}
            <motion.div className="mb-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}>
              <h2 className="text-2xl font-bold text-white mb-1">
                {mode === 'login' && 'Welcome back'}
                {mode === 'signup' && 'Create your account'}
                {mode === 'forgot' && 'Reset your password'}
                {mode === 'reset' && 'Set new password'}
              </h2>
              <p className="text-sm text-white/40">
                {mode === 'login' && 'Enter your workspace to continue.'}
                {mode === 'signup' && 'Start your productivity journey.'}
                {mode === 'forgot' && 'Enter your email to receive a reset link.'}
                {mode === 'reset' && 'Choose a strong new password.'}
              </p>
            </motion.div>

            {/* ── Success State ── */}
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-6"
                >
                  <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                    style={{ background: 'rgba(6,182,212,0.1)', border: '2px solid rgba(6,182,212,0.4)' }}>
                    <CheckCircle2 size={32} style={{ color: '#06b6d4' }} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    {mode === 'reset' ? 'Password Updated!' : 'Check your inbox!'}
                  </h3>
                  <p className="text-sm text-white/50 mb-4">{successMsg}</p>

                  {devResetUrl && (
                    <div className="mt-4 p-4 rounded-2xl text-left"
                      style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
                      <p className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider mb-2">⚠ Dev Mode — No SMTP Configured</p>
                      <p className="text-[10px] text-amber-300/70 mb-3">Copy this link to reset your password:</p>
                      <a href={devResetUrl}
                        onClick={(e) => {
                          e.preventDefault();
                          const url = new URL(devResetUrl);
                          const token = url.searchParams.get('token');
                          if (token) {
                            window.history.pushState({}, '', devResetUrl);
                            window.location.href = devResetUrl;
                          }
                        }}
                        className="block text-[11px] font-mono text-amber-400 break-all hover:text-amber-300 underline leading-relaxed">
                        {devResetUrl}
                      </a>
                    </div>
                  )}

                  {mode === 'forgot' && (
                    <button onClick={() => switchMode('login')}
                      className="mt-6 text-sm text-white/40 hover:text-white/70 flex items-center gap-1 mx-auto transition-colors">
                      <ArrowLeft size={14} /> Back to login
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Form ── */}
            {!success && (
              <form onSubmit={handleSubmit} noValidate>
                {/* Global error */}
                <AnimatePresence>
                  {errors.general && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4 px-4 py-3 rounded-2xl flex items-center gap-2.5 text-sm text-red-300"
                      style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                      <AlertCircle size={15} className="flex-shrink-0" />
                      {errors.general}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-4">
                  {/* Name — signup only */}
                  {mode === 'signup' && (
                    <InputField id="auth-name" label="Full Name" value={name} onChange={setName}
                      placeholder="Your full name" icon={<User size={15} />}
                      error={errors.name} autoComplete="name" />
                  )}

                  {/* Email */}
                  {(mode === 'login' || mode === 'signup' || mode === 'forgot') && (
                    <InputField id="auth-email" label="Email Address" type="email" value={email} onChange={setEmail}
                      placeholder="you@example.com" icon={<Mail size={15} />}
                      error={errors.email} autoComplete="email" />
                  )}

                  {/* Password */}
                  {(mode === 'login' || mode === 'signup' || mode === 'reset') && (
                    <div>
                      <InputField
                        id="auth-password"
                        label={mode === 'reset' ? 'New Password' : 'Password'}
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={setPassword}
                        placeholder="••••••••"
                        icon={<Lock size={15} />}
                        error={errors.password}
                        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                        rightElement={
                          <button type="button" onClick={() => setShowPassword(p => !p)}
                            className="p-1 text-white/30 hover:text-white/60 transition-colors"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}>
                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        }
                      />

                      {/* Password strength bar — signup & reset */}
                      {(mode === 'signup' || mode === 'reset') && password && (
                        <motion.div className="mt-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                          <div className="flex gap-1 mb-1">
                            {[1, 2, 3, 4, 5].map(i => (
                              <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                                style={{ background: i <= strength.score ? strength.color : 'rgba(255,255,255,0.08)' }} />
                            ))}
                          </div>
                          <p className="text-[10px] font-medium" style={{ color: strength.color }}>
                            Strength: {strength.label}
                          </p>
                        </motion.div>
                      )}
                    </div>
                  )}

                  {/* Confirm Password */}
                  {(mode === 'signup' || mode === 'reset') && (
                    <div>
                      <InputField
                        id="auth-confirm-password"
                        label="Confirm Password"
                        type={showConfirm ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={setConfirmPassword}
                        placeholder="••••••••"
                        icon={<Shield size={15} />}
                        error={errors.confirmPassword}
                        autoComplete="new-password"
                        rightElement={
                          <button type="button" onClick={() => setShowConfirm(p => !p)}
                            className="p-1 text-white/30 hover:text-white/60 transition-colors"
                            aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}>
                            {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        }
                      />
                      {confirmPassword && password && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          className={`mt-1.5 text-[11px] flex items-center gap-1 ${password === confirmPassword ? 'text-emerald-400' : 'text-red-400'}`}>
                          <CheckCircle2 size={11} />
                          {password === confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                        </motion.p>
                      )}
                    </div>
                  )}

                  {/* Login extras */}
                  {mode === 'login' && (
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <div
                          onClick={() => setRememberMe(p => !p)}
                          className={`w-4 h-4 rounded flex items-center justify-center transition-all duration-200 cursor-pointer ${rememberMe ? 'bg-violet-600' : 'bg-white/10 border border-white/20'}`}
                          role="checkbox" aria-checked={rememberMe} tabIndex={0}
                          onKeyDown={e => e.key === ' ' && setRememberMe(p => !p)}>
                          {rememberMe && <CheckCircle2 size={10} className="text-white" />}
                        </div>
                        <span className="text-xs text-white/40 group-hover:text-white/60 transition-colors">Remember me</span>
                      </label>
                      <button type="button" onClick={() => switchMode('forgot')}
                        className="text-xs text-violet-400 hover:text-violet-300 transition-colors font-medium">
                        Forgot password?
                      </button>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileTap={{ scale: 0.98 }}
                  className="mt-6 w-full relative flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-sm font-bold text-white overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 50%, #06b6d4 100%)',
                    boxShadow: isLoading ? 'none' : '0 4px 24px rgba(124,58,237,0.4)'
                  }}>
                  {isLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      {mode === 'login' && <><LogIn size={15} /><span>Sign In</span></>}
                      {mode === 'signup' && <><UserPlus size={15} /><span>Create Account</span></>}
                      {mode === 'forgot' && <><Mail size={15} /><span>Send Reset Link</span></>}
                      {mode === 'reset' && <><Zap size={15} /><span>Reset Password</span></>}
                    </>
                  )}
                </motion.button>
              </form>
            )}

            {/* ── Google OAuth ── (login / signup modes) */}
            {!success && (mode === 'login' || mode === 'signup') && (
              <>
                <div className="relative my-6 flex items-center gap-3">
                  <div className="flex-1 h-px bg-white/[0.06]" />
                  <span className="text-[10px] text-white/25 uppercase tracking-widest font-mono">or continue with</span>
                  <div className="flex-1 h-px bg-white/[0.06]" />
                </div>
                <GoogleButton />
              </>
            )}

            {/* ── Mode switcher ── */}
            {!success && (
              <p className="text-center mt-6 text-xs text-white/30">
                {mode === 'login' && (
                  <>Don't have an account?{' '}
                    <button onClick={() => switchMode('signup')}
                      className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">
                      Sign up
                    </button>
                  </>
                )}
                {mode === 'signup' && (
                  <>Already have an account?{' '}
                    <button onClick={() => switchMode('login')}
                      className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">
                      Sign in
                    </button>
                  </>
                )}
                {(mode === 'forgot' || mode === 'reset') && !success && (
                  <button onClick={() => switchMode('login')}
                    className="text-white/40 hover:text-white/60 flex items-center gap-1 mx-auto transition-colors">
                    <ArrowLeft size={12} /> Back to login
                  </button>
                )}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="px-8 pb-6">
            <p className="text-center text-[10px] text-white/15 font-mono">
              Protected by JWT · Cookie-based sessions · OAuth 2.0
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
