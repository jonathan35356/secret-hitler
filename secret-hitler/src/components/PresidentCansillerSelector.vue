<template>
    <div class="selector">
      <h5>Elige un Canciller</h5>
      <div class="d-flex flex-wrap justify-content-center mt-3" style="gap: 8px;">
        <button
          v-for="player in availablePlayers"
          :key="player.id"
          class="btn btn-outline-primary"
          @click="selectChancellor(player)"
        >
          {{ player.name }}
        </button>
      </div>
    </div>
  </template>
  
  <script setup>

import { ref, computed } from 'vue'

  // Desestructuración de los props directamente
  const { players, presidentId } = defineProps(['players', 'presidentId']);
  
  // Define el evento de emisión
  const emit = defineEmits(['chancellor-selected']);
  
  // Computed para filtrar los jugadores disponibles
  const availablePlayers = computed(() =>
    players.filter(p => p.id !== presidentId && !p.isDead)
  );
  
  // Función para seleccionar al canciller
  function selectChancellor(player) {
    emit('chancellor-selected', player);
  }
  </script>
  
  <style scoped>
  .selector {
    padding: 1rem;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 0 8px rgba(0,0,0,0.1);
  }
  </style>
  