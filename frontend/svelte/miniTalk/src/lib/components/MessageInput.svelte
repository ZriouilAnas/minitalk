<script lang="ts">
  import { selectedMessageType } from '../stores';
  import type { MessageType } from '../types';

  export let onSendMessage: (content: string, type: MessageType) => void;
  export let onTyping: () => void;
  export let onStopTyping: () => void;
  export let disabled = false;

  let messageInput = '';
  let typingTimeout: number | null = null;

  const messageTypes: { value: MessageType; label: string; icon: string; color: string }[] = [
    { value: 'normal', label: 'Normal', icon: '💬', color: 'from-blue-500 to-blue-600' },
    { value: 'important', label: 'Important', icon: '⚠️', color: 'from-yellow-500 to-orange-500' },
    { value: 'urgent', label: 'Urgent', icon: '🚨', color: 'from-red-500 to-red-600' },
  ];

  function handleSubmit() {
    const content = messageInput.trim();
    if (!content || disabled) return;

    onSendMessage(content, $selectedMessageType);
    messageInput = '';
    handleStopTyping();
  }

  function handleInput() {
    onTyping();
    
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    typingTimeout = setTimeout(() => {
      handleStopTyping();
    }, 1000);
  }

  function handleStopTyping() {
    if (typingTimeout) {
      clearTimeout(typingTimeout);
      typingTimeout = null;
    }
    onStopTyping();
  }

  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  }
</script>

<div class="glass-input-container p-6 border-t border-white/10">
  <!-- Message Type Selector -->
  <div class="flex flex-wrap gap-2 mb-4">
    {#each messageTypes as type}
      <button
        on:click={() => selectedMessageType.set(type.value)}
        class="
          px-4 py-2 rounded-2xl border transition-all duration-300 
          text-sm font-semibold flex items-center space-x-2
          {$selectedMessageType === type.value 
            ? `bg-gradient-to-r ${type.color} text-white border-transparent shadow-lg scale-105` 
            : 'glass-type-btn text-white/80 border-white/20 hover:border-white/40 hover:bg-white/10'
          }
        "
        disabled={disabled}
      >
        <span>{type.icon}</span>
        <span>{type.label}</span>
        {#if $selectedMessageType === type.value}
          <div class="w-2 h-2 bg-white rounded-full animate-pulse" />
        {/if}
      </button>
    {/each}
  </div>

  <!-- Message Input Form -->
  <form on:submit|preventDefault={handleSubmit} class="space-y-4">
    <div class="flex space-x-4">
      <!-- Message Input -->
      <div class="flex-1 relative">
        <textarea
          bind:value={messageInput}
          on:input={handleInput}
          on:keydown={handleKeyPress}
          on:blur={handleStopTyping}
          placeholder="Tapez votre message..."
          maxlength="500"
          rows="1"
          class="
            w-full px-6 py-4 rounded-2xl glass-input
            text-white placeholder-white/50 
            border border-white/20 
            focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20
            transition-all duration-300
            resize-none overflow-hidden
            text-base leading-relaxed
          "
          style="min-height: 56px; max-height: 120px;"
          {disabled}
        />
        
        <!-- Character Counter -->
        <div class="absolute bottom-2 right-4 text-xs text-white/50 font-medium">
          {messageInput.length}/500
        </div>
      </div>

      <!-- Send Button -->
      <button
        type="submit"
        disabled={disabled || !messageInput.trim()}
        class="
          px-8 py-4 rounded-2xl font-bold text-white
          bg-gradient-to-r from-blue-500 to-indigo-600
          hover:from-blue-400 hover:to-indigo-500
          disabled:from-gray-600 disabled:to-gray-700
          shadow-lg transition-all duration-300 transform
          hover:scale-105 hover:shadow-2xl
          disabled:scale-100 disabled:shadow-none disabled:cursor-not-allowed
          relative overflow-hidden group
          flex items-center space-x-2 min-w-[120px] justify-center
        "
      >
        {#if disabled}
          <div class="flex items-center space-x-2">
            <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Envoi...</span>
          </div>
        {:else}
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          <span>Envoyer</span>
        {/if}
        
        <!-- Shine effect on hover -->
        <div class="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full transition-transform duration-700 group-hover:translate-x-full" />
      </button>
    </div>

    <!-- Input Footer -->
    <div class="flex items-center justify-between text-sm text-white/60">
      <div class="flex items-center space-x-4">
        <div class="flex items-center space-x-2">
          <div class="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
          <span>Appuyez sur Entrée pour envoyer</span>
        </div>
        
        {#if $selectedMessageType !== 'normal'}
          <div class="flex items-center space-x-2 px-3 py-1 rounded-full glass-badge">
            <span class="text-xs">Type sélectionné:</span>
            <span class="font-semibold text-white/80">
              {messageTypes.find(t => t.value === $selectedMessageType)?.label}
            </span>
          </div>
        {/if}
      </div>
      
      <div class="flex items-center space-x-2">
        {#if disabled}
          <div class="text-red-400 font-medium">Hors ligne</div>
        {:else}
          <div class="text-green-400 font-medium">En ligne</div>
        {/if}
      </div>
    </div>
  </form>
</div>

<style>
  .glass-input-container {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .glass-input {
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(15px);
  }

  .glass-input:focus {
    background: rgba(255, 255, 255, 0.12);
  }

  .glass-type-btn {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
  }

  .glass-badge {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(5px);
  }

  /* Auto-resize textarea */
  textarea {
    field-sizing: content;
  }
</style>