<template>
    <div class="game-controls">
      <button 
        class="btn btn-dark w-100 mb-3" 
        @click="startGame"
        :disabled="players.length < 2"
      >
        Iniciar partida
      </button>
      <router-link to="/home" class="btn btn-dark w-100">Volver</router-link>
    </div>
  </template>
  
  <script setup>
  defineProps({
    players: {
      type: Array,
      required: true
    }
  });
  
  const emit = defineEmits(['start-game']);
  
  const startGame = () => {
    emit('start-game');
  };
  </script>