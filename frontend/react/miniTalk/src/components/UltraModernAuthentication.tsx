import { useState, useEffect } from 'react';
import { 
  UserIcon, 
  ArrowRightIcon, 
  SparklesIcon,
  GlobeAltIcon,
  ChatBubbleLeftRightIcon 
} from '@heroicons/react/24/outline';
import { AnimatedBackground } from './AnimatedBackground';
import { LoadingSpinner } from './UltraModernLoadingSpinner';

interface AuthenticationProps {
  onLogin: (pseudo: string) => void;
  isConnecting: boolean;
}

export function Authentication({ onLogin, isConnecting }: AuthenticationProps) {
  const [pseudo, setPseudo] = useState('');
  const [isAnimated, setIsAnimated] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setIsAnimated(true), 500);
    const timer2 = setTimeout(() => setShowWelcome(true), 1000);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pseudo.trim() && !isConnecting) {
      onLogin(pseudo.trim());
    }
  };

  const isValidPseudo = pseudo.trim().length >= 2;

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated background */}
      <AnimatedBackground />
      
      {/* Main content */}
      <div className={`
        relative z-10 w-full max-w-md transform transition-all duration-1000 ease-out
        ${isAnimated ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'}
      `}>
        {/* Welcome header */}
        <div className={`
          text-center mb-8 transition-all duration-1000 ease-out delay-300
          ${showWelcome ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
        `}>
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-[#00b4d8] to-[#caf0f8] rounded-3xl flex items-center justify-center shadow-2xl shadow-[#00b4d8]/30 animate-float">
                <ChatBubbleLeftRightIcon className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#caf0f8] rounded-full flex items-center justify-center animate-bounce">
                <SparklesIcon className="w-4 h-4 text-[#03045e]" />
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-3 animate-glow">
            MiniTalk
          </h1>
          <p className="text-[#90e0ef] text-lg font-medium mb-2">
            Océan Numérique
          </p>
          <p className="text-white/60 text-sm leading-relaxed">
            Plongez dans une expérience de communication immersive
          </p>
        </div>

        {/* Login form */}
        <div className="glass-strong rounded-3xl p-8 border border-white/10 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-white/80 text-sm font-medium">
                Votre identité de voyageur
              </label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-[#00b4d8] to-[#90e0ef] rounded-2xl opacity-0 group-focus-within:opacity-20 transition-opacity duration-300 blur-sm" />
                <div className="relative flex items-center">
                  <UserIcon className="absolute left-4 w-5 h-5 text-white/50 z-10" />
                  <input
                    type="text"
                    value={pseudo}
                    onChange={(e) => setPseudo(e.target.value)}
                    placeholder="Entrez votre pseudo..."
                    disabled={isConnecting}
                    className={`
                      w-full pl-12 pr-4 py-4 bg-white/5 border border-white/20 rounded-2xl
                      text-white placeholder-white/40 focus:outline-none focus:border-[#caf0f8]/50
                      transition-all duration-300 backdrop-blur-sm
                      ${isConnecting ? 'opacity-50 cursor-not-allowed' : 'hover:border-white/30'}
                      ${isValidPseudo ? 'border-[#90e0ef]/50' : ''}
                    `}
                    maxLength={20}
                    minLength={2}
                  />
                  {isValidPseudo && !isConnecting && (
                    <div className="absolute right-4 w-2 h-2 bg-[#90e0ef] rounded-full animate-pulse" />
                  )}
                </div>
              </div>
              <p className="text-white/40 text-xs">
                Minimum 2 caractères • Maximum 20 caractères
              </p>
            </div>

            <button
              type="submit"
              disabled={!isValidPseudo || isConnecting}
              className={`
                w-full py-4 px-6 rounded-2xl font-semibold text-white
                transition-all duration-300 transform relative overflow-hidden group
                ${isValidPseudo && !isConnecting
                  ? 'bg-gradient-to-r from-[#0077b6] to-[#00b4d8] hover:from-[#00b4d8] hover:to-[#90e0ef] hover:scale-[1.02] shadow-lg shadow-[#0077b6]/30 hover:shadow-[#00b4d8]/40'
                  : 'bg-white/10 cursor-not-allowed opacity-50'
                }
              `}
            >
              <div className="flex items-center justify-center space-x-3">
                {isConnecting ? (
                  <>
                    <LoadingSpinner variant="minimal" size="sm" />
                    <span>Plongée en cours...</span>
                  </>
                ) : (
                  <>
                    <GlobeAltIcon className="w-5 h-5" />
                    <span>Rejoindre l'Océan</span>
                    <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
              
              {/* Button glow effect */}
              {isValidPseudo && !isConnecting && (
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
              )}
            </button>
          </form>

          {/* Features showcase */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="space-y-2">
                <div className="w-10 h-10 bg-[#00b4d8]/20 rounded-full flex items-center justify-center mx-auto">
                  <ChatBubbleLeftRightIcon className="w-5 h-5 text-[#90e0ef]" />
                </div>
                <p className="text-white/70 text-xs font-medium">Chat Temps Réel</p>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 bg-[#90e0ef]/20 rounded-full flex items-center justify-center mx-auto">
                  <UserIcon className="w-5 h-5 text-[#caf0f8]" />
                </div>
                <p className="text-white/70 text-xs font-medium">Multi-Utilisateurs</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 space-y-2">
          <p className="text-white/40 text-xs">
            Propulsé par la technologie océanique
          </p>
          <div className="flex justify-center space-x-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-1 h-1 bg-[#90e0ef]/30 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Decorative floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-[#caf0f8]/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${4 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>
    </div>
  );
}