<template>
  <div class="fascist-card-container">
    <div class="fascist-card position-relative bg-dark rounded shadow-lg">
      <!-- Tablero base fascista -->
      <img 
        :src="fascistBoardImage" 
        :alt="`${passedPolicies} políticas fascistas aprobadas`"
        class="board-image img-fluid rounded"
      />
      
      <!-- Fichas de políticas aprobadas -->
      <div v-for="i in maxPolicies" :key="`fascist-policy-${i}`">
        <img
          v-if="i <= passedPolicies"
          :src="fascistPolicyImage"
          alt="Política fascista aprobada"
          class="position-absolute policy-token"
          :class="{ 'show': i <= passedPolicies, 'hide': i > passedPolicies }"
          :style="getPolicyTokenStyle(i)"
        />
      </div>

      <!-- Rastreador de elecciones -->
      <div class="election-tracker position-absolute">
          <img
            v-for="pos in maxTrackerPositions"
            :key="`tracker-${pos}`"
            :src="electionTrackerImage"
            :alt="`Rastreador en posición ${pos} de ${maxTrackerPositions}`"
            class="position-absolute tracker-marker"
            :class="{ 'd-none': pos !== trackerPosition }"
            :style="{ left: getTrackerPosition(pos) }"
          />
      </div>
    </div>
  </div>
</template>

<script>
import fascistBoardImage from '../assets/board-fascist.png'
import fascistPolicyImage from '../assets/policy-fascist.png'

export default {
  name: 'FascistCard',
  props: {
    passedPolicies: {
      type: Number,
      required: true,
      validator: value => value >= 0 && value <= 6,
      default: 0
    },
    trackerPosition: {
      type: Number,
      required: true,
      validator: value => value >= 1 && value <=3,
      default:1
    },
  },
  data() {
    return {
      fascistBoardImage,
      fascistPolicyImage,
      maxPolicies: 6,
      policyPositions: ['11%', '24.6%', '38.2%', '50.8%', '63.4%', '77%']
    }
  },
  methods: {
    getPolicyTokenStyle(index) {
      return {
        left: `calc(${this.policyPositions[index - 1]})`,
        top: '50%',
        transform: 'translateY(-50%)',
        width: '12%',
        zIndex: 10,
        filter: 'drop-shadow(0 0 5px rgba(255, 0, 0, 0.7))'
      }
    }
  }
}
</script>

<style scoped>
.fascist-card-container {
  display: flex;
  justify-content: center;
  padding: 1rem;
}

.fascist-card {
  width: 400px;
  max-width: 100%;
  padding: 1rem;
  background-color: #343a40 !important;
}

.board-image {
  width: 100%;
  border: 3px solid #495057;
}

.policy-token {
  transition: all 0.3s ease;
}

.show {
  display: block;
}

.hide {
  display: none;
}

@media (max-width: 576px) {
  .fascist-card {
    width: 320px;
  }
  
  .policy-token {
    width: 15% !important;
  }
}
</style>