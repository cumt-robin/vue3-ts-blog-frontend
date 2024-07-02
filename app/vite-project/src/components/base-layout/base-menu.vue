<template>
    <section class="base-menu" :class="{ 'is-visible': isVisible }">
        <ul class="menu__list">
            <li class="menu__header">
                <h2>Tusi博客</h2>
                <div class="avatar-wrap">
                    <div class="avatar-mask"></div>
                    <img class="avatar" src="@/assets/img/avatar.jpg" />
                </div>
                <div class="location"><icon-svg icon="location" />湖南长沙</div>
                <a-row class="social-list">
                    <a-col :span="8">
                        <a
                            title="微信"
                            href="http://qncdn.wbjiang.cn/%E5%BE%AE%E4%BF%A1%E4%BA%8C%E7%BB%B4%E7%A0%81%E5%90%8D%E7%89%87.jpg"
                            target="_blank"
                        >
                            <icon-svg icon="wechat" :size="24" />
                        </a>
                    </a-col>
                    <a-col :span="8">
                        <a title="github" href="https://github.com/cumt-robin" target="_blank" rel="nofollow">
                            <icon-svg icon="github" :size="24" />
                        </a>
                    </a-col>
                    <a-col :span="8">
                        <a title="掘金" href="https://juejin.im/user/5ca40a18f265da30b8178b31/posts" target="_blank" rel="nofollow">
                            <icon-svg icon="juejin" :size="24" />
                        </a>
                    </a-col>
                </a-row>
            </li>
            <li class="menu__item">
                <router-link to="/"><icon-svg icon="home" />首页</router-link>
            </li>
            <li class="menu__item">
                <router-link to="/categories"><icon-svg icon="folder" />分类</router-link>
            </li>
            <li class="menu__item">
                <router-link to="/tags"><icon-svg icon="tag" />标签</router-link>
            </li>
            <li class="menu__item">
                <router-link to="/timeline"><icon-svg icon="time-axis" />时间轴</router-link>
            </li>
            <li class="menu__item">
                <router-link to="/messages"><icon-svg icon="leave-message" />留言</router-link>
            </li>
            <li class="menu__item">
                <a href="https://chat.wbjiang.cn" target="_blank" rel="nofollow"><icon-svg icon="chat" />随心聊Chat</a>
            </li>
            <li class="menu__item">
                <router-link to="/chatgpt"><icon-svg icon="chat" />ChatGPT体验</router-link>
            </li>
            <li class="menu__item">
                <router-link to="/chat"><icon-svg icon="chat" />在线交流</router-link>
            </li>
            <li class="menu__item">
                <a target="_blank" href="https://github.com/cumt-robin/vue3-ts-blog-frontend" rel="nofollow"
                    ><icon-svg icon="github" />开源地址</a
                >
            </li>
        </ul>
    </section>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "BaseMenu",
    props: {
        isVisible: {
            type: Boolean,
            default: false,
        },
    },
});
</script>

<style lang="scss" scoped>
.base-menu {
    position: absolute;
    top: 0;
    width: 230px;
    height: 100%;
    background: #222;
    transform: translate3d(-100%, 0, 0);
    &.is-visible {
        box-shadow: 0 0 30px 0 rgba(27, 14, 14, 0.3);
    }
}
.menu__list {
    .icon-svg {
        margin-right: 6px;
    }
}

.menu__header {
    padding: 10px 20px 11px 20px;
    background-color: #393c3e;
    text-align: center;
    > h2 {
        color: rgba(245, 157, 173, 0.76);
        font-weight: 700;
        font-size: 24px;
        margin: 16px 0;
    }
    .avatar-wrap {
        position: relative;
        width: 80px;
        height: 80px;
        margin: 0 auto 16px;
    }
    .avatar-mask {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(102, 110, 210, 0.29);
        border-radius: 100%;
    }
    .avatar {
        display: block;
        width: 100%;
        border-radius: 100%;
    }
    .location {
        font-size: 14px;
        color: #ecc;
        margin: 20px 0;
    }
    .social-list {
        .ant-col:hover {
            .icon-svg {
                color: #fff;
            }
        }
        .icon-svg {
            color: #ecc;
            transition: color 0.3s ease-in-out;
        }
    }
}

.menu__item {
    border-left: 2px solid transparent;
    transition: all 0.3s ease-in-out;
    font-size: 14px;
    line-height: 3;
    &:hover {
        border-left-color: #3c8dbc;
        background-color: #312e2e;
        > a {
            color: #fff;
        }
    }
    > a {
        display: block;
        padding: 0 20px;
        color: #b8c7ce;
        transition: color 0.3s ease-in-out;
        &.router-link-active {
            color: #fff;
        }
    }
}
</style>
