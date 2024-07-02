<template>
    <section
        ref="wrapper"
        class="base-layout__wrapper"
        :class="{ slideInLeft: isMenuVisible, slideOutLeft: !isMenuVisible, 'animated faster': isAnimationEnabled }"
        @animationend="onAnimationEnd"
    >
        <header class="base-layout__header">
            <router-link to="/" class="logo-wrap">
                <img src="@/assets/img/logo.png" />
            </router-link>
            <h3>一个坚持原创的前端分享驿站</h3>
            <div class="icons-wrapper">
                <icon-svg class="menu-toggle" icon="menu" title="打开菜单" @click="onToggleMenu" />
                <router-link v-if="isAuthed" to="/backend" class="adm-entry" title="进入后台">
                    <icon-svg icon="admin" />
                </router-link>
            </div>
        </header>

        <main class="base-layout__main">
            <slot />
        </main>

        <hot-column></hot-column>

        <base-footer />

        <div v-show="isMenuVisible" class="mask" @click="onClickMask"></div>

        <base-menu :is-visible="isMenuVisible" />

        <aside class="aside-icons">
            <slot name="aside" />
            <icon-svg v-show="isShowGoTopIcon" class="icon--aside" icon="arrow-up" @click="goToTop" />
        </aside>
    </section>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeUnmount, onMounted, ref } from "vue";
import { useStore } from "vuex";
import { throttle } from "lodash-es";
import { key } from "@/store";
import { SET_IS_MENU_VISIBLE } from "@/store/constants";
import { setScrollTop } from "@/utils/dom";
import BaseFooter from "./base-footer.vue";
import BaseMenu from "./base-menu.vue";
import HotColumn from "./hot-column.vue";

export default defineComponent({
    name: "BaseLayout",
    components: {
        BaseFooter,
        BaseMenu,
        HotColumn,
    },
    setup() {
        // vuex
        const store = useStore(key);

        const isAuthed = computed(() => !!store.getters.isAuthed);

        // 菜单部分
        const isMenuVisible = computed(() => store.state.isMenuVisible);
        const isAnimationEnabled = ref(false);

        const hideMenu = () => store.commit(SET_IS_MENU_VISIBLE, false);

        const onToggleMenu = () => {
            if (isAnimationEnabled.value === false) {
                isAnimationEnabled.value = true;
            }
            if (isMenuVisible.value) {
                // 走统一的关闭逻辑
                hideMenu();
            } else {
                store.commit(SET_IS_MENU_VISIBLE, true);
                // 在弹出菜单时保证禁用滚动
                document.body.style.overflow = "hidden";
            }
        };

        const onAnimationEnd = () => {
            if (isMenuVisible.value === false) {
                isAnimationEnabled.value = false;
                // 解禁滚动
                document.body.style.overflow = "";
            }
        };

        const onClickMask = () => {
            hideMenu();
        };

        // 侧边按钮
        const isShowGoTopIcon = ref(false);
        let hideTimer: number | null = null;

        const clearHideTimer = () => {
            if (hideTimer) {
                clearTimeout(hideTimer);
                hideTimer = null;
            }
        };

        const setHideTimer = () => {
            clearHideTimer();
            hideTimer = window.setTimeout(() => {
                isShowGoTopIcon.value = false;
            }, 5000);
        };

        const onScroll = () => {
            const currScrollTop = document.body.scrollTop || document.documentElement.scrollTop;
            if (currScrollTop > 0) {
                isShowGoTopIcon.value = true;
                setHideTimer();
            } else {
                isShowGoTopIcon.value = false;
            }
        };

        const onScrollThrottle = throttle(onScroll, 300, { leading: true });

        const addScrollListener = () => {
            document.addEventListener("scroll", onScrollThrottle, {
                passive: true,
            });
        };

        const removeScrollListener = () => {
            document.removeEventListener("scroll", onScrollThrottle);
        };

        const goToTop = () => {
            setScrollTop({
                useAnimation: true,
            });
        };

        onMounted(() => {
            addScrollListener();
            setHideTimer();
        });

        onBeforeUnmount(() => {
            hideMenu();
            removeScrollListener();
            clearHideTimer();
        });

        return {
            isAuthed,
            isMenuVisible,
            isAnimationEnabled,
            onToggleMenu,
            onAnimationEnd,
            onClickMask,
            isShowGoTopIcon,
            goToTop,
        };
    },
});
</script>

<style lang="scss" scoped>
.base-layout__header {
    padding: 18px 40px;
    background: linear-gradient(to bottom right, #2177a7, #5fb7ac);
    text-align: center;
    > h3 {
        margin: 20px 0;
        color: #eaeab3;
        font-size: 20px;
        font-weight: 400;
        text-shadow: 0 1px 0 #2e2e2e, 0 2px 0 #2c2c2c, 0 3px 0 #2a2a2a, 0 4px 0 #282828, 0 5px 0 #262626, 0 6px 0 #242424;
    }
}

.base-layout__main {
    padding: 24px 24px 0;
}

.logo-wrap {
    display: inline-block;
}

.icons-wrapper {
    position: absolute;
    top: 20px;
    left: 12px;
    .icon-svg {
        font-size: 24px;
        color: #fff;
        cursor: pointer;
    }
}

.adm-entry {
    margin-left: 8px;
}

.mask {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.24);
    z-index: 100;
}

.aside-icons {
    position: fixed;
    bottom: 160px;
    right: 24px;
    width: 50px;
    height: 50px;
}

@media screen and (min-width: 992px) {
    :deep(.base-layout__main) {
        width: 800px;
        margin: 0 auto;
    }
}
</style>
