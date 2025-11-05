import { format } from 'date-fns';
import { CheckIcon, CheckCircleIcon, ExclamationTriangleIcon, FireIcon, SparklesIcon } from '@heroicons/react/24/outline';
import type { Message, MessageType } from '../types';

interface MessageItemProps {
  message: Message;
  isOwn: boolean;
  isDelivered?: boolean;
}

export function UltraModernMessageItem({ message, isOwn, isDelivered = false }: MessageItemProps) {
  const getMessageTypeIcon = (type: MessageType) => {
    switch (type) {
      case 'important':
        return <ExclamationTriangleIcon className="w-4 h-4" />;
      case 'urgent':
        return <FireIcon className="w-4 h-4 animate-pulse" />;
      default:
        return <SparklesIcon className="w-4 h-4 opacity-60" />;
    }
  };

  const getMessageGradient = (type: MessageType, isOwn: boolean) => {
    if (isOwn) {
      switch (type) {
        case 'urgent':
          return 'bg-gradient-to-br from-red-500 via-red-600 to-red-700';
        case 'important':
          return 'bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600';
        default:
          return 'bg-gradient-to-br from-[#03045e] via-[#0077b6] to-[#00b4d8]';
      }
    } else {
      switch (type) {
        case 'urgent':
          return 'bg-gradient-to-br from-red-100 via-red-50 to-white border border-red-200';
        case 'important':
          return 'bg-gradient-to-br from-amber-100 via-amber-50 to-white border border-amber-200';
        default:
          return 'glass-medium border border-white/20';
      }
    }
  };

  const getTextColor = (type: MessageType, isOwn: boolean) => {
    if (isOwn) {
      return 'text-white';
    } else {
      switch (type) {
        case 'urgent':
          return 'text-red-800';
        case 'important':
          return 'text-amber-800';
        default:
          return 'text-white/90';
      }
    }
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-6 group`}>
      <div className={`
        max-w-xs lg:max-w-md px-6 py-4 rounded-3xl shadow-lg transform transition-all duration-300
        ${getMessageGradient(message.type, isOwn)}
        ${isOwn ? 'rounded-br-lg animate-slideInUp' : 'rounded-bl-lg animate-slideInUp'}
        hover:scale-105 hover:shadow-xl relative overflow-hidden
      `}>
        {/* Message glow effect */}
        {message.type !== 'normal' && (
          <div className={`
            absolute inset-0 rounded-3xl opacity-30 blur-sm
            ${message.type === 'urgent' ? 'bg-red-400' : 
              message.type === 'important' ? 'bg-amber-400' : 'bg-[#00b4d8]'}
          `} />
        )}
        
        {/* Message header */}
        <div className="relative flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            {!isOwn && (
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                ${message.type === 'urgent' ? 'bg-red-200 text-red-700' :
                  message.type === 'important' ? 'bg-amber-200 text-amber-700' :
                  'bg-white/20 text-white/90'}
              `}>
                {message.pseudo.charAt(0).toUpperCase()}
              </div>
            )}
            <span className={`
              text-sm font-semibold tracking-wide
              ${getTextColor(message.type, isOwn)}
              ${isOwn ? 'opacity-90' : 'opacity-100'}
            `}>
              {isOwn ? 'Vous' : message.pseudo}
            </span>
          </div>
          
          {/* Message type indicator */}
          <div className={`
            flex items-center space-x-1 px-2 py-1 rounded-full text-xs
            ${message.type === 'urgent' ? 'bg-red-500/20 text-red-200' :
              message.type === 'important' ? 'bg-amber-500/20 text-amber-200' :
              isOwn ? 'bg-white/10 text-white/70' : 'bg-white/20 text-white/80'}
          `}>
            {getMessageTypeIcon(message.type)}
            {message.type !== 'normal' && (
              <span className="capitalize font-medium">
                {message.type === 'urgent' ? 'Urgent' : 
                 message.type === 'important' ? 'Important' : 'Normal'}
              </span>
            )}
          </div>
        </div>

        {/* Message content */}
        <div className="relative">
          <p className={`
            text-sm leading-relaxed font-medium break-words
            ${getTextColor(message.type, isOwn)}
          `}>
            {message.content}
          </p>
        </div>

        {/* Message footer */}
        <div className={`
          flex items-center justify-between mt-3 pt-2 border-t
          ${message.type === 'urgent' ? 'border-red-300/30' :
            message.type === 'important' ? 'border-amber-300/30' :
            isOwn ? 'border-white/20' : 'border-white/10'}
        `}>
          <span className={`
            text-xs opacity-70 font-medium
            ${getTextColor(message.type, isOwn)}
          `}>
            {format(new Date(message.timestamp), 'HH:mm')}
          </span>
          
          {/* Delivery status for own messages */}
          {isOwn && (
            <div className="flex items-center space-x-1">
              {isDelivered ? (
                <div className="flex items-center space-x-1 text-white/80">
                  <CheckCircleIcon className="w-4 h-4 animate-pulse" />
                  <span className="text-xs font-medium">Livré</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1 text-white/60">
                  <CheckIcon className="w-4 h-4" />
                  <span className="text-xs">Envoi...</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Floating particles for special messages */}
        {message.type === 'urgent' && (
          <>
            <div className="absolute top-2 right-2 w-1 h-1 bg-red-300 rounded-full animate-ping" />
            <div className="absolute bottom-3 left-3 w-0.5 h-0.5 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
          </>
        )}
        
        {message.type === 'important' && (
          <>
            <div className="absolute top-3 right-4 w-1 h-1 bg-amber-300 rounded-full animate-pulse" />
            <div className="absolute bottom-4 left-2 w-0.5 h-0.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '1s' }} />
          </>
        )}
      </div>
    </div>
  );
}

// System Message Component with ultra-modern design
interface SystemMessageProps {
  pseudo: string;
  timestamp: Date;
  type: 'joined' | 'left';
}

export function SystemMessage({ pseudo, timestamp, type }: SystemMessageProps) {
  return (
    <div className="flex justify-center my-6">
      <div className="glass-medium border border-white/10 px-6 py-3 rounded-full shadow-lg animate-fadeInScale">
        <div className="flex items-center space-x-3">
          {/* Status indicator */}
          <div className={`
            w-3 h-3 rounded-full animate-pulse
            ${type === 'joined' ? 'bg-[#90e0ef]' : 'bg-red-400'}
          `} />
          
          <span className="text-sm font-medium text-white/90">
            <span className="font-semibold text-[#caf0f8]">{pseudo}</span>
            {type === 'joined' ? ' a rejoint l\'océan' : ' a quitté l\'océan'}
          </span>
          
          <span className="text-xs text-white/60 font-mono">
            {format(new Date(timestamp), 'HH:mm')}
          </span>
        </div>
      </div>
    </div>
  );
}