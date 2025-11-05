import { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, ExclamationTriangleIcon, FireIcon } from '@heroicons/react/24/outline';
import type { MessageType } from '../types';
import { MessageTypeLabels, MessageColors } from '../types';

interface MessageInputProps {
  onSendMessage: (content: string, type: MessageType) => void;
  onTyping: () => void;
  onStopTyping: () => void;
  disabled?: boolean;
}

export function MessageInput({ onSendMessage, onTyping, onStopTyping, disabled = false }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<MessageType>('normal');
  const [isTyping, setIsTyping] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);
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

  const getTypeIcon = (type: MessageType) => {
    switch (type) {
      case 'important':
        return <ExclamationTriangleIcon className="w-4 h-4" />;
      case 'urgent':
        return <FireIcon className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const messageTypes: { type: MessageType; label: string; color: string; description: string }[] = [
    { type: 'normal', label: 'Normal', color: MessageColors.normal, description: 'Regular message' },
    { type: 'important', label: 'Important', color: MessageColors.important, description: 'Important message' },
    { type: 'urgent', label: 'Urgent', color: MessageColors.urgent, description: 'Urgent message' },
  ];

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Message type selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowTypePicker(!showTypePicker)}
            className={`
              flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors
              ${messageType === 'normal' 
                ? 'border-gray-300 bg-gray-50 hover:bg-gray-100' 
                : `border-2 hover:opacity-80`
              }
            `}
            style={{ 
              borderColor: messageType !== 'normal' ? MessageColors[messageType] : undefined,
              backgroundColor: messageType !== 'normal' ? `${MessageColors[messageType]}15` : undefined 
            }}
          >
            {getTypeIcon(messageType)}
            <span className="text-sm font-medium" style={{ color: MessageColors[messageType] }}>
              {MessageTypeLabels[messageType]}
            </span>
            <svg className={`w-4 h-4 transition-transform ${showTypePicker ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Type picker dropdown */}
          {showTypePicker && (
            <div className="absolute bottom-full left-0 mb-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
              <div className="p-2">
                {messageTypes.map((type) => (
                  <button
                    key={type.type}
                    type="button"
                    onClick={() => {
                      setMessageType(type.type);
                      setShowTypePicker(false);
                    }}
                    className={`
                      w-full flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors
                      ${messageType === type.type ? 'bg-gray-100' : ''}
                    `}
                  >
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: type.color }}
                    />
                    {getTypeIcon(type.type)}
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm">{type.label}</div>
                      <div className="text-xs text-gray-500">{type.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Message input */}
        <div className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
              disabled={disabled}
              className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
              rows={1}
              maxLength={500}
            />
            
            {/* Character count */}
            <div className="absolute bottom-2 right-4 text-xs text-gray-400">
              {message.length}/500
            </div>
          </div>

          {/* Send button */}
          <button
            type="submit"
            disabled={!message.trim() || disabled}
            className="flex-shrink-0 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white p-3 rounded-full transition-colors duration-200"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Message type indicator */}
        {messageType !== 'normal' && (
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-gray-600">Sending as:</span>
            <div className="flex items-center space-x-1" style={{ color: MessageColors[messageType] }}>
              {getTypeIcon(messageType)}
              <span className="font-medium">{MessageTypeLabels[messageType]}</span>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}