<template>
  <div class="container-fluid text-center mt-4 game-container" style="max-width: 1400px; margin: 0 auto;">
    <!-- Área de notificaciones -->
    <div v-if="notification.message" 
         :class="['alert', notification.type === 'success' ? 'alert-success' : 'alert-danger']">
      {{ notification.message }}
    </div>

    <!-- Contenedor de Jugadores -->
    <div class="players-container mb-4">
      <div class="d-flex justify-content-center overflow-auto" style="gap: 8px;">
        <PlayerContainer
          v-for="n in 10"
          :key="n"
          class="flex-shrink-0"
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
        <button v-if="currentPower === 'investigate'" 
                class="btn btn-warning me-2"
                @click="showPlayerInvestigation">
          Investigar Jugador
        </button>
        <button v-if="currentPower === 'policyPeek'" 
                class="btn btn-warning me-2"
                @click="showPolicyPeek">
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
        <button class="btn btn-primary me-2" 
                @click="drawPolicies" 
                :disabled="isGameOver || policiesDeck.length < 3">
          Robar Políticas ({{ policiesDeck.length }} restantes)
        </button>
        <button v-if="drawnPolicies.length > 0" 
                class="btn btn-success me-2" 
                @click="showPolicySelection">
          Seleccionar Política a Promulgar
        </button>
      </div>

      <!-- Selección de Política (modal) -->
      <div v-if="showPolicyModal" class="policy-modal">
        <div class="modal-content">
          <h4>Selecciona una política para promulgar</h4>
          <div class="d-flex justify-content-center my-3">
            <button v-for="(policy, index) in drawnPolicies" 
                    :key="index"
                    class="btn policy-card mx-2"
                    :class="policy === 'fascist' ? 'btn-danger' : 'btn-primary'"
                    @click="enactPolicy(policy)">
              {{ policy === 'fascist' ? 'Fascista' : 'Liberal' }}
            </button>
          </div>
          <button class="btn btn-secondary" @click="showPolicyModal = false">Cancelar</button>
        </div>
      </div>
    </div>

    <!-- Estado del Juego -->
    <div v-if="isGameOver" class="game-over mt-4">
      <h2 :class="gameResult === 'liberal' ? 'text-primary' : 'text-danger'">
        {{ gameResult === 'liberal' ? '¡Los Liberales han ganado!' : '¡Los Fascistas han ganado!' }}
      </h2>
      <button class="btn btn-info mt-3" @click="resetGame">Nueva Partida</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import PresidentCansillerSelector from '../components/PresidentCansillerSelector.vue'
import FascistCard from '../components/FascistCard.vue'
import LiberalCard from '../components/LiberalCard.vue'
import PlayerContainer from '../components/PlayerContainer.vue'
import DecksEndTermButton from '../components/DecksEndTermButton.vue'

// Configuración inicial
const numPlayers = ref(6)
const fascistTrackLength = computed(() => numPlayers.value <= 6 ? 6 : numPlayers.value <= 8 ? 5 : 6)


const handleFascistEffect = (effect) => {
  console.log("Efecto fascista recibido:", effect)
}

// Estado del juego
const fascistProgress = ref(0)
const liberalProgress = ref(0)
const electionTracker = ref(0)
const policiesDeck = ref([])
const drawnPolicies = ref([])
const discardedPolicies = ref([])
const showPolicyModal = ref(false)
const notification = ref({ message: '', type: '' })
const currentPower = ref(null)
const showFascistPower = ref(false)
const isGameOver = ref(false)
const gameResult = ref(null)

// Inicializar el mazo de políticas
const initializeDeck = () => {
  const fascistCards = Array(11).fill('fascist')
  const liberalCards = Array(6).fill('liberal')
  policiesDeck.value = [...fascistCards, ...liberalCards]
  shuffleDeck(policiesDeck.value) // <- pasa el mazo como argumento
}

const showChancellorSelector = ref(true)
const players = ref([
  { id: 'u1', name: 'Jugador 1', isDead: false },
  { id: 'u2', name: 'Jugador 2', isDead: false },
  { id: 'u3', name: 'Jugador 3', isDead: false },
])

const currentPresident = ref({ id: 'u1' })

const selectedChancellor = ref(null)

function handleChancellorSelected(chancellor) {
  selectedChancellor.value = chancellor
  showChancellorSelector.value = false
  console.log(`Canciller seleccionado: ${chancellor.name}`)
}

// Barajar el mazo
function shuffleDeck(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
}

// Robar políticas
const drawPolicies = () => {
  if (policiesDeck.value.length < 3) {
    policiesDeck.value = [...discardedPolicies.value]
    discardedPolicies.value = []
    shuffleDeck()
    showNotification('¡El mazo se ha rebarajado con las políticas descartadas!', 'success')
  }
  drawnPolicies.value = policiesDeck.value.splice(0, 3)
  showNotification('Se han robado 3 políticas. Selecciona una para promulgar.', 'success')
}

// Mostrar selección de política
const showPolicySelection = () => {
  showPolicyModal.value = true
}

// Promulgar política
const enactPolicy = (policyType) => {
  showPolicyModal.value = false
  const remainingPolicies = drawnPolicies.value.filter(p => p !== policyType)
  discardedPolicies.value.push(...remainingPolicies)
  drawnPolicies.value = []
  
  if (policyType === 'fascist') {
    fascistProgress.value++
    checkFascistPower()
  } else {
    liberalProgress.value++
  }
  
  electionTracker.value = (electionTracker.value + 1) % 3
  showNotification(`¡Se ha promulgado una política ${policyType === 'fascist' ? 'fascista' : 'liberal'}!`, 
                   policyType === 'fascist' ? 'danger' : 'success')

  checkWinConditions()
}

// Efectos especiales del track fascista
const checkFascistPower = () => {
  currentPower.value = null
  showFascistPower.value = false

  if (numPlayers.value >= 7 && fascistProgress.value === 1) {
    currentPower.value = 'investigate'
    showFascistPower.value = true
  } else if (numPlayers.value >= 7 && fascistProgress.value === 2) {
    currentPower.value = 'policyPeek'
    showFascistPower.value = true
  } else if (fascistProgress.value === 3) {
    currentPower.value = 'election'
    showFascistPower.value = true
  }
}

// Descripción de poderes fascistas
const fascistPowerDescription = computed(() => {
  switch(currentPower.value) {
    case 'investigate': return 'El presidente puede investigar la afiliación de otro jugador'
    case 'policyPeek': return 'El presidente puede ver las próximas 3 políticas en el mazo'
    case 'election': return 'El próximo presidente será elegido por el líder fascista'
    default: return ''
  }
})

// Verificar condiciones de victoria
const checkWinConditions = () => {
  if (liberalProgress.value >= 5) {
    endGame('liberal')
  } else if (fascistProgress.value >= 6) {
    endGame('fascist')
  } else if (fascistProgress.value >= 3 && currentPower.value === 'election') {
    endGame('fascist')
  }
}

// Finalizar el juego
const endGame = (result) => {
  isGameOver.value = true
  gameResult.value = result
  showNotification(`¡Juego terminado! Los ${result === 'liberal' ? 'liberales' : 'fascistas'} han ganado.`, 
                   result === 'liberal' ? 'success' : 'danger')
}

// Mostrar notificación
const showNotification = (message, type) => {
  notification.value = { message, type }
  setTimeout(() => { notification.value = { message: '', type: '' } }, 3000)
}

// Reiniciar juego
const resetGame = () => {
  fascistProgress.value = 0
  liberalProgress.value = 0
  electionTracker.value = 0
  drawnPolicies.value = []
  discardedPolicies.value = []
  isGameOver.value = false
  gameResult.value = null
  currentPower.value = null
  showFascistPower.value = false
  initializeDeck()
  showNotification('¡Nueva partida iniciada!', 'success')
}

// Inicializar el juego al cargar
onMounted(() => {
  initializeDeck()
})
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

.players-container, .decks-container {
  background-color: white;
  border-radius: 8px;
  padding: 1rem;
}

.player-card, .deck-card {
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 0.5rem 1rem;
}
</style>
