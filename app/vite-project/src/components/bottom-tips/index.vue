<!--
 * @author: Tusi
 * @description: 自己实现一个底部提示组件，a-divider 太逗了
-->

<template>
    <div class="bottom-tips__wrapper" :style="{ paddingTop: top, paddingBottom: bottom }">
        <span class="tips" :class="{ 'tips--line': line }" :style="{ fontSize: fontSize || '' }">
            <slot>{{ content }}</slot>
        </span>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "BottomTips",
    props: {
        content: {
            type: String,
        },
        top: {
            type: String,
            default: "10px",
        },
        bottom: {
            type: String,
            default: "10px",
        },
        fontSize: {
            type: String,
        },
        line: {
            type: Boolean,
            default: true,
        },
    },
    setup() {
        return {};
    },
});
</script>

<style lang="scss" scoped>
.bottom-tips__wrapper {
    text-align: center;
    overflow: hidden;
}
.tips {
    position: relative;
    font-size: 12px;
    color: #999;
}

.tips--line {
    &::before,
    &::after {
        content: "";
        position: absolute;
        top: 8px;
        width: 60px;
        height: 1px;
        background-color: #ccc;
    }

    &::before {
        left: -70px;
    }

    &::after {
        right: -70px;
    }
}
</style>
