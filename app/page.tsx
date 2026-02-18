'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Music, ShieldCheck, KeyRound, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const { loginWithServiceNumber, registerWithServiceNumber, user } = useAuth();
  const router = useRouter();

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false); // Toggle for testing

  const [serviceNumber, setServiceNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isOffline, setIsOffline] = useState(false);

  // Offline detection
  useEffect(() => {
    // Initial check
    setIsOffline(!navigator.onLine);

    const handleOnline = () => {
      setIsOffline(false);
      setError(''); // Clear offline error if any
    };
    const handleOffline = () => {
      setIsOffline(true);
      setError('네트워크 연결이 끊겼습니다. 인터넷 상태를 확인해주세요.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

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
    if (isOffline) {
      setError('오프라인 상태입니다. 네트워크 연결을 확인해주세요.');
      return;
    }

    setError('');
    setIsLoggingIn(true);

    if (serviceNumber.length < 9) { // 0000-0000 is 9 chars
      setError('서비스 번호 형식이 올바르지 않습니다.');
      setIsLoggingIn(false);
      return;
    }

    try {
      if (isRegisterMode) {
        await registerWithServiceNumber(serviceNumber, password);
      } else {
        await loginWithServiceNumber(serviceNumber, password);
      }
      // Success - router.push will happen via useEffect or auth context
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Auth failed:', err);

      // Detailed Error Handling
      const errorCode = err.code || '';
      const errorMessage = err.message || '';

      if (errorCode === 'auth/invalid-credential' || errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password') {
        setError('서비스 번호 또는 비밀번호가 일치하지 않습니다.');
      } else if (errorCode === 'auth/email-already-in-use') {
        setError('이미 등록된 서비스 번호입니다.');
      } else if (errorMessage.includes('offline') || errorMessage.includes('network') || err.name === 'AbortError') {
        setError('네트워크 연결이 불안정합니다. (Offline/Proxy Fail)');
      } else {
        setError(`인증 실패: ${errorMessage.substring(0, 50)}...`);
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

      {/* Offline Banner */}
      {isOffline && (
        <div className="absolute top-0 left-0 w-full bg-red-600/90 text-white text-xs font-bold py-2 px-4 flex items-center justify-center z-50 animate-pulse">
          <WifiOff className="w-4 h-4 mr-2" />
          오프라인 상태 - 기능이 제한될 수 있습니다.
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
              disabled={isLoggingIn || !serviceNumber || !password || isOffline}
              className={cn(
                "w-full flex items-center justify-center gap-2 py-4 font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-4",
                isRegisterMode
                  ? "bg-gray-800 text-white hover:bg-gray-700"
                  : "bg-bts-purple text-white hover:bg-bts-purple-dark shadow-lg shadow-bts-purple/20"
              )}
            >
              {isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              <span>{isLoggingIn ? 'Verifying...' : (isRegisterMode ? 'Issue New ID' : (isOffline ? 'Offline Mode' : 'Access Command Center'))}</span>
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
              Secure Gateway v2.2 (Offline Logic Applied)
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
