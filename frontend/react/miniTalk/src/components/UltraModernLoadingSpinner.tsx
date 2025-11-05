interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'ocean' | 'minimal' | 'dots' | 'wave';
  message?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16'
};

const SpinnerDefault = ({ size }: { size: string }) => (
  <div className={`${size} border-2 border-white/20 border-t-[#caf0f8] rounded-full animate-spin`} />
);

const SpinnerOcean = ({ size }: { size: string }) => (
  <div className="relative">
    <div className={`${size} border-2 border-transparent rounded-full animate-spin`}
         style={{
           background: 'conic-gradient(from 0deg, #03045e, #0077b6, #00b4d8, #90e0ef, #caf0f8, #03045e)',
           backgroundSize: '200% 200%'
         }}>
      <div className="absolute inset-1 bg-[#03045e] rounded-full" />
    </div>
    <div className="absolute inset-0 rounded-full animate-pulse bg-gradient-to-r from-[#90e0ef]/20 to-[#caf0f8]/20" />
  </div>
);

const SpinnerMinimal = ({ size }: { size: string }) => (
  <div className={`${size} border border-white/30 rounded-full relative animate-spin`}>
    <div className="absolute top-0 left-0 w-2 h-2 bg-[#caf0f8] rounded-full animate-pulse" />
  </div>
);

const SpinnerDots = () => (
  <div className="flex space-x-2">
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className="w-2 h-2 bg-gradient-to-r from-[#00b4d8] to-[#90e0ef] rounded-full animate-bounce"
        style={{ animationDelay: `${i * 0.2}s` }}
      />
    ))}
  </div>
);

const SpinnerWave = () => (
  <div className="flex items-end space-x-1">
    {[0, 1, 2, 3, 4].map((i) => (
      <div
        key={i}
        className="w-1 bg-gradient-to-t from-[#03045e] to-[#caf0f8] rounded-full animate-wave"
        style={{ 
          animationDelay: `${i * 0.1}s`,
          height: `${8 + (i % 2) * 4}px`
        }}
      />
    ))}
  </div>
);

export function LoadingSpinner({ 
  size = 'md', 
  variant = 'default', 
  message, 
  fullScreen = false 
}: LoadingSpinnerProps) {
  const renderSpinner = () => {
    const sizeClass = sizeClasses[size];
    
    switch (variant) {
      case 'ocean':
        return <SpinnerOcean size={sizeClass} />;
      case 'minimal':
        return <SpinnerMinimal size={sizeClass} />;
      case 'dots':
        return <SpinnerDots />;
      case 'wave':
        return <SpinnerWave />;
      default:
        return <SpinnerDefault size={sizeClass} />;
    }
  };

  const content = (
    <div className="flex flex-col items-center justify-center space-y-3">
      {renderSpinner()}
      {message && (
        <div className="text-center space-y-1">
          <p className="text-white/80 text-sm font-medium">{message}</p>
          <div className="flex justify-center space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1 h-1 bg-[#90e0ef]/60 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.3}s` }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[999] flex items-center justify-center">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#03045e] via-[#0077b6] to-[#00b4d8] animate-gradient-shift" />
        
        {/* Overlay with blur */}
        <div className="absolute inset-0 backdrop-blur-sm bg-black/20" />
        
        {/* Content */}
        <div className="relative z-10 glass-strong rounded-3xl p-8 border border-white/10 shadow-2xl">
          {content}
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-[#caf0f8]/30 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  return content;
}

// Specialized loading components for specific use cases
export function ConnectionLoader() {
  return (
    <div className="flex items-center space-x-3 p-4 glass-light rounded-2xl border border-white/10">
      <LoadingSpinner variant="ocean" size="sm" />
      <div className="text-white/80 text-sm">
        Connexion à l'océan numérique...
      </div>
    </div>
  );
}

export function MessageLoader() {
  return (
    <div className="flex items-center space-x-2 px-3 py-2 glass-light rounded-xl">
      <LoadingSpinner variant="dots" />
      <span className="text-white/60 text-xs">Envoi en cours...</span>
    </div>
  );
}

export function TypingLoader({ pseudo }: { pseudo: string }) {
  return (
    <div className="flex items-center space-x-3 p-3 glass-light rounded-2xl border border-white/10">
      <div className="w-8 h-8 bg-gradient-to-br from-[#00b4d8] to-[#90e0ef] rounded-full flex items-center justify-center text-xs font-bold text-white">
        {pseudo.slice(0, 2).toUpperCase()}
      </div>
      <LoadingSpinner variant="wave" />
      <span className="text-white/70 text-sm">{pseudo} écrit...</span>
    </div>
  );
}