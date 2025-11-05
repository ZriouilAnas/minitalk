import { useState, useEffect, useRef } from 'react';
import { UserIcon, WifiIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { AnimatedBackground } from './AnimatedBackground';

interface AuthenticationProps {
  onAuthenticated: (pseudo: string) => void;
  isConnecting: boolean;
  error: string | null;
}

export function Authentication({ onAuthenticated, isConnecting, error }: AuthenticationProps) {
  const [pseudo, setPseudo] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [focusedInput, setFocusedInput] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsVisible(true);
    // Auto-focus input after animation
    setTimeout(() => inputRef.current?.focus(), 500);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!pseudo.trim()) {
      setLocalError('Pseudo is required');
      return;
    }

    if (pseudo.trim().length < 2) {
      setLocalError('Pseudo must be at least 2 characters');
      return;
    }

    if (pseudo.trim().length > 20) {
      setLocalError('Pseudo must be less than 20 characters');
      return;
    }

    onAuthenticated(pseudo.trim());
  };

  const displayError = error || localError;

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Ultra-modern animated background */}
      <AnimatedBackground variant="ocean" intensity="medium" />
      
      {/* Glass morphism overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/5 backdrop-blur-sm" />
      
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div 
          className={`
            transform transition-all duration-1000 ease-out
            ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'}
          `}
        >
          {/* Main card with glass morphism */}
          <div className="relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 w-full max-w-md overflow-hidden">
            {/* Animated glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#00b4d8]/20 via-[#90e0ef]/20 to-[#caf0f8]/20 rounded-3xl blur opacity-50 animate-pulse" />
            
            {/* Header with floating animation */}
            <div className="relative text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 relative">
                {/* Rotating rings */}
                <div className="absolute inset-0 rounded-full border-2 border-[#00b4d8]/30 animate-spin" style={{ animationDuration: '3s' }} />
                <div className="absolute inset-2 rounded-full border-2 border-[#90e0ef]/40 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
                
                {/* Center icon with glow */}
                <div className="relative w-12 h-12 bg-gradient-to-br from-[#00b4d8] to-[#03045e] rounded-full flex items-center justify-center shadow-lg">
                  <WifiIcon className="w-6 h-6 text-white drop-shadow-sm" />
                  <SparklesIcon className="absolute -top-1 -right-1 w-4 h-4 text-[#caf0f8] animate-bounce" />
                </div>
              </div>
              
              <h1 className="text-4xl font-black bg-gradient-to-r from-white via-[#caf0f8] to-[#90e0ef] bg-clip-text text-transparent mb-3 tracking-tight">
                MiniTalk
              </h1>
              <p className="text-white/80 text-lg font-medium">
                Plongez dans l'océan numérique
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="pseudo" className="block text-sm font-semibold text-white/90 mb-3 tracking-wide">
                  Choisissez votre identité
                </label>
                <div className="relative group">
                  {/* Animated border */}
                  <div className={`
                    absolute inset-0 rounded-2xl bg-gradient-to-r from-[#00b4d8] via-[#90e0ef] to-[#caf0f8] p-0.5 transition-all duration-300
                    ${focusedInput ? 'opacity-100 scale-105' : 'opacity-50 scale-100'}
                  `}>
                    <div className="w-full h-full bg-white/10 backdrop-blur-sm rounded-2xl" />
                  </div>
                  
                  <div className="relative flex items-center">
                    <div className={`
                      absolute left-4 transition-all duration-300 z-10
                      ${focusedInput ? 'text-[#caf0f8] scale-110' : 'text-white/60'}
                    `}>
                      <UserIcon className="h-5 w-5" />
                    </div>
                    <input
                      ref={inputRef}
                      type="text"
                      id="pseudo"
                      value={pseudo}
                      onChange={(e) => setPseudo(e.target.value)}
                      onFocus={() => setFocusedInput(true)}
                      onBlur={() => setFocusedInput(false)}
                      className="
                        relative w-full pl-12 pr-4 py-4 bg-transparent text-white placeholder-white/50 
                        border-0 outline-none text-lg font-medium tracking-wide
                        transition-all duration-300
                      "
                      placeholder="Votre nom d'aventurier..."
                      disabled={isConnecting}
                      maxLength={20}
                      autoComplete="username"
                    />
                  </div>
                </div>
                <p className="mt-2 text-xs text-white/60 ml-1">
                  2-20 caractères • Soyez unique
                </p>
              </div>

              {displayError && (
                <div className="relative backdrop-blur-sm bg-red-500/20 border border-red-400/30 rounded-2xl p-4 animate-shake">
                  <p className="text-sm text-red-200 font-medium">{displayError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isConnecting || !pseudo.trim()}
                className="
                  group relative w-full py-4 px-6 rounded-2xl font-bold text-lg tracking-wide
                  bg-gradient-to-r from-[#03045e] via-[#0077b6] to-[#00b4d8]
                  hover:from-[#0077b6] hover:via-[#00b4d8] hover:to-[#90e0ef]
                  disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed
                  transform transition-all duration-300 ease-out
                  hover:scale-105 hover:shadow-2xl hover:shadow-[#00b4d8]/25
                  active:scale-95
                  text-white shadow-xl
                "
              >
                {/* Button glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#00b4d8]/50 to-[#90e0ef]/50 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative flex items-center justify-center space-x-3">
                  {isConnecting ? (
                    <>
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Connexion en cours...</span>
                    </>
                  ) : (
                    <>
                      <span>Rejoindre l'Océan</span>
                      <WifiIcon className="w-5 h-5 group-hover:animate-pulse" />
                    </>
                  )}
                </div>
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-xs text-white/50 leading-relaxed">
                En rejoignant MiniTalk, vous acceptez de respecter notre communauté<br />
                et de contribuer à une expérience positive pour tous
              </p>
            </div>

            {/* Floating particles */}
            <div className="absolute top-4 right-4 w-2 h-2 bg-[#caf0f8] rounded-full animate-ping" />
            <div className="absolute bottom-8 left-6 w-1.5 h-1.5 bg-[#90e0ef] rounded-full animate-pulse" />
            <div className="absolute top-16 left-8 w-1 h-1 bg-[#00b4d8] rounded-full animate-bounce" style={{ animationDelay: '1s' }} />
          </div>
        </div>
      </div>


    </div>
  );
}