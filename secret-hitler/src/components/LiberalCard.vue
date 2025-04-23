<template>
    <div class="liberal-card-container">
      <div class="liberal-card position-relative bg-light rounded shadow-lg">
        <!-- Tablero base liberal -->
        <img 
          :src="liberalBoardImage" 
          :alt="`${passedPolicies} políticas liberales aprobadas`"
          class="board-image img-fluid rounded"
        />
        
        <!-- Fichas de políticas aprobadas -->
        <div v-for="i in maxPolicies" :key="`policy-${i}`">
          <img
            v-if="i <= passedPolicies"
            :src="liberalPolicyImage"
            alt="Política liberal aprobada"
            class="position-absolute policy-token"
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
  import liberalBoardImage from '../assets/board-liberal.png'
  import liberalPolicyImage from '../assets/policy-liberal.png'
  import electionTrackerImage from '../assets/election-tracker.png'
  
  export default {
    name: 'LiberalCard',
    props: {
      passedPolicies: {
        type: Number,
        required: true,
        validator: value => value >= 0 && value <= 5,
        default: 0
      },
      trackerPosition: {
        type: Number,
        required: true,
        validator: value => value >= 1 && value <= 3,
        default: 1
      }
    },
    data() {
      return {
        liberalBoardImage,
        liberalPolicyImage,
        electionTrackerImage,
        maxPolicies: 5,
        maxTrackerPositions: 3
      }
    },
    methods: {
      getPolicyTokenStyle(index) {
        return {
          top: `${18 + index * 10}%`,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '20%',
          zIndex: 10
        }
      },
      getTrackerPosition(pos) {
        const positions = ['20%', '40%', '60%']
        return positions[pos - 1]
      }
    }
  }
  </script>
  
  <style scoped>
  .liberal-card-container {
    display: flex;
    justify-content: center;
    padding: 1rem;
  }
  
  .liberal-card {
    width: 400px;
    max-width: 100%;
    padding: 1rem;
  }
  
  .board-image {
    width: 100%;
    border: 3px solid #e9ecef;
  }
  
  .policy-token {
    transition: all 0.3s ease;
    filter: drop-shadow(0 0 5px rgba(0, 0, 255, 0.5));
  }
  
  .election-tracker {
    top: 78%;
    left: 0;
    width: 100%;
    height: 8%;
  }
  
  .tracker-marker {
    width: 8%;
    height: 100%;
    filter: drop-shadow(0 0 3px rgba(255, 0, 0, 0.7));
  }
  
  @media (max-width: 576px) {
    .liberal-card {
      width: 320px;
    }
    
    .policy-token {
      width: 25% !important;
    }
  }
  </style>