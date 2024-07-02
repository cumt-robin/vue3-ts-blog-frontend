/**
 * @author: Tusi
 * @description: 菜单配置
 */

import { BookOutlined, MessageOutlined, CommentOutlined, FolderOutlined, TagOutlined } from "@ant-design/icons-vue";
import { app } from "@/main";
import { TreeNode } from "@/bean/base";

const icons = [BookOutlined, MessageOutlined, CommentOutlined, FolderOutlined, TagOutlined];

const registerIcons = () => {
    icons.forEach((icon) => {
        app.component(icon.name, icon);
    });
};

registerIcons();

export interface NavItem extends TreeNode {
    key: string;
    icon?: string;
    title: string;
    parentKeys?: string[];
}

export const navs: NavItem[] = [
    {
        key: "sub1",
        icon: BookOutlined.name,
        title: "文章管理",
        children: [
            {
                key: "/backend",
                title: "所有文章",
                parentKeys: ["sub1"],
            },
            {
                key: "/backend/write",
                title: "开始创作",
                parentKeys: ["sub1"],
            },
        ],
    },
    {
        key: "sub2",
        icon: MessageOutlined.name,
        title: "留言管理",
        children: [
            {
                key: "/backend/review-msg",
                title: "审核留言",
                parentKeys: ["sub2"],
            },
            {
                key: "/backend/review-msg-reply",
                title: "审核留言回复",
                parentKeys: ["sub2"],
            },
            {
                key: "/backend/all-msg",
                title: "所有留言",
                parentKeys: ["sub2"],
            },
        ],
    },
    {
        key: "sub3",
        icon: CommentOutlined.name,
        title: "评论管理",
        children: [
            {
                key: "/backend/review-comment",
                title: "审核评论",
                parentKeys: ["sub3"],
            },
            {
                key: "/backend/review-comment-reply",
                title: "审核评论回复",
                parentKeys: ["sub3"],
            },
            {
                key: "/backend/all-comment",
                title: "所有评论",
                parentKeys: ["sub3"],
            },
        ],
    },
    {
        key: "sub4",
        icon: FolderOutlined.name,
        title: "分类管理",
        children: [
            {
                key: "/backend/category",
                title: "分类维护",
                parentKeys: ["sub4"],
            },
        ],
    },
    {
        key: "sub5",
        icon: TagOutlined.name,
        title: "标签管理",
        children: [
            {
                key: "/backend/tag",
                title: "标签维护",
                parentKeys: ["sub5"],
            },
        ],
    },
];
