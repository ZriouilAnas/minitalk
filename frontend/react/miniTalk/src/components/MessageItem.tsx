import { format } from 'date-fns';
import { CheckIcon, CheckCircleIcon, ExclamationTriangleIcon, FireIcon } from '@heroicons/react/24/outline';
import type { Message, MessageType } from '../types';
import { MessageColors } from '../types';

interface MessageItemProps {
  message: Message;
  isOwn: boolean;
  isDelivered?: boolean;
}

export function MessageItem({ message, isOwn, isDelivered = false }: MessageItemProps) {
  // Function to decode HTML entities (same as Svelte)
  const decodeHtmlEntities = (text: string): string => {
    return text
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'");
  };
  
  const decodedContent = decodeHtmlEntities(message.content);
  
  const getMessageTypeIcon = (type: MessageType) => {
    switch (type) {
      case 'important':
        return <ExclamationTriangleIcon className="w-4 h-4" />;
      case 'urgent':
        return <FireIcon className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getMessageTypeStyles = (type: MessageType) => {
    switch (type) {
      case 'important':
        return 'border-l-4 border-amber-500 bg-amber-50';
      case 'urgent':
        return 'border-l-4 border-red-500 bg-red-50 animate-pulse';
      default:
        return '';
    }
  };

  const getMessageBubbleStyle = (type: MessageType, isOwn: boolean) => {
    if (isOwn) {
      return 'bg-green-600 text-white';
    }
    
    switch (type) {
      case 'important':
        return 'bg-amber-100 text-amber-900 border border-amber-200';
      case 'urgent':
        return 'bg-red-100 text-red-900 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-900';
    }
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
        {/* Username and timestamp */}
        {!isOwn && (
          <div className="flex items-center space-x-2 mb-1 px-1">
            <span className="text-sm font-medium text-gray-700">
              {message.pseudo}
            </span>
            {message.type !== 'normal' && (
              <div className={`flex items-center space-x-1 text-xs px-2 py-0.5 rounded-full ${
                message.type === 'important' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
              }`}>
                {getMessageTypeIcon(message.type)}
                <span className="capitalize">{message.type}</span>
              </div>
            )}
          </div>
        )}

        {/* Message bubble */}
        <div className={`
          relative px-4 py-2 rounded-2xl shadow-sm
          ${getMessageBubbleStyle(message.type, isOwn)}
          ${getMessageTypeStyles(message.type)}
        `}>
          {/* Message content */}
          <p className="text-sm break-words whitespace-pre-wrap">
            {decodedContent}
          </p>

          {/* Message metadata */}
          <div className={`flex items-center justify-between mt-2 text-xs ${
            isOwn ? 'text-green-200' : 'text-gray-500'
          }`}>
            <span>
              {format(new Date(message.timestamp), 'HH:mm')}
            </span>
            
            {/* Delivery status for own messages */}
            {isOwn && (
              <div className="flex items-center space-x-1 ml-2">
                {isDelivered ? (
                  <CheckCircleIcon className="w-4 h-4 text-green-300" />
                ) : (
                  <CheckIcon className="w-4 h-4 text-green-300" />
                )}
              </div>
            )}
          </div>

          {/* Message type indicator for own messages */}
          {isOwn && message.type !== 'normal' && (
            <div className="absolute -top-2 -left-2 flex items-center space-x-1 bg-white rounded-full px-2 py-1 shadow-sm border">
              {getMessageTypeIcon(message.type)}
              <span className="text-xs font-medium capitalize" style={{ color: MessageColors[message.type] }}>
                {message.type}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface SystemMessageProps {
  pseudo: string;
  timestamp: Date;
  type: 'joined' | 'left';
}

export function SystemMessage({ pseudo, timestamp, type }: SystemMessageProps) {
  return (
    <div className="flex justify-center mb-4">
      <div className="bg-gray-100 text-gray-600 text-sm px-4 py-2 rounded-full">
        <span className="font-medium">{pseudo}</span>
        {type === 'joined' ? ' joined the chat' : ' left the chat'}
        <span className="ml-2 text-xs">
          {format(new Date(timestamp), 'HH:mm')}
        </span>
      </div>
    </div>
  );
}