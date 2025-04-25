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
  const { players, presidentId, codigoSala } = defineProps(['players', 'presidentId', 'codigoSala']);
  
  // Define el evento de emisión
  const emit = defineEmits(['chancellor-selected']);
  
  // Computed para filtrar los jugadores disponibles
  const availablePlayers = computed(() =>
    players.filter(p => p.id !== presidentId && !p.isDead)
  );
  
  // Función para seleccionar al canciller
  async function selectChancellor(player) {
    emit('chancellor-selected', player);
    await handleChancellorSelected(player);
  }

  const handleChancellorSelected = async (chancellor) => {
    try {
      await updateDocument("partidas", codigoSala, {
        id_canciller: chancellor.id,
      });
      console.log("Canciller seleccionado:", chancellor.nombre);
    } catch (error) {
      console.error("Error al seleccionar Canciller:", error);
    }
  };
  </script>
  
  <style scoped>
  .selector {
    padding: 1rem;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 0 8px rgba(0,0,0,0.1);
  }
  </style>
