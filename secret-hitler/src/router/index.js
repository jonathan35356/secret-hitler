import {createRouter,createWebHistory} from 'vue-router'
import { HelloWorld } from '../components/index'

const routes= [
    {path: "/a", name: "helloword", component: HelloWorld}
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router