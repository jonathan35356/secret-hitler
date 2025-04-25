<template>
    <div class="game-code">
      <h2 class="text-center mb-3">Código: {{ code }}</h2>
      <p class="text-center mb-3">
        Estado de la partida:
        <span class="badge" :class="statusClass">{{ statusText }}</span>
      </p>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue'; // ← Importación añadida
  
  const props = defineProps({
    code: {
      type: String,
      required: true
    },
    status: {
      type: String,
      default: 'esperando'
    }
  });
  
  const statusText = computed(() => props.status === "iniciada" ? "Iniciada" : "No iniciada");
  const statusClass = computed(() => ({
    'bg-primary': props.status === "iniciada",
    'bg-secondary': props.status !== "iniciada"
  }));
  </script>
  
  <style scoped>
  .game-code {
    margin-bottom: 1.5rem;
  }
  </style>