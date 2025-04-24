import {createRouter,createWebHistory} from 'vue-router'
import Login from '../Views/Login.vue'
import GameBoard from '../Views/GameBoard.vue'
import Register from '../Views/Register.vue'
import JoinGame from '../Views/JoinGame.vue'

const routes= [
    {path: "/login", name: "login", component: Login},
    {path: "/gameboard", name: "game-board", component: GameBoard},
    {path: "/register", name: "register", component: Register},
    {path: "/join-game", name: "join-game", component: JoinGame},
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router