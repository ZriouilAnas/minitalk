<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import { 
    messages, 
    users, 
    typingUsers, 
    connectionStatus, 
    deliveredMessages, 
    historyMessageCount,
    canLoadMoreHistory,
    showUserList,
    currentUser,
    addToast
  } from '../stores';
  import { socketService } from '../socketService';
  import MessageItem from './MessageItem.svelte';
  import MessageInput from './MessageInput.svelte';
  import UserList from './UserList.svelte';
  import LoadingSpinner from './LoadingSpinner.svelte';
  import type { Message, MessageType, SystemMessage } from '../types';

  let messagesContainer: HTMLDivElement;
  let isLoadingHistory = false;
  let mounted = false;

  onMount(() => {
    mounted = true;
    initializeSocket();
  });

  onDestroy(() => {
    socketService.disconnect();
  });

  async function initializeSocket() {
    try {
      connectionStatus.update(status => ({ ...status, attempting: true }));

      if (!socketService.isConnected()) {
        await socketService.connect();
      }

      // Setup socket event listeners
      socketService.onConnect(() => {
        connectionStatus.update(status => ({ ...status, connected: true, attempting: false, error: undefined }));
        addToast('Connexion établie ! 🎉', 'success');
      });

      socketService.onDisconnect((reason) => {
        console.log('Disconnected:', reason);
        connectionStatus.update(status => ({ ...status, connected: false }));
        addToast('Connexion perdue 😔', 'error');
      });

      socketService.onMessage((message) => {
        messages.update(list => [...list, message]);
        deliveredMessages.update(set => new Set([...set, message.id]));
        scrollToBottom();
      });

      socketService.onMessageHistory((historyMessages) => {
        console.log('📚 Received message history:', historyMessages.length, 'messages');
        messages.set(historyMessages);
        historyMessageCount.set(historyMessages.length);
        
        const historyIds = historyMessages.map(msg => msg.id);
        deliveredMessages.update(set => new Set([...set, ...historyIds]));
        
        if (historyMessages.length > 0) {
          addToast(`📚 ${historyMessages.length} message${historyMessages.length !== 1 ? 's' : ''} chargé${historyMessages.length !== 1 ? 's' : ''}`, 'info');
        }
        
        scrollToBottom();
      });

      socketService.onUserJoined((data) => {
        messages.update(list => [...list, { ...data, type: 'joined' as const }]);
        addToast(`👋 ${data.pseudo} a rejoint la conversation`, 'info');
        scrollToBottom();
      });

      socketService.onUserLeft((data) => {
        messages.update(list => [...list, { ...data, type: 'left' as const }]);
        addToast(`👋 ${data.pseudo} a quitté la conversation`, 'info');
        scrollToBottom();
      });

      socketService.onUsersUpdate((usersList) => {
        users.set(usersList);
      });

      socketService.onUserTyping((data) => {
        typingUsers.update(list => {
          const filtered = list.filter(user => user.pseudo !== data.pseudo);
          if (data.isTyping) {
            return [...filtered, data];
          }
          return filtered;
        });
      });

      socketService.onError((error) => {
        console.error('Socket error:', error);
        connectionStatus.update(status => ({ ...status, error }));
        addToast(`Erreur: ${error}`, 'error');
      });

      connectionStatus.update(status => ({ ...status, connected: true, attempting: false }));

    } catch (error) {
      console.error('Failed to initialize socket:', error);
      connectionStatus.update(status => ({
        connected: false,
        attempting: false,
        error: error instanceof Error ? error.message : 'Connection failed'
      }));
      addToast('Impossible de se connecter au serveur', 'error');
    }
  }

  async function handleSendMessage(content: string, type: MessageType) {
    if (!$connectionStatus.connected) {
      addToast('Impossible d\'envoyer le message: non connecté', 'error');
      return;
    }

    try {
      const acknowledgment = await socketService.sendMessage(content, type);
      console.log('Message sent:', acknowledgment);
      
      if (acknowledgment.messageId) {
        deliveredMessages.update(set => new Set([...set, acknowledgment.messageId!]));
      }
      
      addToast('Message envoyé ! ✅', 'success');
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage = error instanceof Error ? error.message : 'Échec de l\'envoi du message';
      addToast(errorMessage, 'error');
    }
  }

  function handleTyping() {
    socketService.startTyping();
  }

  function handleStopTyping() {
    socketService.stopTyping();
  }

  async function handleLoadMoreHistory() {
    if (!$connectionStatus.connected || isLoadingHistory) {
      return;
    }

    isLoadingHistory = true;

    try {
      const moreMessages = await socketService.requestMoreHistory(50);
      
      if (moreMessages.length === 0) {
        canLoadMoreHistory.set(false);
        addToast('📚 Historique complet: tous les messages disponibles ont été chargés', 'info');
        return;
      }

      const existingIds = new Set($messages.map(msg => 'id' in msg ? msg.id : `system-${msg.timestamp}`));
      const newMessages = moreMessages.filter(msg => !existingIds.has(msg.id));
      
      if (newMessages.length > 0) {
        messages.update(list => [...newMessages, ...list]);
        
        const newMessageIds = newMessages.map(msg => msg.id);
        deliveredMessages.update(set => new Set([...set, ...newMessageIds]));
        
        addToast(`📚 ${newMessages.length} message${newMessages.length !== 1 ? 's' : ''} supplémentaire${newMessages.length !== 1 ? 's' : ''} chargé${newMessages.length !== 1 ? 's' : ''}`, 'info');
      } else {
        addToast('📚 Aucun nouveau message: tous les messages récents sont déjà affichés', 'info');
      }
      
      if (moreMessages.length < 50) {
        canLoadMoreHistory.set(false);
      }
      
    } catch (error) {
      console.error('Failed to load more history:', error);
      addToast('❌ Erreur: Impossible de charger plus de messages', 'error');
    } finally {
      isLoadingHistory = false;
    }
  }

  function handleDisconnect() {
    socketService.disconnect();
    // Reset all stores will be handled by the parent component
  }

  async function scrollToBottom() {
    if (messagesContainer) {
      await tick();
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  // Get active typing users (excluding current user)
  $: activeTypingUsers = $typingUsers.filter(user => user.isTyping && user.pseudo !== $currentUser);
</script>

<div class="h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex overflow-hidden relative">
  <!-- Animated background -->
  <div class="absolute inset-0 overflow-hidden">
    {#if mounted}
      <!-- Floating particles -->
      {#each Array(30) as _, i}
        <div
          class="absolute w-1 h-1 bg-blue-400/30 rounded-full animate-float-slow"
          style="
            left: {Math.random() * 100}%;
            top: {Math.random() * 100}%;
            animation-delay: {Math.random() * 5}s;
            animation-duration: {5 + Math.random() * 5}s;
          "
        />
      {/each}
      
      <!-- Animated gradient orbs -->
      <div class="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow" />
      <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse-slow" style="animation-delay: 2s" />
    {/if}
  </div>

  <!-- Sidebar -->
  <UserList />

  <!-- Main Chat Container -->
  <div class="flex-1 flex flex-col relative z-10">
    <!-- Header -->
    <div class="glass-header p-6 border-b border-white/10">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <!-- Mobile menu button -->
          <button
            on:click={() => showUserList.update(show => !show)}
            class="lg:hidden p-2 rounded-xl glass-light hover:glass-medium transition-all duration-300 hover:scale-105"
          >
            <svg class="w-6 h-6 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div class="flex items-center space-x-4">
            <!-- Logo -->
            <div class="relative">
              <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl animate-float flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            
            <div>
              <h1 class="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-300">
                MiniTalk
              </h1>
              <div class="flex items-center space-x-3 mt-1">
                <div class="w-3 h-3 rounded-full {$connectionStatus.connected ? 'bg-green-400 animate-pulse-dot' : $connectionStatus.attempting ? 'bg-yellow-400 animate-spin' : 'bg-red-400 animate-pulse'}" />
                <span class="text-sm font-medium text-white/80">
                  {$connectionStatus.connected 
                    ? `${$users.length} voyageur${$users.length !== 1 ? 's' : ''} connecté${$users.length !== 1 ? 's' : ''}`
                    : $connectionStatus.attempting 
                      ? 'Connexion en cours...' 
                      : 'Déconnecté'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="flex items-center space-x-3">
          <!-- Connection status -->
          <div class="flex items-center space-x-3 px-4 py-2 glass-light rounded-full">
            <div class="p-2 rounded-full {$connectionStatus.connected ? 'bg-green-400/20 text-green-400' : $connectionStatus.attempting ? 'bg-yellow-400/20 text-yellow-400' : 'bg-red-400/20 text-red-400'}">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
              </svg>
            </div>
            <span class="hidden sm:inline text-sm font-semibold text-white/90">
              {$currentUser}
            </span>
          </div>

          <!-- Disconnect button -->
          <button
            on:click={handleDisconnect}
            class="p-3 rounded-full glass-light hover:glass-medium transition-all duration-300 text-white/70 hover:text-red-400 hover:scale-105"
            title="Se déconnecter"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Messages Container -->
    <div 
      bind:this={messagesContainer}
      class="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar"
    >
      {#if $messages.length === 0}
        <div class="flex items-center justify-center h-full">
          <div class="text-center animate-fade-in-scale">
            <div class="relative w-24 h-24 mx-auto mb-6">
              <div class="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full animate-float" />
              <div class="absolute inset-2 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                <svg class="w-10 h-10 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="17 8h1a4 4 0 010 8h-1m-3.5-4H12m0 0V8m0 4v4" />
                </svg>
              </div>
            </div>
            <h3 class="text-2xl font-bold text-white mb-3">
              Bienvenue dans l'Océan Digital
            </h3>
            <p class="text-white/70 text-lg">
              Commencez une conversation et plongez dans l'expérience
            </p>
          </div>
        </div>
      {:else}
        <!-- Load more history button -->
        {#if $canLoadMoreHistory && $historyMessageCount > 0}
          <div class="flex justify-center mb-4">
            <button
              on:click={handleLoadMoreHistory}
              disabled={isLoadingHistory}
              class="
                px-6 py-3 rounded-2xl glass-medium border border-blue-400/30
                text-blue-200 hover:text-white transition-all duration-300
                hover:scale-105 hover:bg-blue-500/20
                disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100
                flex items-center space-x-2
              "
            >
              {#if isLoadingHistory}
                <LoadingSpinner size="sm" />
                <span>Chargement...</span>
              {:else}
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span>📜 Charger plus d'historique</span>
              {/if}
            </button>
          </div>
        {/if}

        <!-- Messages -->
        {#each $messages as message, index (('id' in message) ? message.id : `system-${index}`)}
          <div class="animate-fade-in-up">
            <MessageItem 
              {message} 
              isOwn={('senderId' in message) && (message.senderId === $currentUser || message.pseudo === $currentUser)}
              isDelivered={('id' in message) && $deliveredMessages.has(message.id)}
            />
            
            <!-- History separator -->
            {#if index === $historyMessageCount - 1 && $historyMessageCount > 0}
              <div class="flex items-center my-6">
                <div class="flex-1 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />
                <div class="px-4 py-2 glass-medium rounded-full border border-blue-400/30">
                  <span class="text-sm font-medium text-blue-200">
                    📚 Historique ({$historyMessageCount} message{$historyMessageCount !== 1 ? 's' : ''})
                  </span>
                </div>
                <div class="flex-1 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />
              </div>
            {/if}
          </div>
        {/each}

        <!-- Typing indicators -->
        {#if activeTypingUsers.length > 0}
          <div class="flex justify-start animate-slide-in-up">
            <div class="glass-medium border border-blue-400/20 px-6 py-3 rounded-3xl">
              <div class="flex items-center space-x-4">
                <!-- Animated typing dots -->
                <div class="flex space-x-1">
                  <div class="w-3 h-3 bg-blue-400 rounded-full animate-bounce opacity-80" />
                  <div class="w-3 h-3 bg-blue-400 rounded-full animate-bounce opacity-60" style="animation-delay: 0.1s" />
                  <div class="w-3 h-3 bg-blue-400 rounded-full animate-bounce opacity-40" style="animation-delay: 0.2s" />
                </div>
                <span class="text-sm font-medium text-white/90">
                  {activeTypingUsers.length === 1 
                    ? `${activeTypingUsers[0].pseudo} compose un message...`
                    : `${activeTypingUsers.length} personnes écrivent...`
                  }
                </span>
              </div>
            </div>
          </div>
        {/if}
      {/if}
    </div>

    <!-- Message Input -->
    <MessageInput
      onSendMessage={handleSendMessage}
      onTyping={handleTyping}
      onStopTyping={handleStopTyping}
      disabled={!$connectionStatus.connected}
    />
  </div>
</div>

<style>
  .glass-header {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .glass-light {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .glass-medium {
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(15px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #3b82f6, #6366f1);
    border-radius: 4px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, #2563eb, #4f46e5);
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
  }

  @keyframes float-slow {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-30px) rotate(180deg); }
  }

  @keyframes pulse-slow {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 0.6; transform: scale(1.1); }
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

  @keyframes slide-in-up {
    0% { 
      opacity: 0; 
      transform: translateY(10px); 
    }
    100% { 
      opacity: 1; 
      transform: translateY(0); 
    }
  }

  .animate-float {
    animation: float 6s ease-in-out infinite;
  }

  .animate-float-slow {
    animation: float-slow 10s ease-in-out infinite;
  }

  .animate-pulse-slow {
    animation: pulse-slow 4s ease-in-out infinite;
  }

  .animate-pulse-dot {
    animation: pulse-dot 2s ease-in-out infinite;
  }

  .animate-fade-in-scale {
    animation: fade-in-scale 0.6s ease-out;
  }

  .animate-fade-in-up {
    animation: fade-in-up 0.4s ease-out;
  }

  .animate-slide-in-up {
    animation: slide-in-up 0.3s ease-out;
  }
</style>