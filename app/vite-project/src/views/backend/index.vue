<template>
    <a-layout class="backend-layout">
        <a-layout-sider :trigger="null" v-model:collapsed="menuState.collapsed" collapsible breakpoint="lg" @collapse="onSiderCollapse">
            <img class="logo" src="@/assets/img/logo.png" />
            <a-menu
                theme="dark"
                mode="inline"
                v-model:openKeys="menuState.openKeys"
                :selected-keys="selectedKeys"
                :inline-collapsed="menuState.collapsed"
                @click="onClickMenu"
            >
                <a-sub-menu v-for="sub in navs" :key="sub.key">
                    <template #title>
                        <span>
                            <component :is="sub.icon" />
                            <span>{{ sub.title }}</span>
                        </span>
                    </template>
                    <template #default>
                        <a-menu-item v-for="child in sub.children" :key="child.key">{{ child.title }}</a-menu-item>
                    </template>
                </a-sub-menu>
            </a-menu>
        </a-layout-sider>
        <a-layout>
            <a-layout-header class="right-header">
                <MenuUnfoldOutlined v-if="menuState.collapsed" class="trigger" @click="toggleMenu" />
                <MenuFoldOutlined v-else class="trigger" @click="toggleMenu" />
                <HomeOutlined @click="goHome" />

                <a-dropdown v-model:visible="isDropdownVisible">
                    <a-avatar class="admin-avatar">T</a-avatar>

                    <template #overlay>
                        <a-menu @click="handleDropdownMenuClick">
                            <a-menu-item key="write">开始创作</a-menu-item>
                            <a-menu-item key="logout">退出登录</a-menu-item>
                        </a-menu>
                    </template>
                </a-dropdown>
            </a-layout-header>
            <a-layout-content class="right-main">
                <router-view />
            </a-layout-content>
        </a-layout>
    </a-layout>
</template>
<script lang="ts">
import { MenuFoldOutlined, MenuUnfoldOutlined, HomeOutlined } from "@ant-design/icons-vue";
import { computed, defineComponent, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";

import { Avatar, Checkbox, Dropdown, Layout, Menu, Table } from "ant-design-vue";
import { tree2Arr } from "@/utils/tree";
import { key } from "@/store";
import { LOGOUT_ACTION } from "@/store/constants";

import { app } from "@/main";
import { NavItem, navs } from "./navs";

const components = [Table, Layout, Checkbox, Avatar];

components.forEach((comp) => {
    app.use(comp);
});

interface MenuState {
    collapsed: boolean;
    openKeys: Array<string>;
    preOpenKeys: Array<string>;
}

export default defineComponent({
    name: "Backend",
    components: {
        MenuFoldOutlined,
        MenuUnfoldOutlined,
        HomeOutlined,
        [Dropdown.name]: Dropdown,
        [Menu.name]: Menu,
        [Menu.SubMenu.name]: Menu.SubMenu,
        [Menu.Item.name]: Menu.Item,
    },
    setup() {
        // vuex
        const store = useStore(key);

        const route = useRoute();
        const router = useRouter();

        // 菜单相关
        const flatNavs = tree2Arr<NavItem>(navs);

        const calcOpenKeys = () => {
            const activeNav = flatNavs.find((item) => item.key === route.path);
            return activeNav?.parentKeys || [];
        };

        const initOpenKeys = calcOpenKeys();

        // 菜单状态项
        const menuState = reactive<MenuState>({
            collapsed: false,
            openKeys: initOpenKeys,
            preOpenKeys: initOpenKeys,
        });

        // 监听openKeys的变化，记录preOpenKeys
        watch(
            () => menuState.openKeys,
            (val, oldVal) => {
                menuState.preOpenKeys = oldVal;
            }
        );

        // 路由的变化会，需要更新openKeys
        watch(
            () => route.path,
            () => {
                menuState.openKeys = calcOpenKeys();
            }
        );

        // 手动收起/展开菜单
        const toggleMenu = () => {
            menuState.collapsed = !menuState.collapsed;
            menuState.openKeys = menuState.collapsed ? [] : menuState.preOpenKeys;
        };

        // 侧边收起和展开事件
        const onSiderCollapse = (collapsed: boolean) => {
            menuState.collapsed = collapsed;
            menuState.openKeys = menuState.collapsed ? [] : menuState.preOpenKeys;
        };

        const selectedKeys = computed(() => [route.path]);

        // 点击菜单
        const onClickMenu = ({ key }: { key: string }) => {
            router.push(key);
        };

        // 导航栏右侧信息
        const isDropdownVisible = ref(false);

        // 点击用户下拉菜单
        const handleDropdownMenuClick = async ({ key }: { key: string }) => {
            switch (key) {
                case "write":
                    router.push("/backend/write");
                    break;
                case "logout":
                    await store.dispatch(LOGOUT_ACTION);
                    router.push("/");
                    break;
                default:
                    break;
            }
        };

        // 回到首页
        const goHome = () => {
            router.push("/");
        };

        return {
            selectedKeys,
            menuState,
            navs,
            toggleMenu,
            onSiderCollapse,
            onClickMenu,
            goHome,
            handleDropdownMenuClick,
            isDropdownVisible,
        };
    },
});
</script>

<style lang="scss" scoped>
.backend-layout {
    height: 100%;
}

.logo {
    max-width: 80%;
    height: 32px;
    display: block;
    margin: 16px auto;
}

.trigger {
    padding: 0 24px;
}

:deep(.right-header) {
    background: rgb(255, 255, 255);
    padding: 0;
    .anticon {
        font-size: 18px;
        transition: color 0.3s;
        &:hover {
            color: #1890ff;
        }
    }
    .admin-avatar {
        color: $color-primary;
        background-color: rgb(253, 227, 207);
        float: right;
        margin-right: 24px;
        margin-top: 16px;
    }
}

:deep(.right-main) {
    padding: 24px;
    flex: 1;
}

:deep(.admin-page-wrapper) {
    padding: 20px;
    background: #fff;
}
</style>
