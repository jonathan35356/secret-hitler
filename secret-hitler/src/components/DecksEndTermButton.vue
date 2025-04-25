<template>
    <div class="d-flex align-items-center justify-content-center gap-4 mt-3">
      <div class="mazo text-center px-3 py-2 border rounded">
        Mazo<br />
        {{ mazoPartida.length }} cartas
      </div>
  
      <button
        class="btn btn-sm btn-primary"
        @click="accionDelBoton"
        style="padding: 4px 10px; font-size: 0.9rem;"
      >
        Finalizar Presidencia
      </button>
  
      <div class="mazo text-center px-3 py-2 border rounded">
        Descarte<br />
        {{ mazoDescarte.length }} cartas
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  
  // Inicializamos el mazo: 6 liberales (L), 11 fascistas (F)
  const mazoPartida = ref([
    ...Array(6).fill('Liberal'),
    ...Array(11).fill('Fascista')
  ])
  const mazoDescarte = ref([])
  
  const accionDelBoton = () => {
    if (mazoPartida.value.length > 0) {
      const carta = mazoPartida.value.pop()
      mazoDescarte.value.push(carta)
      console.log(`Carta movida al descarte: ${carta}`)
    } else {
      console.log('El mazo está vacío.')
    }
  }

  
  </script>
  
  <style scoped>
  .contenedor-principal {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    padding: 16px;
    height: 100vh;
  }
  
  .mazo {
    width: 100px;
    height: 140px;
    background-color: #ccc;
    border: 2px solid #999;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    text-align: center;
  }
  
  .boton-central {
    padding: 12px 20px;
    font-size: 16px;
    border-radius: 8px;
    border: none;
    background-color: #4a90e2;
    color: white;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .boton-central:hover {
    background-color: #357ab7;
  }
  </style>
  