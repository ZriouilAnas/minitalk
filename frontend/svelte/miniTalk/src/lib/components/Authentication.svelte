<script lang="ts">
  import { onMount } from 'svelte';
  import { socketService } from '../socketService';
  import { isAuthenticated, currentUser, connectionStatus, addToast } from '../stores';
  
  let pseudoInput = '';
  let isConnecting = false;
  let errors: string[] = [];
  
  let mounted = false;
  
  onMount(() => {
    mounted = true;
  });

  async function handleLogin() {
    if (!pseudoInput || pseudoInput.length < 2) {
      errors = ['Le pseudo doit contenir au moins 2 caractères'];
      return;
    }
    
    if (pseudoInput.length > 20) {
      errors = ['Le pseudo ne peut pas dépasser 20 caractères'];
      return;
    }

    isConnecting = true;
    errors = [];

    try {
      connectionStatus.update(status => ({ ...status, attempting: true }));
      
      // Ensure we're connected first
      if (!socketService.isConnected()) {
        await socketService.connect();
      }
      
      const result = await socketService.setPseudo(pseudoInput);
      
      currentUser.set(result.pseudo);
      isAuthenticated.set(true);
      connectionStatus.update(status => ({ ...status, attempting: false, connected: true }));
      
      addToast(`Bienvenue ${result.pseudo} ! 🎉`, 'success');
    } catch (error) {
      console.error('Authentication failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Échec de l\'authentification';
      errors = [errorMessage];
      connectionStatus.update(status => ({ ...status, attempting: false }));
      addToast(errorMessage, 'error');
    } finally {
      isConnecting = false;
    }
  }

  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      handleLogin();
    }
  }
</script>

<div class="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-800 to-cyan-600 flex items-center justify-center p-4 relative overflow-hidden">
  <!-- Animated background particles -->
  <div class="absolute inset-0 overflow-hidden">
    {#if mounted}
      {#each Array(20) as _, i}
        <div
          class="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
          style="
            left: {Math.random() * 100}%;
            top: {Math.random() * 100}%;
            animation-delay: {Math.random() * 3}s;
            animation-duration: {3 + Math.random() * 4}s;
          "
        />
      {/each}
    {/if}
  </div>

  <!-- Glass morphism login card -->
  <div class="relative glass-card p-8 w-full max-w-md animate-fade-in-scale">
    <!-- Glowing border effect -->
    <div class="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-400/20 via-blue-500/20 to-indigo-600/20 blur-xl animate-pulse-glow" />
    
    <div class="relative z-10">
      <!-- Logo and title -->
      <div class="text-center mb-8">
        <div class="w-20 h-20 mx-auto mb-6 relative">
          <div class="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl animate-float" />
          <div class="absolute inset-2 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
        </div>

        <h1 class="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-300 to-indigo-300 mb-3 animate-text-shimmer">
          MiniTalk
        </h1>
        <p class="text-blue-100/80 text-lg font-medium">
          Plongez dans l'océan digital
        </p>
      </div>

      <!-- Connection status -->
      <div class="mb-6">
        <div class="flex items-center justify-center space-x-3 p-3 rounded-2xl glass-light">
          <div class="{$connectionStatus.connected ? 'w-3 h-3 bg-green-400 rounded-full animate-pulse-dot' : $connectionStatus.attempting ? 'w-3 h-3 bg-yellow-400 rounded-full animate-spin' : 'w-3 h-3 bg-red-400 rounded-full animate-pulse'}" />
          <span class="text-sm font-semibold text-white/90">
            {$connectionStatus.connected 
              ? '✅ Connecté au serveur'
              : $connectionStatus.attempting 
                ? '🔄 Connexion en cours...' 
                : '❌ Déconnecté'
            }
          </span>
        </div>
      </div>

      <!-- Login form -->
      <form on:submit|preventDefault={handleLogin} class="space-y-6">
        <div class="space-y-2">
          <label for="pseudo" class="block text-sm font-bold text-blue-100 mb-2">
            Votre pseudo
          </label>
          <div class="relative">
            <input
              id="pseudo"
              type="text"
              bind:value={pseudoInput}
              on:keypress={handleKeyPress}
              placeholder="Entrez votre pseudo..."
              maxlength="20"
              class="
                w-full px-4 py-4 rounded-2xl glass-input 
                text-white placeholder-white/50 
                border border-white/20 
                focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 
                transition-all duration-300
                text-lg font-medium
              "
              disabled={isConnecting}
            />
            <div class="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 text-sm font-medium">
              {pseudoInput.length}/20
            </div>
          </div>
        </div>

        <!-- Error messages -->
        {#if errors.length > 0}
          <div class="space-y-2 animate-slide-in-down">
            {#each errors as error}
              <div class="p-3 rounded-2xl bg-red-500/20 border border-red-400/30 text-red-200 text-sm font-medium flex items-center space-x-2">
                <svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            {/each}
          </div>
        {/if}

        <!-- Login button -->
        <button
          type="submit"
          disabled={isConnecting || !pseudoInput.trim() || pseudoInput.length < 2}
          class="
            w-full py-4 px-6 rounded-2xl font-bold text-lg
            bg-gradient-to-r from-cyan-500 to-blue-600
            hover:from-cyan-400 hover:to-blue-500
            disabled:from-gray-600 disabled:to-gray-700
            text-white shadow-lg
            transition-all duration-300 transform
            hover:scale-105 hover:shadow-2xl
            disabled:scale-100 disabled:shadow-none disabled:cursor-not-allowed
            relative overflow-hidden group
          "
        >
          {#if isConnecting}
            <div class="flex items-center justify-center space-x-3">
              <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Connexion...</span>
            </div>
          {:else}
            <span class="relative z-10">Entrer dans l'océan 🌊</span>
            <div class="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full transition-transform duration-700 group-hover:translate-x-full" />
          {/if}
        </button>
      </form>

      <!-- Features list -->
      <div class="mt-8 pt-6 border-t border-white/10">
        <div class="grid grid-cols-1 gap-3 text-sm">
          <div class="flex items-center space-x-3 text-blue-100/80">
            <div class="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            <span>Chat en temps réel avec animations fluides</span>
          </div>
          <div class="flex items-center space-x-3 text-blue-100/80">
            <div class="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style="animation-delay: 0.2s" />
            <span>Messages avec priorités (Normal, Important, Urgent)</span>
          </div>
          <div class="flex items-center space-x-3 text-blue-100/80">
            <div class="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" style="animation-delay: 0.4s" />
            <span>Historique des conversations</span>
          </div>
          <div class="flex items-center space-x-3 text-blue-100/80">
            <div class="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style="animation-delay: 0.6s" />
            <span>Indicateurs de frappe en direct</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .glass-card {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 24px;
    box-shadow: 
      0 8px 32px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  .glass-light {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .glass-input {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
  }

  @keyframes pulse-glow {
    0%, 100% { opacity: 0.5; transform: scale(1); }
    50% { opacity: 0.8; transform: scale(1.05); }
  }

  @keyframes pulse-dot {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  @keyframes fade-in-scale {
    0% { 
      opacity: 0; 
      transform: scale(0.9) translateY(20px); 
    }
    100% { 
      opacity: 1; 
      transform: scale(1) translateY(0); 
    }
  }

  @keyframes slide-in-down {
    0% { 
      opacity: 0; 
      transform: translateY(-10px); 
    }
    100% { 
      opacity: 1; 
      transform: translateY(0); 
    }
  }

  @keyframes text-shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }

  .animate-float {
    animation: float 6s ease-in-out infinite;
  }

  .animate-pulse-glow {
    animation: pulse-glow 2s ease-in-out infinite;
  }

  .animate-pulse-dot {
    animation: pulse-dot 2s ease-in-out infinite;
  }

  .animate-fade-in-scale {
    animation: fade-in-scale 0.6s ease-out;
  }

  .animate-slide-in-down {
    animation: slide-in-down 0.3s ease-out;
  }

  .animate-text-shimmer {
    background-size: 200% auto;
    animation: text-shimmer 3s linear infinite;
  }
</style>