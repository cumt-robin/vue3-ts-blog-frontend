<!--
 * @author: Tusi
 * @description: 按钮组件
-->
<template>
    <a-button class="my-button" v-bind="$attrs">
        <slot name="icon">
            <icon-svg v-if="icon" :icon="icon" :size="iconSize" :color="iconColor" />
        </slot>
        <slot />
    </a-button>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "MyButton",
    inheritAttrs: false,
    props: {
        icon: {
            type: String,
        },
        iconSize: {
            type: Number,
            default: 14,
        },
        iconColor: {
            type: String,
        },
    },
});
</script>
