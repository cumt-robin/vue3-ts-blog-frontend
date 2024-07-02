/**
 * @author: Tusi
 * @description: 后台路由
 */

import { RouteRecordRaw } from "vue-router";

export const BACKEND_ROUTE: RouteRecordRaw = {
    path: "/backend",
    name: "Backend",
    component: () => import("@/views/backend/index.vue"),
    meta: {
        auth: true,
        isAdmin: true,
    },
    children: [
        // 文章
        {
            path: "",
            component: () => import("@/views/backend/article/index.vue"),
            meta: {
                title: "所有文章",
            },
        },
        {
            path: "write",
            component: () => import("@/views/backend/write/index.vue"),
            meta: {
                title: "开始创作",
            },
        },
        {
            path: "article/edit/:id",
            component: () => import("@/views/backend/write/index.vue"),
            meta: {
                title: "修改文章",
            },
        },
        // 留言
        {
            path: "all-msg",
            component: () => import("@/views/backend/msg/all/index.vue"),
            meta: {
                title: "所有留言",
            },
        },
        {
            path: "review-msg",
            component: () => import("@/views/backend/msg/review/index.vue"),
            meta: {
                title: "审核留言",
            },
        },
        {
            path: "review-msg-reply",
            component: () => import("@/views/backend/msg/review-reply/index.vue"),
            meta: {
                title: "审核留言回复",
            },
        },
        // 评论
        {
            path: "all-comment",
            component: () => import("@/views/backend/comment/all/index.vue"),
            meta: {
                title: "所有评论",
            },
        },
        {
            path: "review-comment",
            component: () => import("@/views/backend/comment/review/index.vue"),
            meta: {
                title: "审核评论",
            },
        },
        {
            path: "review-comment-reply",
            component: () => import("@/views/backend/comment/review-reply/index.vue"),
            meta: {
                title: "审核评论回复",
            },
        },
        {
            path: "category",
            component: () => import("@/views/backend/category/index.vue"),
            meta: {
                title: "分类维护",
            },
        },
        {
            path: "tag",
            component: () => import("@/views/backend/tag/index.vue"),
            meta: {
                title: "标签维护",
            },
        },
    ],
};
