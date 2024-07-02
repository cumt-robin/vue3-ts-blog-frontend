/**
 * @author: Tusi
 * @description: 404路由
 */
import { RouteRecordRaw } from "vue-router";

export const NOT_FOUND_ROUTE: RouteRecordRaw = {
    name: "NotFound",
    path: "/404",
    component: () => import("@/views/404/index.vue"),
    meta: {
        auto: false,
        title: "页面找不到了",
    },
};

export const FALLBACK_ROUTE = {
    name: "Fallback",
    path: "/:pathMatch(.*)*",
    redirect: "/404",
};
