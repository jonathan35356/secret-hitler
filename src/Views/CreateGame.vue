<template>
  <div class="container-creategame">
    <div class="card-creategame p-4">
      <h2 class="text-center mb-3">Código: {{ codigo }}</h2>
      <p class="text-center mb-3">
        Estado de la partida:
        <span class="badge bg-primary">{{ estado === "iniciada" ? "Iniciada" : "No iniciada" }}</span>
      </p>

      <h4 class="text-center mb-4">Lista de participantes</h4>

      <!-- Lista de jugadores -->
      <div class="list-group mb-4">
        <div
          v-for="(jugador, index) in participantes"
          :key="index"
          class="list-group-item"
        >
          {{ jugador.nombre }}
        </div>
      </div>

      <!-- Botón para iniciar partida -->
      <button class="btn btn-primary w-100 mb-3" @click="iniciarPartida">Iniciar partida</button>

      <!-- Botón para unirse a una partida -->
      <router-link to="/join-game">
        <button class="btn btn-success w-100 mb-3">Unirse a una partida</button>
      </router-link>

      <!-- Botón para volver -->
      <router-link to="/home">
        <button class="btn btn-danger w-100">Volver</button>
      </router-link>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { AuthService } from '../firebase/auth.js';
import {
  createDocument,
  readDocumentById,
  updateDocument,
  createSubCollection,
  onSnapshotDocument,
  onSnapshotSubcollectionWithFullData,
  createGame
} from "../firebase/servicesFirebase.js";
import { initializePolicies } from "../firebase/initializePolicies";
import Swal from "sweetalert2";

export default {
  setup() {
    const codigo = ref("");
    const participantes = ref([]);
    const estado = ref("esperando");
    const router = useRouter();
    let uid = "";

    const generarCodigo = () => {
      const caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let codigo = "";
      for (let i = 0; i < 5; i++) {
        const indiceAleatorio = Math.floor(Math.random() * caracteres.length);
        codigo += caracteres.charAt(indiceAleatorio);
      }
      return codigo;
    };

    let unsubscribeDocumento = null;
    let unsubscribeSubcoleccion = null;

    onMounted(async () => {
      const user = await AuthService.getCurrentUser();
      if (!user) {
        Swal.fire("Error", "Debes iniciar sesión para crear una partida.", "error");
        return;
      }

      const { displayName, uid: userUid } = user;
      uid = userUid;

      let nuevoCodigo;
      let partidaSnap;

      try {
        do {
          nuevoCodigo = generarCodigo();
          partidaSnap = await readDocumentById("partidas", nuevoCodigo);
        } while (partidaSnap);

        // ✅ Crear partida con estructura de Secret Hitler
        await createDocument(
          "partidas",
          {
            codigo: nuevoCodigo,
            estado: "esperando",
            presidente_actual: uid,
            canciller_actual: null,
            fallo_consecutivo: 0,
            tablero_fascista: {
              politicas_aprobadas: 0,
              poderes: []
            },
            tablero_liberal: {
              politicas_aprobadas: 0,
              fallos: 0
            }
          },
          nuevoCodigo
        );

        // Crear jugador host en subcolección
        await createSubCollection("partidas", nuevoCodigo, "jugadores_partida", {
          idJugador: uid,
          idPartida: nuevoCodigo,
          host: true,
          vivo: true,
          nombre: displayName,
          inclinacion_politica: null,
          rol: null,
          orden_turno: 1
        });

        codigo.value = nuevoCodigo;
        estado.value = "No iniciada";

        // Escuchar participantes
        unsubscribeSubcoleccion = await onSnapshotSubcollectionWithFullData(
          "partidas",
          codigo.value,
          "jugadores_partida",
          (querySnapshot) => {
            participantes.value = querySnapshot;
          }
        );

        // Escuchar estado de la partida
        unsubscribeDocumento = await onSnapshotDocument("partidas", codigo.value, (docSnap) => {
          if (docSnap?.estado === "iniciada") {
            router.push(`/gameboard/${codigo.value}`);
          }
        });

      } catch (error) {
        console.error("Error al crear la partida:", error);
        Swal.fire("Error", "No se pudo crear la partida. Inténtalo de nuevo.", "error");
      }
    });

    const iniciarPartida = async () => {
      try {
        if (participantes.value.length < 5) {
          Swal.fire("Error", "Se necesitan al menos 5 jugadores para iniciar la partida.", "error");
          return;
        }

        const jugadores = participantes.value.map((jugador, index) => ({
          id_usuario: jugador.idJugador,
          id_jugador: jugador.idJugador,
          nombre: jugador.nombre,
          rol: null,
          orden_turno: index + 1,
          vivo: true,
          inclinacion_politica: null
        }));

        await createGame(codigo.value, uid, jugadores);
        await initializePolicies(codigo.value);

        await updateDocument("partidas", codigo.value, { estado: "iniciada" });

        router.push({ name: 'GameBoard', params: { codigoSala: codigo.value } });

        Swal.fire("¡Partida iniciada!", "La partida ha comenzado correctamente.", "success");
      } catch (error) {
        console.error("Error al iniciar la partida:", error);
        Swal.fire("Error", "No se pudo iniciar la partida.", "error");
      }
    };

    onUnmounted(() => {
      if (unsubscribeDocumento) unsubscribeDocumento();
      if (unsubscribeSubcoleccion) unsubscribeSubcoleccion();
    });

    return { codigo, participantes, estado, iniciarPartida };
  }
};
</script>



<style scoped>
.container-creategame {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-image: url('/fondo.jpg'); /* mismo fondo de cartas UNO */
  background-size: cover;
  background-position: center;
}

.card-creategame {
  background: rgba(255, 255, 255); /* blanco con 90% opacidad */
  padding: 30px;
  border-radius: 20px;
  box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.25);
  width: 100%;
  max-width: 400px;
}

.btn-success {
  background-color: #28a745;
  border-color: #28a745;
}

.btn-success:hover {
  background-color: #218838;
  border-color: #1e7e34;
}
</style>