import Vue from "vue";
import VueRouter from "vue-router";
import Login from "../views/Login.vue";
import DataEnhancement from "../views/DataEnhancement.vue";
import Classification from "../views/Classification.vue";
import ImageSegmentation from "../views/ImageSegmentation.vue";
import LLMService from "../views/LLMService.vue";
import Dashboard from "../views/Dashboard.vue";
import store from "../store/index";

Vue.use(VueRouter);

const routes = [
    {
        path: '/',
        name: 'Login',
        component: Login,
        meta: { requiresAuth: false }
    },
    {
        path: '/dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: {
            name: "首页",
            requiresAuth: true
        }
    },
    {
        path: "/DataAEnhancement",
        name: "DataAEnhancement",
        component: DataEnhancement,
        meta: { 
            name: "数据增强",
            requiresAuth: true 
        },
    },
    {
        path: "/classification",
        name: "Classification",
        component: Classification,
        meta: { 
            name: "分类识别",
            requiresAuth: true 
        },
    },
    {
        path: "/segmentation",
        name: "ImageSegmentation",
        component: ImageSegmentation,
        meta: { 
            name: "分割推理",
            requiresAuth: true 
        },
    },
    {
        path: "/llms",
        name: "LLMService",
        component: LLMService,
        meta: { 
            name: "Deepdetect",
            requiresAuth: true 
        },
    },
];

const router = new VueRouter({
    mode: "history",
    base: process.env.BASE_URL,
    routes,
});

router.beforeEach((to, from, next) => {
    const isAuthenticated = localStorage.getItem('username') !== null;
    
    if (to.meta.requiresAuth && !isAuthenticated) {
        next('/');
    } else {
        next();
    }
});

export default router;
