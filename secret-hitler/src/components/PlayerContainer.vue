<template>
  <div class="player-card">
    <img :src="imagen" alt="Imagen del jugador" class="player-image" />
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
  imagen: {
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
  width: 120px; /* Tamaño fijo para las tarjetas */
}

.player-image {
  width: 80px;
  height: 80px;
  border-radius: 50%; /* Hace que la imagen sea circular */
  object-fit: cover; /* Ajusta la imagen para que no se deforme */
  margin-bottom: 0.5rem;
}

.player-name {
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.player-role {
  font-size: 0.9rem;
  color: #666;
}

.players-container {
  display: flex;
  flex-wrap: nowrap; /* No permite que los elementos se ajusten a la siguiente fila */
  justify-content: center;
  gap: 0.5rem;
  overflow-x: auto; /* Permite desplazamiento horizontal si hay desbordamiento */
}
</style>
