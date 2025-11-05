import { UsersIcon, UserIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import type { User, TypingUser } from '../types';

interface UserListProps {
  users: User[];
  currentUser: string;
  typingUsers: TypingUser[];
  isVisible: boolean;
  onToggle: () => void;
}

export function UserList({ users, currentUser, typingUsers, isVisible, onToggle }: UserListProps) {
  const typingUsersMap = new Map(typingUsers.map(user => [user.pseudo, user.isTyping]));

  return (
    <>
      {/* Mobile overlay */}
      {isVisible && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-50 lg:z-0
        w-80 lg:w-80 bg-white border-r border-gray-200
        transform ${isVisible ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        transition-transform duration-300 ease-in-out
        flex flex-col
      `}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <UsersIcon className="w-5 h-5 text-gray-600" />
              <h2 className="font-semibold text-gray-900">
                Online ({users.length})
              </h2>
            </div>
            <button
              onClick={onToggle}
              className="lg:hidden p-1 rounded-md hover:bg-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Users list */}
        <div className="flex-1 overflow-y-auto">
          {users.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <UserIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No users online</p>
            </div>
          ) : (
            <div className="p-2">
              {users.map((user) => {
                const isCurrentUser = user.pseudo === currentUser;
                const isTyping = typingUsersMap.get(user.pseudo);
                
                return (
                  <div
                    key={user.id}
                    className={`
                      flex items-center space-x-3 p-3 rounded-lg mb-1
                      ${isCurrentUser ? 'bg-green-50 border border-green-200' : 'hover:bg-gray-50'}
                      transition-colors duration-150
                    `}
                  >
                    {/* Avatar */}
                    <div className={`
                      relative flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm
                      ${isCurrentUser ? 'bg-green-600' : 'bg-gray-600'}
                    `}>
                      {user.pseudo.charAt(0).toUpperCase()}
                      {/* Online indicator */}
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                    </div>

                    {/* User info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className={`
                          font-medium truncate
                          ${isCurrentUser ? 'text-green-800' : 'text-gray-900'}
                        `}>
                          {user.pseudo}
                          {isCurrentUser && (
                            <span className="ml-1 text-xs text-green-600 font-normal">(You)</span>
                          )}
                        </p>
                        {isTyping && (
                          <div className="flex space-x-1">
                            <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        Joined {formatDistanceToNow(new Date(user.joinedAt), { addSuffix: true })}
                      </p>
                      {isTyping && (
                        <p className="text-xs text-blue-600 italic">
                          is typing...
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Connected to MiniTalk</span>
          </div>
        </div>
      </div>
    </>
  );
}