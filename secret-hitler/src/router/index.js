import {createRouter,createWebHistory} from 'vue-router'
import Login from '../Views/Login.vue'
import GameBoard from '../Views/GameBoard.vue'

const routes= [
    {path: "/login", name: "login", component: Login},
    {path: "/gameboard", name: "game-board", component: GameBoard},
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router