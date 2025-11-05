import { useState } from 'react';
import { ArrowUpIcon } from '@heroicons/react/24/outline';

interface HistorySeparatorProps {
  messageCount: number;
  onLoadMore?: () => Promise<void>;
  canLoadMore?: boolean;
}

export function HistorySeparator({ messageCount, onLoadMore, canLoadMore = true }: HistorySeparatorProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadMore = async () => {
    if (!onLoadMore || isLoading) return;
    
    setIsLoading(true);
    try {
      await onLoadMore();
    } catch (error) {
      console.error('Failed to load more messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center my-6">
      <div className="flex-1 border-t border-gray-300"></div>
      <div className="flex items-center space-x-3">
        <div className="px-4 py-2 bg-gray-100 text-gray-600 text-sm rounded-full border">
          📚 {messageCount} message{messageCount !== 1 ? 's' : ''} précédent{messageCount !== 1 ? 's' : ''}
        </div>
        {canLoadMore && onLoadMore && (
          <button
            onClick={handleLoadMore}
            disabled={isLoading}
            className={`
              flex items-center space-x-2 px-3 py-2 rounded-full border transition-colors text-sm
              ${isLoading 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200'
              }
            `}
            title="Charger plus de messages"
          >
            <ArrowUpIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Chargement...' : 'Plus'}</span>
          </button>
        )}
      </div>
      <div className="flex-1 border-t border-gray-300"></div>
    </div>
  );
}