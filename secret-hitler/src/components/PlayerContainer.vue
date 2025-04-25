<template>
  <div class="contenedor-externo mini">
    <div v-if="rol" class="rol-texto mini-texto">
      {{ rol === 'presidente' ? 'Presidente' : rol === 'canciller' ? 'Canciller' : 'Jugador' }}
    </div>
    <div class="contenedor-imagen mini-imagen">
      <img src="/image.png" alt="Imagen" />
    </div>
    <div class="nombre-jugador mini-texto">{{ nombre }}</div>
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
    required: false,
    default: "Jugador",
  },
});
</script>

<style scoped>
.contenedor-externo.mini {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  margin: 6px;
  border: 1px solid #ccc;
  border-radius: 8px;
  width: 100px;
  background-color: #f8f9fa;
}

.rol-texto.mini-texto,
.nombre-jugador.mini-texto {
  font-size: 0.8rem;
  text-align: center;
  margin: 4px 0;
  font-weight: 500;
}

.contenedor-imagen.mini-imagen img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
}

</style>
