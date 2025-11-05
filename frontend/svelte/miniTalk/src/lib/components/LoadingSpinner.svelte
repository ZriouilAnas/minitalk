<script lang="ts">
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let color: string = 'text-blue-400';

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };
</script>

<div class="inline-flex items-center justify-center">
  <div class="
    {sizeClasses[size]} 
    border-2 border-current border-t-transparent 
    rounded-full animate-spin 
    {color}
  " />
</div>