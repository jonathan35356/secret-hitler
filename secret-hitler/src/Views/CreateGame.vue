<template>
  <div class="container-creategame">
    <div class="card-creategame p-4">
      <h2 class="text-center mb-3">Código: {{ codigo }}</h2>
      <p class="text-center mb-3">
        Estado de la partida:
        <span class="badge bg-primary">{{ estado === "iniciada" ? "Iniciada" : "No iniciada" }}</span>
      </p>

      <h4 class="text-center mb-4">Lista de participantes</h4>

      <!-- Solamente mostrar el nombre del jugador -->
      <div class="list-group mb-4">
        <div
          v-for="(jugador, index) in participantes"
          :key="index"
          class="list-group-item"
        >
          {{ jugador.nombre }}
        </div>
      </div>

      <button class="btn btn-primary w-100 mb-3" @click="iniciarPartida">Iniciar partida</button>
      <router-link to="/home"><button class="btn btn-danger w-100">Volver</button></router-link>

    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { AuthService } from '../firebase/auth.js';
import { createDocument, readDocumentById, updateDocument, createSubCollection, onSnapshotDocument, onSnapshotSubcollectionWithFullData, readCollection } from "../firebase/servicesFirebase.js"
import Swal from "sweetalert2";

export default {
  setup() {
    const codigo = ref("");
    const participantes = ref([]);
    const estado = ref("esperando");
    const router = useRouter();

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
      console.log(user)
      if (!user) {
        Swal.fire("Error", "Debes iniciar sesión para crear una partida.", "error");
        return;
      }

      const { displayName, uid } = user;
      console.log(displayName, uid)
      let nuevoCodigo
      let partidaSnap

      try {
        // Verifica y genera un código único
        do {
          nuevoCodigo = generarCodigo(); // Generar un nuevo código
          partidaSnap = await readDocumentById("partidas", nuevoCodigo);
        } while (partidaSnap); // Repetir mientras el código ya exista

        // Crea la nueva partida
        await createDocument("partidas", {
          codigo: nuevoCodigo,
          estado: "esperando",
          turnoActual: uid, // Revisar si este o el jugadores_partida
          cartaActual: "inicio",
          colorActual: "ninguno",
          cartaAcumulada: null,
          ordenInverso: false
        }, nuevoCodigo);

        //Añadir el jugador a "jugadores_partida"
        await createSubCollection("partidas", nuevoCodigo, "jugadores_partida", {
          idJugador: uid,
          idPartida: nuevoCodigo,
          host: true,
          estadoUno: false
        })

        // Asignar valores locales
        codigo.value = nuevoCodigo;
        estado.value = "No iniciada";

        // Escuchar cambios en la subcolección "jugadores_partida"
        unsubscribeSubcoleccion = await onSnapshotSubcollectionWithFullData ("partidas", codigo.value, "jugadores_partida", (querySnapshot) => {
          participantes.value  = querySnapshot
        });

        // Escuchar cambios en la partida
        unsubscribeDocumento = await onSnapshotDocument("partidas", codigo.value, (docSnap) => {
          if (docSnap) {
            if (docSnap.estado === "iniciada") {
              router.push(`/gameboard/${codigo.value}`);
            }
          }
        });

      } catch (error) {
        console.error("Error al crear la partida:", error);
        Swal.fire("Error", "No se pudo crear la partida. Inténtalo de nuevo.", "error");
      }
    });

    const asignarCartasAJugadores = async (codigoPartida, jugadores) => {
      try {
        // Obtén todas las cartas de la colección "Cartas"
        const cartasTotalesSnap = await readCollection("cartas"); // Suponiendo que tienes un documento que contiene todas las cartas
        let cartasDisponibles = cartasTotalesSnap

        if (!cartasDisponibles || cartasDisponibles.length === 0) {
          throw new Error("No hay cartas disponibles en la colección 'Cartas'.");
        }

        for (let jugador of jugadores) {
          const cartasJugador = [];

          for (let i = 0; i < 7; i++) {
            const indiceAleatorio = Math.floor(Math.random() * cartasDisponibles.length);
            const cartaSeleccionada = cartasDisponibles[indiceAleatorio];

            cartasJugador.push(cartaSeleccionada);

            // Crea el registro en la subcolección "cartas_partida"
            await createSubCollection("partidas", codigoPartida, "cartas_partida", {
              idJugador: jugador.idJugador,
              idPartida: codigoPartida,
              idCarta: cartaSeleccionada.id,
              place: "mano"
            }, cartaSeleccionada.id);

            // Elimina la carta asignada del conjunto disponible
            cartasDisponibles.splice(indiceAleatorio, 1);
          }

          // console.log(`Cartas asignadas al jugador ${jugador.nombre}:`, cartasJugador);
        }

        console.log("Asignación de cartas completada.");
      } catch (error) {
        console.error("Error en la asignación de cartas:", error);
        throw error;
      }
    };


    const iniciarPartida = async () => {
      try {
        const confirmar = await Swal.fire({
          title: "¿Iniciar partida?",
          text: "Una vez iniciada, no podrás agregar más jugadores.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Sí, iniciar",
          cancelButtonText: "Cancelar"
        });

        if (confirmar.isConfirmed) {
          // Valida si el número de jugadores es suficiente
          if (participantes.value.length < 2) {
            Swal.fire("Mínimo de jugadores no alcanzado", "Necesitas al menos 2 jugadores para iniciar la partida.", "error");
            return;
          }

          // Asignar las cartas a los jugadores
          Swal.fire({
            title: 'Iniciando partida...',
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            }
          });


          await asignarCartasAJugadores(codigo.value, participantes.value);

          // Actualizar el estado a "iniciada"
          await updateDocument("partidas", codigo.value, { estado: "iniciada" });

          // Una vez todo listo, mostramos éxito
          await Swal.fire("¡Partida iniciada!", "", "success");

        }
      } catch (error) {
        console.error("Error al iniciar la partida:", error);
        Swal.fire("Error", "No se pudo iniciar la partida.", "error");
      }
    };

    onUnmounted(() => {

      if (unsubscribeDocumento) {
        unsubscribeDocumento();
      }
      if (unsubscribeSubcoleccion) {
        unsubscribeSubcoleccion();
      }
    });
    return { codigo, participantes, estado, iniciarPartida };
  },
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
</style>