<template>
    <div>
      <input 
        type="text" 
        class="form-control my-2" 
        placeholder="Ingrese el código de la partida" 
        v-model="codigoIngresado"
        :disabled="esperandoInicio"
      >
    </div>
  </template>
  
  <script setup>
  import { ref, defineProps, defineEmits } from 'vue';
  
  const props = defineProps({
    esperandoInicio: Boolean
  });
  
  const emit = defineEmits(['unirseAPartida']);
  
  const codigoIngresado = ref("");
  
  const unirseAPartida = async () => {
    try {
      const codigoClean = codigoIngresado.value.trim().toUpperCase();
      emit('unirseAPartida', codigoClean);
    } catch (error) {
      console.error("Error:", error);
      throw error; // Re-lanzamos el error para manejarlo en el padre
    }
  };
  
  defineExpose({
    codigoIngresado,
    unirseAPartida
  });
  </script>