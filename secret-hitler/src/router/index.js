import {createRouter,createWebHistory} from 'vue-router'
import { HelloWorld } from '../components/index'
import Login from '../Views/Login.vue'

const routes= [
    {path: "/a", name: "helloword", component: HelloWorld},
    {path: "/login", name: "login", component: Login},
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router