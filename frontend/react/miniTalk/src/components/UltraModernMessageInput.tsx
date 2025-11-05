import { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, ExclamationTriangleIcon, FireIcon, SparklesIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import type { MessageType } from '../types';

interface MessageInputProps {
  onSendMessage: (content: string, type: MessageType) => void;
  onTyping: () => void;
  onStopTyping: () => void;
  disabled?: boolean;
}

export function UltraModernMessageInput({ onSendMessage, onTyping, onStopTyping, disabled = false }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<MessageType>('normal');
  const [isTyping, setIsTyping] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<number | null>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 500) {
      setMessage(value);
      
      // Handle typing indicators
      if (value.trim() && !isTyping) {
        setIsTyping(true);
        onTyping();
      }

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        onStopTyping();
      }, 1000) as unknown as number;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedMessage = message.trim();
    if (!trimmedMessage || disabled) return;

    onSendMessage(trimmedMessage, messageType);
    setMessage('');
    setMessageType('normal');
    setShowTypePicker(false);
    
    // Stop typing indicator
    if (isTyping) {
      setIsTyping(false);
      onStopTyping();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }

    // Focus back to input
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const getTypeInfo = (type: MessageType) => {
    switch (type) {
      case 'important':
        return {
          icon: <ExclamationTriangleIcon className="w-5 h-5" />,
          label: 'Important',
          color: 'from-amber-500 to-orange-600',
          bgColor: 'bg-amber-500/20',
          textColor: 'text-amber-200',
          description: 'Message prioritaire'
        };
      case 'urgent':
        return {
          icon: <FireIcon className="w-5 h-5 animate-pulse" />,
          label: 'Urgent',
          color: 'from-red-500 to-red-700',
          bgColor: 'bg-red-500/20',
          textColor: 'text-red-200',
          description: 'Message critique'
        };
      default:
        return {
          icon: <SparklesIcon className="w-5 h-5" />,
          label: 'Normal',
          color: 'from-[#00b4d8] to-[#90e0ef]',
          bgColor: 'bg-[#00b4d8]/20',
          textColor: 'text-[#caf0f8]',
          description: 'Message standard'
        };
    }
  };

  const messageTypeInfo = getTypeInfo(messageType);
  const messageTypes: MessageType[] = ['normal', 'important', 'urgent'];

  return (
    <div className="relative p-6 glass-medium border-t border-white/10">
      {/* Type picker dropdown */}
      {showTypePicker && (
        <div className="absolute bottom-full left-6 right-6 mb-3 glass-strong border border-white/20 rounded-2xl shadow-2xl animate-slideInUp overflow-hidden">
          <div className="p-4">
            <h3 className="text-sm font-semibold text-white/90 mb-4 flex items-center space-x-2">
              <SparklesIcon className="w-4 h-4" />
              <span>Type de message</span>
            </h3>
            <div className="space-y-2">
              {messageTypes.map((type) => {
                const typeInfo = getTypeInfo(type);
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setMessageType(type);
                      setShowTypePicker(false);
                      textareaRef.current?.focus();
                    }}
                    className={`
                      w-full group flex items-center space-x-4 p-4 rounded-xl transition-all duration-300
                      hover:scale-105 hover:shadow-lg border
                      ${messageType === type 
                        ? `${typeInfo.bgColor} border-current ${typeInfo.textColor}` 
                        : 'glass-light border-white/10 text-white/70 hover:text-white/90'
                      }
                    `}
                  >
                    <div className={`
                      p-2 rounded-lg transition-colors
                      ${messageType === type ? typeInfo.bgColor : 'bg-white/10'}
                    `}>
                      {typeInfo.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-sm">{typeInfo.label}</div>
                      <div className="text-xs opacity-70">{typeInfo.description}</div>
                    </div>
                    {messageType === type && (
                      <div className="w-6 h-6 rounded-full bg-current/20 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Message type indicator */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowTypePicker(!showTypePicker)}
            className={`
              group flex items-center space-x-3 px-4 py-2 rounded-xl transition-all duration-300
              hover:scale-105 border backdrop-blur-sm
              ${messageType !== 'normal' 
                ? `${messageTypeInfo.bgColor} border-current ${messageTypeInfo.textColor}` 
                : 'glass-light border-white/20 text-white/70 hover:text-white/90'
              }
            `}
          >
            {messageTypeInfo.icon}
            <span className="font-medium text-sm">{messageTypeInfo.label}</span>
            <ChevronUpIcon className={`
              w-4 h-4 transition-transform duration-300
              ${showTypePicker ? 'rotate-180' : 'rotate-0'}
            `} />
          </button>

          {/* Character counter */}
          <div className={`
            text-xs font-mono transition-colors
            ${message.length > 450 ? 'text-red-400' : 
              message.length > 350 ? 'text-amber-400' : 'text-white/50'}
          `}>
            {message.length}/500
          </div>
        </div>

        {/* Message input container */}
        <div className="relative">
          {/* Animated border glow */}
          <div className={`
            absolute inset-0 rounded-2xl bg-gradient-to-r ${messageTypeInfo.color} p-0.5 transition-all duration-300
            ${isFocused ? 'opacity-100 scale-105' : 'opacity-40 scale-100'}
          `}>
            <div className="w-full h-full glass-medium rounded-2xl" />
          </div>

          <div className="relative flex items-end space-x-4 p-4">
            {/* Textarea */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Partagez vos pensées dans l'océan numérique..."
                disabled={disabled}
                className="
                  w-full bg-transparent text-white placeholder-white/40 resize-none
                  border-0 outline-none text-base leading-relaxed font-medium
                  min-h-[3rem] max-h-[8rem] transition-all duration-300
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
                rows={1}
                maxLength={500}
              />
              
              {/* Floating placeholder animation */}
              {!message && !isFocused && (
                <div className="absolute inset-0 flex items-center pointer-events-none">
                  <div className="flex items-center space-x-2 text-white/30 animate-pulse">
                    <div className="flex space-x-1">
                      <div className="w-1 h-1 bg-current rounded-full animate-bounce" />
                      <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Send button */}
            <button
              type="submit"
              disabled={!message.trim() || disabled}
              className={`
                group relative p-4 rounded-full transition-all duration-300 transform
                disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-95
                hover:scale-110 active:scale-95 shadow-lg
                bg-gradient-to-r ${messageTypeInfo.color}
                hover:shadow-xl hover:shadow-current/25
              `}
            >
              {/* Button glow effect */}
              <div className="absolute inset-0 rounded-full bg-current/30 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <PaperAirplaneIcon className={`
                relative w-6 h-6 text-white transition-transform duration-300
                ${!message.trim() ? 'translate-x-0' : 'translate-x-0.5 -translate-y-0.5'}
                group-hover:animate-pulse
              `} />
            </button>
          </div>
        </div>

        {/* Message type preview */}
        {messageType !== 'normal' && (
          <div className={`
            flex items-center space-x-2 px-4 py-2 rounded-xl text-sm
            ${messageTypeInfo.bgColor} ${messageTypeInfo.textColor}
            animate-fadeInScale
          `}>
            <span className="opacity-80">Sera envoyé comme:</span>
            <div className="flex items-center space-x-1 font-semibold">
              {messageTypeInfo.icon}
              <span>{messageTypeInfo.label}</span>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}