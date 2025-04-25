<template>
  <div
    class="container-fluid text-center mt-4 game-container"
    style="max-width: 1400px; margin: 0 auto"
  >
    <!-- Área de notificaciones -->
    <div
      v-if="notification.message"
      :class="[
        'alert',
        notification.type === 'success' ? 'alert-success' : 'alert-danger',
      ]"
    >
      {{ notification.message }}
    </div>

    <!-- Contenedor de Jugadores -->
    <div class="players-container mb-4">
      <div class="d-flex justify-content-center overflow-auto" style="gap: 8px">
        <PlayerContainer
          v-for="player in players"
          :key="player.id"
          :nombre="player.nombre"
          :rol="player.rol"
        />
      </div>
    </div>

    <!-- Contenedor de Mazos -->
    <div class="decks-container mb-4">
      <div class="d-flex justify-content-center">
        <DecksEndTermButton class="mx-3" />
      </div>
    </div>

    <!-- Selector de Canciller -->
    <PresidentCansillerSelector
      v-if="showChancellorSelector"
      :players="players"
      :presidentId="currentPresident.id"
      @chancellor-selected="handleChancellorSelected"
    />

    <!-- Tablero Fascista -->
    <div class="mb-4">
      <div class="d-flex justify-content-center">
        <FascistCard
          :passedPolicies="fascistProgress"
          :currentPlayerCount="numPlayers"
          @policy-effect="handleFascistEffect"
        />
      </div>
      <div v-if="showFascistPower" class="mt-3">
        <h5>¡Poder Fascista Activado!</h5>
        <p>{{ fascistPowerDescription }}</p>
        <button
          v-if="currentPower === 'investigate'"
          class="btn btn-warning me-2"
          @click="showPlayerInvestigation"
        >
          Investigar Jugador
        </button>
        <button
          v-if="currentPower === 'policyPeek'"
          class="btn btn-warning me-2"
          @click="showPolicyPeek"
        >
          Ver Próximas Políticas
        </button>
      </div>
    </div>

    <!-- Tablero Liberal -->
    <div class="mb-4">
      <div class="d-flex justify-content-center">
        <LiberalCard
          :passedPolicies="liberalProgress"
          :trackerPosition="electionTracker"
        />
      </div>
    </div>

    <!-- Controles del Juego -->
    <div class="game-controls mt-4">
      <div class="mb-3">
        <h4>Acciones Disponibles</h4>
        <button
          class="btn btn-primary me-2"
          @click="drawPolicies"
          :disabled="isGameOver || politicas.length < 3"
        >
          Robar Políticas ({{ politicas.length }} restantes)
        </button>
        <button
          v-if="drawnPolicies.length > 0"
          class="btn btn-success me-2"
          @click="showPolicySelection"
        >
          Seleccionar Política a Promulgar
        </button>
      </div>

      <!-- Selección de Política (modal) -->
      <div v-if="showPolicyModal" class="policy-modal">
        <div class="modal-content">
          <h4>Selecciona una política para promulgar</h4>
          <div class="d-flex justify-content-center my-3">
            <button
              v-for="(policy, index) in drawnPolicies"
              :key="index"
              class="btn policy-card mx-2"
              :class="policy.tipo_carta === 'fascista' ? 'btn-danger' : 'btn-primary'"
              @click="handlePresidentPolicySelection(policy.tipo_carta)"
            >
              {{ policy.tipo_carta === "fascista" ? "Fascista" : "Liberal" }}
            </button>
          </div>
          <button class="btn btn-secondary" @click="showPolicyModal = false">
            Cancelar
          </button>
        </div>
      </div>

      <!-- Selección de Política por Canciller -->
      <div v-if="politicasParaCanciller.length > 0" class="policy-modal">
        <div class="modal-content">
          <h4>Selecciona una política para promulgar</h4>
          <div class="d-flex justify-content-center my-3">
            <button
              v-for="(policy, index) in politicasParaCanciller"
              :key="index"
              class="btn policy-card mx-2"
              :class="policy.tipo_carta === 'fascista' ? 'btn-danger' : 'btn-primary'"
              @click="handleChancellorPolicySelection(policy.tipo_carta)"
            >
              {{ policy.tipo_carta === "fascista" ? "Fascista" : "Liberal" }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Estado del Juego -->
    <div v-if="isGameOver" class="game-over mt-4">
      <h2 :class="gameResult === 'liberal' ? 'text-primary' : 'text-danger'">
        {{
          gameResult === "liberal"
            ? "¡Los Liberales han ganado!"
            : "¡Los Fascistas han ganado!"
        }}
      </h2>
      <button class="btn btn-info mt-3" @click="resetGame">Nueva Partida</button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import PlayerContainer from "../components/PlayerContainer.vue";
import DecksEndTermButton from "../components/DecksEndTermButton.vue";
import PresidentCansillerSelector from "../components/PresidentCansillerSelector.vue";
import FascistCard from "../components/FascistCard.vue";
import LiberalCard from "../components/LiberalCard.vue";
import { onSnapshotSubcollection, updateDocument, createSubCollection, enrichDataWithField, readSubcollection, readDocumentById, onSnapshotDocument, updateSubcollectionDocument } from "../firebase/servicesFirebase"; // Importación de función para escuchar cambios

export default {
  props: ["codigoSala"],
  components: {
    PlayerContainer,
    DecksEndTermButton,
    PresidentCansillerSelector,
    FascistCard,
    LiberalCard,
  },
  setup(props) {
    const notification = ref({ message: "", type: "" });
    const players = ref([]); // Lista de jugadores
    const showChancellorSelector = ref(false);
    const fascistProgress = ref(0);
    const liberalProgress = ref(0);
    const electionTracker = ref(0);
    const isGameOver = ref(false);
    const drawnPolicies = ref([]);
    const showPolicyModal = ref(false);
    const politicasParaCanciller = ref([]);
    const currentPresident = ref(null); // Presidente actual
    const currentChancellor = ref(null); // Canciller actual
    const numPlayers = computed(() => players.value.length); // Número de jugadores
    const showFascistPower = ref(false); // Mostrar poderes fascistas

    // Escuchar jugadores en tiempo real y sincronizar estado local con Firebase
    onMounted(async () => {
      const unsubscribePlayers = onSnapshotSubcollection(
        "partidas",
        props.codigoSala,
        "jugadores",
        async (jugadores) => {
          // Enriquecer los datos de los jugadores con sus nombres y roles
          players.value = await enrichDataWithField(jugadores, "jugadores", "id_usuario", "nombre");
        }
      );

      try {
        // Recuperar datos de la partida
        const partida = await readDocumentById("partidas", props.codigoSala);
        if (partida) {
          // Sincronizar el estado local con Firebase
          fascistProgress.value = partida.fascistProgress || 0;
          liberalProgress.value = partida.liberalProgress || 0;
          electionTracker.value = partida.electionTracker || 0;
          currentPresident.value = players.value.find(player => player.id === partida.id_presidente) || null;
          currentChancellor.value = players.value.find(player => player.id === partida.id_canciller) || null;
          politicas.value = partida.politicas_restantes || [];
          drawnPolicies.value = partida.politicas_robadas || [];
        }

        // Escuchar cambios en los jugadores
        const unsubscribePlayers = onSnapshotSubcollection(
          "partidas",
          props.codigoSala,
          "jugadores",
          (jugadores) => {
            players.value = jugadores;
          }
        );

        // Escuchar cambios en la partida
        const unsubscribeGame = onSnapshotDocument("partidas", props.codigoSala, (partida) => {
          if (partida) {
            fascistProgress.value = partida.fascistProgress || 0;
            liberalProgress.value = partida.liberalProgress || 0;
            electionTracker.value = partida.electionTracker || 0;
            currentPresident.value = players.value.find(player => player.id === partida.id_presidente) || null;
            currentChancellor.value = players.value.find(player => player.id === partida.id_canciller) || null;
            politicas.value = partida.politicas_restantes || [];
            drawnPolicies.value = partida.politicas_robadas || [];
          }
        });

        const jugadores = await readSubcollection("partidas", props.codigoSala, "jugadores");
        console.log(jugadores);

        return () => {
          unsubscribePlayers(); // Cancelar la suscripción al desmontar
          unsubscribeGame(); // Cancelar la suscripción al desmontar
        };
      } catch (error) {
        console.error("Error al recuperar el estado del juego:", error);
      }
    });

    const politicas = ref([
      { tipo_carta: "liberal" },
      { tipo_carta: "fascista" },
      { tipo_carta: "liberal" },
    ]);

    const handleFascistEffect = () => {
      console.log("Efecto fascista activado");
    };

    const drawPolicies = async () => {
      if (politicas.value.length < 3) {
        console.error("No hay suficientes cartas en el mazo.");
        return;
      }

      drawnPolicies.value = politicas.value.slice(0, 3);
      politicas.value = politicas.value.slice(3);

      await updateDocument("partidas", props.codigoSala, {
        politicas_robadas: drawnPolicies.value,
        politicas_restantes: politicas.value,
      });

      showPolicyModal.value = true; // Mostrar el modal de selección
    };

    const enactPolicy = async (policyType) => {
      try {
        if (policyType === "fascista") {
          fascistProgress.value += 1;
        } else if (policyType === "liberal") {
          liberalProgress.value += 1;
        }

        await updateDocument("partidas", props.codigoSala, {
          fascistProgress: fascistProgress.value,
          liberalProgress: liberalProgress.value,
        });

        await checkGameOver();
      } catch (error) {
        console.error("Error al promulgar política:", error);
      }
    };

    const checkGameOver = async () => {
      if (fascistProgress.value >= 6) {
        isGameOver.value = true;
        await updateDocument("partidas", props.codigoSala, {
          estado: "finalizada",
          ganador: "fascistas",
        });
        notification.value = { message: "¡Los Fascistas han ganado!", type: "danger" };
      } else if (liberalProgress.value >= 5) {
        isGameOver.value = true;
        await updateDocument("partidas", props.codigoSala, {
          estado: "finalizada",
          ganador: "liberales",
        });
        notification.value = { message: "¡Los Liberales han ganado!", type: "success" };
      }
    };

    const resetGame = async () => {
      try {
        await updateDocument("partidas", props.codigoSala, {
          estado: "pendiente",
          fascistProgress: 0,
          liberalProgress: 0,
          turno_actual: 0,
          ganador: null,
        });
        fascistProgress.value = 0;
        liberalProgress.value = 0;
        isGameOver.value = false;
        notification.value = { message: "La partida ha sido reiniciada.", type: "info" };
      } catch (error) {
        console.error("Error al reiniciar la partida:", error);
      }
    };

    const handleChancellorSelected = async (chancellor) => {
      try {
        await updateDocument("partidas", props.codigoSala, {
          id_canciller: chancellor.id,
        });

        currentChancellor.value = chancellor;

        // Asignar rol al Canciller
        players.value = players.value.map((player) =>
          player.id === chancellor.id ? { ...player, rol: "canciller" } : player
        );

        showChancellorSelector.value = false; // Ocultar el selector de Canciller
        notification.value = { message: `¡${chancellor.nombre} ha sido nominado como Canciller!`, type: "info" };
      } catch (error) {
        console.error("Error al seleccionar Canciller:", error);
      }
    };

    const handlePresidentPolicySelection = async (selectedPolicy) => {
      try {
        const remainingPolicies = drawnPolicies.value.filter(policy => policy.tipo_carta !== selectedPolicy);

        await updateDocument("partidas", props.codigoSala, {
          politicas_para_canciller: remainingPolicies,
        });

        politicasParaCanciller.value = remainingPolicies;
        notification.value = { message: "El Canciller debe seleccionar una política.", type: "info" };
        showPolicyModal.value = false;
      } catch (error) {
        console.error("Error al seleccionar política del presidente:", error);
      }
    };

    const handleChancellorPolicySelection = async (selectedPolicy) => {
      try {
        if (selectedPolicy === "fascista") {
          fascistProgress.value += 1;
        } else if (selectedPolicy === "liberal") {
          liberalProgress.value += 1;
        }

        await updateDocument("partidas", props.codigoSala, {
          fascistProgress: fascistProgress.value,
          liberalProgress: liberalProgress.value,
        });

        await checkGameOver();

        politicasParaCanciller.value = [];
        notification.value = { message: `¡Se ha promulgado una política ${selectedPolicy}!`, type: "success" };
      } catch (error) {
        console.error("Error al seleccionar política del Canciller:", error);
      }
    };

    const selectRandomPresident = async () => {
      try {
        const randomIndex = Math.floor(Math.random() * players.value.length);
        const selectedPresident = players.value[randomIndex];

        // Actualizar Firebase con el presidente seleccionado
        await updateDocument("partidas", props.codigoSala, {
          id_presidente: selectedPresident.id,
        });

        currentPresident.value = selectedPresident;
        notification.value = { message: `¡${selectedPresident.nombre} es el Presidente!`, type: "info" };

        // Asignar rol al presidente
        players.value = players.value.map((player) =>
          player.id === selectedPresident.id ? { ...player, rol: "presidente" } : player
        );
      } catch (error) {
        console.error("Error al seleccionar presidente:", error);
      }
    };

    const handleVote = async (playerId, vote) => {
      try {
        // Guardar el voto en Firebase
        await createSubCollection("partidas", props.codigoSala, "votaciones", {
          id_jugador: playerId,
          voto: vote,
        });

        // Escuchar los votos en tiempo real
        const unsubscribe = onSnapshotSubcollection(
          "partidas",
          props.codigoSala,
          "votaciones",
          (votos) => {
            const totalVotes = votos.length;
            const yesVotes = votos.filter((v) => v.voto === "ja").length;

            if (totalVotes === players.value.length - 1) {
              // Todos los jugadores han votado
              if (yesVotes > Math.floor(players.value.length / 2)) {
                notification.value = { message: "¡El Canciller ha sido aprobado!", type: "success" };
                startPolicySelection(); // Iniciar la selección de políticas
              } else {
                notification.value = { message: "El Canciller ha sido rechazado.", type: "danger" };
                resetTurn(); // Reiniciar el turno
              }
            }
          }
        );

        return () => unsubscribe(); // Cancelar la suscripción al desmontar
      } catch (error) {
        console.error("Error al manejar el voto:", error);
      }
    };

    const createTurn = async (numeroTurno, idPresidenteJugador) => {
      try {
        const turnoData = {
          numero: numeroTurno,
          id_presidente_jugador: idPresidenteJugador,
          id_canciller_jugador: null,
          resultado: null,
          fecha_inicio: new Date().toISOString(),
          fecha_fin: null,
        };
        await createSubCollection("partidas", props.codigoSala, "turnos", turnoData);
      } catch (error) {
        console.error("Error al crear el turno:", error);
      }
    };

    const updatePolicyState = async (policyId, newState) => {
      try {
        await updateSubcollectionDocument(
          "partidas",
          props.codigoSala,
          "politicas",
          policyId,
          { estado: newState }
        );
      } catch (error) {
        console.error("Error al actualizar el estado de la política:", error);
      }
    };

    return {
      notification,
      players,
      showChancellorSelector,
      fascistProgress,
      liberalProgress,
      electionTracker,
      isGameOver,
      politicas,
      drawnPolicies,
      showPolicyModal,
      politicasParaCanciller,
      handleFascistEffect,
      drawPolicies,
      enactPolicy,
      resetGame,
      handleChancellorSelected,
      handlePresidentPolicySelection,
      handleChancellorPolicySelection,
      selectRandomPresident,
      handleVote,
      createTurn,
      updatePolicyState,
      numPlayers,
      showFascistPower,
    };
  },
};
</script>

<style scoped>
.game-container {
  max-width: 800px;
}

.policy-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 80%;
  max-width: 500px;
}

.policy-card {
  min-width: 100px;
  font-weight: bold;
}

.game-over {
  padding: 2rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-top: 2rem;
}

.alert {
  margin: 0 auto 1rem;
  max-width: 80%;
}

.players-container,
.decks-container {
  background-color: white;
  border-radius: 8px;
  padding: 1rem;
}

.player-card,
.deck-card {
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 0.5rem 1rem;
}
</style>
