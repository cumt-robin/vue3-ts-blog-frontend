/**
 * @author: Tusi
 * @description: 路由配置
 */
import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import store from "@/store";
import { SET_USER_INFO } from "@/store/constants";
import { BACKEND_ROUTE } from "./backend";
import { FALLBACK_ROUTE, NOT_FOUND_ROUTE } from "./not-found";

const routes: Array<RouteRecordRaw> = [
    {
        path: "/",
        name: "Home",
        component: () => import("@/views/home/index.vue"),
        meta: {
            auth: false,
            title: "首页",
        },
    },
    {
        path: "/categories",
        name: "Categoryies",
        component: () => import("@/views/categories/index.vue"),
        meta: {
            auth: false,
            title: "所有分类",
        },
    },
    {
        path: "/category/:name",
        name: "Category",
        component: () => import("@/views/category/index.vue"),
        meta: {
            auth: false,
            title: "分类",
        },
    },
    {
        path: "/tags",
        name: "Tags",
        component: () => import("@/views/tags/index.vue"),
        meta: {
            auth: false,
            title: "所有标签",
        },
    },
    {
        path: "/tag/:name",
        name: "Tag",
        component: () => import("@/views/tag/index.vue"),
        meta: {
            auth: false,
            title: "标签",
        },
    },
    {
        path: "/timeline",
        name: "Timeline",
        component: () => import("@/views/timeline/index.vue"),
        meta: {
            auth: false,
            title: "时间轴",
        },
    },
    {
        path: "/article/:id",
        name: "Article",
        component: () => import("@/views/article/index.vue"),
        meta: {
            auth: false,
            title: "文章详情",
        },
    },
    {
        path: "/jumpout/:target",
        name: "Jumpout",
        component: () => import("@/views/jumpout/index.vue"),
        meta: {
            auth: false,
            title: "即将离开博客",
        },
    },
    {
        path: "/messages",
        name: "Messages",
        component: () => import("@/views/messages/index.vue"),
        meta: {
            auth: false,
            title: "留言",
        },
    },
    {
        path: "/chat",
        name: "Chat",
        component: () => import("@/views/chat/index.vue"),
        meta: {
            auth: false,
            title: "在线聊天室",
        },
    },
    {
        path: "/login",
        name: "Login",
        component: () => import("@/views/login/index.vue"),
        meta: {
            auth: false,
            title: "登录",
        },
    },
    {
        path: "/chatgpt",
        name: "ChatGpt",
        component: () => import("@/views/chatgpt/index.vue"),
        meta: {
            auth: false,
            title: "ChatGpt AI对话",
        },
    },
    BACKEND_ROUTE,
    NOT_FOUND_ROUTE,
    FALLBACK_ROUTE,
];

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition;
        }
        return { top: 0 };
    },
});

const clearUserInfo = () => {
    store.commit(SET_USER_INFO, null);
};

router.beforeEach((to, from, next) => {
    // 基本校验
    if (to.meta.auth) {
        // 需要鉴权的页面，进行前端检查，主要检查token有没有
        // 后端依旧需要对需要鉴权的接口访问做校验，不能依赖前端的判定
        const token = localStorage.getItem("token");
        if (token) {
            next();
        } else {
            clearUserInfo();
            next("/login");
        }
    } else {
        next();
    }
});

export default router;
