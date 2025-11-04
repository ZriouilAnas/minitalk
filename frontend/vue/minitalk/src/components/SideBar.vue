<template>
  <div class="sidebar">
    <h3>👥 Online Users ({{ users.length }})</h3>
    <div class="users-list">
      <div v-for="user in users" :key="user.id" class="user-item">
        {{ user.pseudo }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["users"],
};
</script>
