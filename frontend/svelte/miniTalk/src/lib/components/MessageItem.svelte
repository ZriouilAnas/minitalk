<script lang="ts">
  import type { Message, SystemMessage } from '../types';

  export let message: Message | SystemMessage & { type: 'joined' | 'left' };
  export let isOwn: boolean = false;
  export let isDelivered: boolean = true;

  // Function to decode HTML entities
  function decodeHtmlEntities(text: string): string {
    return text
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'");
  }

  function formatTime(timestamp: Date | string): string {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function getMessageTypeLabel(type: string): string {
    const labels = {
      normal: '💬 Normal',
      important: '⚠️ Important',
      urgent: '🚨 Urgent',
    };
    return labels[type as keyof typeof labels] || '💬 Normal';
  }

  function getMessageTypeClass(type: string): string {
    const classes = {
      normal: 'border-l-blue-400',
      important: 'border-l-yellow-400',
      urgent: 'border-l-red-400',
    };
    return classes[type as keyof typeof classes] || 'border-l-blue-400';
  }

  // Check if it's a system message
  $: isSystemMessage = 'type' in message && (message.type === 'joined' || message.type === 'left');
</script>

{#if isSystemMessage}
  <!-- System Message -->
  <div class="flex justify-center my-4 animate-fade-in">
    <div class="glass-system px-4 py-2 rounded-full border border-white/20 max-w-md">
      <div class="flex items-center justify-center space-x-2 text-sm font-medium text-white/80">
        <div class="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
        <span>
          {#if message.type === 'joined'}
            👋 <strong class="text-blue-300">{message.pseudo}</strong> a rejoint la conversation
          {:else if message.type === 'left'}
            👋 <strong class="text-blue-300">{message.pseudo}</strong> a quitté la conversation
          {/if}
        </span>
        <span class="text-xs text-white/50">
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  </div>
{:else}
  <!-- Regular Message -->
  <div class="flex {isOwn ? 'justify-end' : 'justify-start'} animate-fade-in-up">
    <div class="max-w-xs sm:max-w-md lg:max-w-lg xl:max-w-xl group">
      <!-- Message Bubble -->
      <div class="
        relative p-4 rounded-2xl border-l-4 
        {isOwn 
          ? 'bg-gradient-to-br from-blue-600/90 to-indigo-600/90 text-white glass-own' 
          : 'glass-other text-white border border-white/10'
        }
        {getMessageTypeClass(message.type)}
        transition-all duration-300 hover:scale-105 hover:shadow-xl
      ">
        <!-- Message Header -->
        {#if !isOwn}
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center space-x-2">
              <!-- User Avatar -->
              <div class="w-6 h-6 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                <span class="text-xs font-bold text-white">
                  {message.pseudo.charAt(0).toUpperCase()}
                </span>
              </div>
              <strong class="text-sm font-bold text-blue-200">
                {message.pseudo}
              </strong>
            </div>
            <span class="text-xs px-2 py-1 rounded-full glass-badge text-white/70">
              {getMessageTypeLabel(message.type)}
            </span>
          </div>
        {:else}
          <div class="flex justify-end mb-2">
            <span class="text-xs px-2 py-1 rounded-full bg-white/20 text-white/80">
              {getMessageTypeLabel(message.type)}
            </span>
          </div>
        {/if}

        <!-- Message Content -->
        <div class="mb-3">
          <p class="text-sm sm:text-base leading-relaxed break-words">
            {decodeHtmlEntities(message.content)}
          </p>
        </div>

        <!-- Message Footer -->
        <div class="flex items-center justify-between text-xs text-white/60">
          <span class="font-medium">
            {formatTime(message.timestamp)}
          </span>
          
          {#if isOwn}
            <div class="flex items-center space-x-1">
              {#if isDelivered}
                <svg class="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-green-400">Livré</span>
              {:else}
                <div class="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Envoi...</span>
              {/if}
            </div>
          {/if}
        </div>

        <!-- Message Type Glow Effect -->
        {#if message.type === 'important'}
          <div class="absolute inset-0 rounded-2xl bg-yellow-400/10 animate-pulse-glow pointer-events-none" />
        {:else if message.type === 'urgent'}
          <div class="absolute inset-0 rounded-2xl bg-red-400/10 animate-pulse-glow pointer-events-none" />
        {/if}

        <!-- Hover Glow Effect -->
        <div class="absolute inset-0 rounded-2xl bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>

      <!-- Message Tail -->
      <div class="
        relative {isOwn ? 'flex justify-end mr-4' : 'flex justify-start ml-4'}
      ">
        <div class="
          w-0 h-0 border-l-8 border-r-8 border-t-8 
          {isOwn 
            ? 'border-l-transparent border-r-blue-600/90 border-t-transparent' 
            : 'border-l-white/10 border-r-transparent border-t-transparent'
          }
        " />
      </div>
    </div>
  </div>
{/if}

<style>
  .glass-system {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
  }

  .glass-own {
    backdrop-filter: blur(20px);
    box-shadow: 
      0 8px 32px rgba(59, 130, 246, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }

  .glass-other {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(15px);
    box-shadow: 
      0 4px 16px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  .glass-badge {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(5px);
  }

  @keyframes fade-in {
    0% { opacity: 0; }
    100% { opacity: 1; }
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

  @keyframes pulse-glow {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 0.6; }
  }

  .animate-fade-in {
    animation: fade-in 0.3s ease-out;
  }

  .animate-fade-in-up {
    animation: fade-in-up 0.4s ease-out;
  }

  .animate-pulse-glow {
    animation: pulse-glow 2s ease-in-out infinite;
  }
</style>