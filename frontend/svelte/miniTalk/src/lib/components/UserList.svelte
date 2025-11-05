<script lang="ts">
  import { users, typingUsers, currentUser, showUserList } from '../stores';

  // Get users with typing status
  $: usersWithTyping = $users.map(user => ({
    ...user,
    isTyping: $typingUsers.some(t => t.pseudo === user.pseudo && t.isTyping)
  }));

  function getInitials(pseudo: string): string {
    return pseudo.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
  }

  function formatJoinTime(joinedAt: Date | string): string {
    const date = typeof joinedAt === 'string' ? new Date(joinedAt) : joinedAt;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function getStatusColor(user: typeof usersWithTyping[0]): string {
    if (user.pseudo === $currentUser) return 'bg-blue-400';
    if (user.isTyping) return 'bg-yellow-400 animate-pulse';
    return 'bg-green-400';
  }
</script>

<!-- Mobile Overlay -->
{#if $showUserList}
  <div 
    class="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
    on:click={() => showUserList.set(false)}
    on:keydown={(e) => e.key === 'Escape' && showUserList.set(false)}
    role="button"
    tabindex="0"
  />
{/if}

<!-- Sidebar -->
<div class="
  translate-x-0
  relative inset-y-0 left-0 z-auto
  w-80 lg:w-72 xl:w-80
  transition-transform duration-300 ease-in-out
  glass-sidebar border-r border-white/10
">
  <!-- Header -->
  <div class="p-6 border-b border-white/10 relative overflow-hidden">
    <!-- Animated header background -->
    <div class="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-indigo-600/5 to-purple-600/10 animate-gradient-x" />
    
    <div class="flex items-center justify-between relative z-10">
      <div class="flex items-center space-x-3">
        <!-- Animated icon -->
        <div class="relative">
          <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl animate-morphing flex items-center justify-center">
            <svg class="w-5 h-5 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <!-- Glow effect -->
          <div class="absolute inset-0 bg-blue-500/30 rounded-2xl blur-xl animate-pulse-slow" />
        </div>
        
        <h3 class="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-300 to-indigo-300 ">
          Voyageurs Digital
        </h3>
      </div>
      
      <!-- Close button for mobile -->
      <button
        on:click={() => showUserList.set(false)}
        class="lg:hidden p-2 rounded-xl glass-light hover:glass-medium transition-all duration-300"
      >
        <svg class="w-5 h-5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    
    <!-- Advanced user count with animations -->
    <div class="mt-4 space-y-3">
      <div class="flex items-center justify-between p-3 rounded-2xl glass-medium">
        <div class="flex items-center space-x-3">
          <div class="relative">
            <div class="w-4 h-4 bg-green-400 rounded-full animate-pulse-dot" />
            <div class="absolute inset-0 bg-green-400/30 rounded-full animate-ping" />
          </div>
          <span class="text-sm font-bold text-white/90">
            {$users.length} voyageur{$users.length !== 1 ? 's' : ''} connecté{$users.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div class="text-xs text-green-300 font-semibold bg-green-500/20 px-2 py-1 rounded-full">
          LIVE
        </div>
      </div>
      
      <!-- Activity indicator -->
      {#if $typingUsers.filter(u => u.isTyping).length > 0}
        <div class="flex items-center space-x-3 p-3 rounded-2xl bg-yellow-500/10 border border-yellow-400/20">
          <div class="flex space-x-1">
            <div class="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" />
            <div class="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style="animation-delay: 0.1s" />
            <div class="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style="animation-delay: 0.2s" />
          </div>
          <span class="text-xs font-medium text-yellow-200">
            {$typingUsers.filter(u => u.isTyping).length} en train d'écrire...
          </span>
        </div>
      {/if}
    </div>
  </div>

  <!-- Users List -->
  <div class="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
    {#if $users.length === 0}
      <!-- No users placeholder -->
      <div class="text-center py-8">
        <div class="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500/20 to-indigo-600/20 rounded-full flex items-center justify-center">
          <svg class="w-8 h-8 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <p class="text-white/60 text-sm">Aucun voyageur connecté</p>
      </div>
    {:else}
      {#each usersWithTyping as user (user.id)}
        <div class="
          group relative p-4 rounded-3xl glass-user-card border border-white/10
          transition-all duration-500 hover:scale-105 hover:glass-user-card-hover hover:shadow-2xl
          {user.pseudo === $currentUser ? 'ring-2 ring-blue-400/50 bg-blue-500/10' : ''}
          animate-fade-in-up overflow-hidden
        ">
          <!-- User Avatar and Info -->
          <div class="flex items-center space-x-4">
            <!-- Ultra-modern Avatar -->
            <div class="relative">
              <!-- Main avatar with gradient border -->
              <div class="relative p-0.5 rounded-3xl bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 animate-gradient-rotate">
                <div class="
                  w-14 h-14 rounded-3xl flex items-center justify-center font-black text-white text-lg
                  bg-gradient-to-br from-slate-800 to-slate-900
                  transition-all duration-500 group-hover:scale-110 group-hover:shadow-2xl
                  {user.pseudo === $currentUser ? 'from-blue-600 to-indigo-700' : ''}
                ">
                  {getInitials(user.pseudo)}
                </div>
              </div>
              
              <!-- Animated status indicator -->
              <div class="absolute -bottom-1 -right-1 w-5 h-5 {getStatusColor(user)} rounded-full border-3 border-slate-800 shadow-lg">
                {#if user.pseudo === $currentUser}
                  <div class="absolute inset-0 bg-blue-400/50 rounded-full animate-ping" />
                {:else if user.isTyping}
                  <div class="absolute inset-0 bg-yellow-400/50 rounded-full animate-pulse" />
                {:else}
                  <div class="absolute inset-0 bg-green-400/30 rounded-full animate-pulse-slow" />
                {/if}
              </div>
              
              <!-- Typing indicator overlay with particles -->
              {#if user.isTyping}
                <div class="absolute inset-0 rounded-3xl bg-gradient-to-br from-yellow-400/20 to-orange-400/10 animate-pulse">
                  <!-- Floating particles -->
                  <div class="absolute top-1 left-1 w-1 h-1 bg-yellow-300 rounded-full animate-float" />
                  <div class="absolute top-2 right-2 w-1 h-1 bg-yellow-300 rounded-full animate-float" style="animation-delay: 0.5s" />
                </div>
              {/if}
              
              <!-- Glow effect for current user -->
              {#if user.pseudo === $currentUser}
                <div class="absolute inset-0 bg-blue-500/20 rounded-3xl blur-xl animate-pulse-glow" />
              {/if}
            </div>

            <!-- Enhanced User Details -->
            <div class="flex-1 min-w-0 space-y-2">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <h4 class="font-black text-white truncate text-lg">
                    {user.pseudo}
                  </h4>
                  {#if user.pseudo === $currentUser}
                    <span class="px-3 py-1 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-bold animate-shimmer">
                      ✨ VOUS
                    </span>
                  {/if}
                </div>
                
                <!-- User rank/level indicator -->
                <div class="text-xs text-cyan-300 font-bold bg-cyan-500/20 px-2 py-1 rounded-full">
                  #{$users.findIndex(u => u.id === user.id) + 1}
                </div>
              </div>
              
              <div class="space-y-1">
                {#if user.isTyping}
                  <div class="flex items-center space-x-2 p-2 rounded-xl bg-yellow-500/10 border border-yellow-400/20">
                    <div class="flex space-x-1">
                      <div class="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" />
                      <div class="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style="animation-delay: 0.1s" />
                      <div class="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style="animation-delay: 0.2s" />
                    </div>
                    <span class="text-xs text-yellow-200 font-semibold">
                      Compose un message...
                    </span>
                  </div>
                {:else}
                  <div class="flex items-center space-x-2 text-xs text-white/70">
                    <svg class="w-3 h-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Connecté à {formatJoinTime(user.joinedAt)}</span>
                  </div>
                {/if}
                
                <!-- User activity bar -->
                <div class="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full animate-pulse" 
                       style="width: {user.isTyping ? '100%' : '60%'}">
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Hover glow effect -->
          <div class="absolute inset-0 rounded-2xl bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          
          <!-- Current user glow -->
          {#if user.pseudo === $currentUser}
            <div class="absolute inset-0 rounded-2xl bg-blue-400/10 animate-pulse-slow pointer-events-none" />
          {/if}
        </div>
      {/each}
    {/if}
  </div>

  <!-- Ultra-modern Footer -->
  <div class="p-6 border-t border-white/10 relative overflow-hidden">
    <!-- Animated footer background -->
    <div class="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent opacity-80" />
    
    <div class="space-y-4 relative z-10">
      <!-- Connection status with pulse animation -->
      <div class="relative p-4 rounded-3xl glass-medium border border-green-400/20 overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-r from-green-500/10 via-transparent to-blue-500/10 animate-gradient-x" />
        <div class="flex items-center justify-center space-x-3 relative z-10">
          <div class="relative">
            <div class="w-3 h-3 bg-green-400 rounded-full animate-pulse-dot" />
            <div class="absolute inset-0 bg-green-400/30 rounded-full animate-ping" />
          </div>
          <span class="text-sm font-bold text-white/90">Océan Digital Connecté</span>
          <div class="px-2 py-1 bg-green-500/20 text-green-300 text-xs font-bold rounded-full">
            ⚡ LIVE
          </div>
        </div>
      </div>
      
      <!-- Advanced statistics grid -->
      <div class="grid grid-cols-2 gap-3">
        <!-- Total users -->
        <div class="relative glass-stat p-4 rounded-2xl border border-blue-400/20 overflow-hidden group hover:scale-105 transition-all duration-300">
          <div class="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-600/5 group-hover:from-blue-500/20 group-hover:to-indigo-600/10 transition-all duration-300" />
          <div class="relative z-10 text-center">
            <div class="text-2xl font-black text-blue-300 animate-count">{$users.length}</div>
            <div class="text-xs text-blue-200/80 font-semibold">Voyageurs</div>
            <div class="flex items-center justify-center mt-1">
              <svg class="w-3 h-3 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <!-- Active typers -->
        <div class="relative glass-stat p-4 rounded-2xl border border-yellow-400/20 overflow-hidden group hover:scale-105 transition-all duration-300">
          <div class="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-600/5 group-hover:from-yellow-500/20 group-hover:to-orange-600/10 transition-all duration-300" />
          <div class="relative z-10 text-center">
            <div class="text-2xl font-black text-yellow-300 animate-bounce">{$typingUsers.filter(u => u.isTyping).length}</div>
            <div class="text-xs text-yellow-200/80 font-semibold">Actifs</div>
            <div class="flex items-center justify-center mt-1 space-x-1">
              <div class="w-1 h-1 bg-yellow-400 rounded-full animate-bounce" />
              <div class="w-1 h-1 bg-yellow-400 rounded-full animate-bounce" style="animation-delay: 0.1s" />
              <div class="w-1 h-1 bg-yellow-400 rounded-full animate-bounce" style="animation-delay: 0.2s" />
            </div>
          </div>
        </div>
      </div>
      
      <!-- Wave animation separator -->
      <div class="flex items-center justify-center space-x-1 py-2">
        {#each Array(5) as _, i}
          <div class="w-1 h-1 bg-cyan-400/60 rounded-full animate-wave" style="animation-delay: {i * 0.1}s" />
        {/each}
      </div>
      
      <!-- Server info -->
      <div class="text-center text-xs text-white/50 font-medium">
        🌊 Plongez dans l'expérience
      </div>
    </div>
  </div>
</div>

<style>
  .glass-sidebar {
    background: rgba(15, 23, 42, 0.8);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .glass-user-card {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
  }

  .glass-user-card-hover {
    background: rgba(255, 255, 255, 0.1);
    box-shadow: 0 8px 32px rgba(59, 130, 246, 0.2);
  }

  .glass-light {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
  }

  .glass-stat {
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(8px);
  }

  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #3b82f6, #6366f1);
    border-radius: 3px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, #2563eb, #4f46e5);
  }

  @keyframes fade-in-up {
    0% { 
      opacity: 0; 
      transform: translateY(20px); 
    }
    100% { 
      opacity: 1; 
      transform: translateY(0); 
    }
  }

  @keyframes pulse-slow {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 0.6; }
  }

  .animate-fade-in-up {
    animation: fade-in-up 0.4s ease-out;
  }

  .animate-pulse-slow {
    animation: pulse-slow 3s ease-in-out infinite;
  }

  .animate-gradient-x {
    animation: gradient-x 3s ease infinite;
    background-size: 200% 200%;
  }

  .animate-gradient-rotate {
    animation: gradient-rotate 4s linear infinite;
  }

  .animate-morphing {
    animation: morphing 8s ease-in-out infinite;
  }

  .animate-text-shimmer {
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    background-size: 200% 100%;
    animation: shimmer 2s infinite;
  }

  .animate-pulse-dot {
    animation: pulse-dot 2s ease-in-out infinite;
  }

  .animate-pulse-glow {
    animation: pulse-glow 2s ease-in-out infinite;
  }

  .animate-count {
    animation: count-up 0.8s ease-out;
  }

  .animate-wave {
    animation: wave 2s ease-in-out infinite;
  }

  .animate-shimmer {
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    background-size: 200% 100%;
    animation: shimmer 3s infinite;
  }

  @keyframes gradient-x {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }

  @keyframes gradient-rotate {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @keyframes morphing {
    0%, 100% { border-radius: 60% 40% 30% 70%/60% 30% 70% 40%; }
    50% { border-radius: 30% 60% 70% 40%/50% 60% 30% 60%; }
  }

  @keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }

  @keyframes pulse-dot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.8); }
  }

  @keyframes pulse-glow {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 0.8; transform: scale(1.1); }
  }

  @keyframes count-up {
    0% { transform: scale(0.5); opacity: 0; }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); opacity: 1; }
  }

  @keyframes wave {
    0%, 100% { transform: scaleY(1); }
    50% { transform: scaleY(3); }
  }
</style>