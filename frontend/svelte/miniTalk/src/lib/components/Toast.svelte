<script lang="ts">
  import { toasts } from '../stores';
  import { fly } from 'svelte/transition';

  function removeToast(id: string) {
    toasts.update(list => list.filter(toast => toast.id !== id));
  }

  function getToastStyles(type: string) {
    const styles = {
      success: 'from-green-500/90 to-emerald-600/90 border-green-400/30',
      error: 'from-red-500/90 to-red-600/90 border-red-400/30',
      info: 'from-blue-500/90 to-indigo-600/90 border-blue-400/30',
    };
    return styles[type as keyof typeof styles] || styles.info;
  }

  function getToastIcon(type: string) {
    const icons = {
      success: '✅',
      error: '❌',
      info: 'ℹ️',
    };
    return icons[type as keyof typeof icons] || icons.info;
  }
</script>

{#if $toasts.length > 0}
  <div class="fixed top-4 right-4 z-50 space-y-2">
    {#each $toasts as toast (toast.id)}
      <div
        transition:fly={{ x: 300, duration: 300 }}
        class="
          max-w-sm p-4 rounded-2xl backdrop-blur-20 border
          bg-gradient-to-r {getToastStyles(toast.type)}
          shadow-lg text-white font-medium
          flex items-center space-x-3
          animate-slide-in-right
        "
      >
        <!-- Icon -->
        <div class="text-lg">
          {getToastIcon(toast.type)}
        </div>
        
        <!-- Message -->
        <div class="flex-1 text-sm">
          {toast.message}
        </div>
        
        <!-- Close button -->
        <button
          on:click={() => removeToast(toast.id)}
          class="p-1 rounded-lg hover:bg-white/20 transition-colors duration-200"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    {/each}
  </div>
{/if}

<style>
  @keyframes slide-in-right {
    0% { 
      opacity: 0; 
      transform: translateX(100px); 
    }
    100% { 
      opacity: 1; 
      transform: translateX(0); 
    }
  }

  .animate-slide-in-right {
    animation: slide-in-right 0.3s ease-out;
  }
</style>