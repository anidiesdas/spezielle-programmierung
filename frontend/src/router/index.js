import { createRouter, createWebHistory } from "vue-router";
import DashboardPage from "../pages/DashboardPage.vue";
import ChatPage from "../pages/ChatPage.vue";
import PlanPage from "@/pages/PlanPage.vue";

const routes = [
    {
        path: "/",
        redirect: "/dashboard",
    },
    {
        path: "/dashboard",
        name: "dashboard",
        component: DashboardPage,
    },
    {
        path: "/chat",
        name: "chat",
        component: ChatPage,
    },
    {
        path: "/plan",
        name: "plan",
        component: PlanPage
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;