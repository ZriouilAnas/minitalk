<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { 
    isAuthenticated, 
    currentUser, 
    connectionStatus, 
    messages, 
    users, 
    typingUsers, 
    deliveredMessages, 
    historyMessageCount, 
    canLoadMoreHistory,
    addToast 
  } from '../lib/stores';
  import { socketService } from '../lib/socketService';
  import Authentication from '../lib/components/Authentication.svelte';
  import ChatInterface from '../lib/components/ChatInterface.svelte';
  import Toast from '../lib/components/Toast.svelte';

  let mounted = false;

  onMount(() => {
    mounted = true;
    initializeConnection();
  });

  onDestroy(() => {
    socketService.disconnect();
  });

  async function initializeConnection() {
    try {
      connectionStatus.update(status => ({ ...status, attempting: true, error: undefined }));
      
      console.log('🔌 Connecting to server...');
      await socketService.connect();
      console.log('✅ Connected, setting up listeners...');
      
      connectionStatus.update(status => ({ ...status, connected: true, attempting: false }));
      
    } catch (error) {
      console.error('Failed to connect:', error);
      connectionStatus.update(status => ({
        connected: false,
        attempting: false,
        error: error instanceof Error ? error.message : 'Connection failed',
      }));
    }
  }

  function handleDisconnect() {
    console.log('👋 User initiated disconnect');
    socketService.disconnect();
    
    // Reset all stores
    isAuthenticated.set(false);
    currentUser.set('');
    messages.set([]);
    users.set([]);
    typingUsers.set([]);
    deliveredMessages.set(new Set());
    historyMessageCount.set(0);
    canLoadMoreHistory.set(true);
    connectionStatus.set({ connected: false, attempting: false, error: undefined });
    
    addToast('Déconnecté avec succès 👋', 'info');
    
    // Reconnect for future use
    setTimeout(initializeConnection, 1000);
  }
</script>

<svelte:head>
  <title>MiniTalk - Chat en temps réel</title>
  <meta name="description" content="Application de chat moderne avec Svelte" />
</svelte:head>

<main class="h-screen overflow-hidden">
  {#if mounted}
    {#if $connectionStatus.attempting}
      <!-- Loading screen -->
      <div class="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-800 to-cyan-600 flex items-center justify-center p-4">
        <div class="text-center animate-fade-in-scale">
          <div class="w-20 h-20 mx-auto mb-6 relative">
            <div class="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl animate-spin" />
            <div class="absolute inset-2 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
          </div>
          <h2 class="text-2xl font-bold text-white mb-3">Connexion en cours...</h2>
          <p class="text-blue-100/80">Préparation de l'océan digital</p>
        </div>
      </div>
    {:else if $connectionStatus.error && !$isAuthenticated}
      <!-- Error screen -->  
      <div class="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-600 flex items-center justify-center p-4">
        <div class="text-center animate-fade-in-scale">
          <div class="w-20 h-20 mx-auto mb-6 relative">
            <div class="absolute inset-0 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl" />
            <div class="absolute inset-2 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h2 class="text-2xl font-bold text-white mb-3">Erreur de connexion</h2>
          <p class="text-red-100/80 mb-6">{$connectionStatus.error}</p>
          <button
            on:click={initializeConnection}
            class="px-6 py-3 bg-white/20 text-white rounded-2xl hover:bg-white/30 transition-all duration-300 font-semibold"
          >
            Réessayer
          </button>
        </div>
      </div>
    {:else if !$isAuthenticated}
      <!-- Authentication screen -->
      <Authentication />
    {:else}
      <!-- Main chat interface -->
      <ChatInterface />
    {/if}
    
    <!-- Toast notifications -->
    <Toast />
  {/if}
</main>

<style>
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

  .animate-fade-in-scale {
    animation: fade-in-scale 0.6s ease-out;
  }
</style>
