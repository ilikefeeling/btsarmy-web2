'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Music, ShieldCheck, KeyRound } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const { loginWithServiceNumber, registerWithServiceNumber, user } = useAuth();
  const router = useRouter();

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false); // Toggle for testing

  const [serviceNumber, setServiceNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const isLoadingRedirect = !!user;

  const handleServiceNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Auto-format 0000-0000
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 8) val = val.slice(0, 8);
    if (val.length > 4) val = `${val.slice(0, 4)}-${val.slice(4)}`;
    setServiceNumber(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoggingIn(true);

    if (serviceNumber.length < 9) { // 0000-0000 is 9 chars
      setError('Invalid Service Number format.');
      setIsLoggingIn(false);
      return;
    }

    try {
      if (isRegisterMode) {
        await registerWithServiceNumber(serviceNumber, password);
      } else {
        await loginWithServiceNumber(serviceNumber, password);
      }
      router.push('/dashboard');
    } catch (err: unknown) {
      console.error('Auth failed:', err);
      // Firebase error codes
      const firebaseError = err as { code?: string };
      if (firebaseError.code === 'auth/invalid-credential' || firebaseError.code === 'auth/user-not-found' || firebaseError.code === 'auth/wrong-password') {
        setError('Invalid Service Number or Password.');
      } else if (firebaseError.code === 'auth/email-already-in-use') {
        setError('This Service Number is already active.');
      } else {
        setError('Authentication failed. Please try again.');
      }
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {isLoadingRedirect && (
        <div className="absolute inset-0 z-50 bg-black flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-bts-purple animate-spin" />
        </div>
      )}
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-bts-purple/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl shadow-bts-purple/20">
        <div className="text-center space-y-6">
          {/* Logo / Badge */}
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-bts-purple to-purple-900 rounded-2xl flex items-center justify-center shadow-lg">
            <Music className="w-10 h-10 text-white" />
          </div>

          <div>
            <h1 className="text-3xl font-black text-white tracking-tighter">
              ARMY <span className="text-bts-purple">COMMAND</span>
            </h1>
            <p className="text-gray-400 text-sm mt-2">
              Restricted Access. Verified Personnel Only.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="pt-6 space-y-4">
            {/* Service Number Input */}
            <div className="space-y-1 text-left">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Service Number</label>
              <div className="relative">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={serviceNumber}
                  onChange={handleServiceNumberChange}
                  placeholder="0000-0000"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-bts-purple font-mono tracking-widest text-lg"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1 text-left">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Password</label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-bts-purple"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-red-400 text-xs font-bold bg-red-500/10 p-2 rounded text-center">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoggingIn || !serviceNumber || !password}
              className={cn(
                "w-full flex items-center justify-center gap-2 py-4 font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-4",
                isRegisterMode
                  ? "bg-gray-800 text-white hover:bg-gray-700"
                  : "bg-bts-purple text-white hover:bg-bts-purple-dark shadow-lg shadow-bts-purple/20"
              )}
            >
              {isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              <span>{isLoggingIn ? 'Verifying...' : (isRegisterMode ? 'Issue New ID' : 'Access Command Center')}</span>
            </button>

            {/* Toggle Register Mode (For testing purposes) */}
            <div className="pt-4 text-center">
              <button
                type="button"
                onClick={() => { setIsRegisterMode(!isRegisterMode); setError(''); }}
                className="text-xs text-gray-500 hover:text-white underline"
              >
                {isRegisterMode ? "Already have a Service Number? Login" : "No Service Number? Issue ID (Test Only)"}
              </button>
            </div>

            <div className="text-[10px] text-center text-gray-600 mt-6">
              Official Army App Authentication Protocol <br />
              Secure Gateway v2.0
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
