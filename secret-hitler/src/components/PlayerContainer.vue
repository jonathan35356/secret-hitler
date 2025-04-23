<template>
    <div class="contenedor-externo mini">
      <div v-if="rolJugador" class="rol-texto mini-texto">
        {{ rolJugador === 'presidente' ? 'Presidente' : 'Canciller' }}
      </div>
      <div class="contenedor-imagen mini-imagen">
        <img src="/image.png" alt="Imagen" />
      </div>
      <div class="nombre-jugador mini-texto">{{ nombreJugador }}</div>
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
  