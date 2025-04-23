import { db } from './firebase'
import {
  collection,
  addDoc,
  doc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore'

export async function crearUsuario(nombre, email, avatar_url = '') {
  const usuariosCol = collection(db, 'usuarios')
  const docRef = await addDoc(usuariosCol, {
    nombre_usuario: nombre,
    email,
    avatar_url,
    creado_en: serverTimestamp()
  })
  return docRef.id
}

export async function crearSala(codigo, maxJugadores = 5) {
  const salasCol = collection(db, 'salas')
  const docRef = await addDoc(salasCol, {
    codigo_sala: codigo,
    estado: 'esperando',
    max_jugadores: maxJugadores,
    creada_en: serverTimestamp()
  })
  return docRef.id
}

export async function crearPartida(idSala) {
  const partidasCol = collection(db, 'salas', idSala, 'partidas')
  const docRef = await addDoc(partidasCol, {
    estado: 'en_curso',
    turno_actual: 0,
    ronda: 1,
    ganador: null,
    fecha_inicio: serverTimestamp(),
    fecha_fin: null
  })
  return docRef.id
}

export async function agregarJugador(idSala, idPartida, jugador) {
  const jugadoresCol = collection(db, 'salas', idSala, 'partidas', idPartida, 'jugadores')
  const docRef = await addDoc(jugadoresCol, {
    ...jugador, // ejemplo: { id_usuario, nombre, rol, ... }
    conectado: true,
    esta_vivo: true,
    es_presidente: false,
    es_canciller: false
  })
  return docRef.id
}
