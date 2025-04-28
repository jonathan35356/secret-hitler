<template>
  <div class="player-card">
    <div class="player-name">{{ nombre }}</div>
    <div class="player-role">
      {{ rol === 'presidente' ? 'Presidente' : rol === 'canciller' ? 'Canciller' : rol }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  nombre: {
    type: String,
    required: true,
  },
  rol: {
    type: String,
    required: true,
  },
});
</script>

<style scoped>
.player-card {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  background-color: #f9f9f9;
}
.player-name {
  font-weight: bold;
  margin-bottom: 0.5rem;
}
.player-role {
  font-size: 0.9rem;
  color: #666;
}
</style>
