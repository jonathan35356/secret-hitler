<template>
    <div class="contenedor-externo">
      <div v-if="rolJugador" class="rol-texto">
        {{ rolJugador === 'presidente' ? 'Presidente' : 'Canciller' }}
      </div>
      <div class="contenedor-imagen">
        <img src="/image.png" alt="Imagen" />
      </div>
      <div class="nombre-jugador">{{ nombreJugador }}</div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { doc, getDoc } from 'firebase/firestore'
  import { db } from '../firebase/firebase.js'
  
  // Datos fijos
  const salaId = 'KfdGbap7GzBeZFWVFHbo'
  const partidaId = 'LXSy7nX217NOEukOIO0x'
  const turnoId = 'NDE8FAHxPlZ4DsyO7iJA'
  const jugadorId = 'KicEDWZugGV6RC3pHvdA'
  
  // Refs reactivas
  const rolJugador = ref('')
  const nombreJugador = ref('')
  
  // Referencias a documentos
  const turnoRef = doc(db, 'salas', salaId, 'partidas', partidaId, 'turno', turnoId)
  const jugadorRef = doc(db, 'salas', salaId, 'partidas', partidaId, 'jugadores', jugadorId)
  
  // Obtener datos del turno
  const obtenerTurno = async () => {
    try {
      const snap = await getDoc(turnoRef)
      if (snap.exists()) {
        const data = snap.data()
        if (data.id_presidente_jugador === jugadorId) {
          rolJugador.value = 'presidente'
        } else if (data.id_canciller_jugador === jugadorId) {
          rolJugador.value = 'canciller'
        } else {
          rolJugador.value = ''
        }
      }
    } catch (error) {
      console.error('Error al obtener el turno:', error)
    }
  }
  
  // Obtener nombre del jugador
  const obtenerNombreJugador = async () => {
    try {
      const snap = await getDoc(jugadorRef)
      if (snap.exists()) {
        nombreJugador.value = snap.data().nombre || 'Sin nombre'
      }
    } catch (error) {
      console.error('Error al obtener el nombre del jugador:', error)
    }
  }
  
  // Ejecutar al montar
  onMounted(() => {
    obtenerTurno()
    obtenerNombreJugador()
  })
  </script>
  
  <style scoped>
  .contenedor-externo {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .rol-texto {
    margin-bottom: 4px;
    font-weight: bold;
    color: #8b5cf6;
    text-transform: uppercase;
    font-size: 14px;
  }
  
  .contenedor-imagen {
    width: 150px;
    height: 150px;
    border: 1px solid #ccc;
    padding: 8px;
    border-radius: 8px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .contenedor-imagen img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
  
  .nombre-jugador {
    margin-top: 6px;
    font-size: 14px;
    color: #333;
  }
  </style>
  