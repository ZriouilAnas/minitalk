import { useEffect, useState } from 'react';
import { XMarkIcon, UsersIcon, WifiIcon, PencilIcon } from '@heroicons/react/24/outline';
import type { User, TypingUser } from '../types';

interface UserListProps {
  users: User[];
  currentUser: string;
  typingUsers: TypingUser[];
  isVisible: boolean;
  onToggle: () => void;
}

export function UserList({ users, currentUser, typingUsers, isVisible, onToggle }: UserListProps) {
  const [animatedUsers, setAnimatedUsers] = useState<string[]>([]);

  // Animate new users joining
  useEffect(() => {
    const newUsers = users.filter(user => !animatedUsers.includes(user.pseudo));
    if (newUsers.length > 0) {
      newUsers.forEach(user => {
        setTimeout(() => {
          setAnimatedUsers(prev => [...prev, user.pseudo]);
        }, 100);
      });
    }
  }, [users, animatedUsers]);

  const getUserInitials = (pseudo: string) => {
    return pseudo.slice(0, 2).toUpperCase();
  };

  const isUserTyping = (pseudo: string) => {
    return typingUsers.some(user => user.pseudo === pseudo && user.isTyping);
  };

  const getUserColor = (_pseudo: string, index: number) => {
    const colors = [
      'from-[#03045e] to-[#0077b6]',
      'from-[#0077b6] to-[#00b4d8]',
      'from-[#00b4d8] to-[#90e0ef]',
      'from-[#90e0ef] to-[#caf0f8]',
      'from-[#caf0f8] to-[#90e0ef]'
    ];
    return colors[index % colors.length];
  };

  return (
    <>
      {/* Backdrop overlay for mobile */}
      {isVisible && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden animate-fadeInScale"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:relative top-0 left-0 h-full z-50 transition-all duration-500 ease-out
        ${isVisible ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        w-80 lg:w-72 glass-strong border-r border-white/10 backdrop-blur-xl
      `}>
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#00b4d8] to-[#90e0ef] rounded-full flex items-center justify-center animate-pulse">
                <UsersIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Voyageurs</h2>
                <p className="text-xs text-white/60">En ligne maintenant</p>
              </div>
            </div>
            <button
              onClick={onToggle}
              className="lg:hidden p-2 rounded-xl glass-light hover:glass-medium transition-all duration-300 hover:rotate-90 group"
            >
              <XMarkIcon className="w-5 h-5 text-white/70 group-hover:text-red-400" />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="glass-light rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-[#caf0f8] mb-1">{users.length}</div>
              <div className="text-xs text-white/60">Connectés</div>
            </div>
            <div className="glass-light rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-[#90e0ef] mb-1">
                {typingUsers.filter(u => u.isTyping).length}
              </div>
              <div className="text-xs text-white/60">Écrivent</div>
            </div>
          </div>
        </div>

        {/* Users list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar max-h-[calc(100vh-200px)]">
          {users.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <UsersIcon className="w-8 h-8 text-white/50" />
              </div>
              <p className="text-white/60 text-sm">Aucun voyageur dans l'océan</p>
            </div>
          ) : (
            users.map((user, index) => {
              const isCurrentUser = user.pseudo === currentUser;
              const typing = isUserTyping(user.pseudo);
              const isAnimated = animatedUsers.includes(user.pseudo);

              return (
                <div
                  key={user.id}
                  className={`
                    group relative p-4 rounded-2xl transition-all duration-500 transform hover:scale-[1.02]
                    ${isCurrentUser 
                      ? 'glass-medium border-2 border-[#caf0f8]/30 shadow-lg shadow-[#caf0f8]/10' 
                      : 'glass-light hover:glass-medium border border-white/10'
                    }
                    ${isAnimated ? 'animate-slideInUp' : 'opacity-0'}
                    ${typing ? 'animate-pulse' : ''}
                  `}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* User avatar and info */}
                  <div className="flex items-center space-x-4">
                    {/* Avatar */}
                    <div className="relative">
                      <div className={`
                        w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm
                        bg-gradient-to-br ${getUserColor(user.pseudo, index)}
                        shadow-lg transition-all duration-300 group-hover:scale-110
                        ${typing ? 'animate-pulse ring-4 ring-[#90e0ef]/30' : ''}
                      `}>
                        {getUserInitials(user.pseudo)}
                      </div>
                      
                      {/* Online status dot */}
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#90e0ef] rounded-full border-2 border-white/20 animate-pulse" />
                      
                      {/* Typing indicator */}
                      {typing && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#caf0f8] rounded-full flex items-center justify-center animate-bounce">
                          <PencilIcon className="w-3 h-3 text-[#03045e]" />
                        </div>
                      )}
                    </div>

                    {/* User details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className={`
                          font-semibold text-sm truncate transition-colors
                          ${isCurrentUser ? 'text-[#caf0f8]' : 'text-white/90'}
                        `}>
                          {user.pseudo}
                        </h3>
                        {isCurrentUser && (
                          <span className="text-xs px-2 py-1 bg-[#caf0f8]/20 text-[#caf0f8] rounded-full font-medium">
                            Vous
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 mt-1">
                        <WifiIcon className="w-3 h-3 text-[#90e0ef]" />
                        <span className="text-xs text-white/60">
                          {typing ? 'Écrit un message...' : 'En ligne'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Hover glow effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#00b4d8]/10 to-[#90e0ef]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  
                  {/* Special effects for current user */}
                  {isCurrentUser && (
                    <>
                      <div className="absolute top-2 right-2 w-2 h-2 bg-[#caf0f8] rounded-full animate-ping" />
                      <div className="absolute bottom-2 left-2 w-1 h-1 bg-[#90e0ef] rounded-full animate-pulse" />
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <div className="glass-light rounded-xl p-3 text-center">
            <p className="text-xs text-white/60 leading-relaxed">
              🌊 Naviguez ensemble dans l'océan numérique
            </p>
          </div>
        </div>
      </div>
    </>
  );
}