<template>
  <div class="modal-overlay">
    <div class="selector">
      <h5>Elige un Canciller</h5>

      <div class="d-flex flex-wrap justify-content-center mt-3 gap-2">
        <!-- Primera fila -->
        <div class="d-flex justify-content-center w-100 gap-2">
          <button
            v-for="jugador in firstRow"
            :key="jugador.id"
            @click="selectChancellor(jugador)"
          >
            <div class="contenedor-imagen mini-imagen">
              <img :src="jugador.imagen || '/image.png'" alt="Imagen" />
            </div>
            <div class="nombre-jugador mini-texto">{{ jugador.nombre }}</div>
          </button>
        </div>

        <!-- Segunda fila -->
        <div class="d-flex justify-content-center w-100 gap-2 mt-2">
          <button
            v-for="jugador in secondRow"
            :key="jugador.id"
            @click="selectChancellor(jugador)"
          >
            <div class="contenedor-imagen mini-imagen">
              <img :src="jugador.imagen || '/image.png'" alt="Imagen" />
            </div>
            <div class="nombre-jugador mini-texto">{{ jugador.nombre }}</div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
// Importa las funciones necesarias de Firebase
import { collection, getDocs, updateDoc, doc, query, where } from 'firebase/firestore'
import { db } from '../firebase/firebase.js' // Asegúrate de que el archivo firebase.js esté configurado correctamente

// Estado
const turnoId = ref('')
const turnoRef = ref(null);

// Props y eventos
const { presidentId } = defineProps(['presidentId'])
const emit = defineEmits(['close', 'chancellor-selected'])

// Estado para los jugadores disponibles
const availablePlayers = ref([])

// Función para obtener los jugadores
const obtenerJugadores = async () => {
  const jugadoresRef = collection(db, 'partidas', '0WRUD', 'jugadores')
  
  try {
    const snapshot = await getDocs(jugadoresRef)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      rol: doc.data().rol || 'jugador', // Asigna un rol si no existe
      imagen: doc.data().imagen || '/image.png', // Si no existe imagen, usa la predeterminada
      rolTurno: '' // Inicializamos el rol de turno vacío
    }))
  } catch (error) {
    console.error('Error al obtener los jugadores:', error)
    return []
  }
}

// Función para obtener el turnoId
const obtenerTurnoId = async () => {
  const turnosRef = collection(db, 'partidas', 'AVX9WR', 'turnos')
  const q = query(turnosRef, where('id_partida', '==', 'AVX9WR')) // Asegúrate de usar el id correcto de la partida

  try {
    const querySnapshot = await getDocs(q)
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0] // Suponiendo que solo hay un turno con ese código de sala
      turnoId.value = doc.id
      console.log('Turno ID obtenido:', turnoId.value)
      
      // Asignar turnoRef solo después de obtener el turnoId
      turnoRef.value = doc.ref

      // Escuchar el turno después de obtener el turnoId
      
    } else {
      console.log('No se encontró un turno con el código de sala proporcionado.')
    }
  } catch (error) {
    console.error('Error al obtener el turnoId:', error)
  }
}

// Obtenemos los jugadores y el turnoId al montar el componente
onMounted(async () => {
  // Obtener el turnoId primero
  await obtenerTurnoId()

  // Luego obtener los jugadores
  availablePlayers.value = await obtenerJugadores()
})

// Computamos los jugadores disponibles (sin el presidente y los muertos)
const filteredPlayers = computed(() =>
  availablePlayers.value.filter(jugador => jugador.id !== presidentId && !jugador.isDead)
)

// Dividimos los jugadores en dos filas
const half = computed(() => Math.ceil(filteredPlayers.value.length / 2))
const firstRow = computed(() => filteredPlayers.value.slice(0, half.value))
const secondRow = computed(() => filteredPlayers.value.slice(half.value))

// Función para seleccionar al canciller y actualizar el campo id_canciller_jugador
async function selectChancellor(jugador) {
  try {
    // Asegúrate de que el turnoId está disponible antes de actualizar
    if (!turnoId.value) {
      console.error('Turno ID no disponible')
      return
    }

    // Actualiza el campo id_canciller_jugador en la base de datos
    const turnoRef = doc(db, 'partidas', 'AVX9WR', 'turnos', turnoId.value)
    await updateDoc(turnoRef, {
      id_canciller_jugador: jugador.id // Actualiza el campo con el id del jugador seleccionado
    })
    console.log('Canciller seleccionado:', jugador.nombre)

    // Emite el evento con el jugador seleccionado
    emit('chancellor-selected', jugador)
    emit('close')
  } catch (error) {
    console.error('Error al actualizar el canciller:', error)
  }
}
</script>



<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5); /* Fondo oscuro con opacidad */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999; /* Asegura que el modal esté por encima de otros elementos */
}

.selector {
  padding: 1rem;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
  width: 300px; /* Ajusta el tamaño del modal */
  max-height: 80vh;
  overflow-y: auto; /* Permite desplazarse si hay muchos jugadores */
}

.contenedor-imagen {
  width: 40px;  /* Ajusta el tamaño de la imagen */
  height: 40px;
  overflow: hidden;
  border-radius: 50%;
}

.contenedor-imagen img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.nombre-jugador {
  font-size: 14px;  /* Ajusta el tamaño del texto */
  text-align: center;
  margin-top: 5px;
}

.mini-imagen {
  margin-bottom: 5px;
}

.mini-texto {
  font-size: 12px;
}

button {
  background-color: #f1f1f1;
  border: none;
  padding: 10px;
  cursor: pointer;
  border-radius: 6px;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #e0e0e0;
}
</style>
