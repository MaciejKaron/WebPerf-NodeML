import { createWebHistory, createRouter } from "vue-router";

const ModelLoader = () => import("./components/ModelLoader.vue")

const routes = [
    {
        path: "/",
        name: "start",
        component: ModelLoader,
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router;