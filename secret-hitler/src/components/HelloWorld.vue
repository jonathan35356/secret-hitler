<template>
  <div>
    <h1>Estado de la Base de Datos</h1>
    <button @click="crearTodo">Crear Juego</button>
    <p v-if="statusMessage">{{ statusMessage }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import {
  crearUsuario,
  crearSala,
  crearPartida,
  agregarJugador
} from '../firebase/useFireStoreGame.js'

const statusMessage = ref('')

const crearTodo = async () => {
  try {
    statusMessage.value = 'Creando usuario, sala, partida y jugador...'

    // Crear un usuario
    const idUsuario = await crearUsuario('Juan', 'juan@email.com')
    console.log('Usuario creado:', idUsuario)

    // Crear una sala
    const idSala = await crearSala('ABC123', 7)
    console.log('Sala creada:', idSala)

    // Crear una partida
    const idPartida = await crearPartida(idSala)
    console.log('Partida creada:', idPartida)

    // Agregar un jugador
    await agregarJugador(idSala, idPartida, {
      id_usuario: idUsuario,
      nombre: 'Juan',
      rol: 'liberal',
      orden_turno: 1
    })
    console.log('Jugador agregado.')

    statusMessage.value = 'Todo creado: usuario, sala, partida y jugador.'
  } catch (error) {
    console.error('Error creando juego:', error)
    statusMessage.value = 'Hubo un error al crear el juego.'
  }
}
</script>
