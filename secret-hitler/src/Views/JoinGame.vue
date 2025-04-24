<template>
    <div class="d-flex justify-content-center align-items-center min-vh-100">
      <div class="card card-join">
        <div class="p-4 shadow-sm rounded-3 bg-white">
          <template v-if="!joinedGame">
            <Code 
              ref="codeComponent"
              :esperando-inicio="esperandoInicio"
              @unirseAPartida="handleUnirseAPartida"
            />
            
            <BaseButton
              label="Unirse a partida"
              action="joinGame"
              variant="dark"
              :loading="esperandoInicio"
              @click="triggerUnirseAPartida"
              class="w-100 my-2"
            />
          </template>
  
          <GameLobby
            v-else
            :game-code="gameCode"
            :players="players"
            @leave-game="handleLeaveGame"
          />
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onUnmounted } from 'vue';
  import { useRouter } from 'vue-router';
  import Swal from 'sweetalert2';
  import BaseButton from '../components/BaseButton.vue';
  import Code from '../components/Code.vue';
  import GameLobby from '../components/GameLobby.vue';
  import { 
    readDocumentById, 
    createSubCollection, 
    onSnapshotDocument,
    onSnapshotSubcollectionWithFullData, 
    readSubcollection,
    deleteDocumentFromSubcollection
  } from "../firebase/servicesFirebase.js";
  import { AuthService } from "../firebase/auth.js";
  
  export default {
    name: 'JoinGame',
    components: {
      BaseButton,
      Code,
      GameLobby
    },
    setup() {
      const router = useRouter();
      const codeComponent = ref(null);
      const esperandoInicio = ref(false);
      const joinedGame = ref(false);
      const gameCode = ref('');
      const players = ref([]);
      const unsubscribeGame = ref(null);
      const unsubscribePlayers = ref(null);
  
      const handleUnirseAPartida = async (codigoClean) => {
        try {
          esperandoInicio.value = true;
          
          if (!codigoClean) {
            Swal.fire("Error", "Debes ingresar un código de partida.", "error");
            return;
          }
  
          const partidaSnap = await readDocumentById("partidas", codigoClean);
          
          if (!partidaSnap) {
            Swal.fire("Error", "El código de la partida no existe.", "error");
            return;
          }
  
          if (partidaSnap.estado === "iniciada") {
            Swal.fire("Error", "La partida ya ha comenzado.", "error");
            return;
          }
  
          const user = await AuthService.getCurrentUser();
          if (!user) {
            Swal.fire("Error", "Debes iniciar sesión para unirte a una partida.", "error");
            return;
          }
  
          //Verificar si el usuario ya está en la partida
          const jugadoresSnap = await readSubcollection(
            "partidas",
            codigoClean,
            "jugadores_partida"
          );
  
          const usuarioYaExiste = jugadoresSnap.some(
            jugador => jugador.idJugador === user.id
          );
  
          //Si ya el jugador se encuentra en la partida, simplemente se une al lobby
          if(usuarioYaExiste) {
            setupRealTimeListeners(codigoClean);
            gameCode.value = codigoClean;
            joinedGame.value = true;
            return;
          }
  
          await createSubCollection(
            "partidas",
            codigoClean,
            "jugadores_partida",
            {
              idJugador: user.uid,
              idPartida: codigoClean,
              host: false,
              estadoUno: false,
              nombre: user.displayName || `Jugador${Math.floor(Math.random() * 1000)}`
            }
          );
  
          setupRealTimeListeners(codigoClean);
          gameCode.value = codigoClean;
          joinedGame.value = true;
  
        } catch (error) {
          console.error("Error al unirse a la partida:", error);
          Swal.fire("Error", "Ocurrió un problema al unirse a la partida.", "error");
        } finally {
          esperandoInicio.value = false;
        }
      };
  
      const setupRealTimeListeners = (gameId) => {
        unsubscribeGame.value = onSnapshotDocument("partidas", gameId, (doc) => {
          if (doc?.estado === "iniciada") {
            router.push({ name: 'game-board', params: { gameId } });
          }
        });
  
        unsubscribePlayers.value = onSnapshotSubcollectionWithFullData(
          "partidas",
          gameId,
          "jugadores_partida",
          (snapshot) => {
            players.value = snapshot;
          }
        );
      };
  
      const handleLeaveGame = async () => {
        try {
          const user = await AuthService.getCurrentUser();
          if(user && gameCode.value) {
            Swal.fire({
              title: 'Saliendo de la partida...',
              allowOutsideClick: false,
              didOpen: ()=> Swal.showLoading()
            });
            await deleteDocumentFromSubcollection(
              "partidas",
              gameCode.value,
              "jugadores_partida",
              user.uid
            );
  
            Swal.close();
          }
        } catch (error) {
          console.error("Error al abandonar la partida:", error);
          Swal.fire(
            "Error",
            "No se pudo abandonar la partida correctamente",
            "error"
          );
        } finally {
          if (unsubscribeGame.value) unsubscribeGame.value();
          if (unsubscribePlayers.value) unsubscribePlayers.value();
          joinedGame.value = false;
          gameCode.value = '';
          players.value = [];
        }
      };
  
      const triggerUnirseAPartida = () => {
        if (codeComponent.value) {
          codeComponent.value.unirseAPartida();
        }
      };
  
      const handleCancel = () => {
        if (joinedGame.value) {
          handleLeaveGame();
        }
        router.push('/Home');
      };
  
      onUnmounted(() => {
        if (unsubscribeGame.value) unsubscribeGame.value();
        if (unsubscribePlayers.value) unsubscribePlayers.value();
      });
  
      return {
        codeComponent,
        esperandoInicio,
        joinedGame,
        gameCode,
        players,
        handleUnirseAPartida,
        triggerUnirseAPartida,
        handleCancel,
        handleLeaveGame
      };
    }
  };
  </script>
  
  <style scoped>
  .card-join {
    width: 100%;
    max-width: 400px;
  }
  </style>