<!--
 * @author: Tusi
 * @description: 矢量图标组件
-->
<script lang="tsx">
import { createFromIconfontCN } from "@ant-design/icons-vue";
import { defineComponent, computed } from "vue";

const MyIcon = createFromIconfontCN({
    // 每次在 iconfont 修改了图标，需要重新生成链接，复制到这里
    scriptUrl: "//at.alicdn.com/t/font_1570300_zwupv8bc2lp.js",
});

const iconPrefix = "icon-";
const fallbackIcon = "home";

export default defineComponent({
    name: "IconSvg",
    inheritAttrs: false,
    props: {
        icon: {
            type: String,
        },
        size: {
            type: Number,
        },
        // 只对单色图标有用
        color: {
            type: String,
            default: "",
        },
    },
    setup(props, { attrs }) {
        // 有可能传过来是null, prop的default不会生效
        const iconType = computed(() => `${iconPrefix}${props.icon || fallbackIcon}`);
        return () => (
            <MyIcon
                class="icon-svg"
                type={iconType.value}
                style={{
                    fontSize: props.size && `${props.size}px`,
                    color: props.color,
                }}
                {...attrs}
            />
        );
    },
});
</script>

<style lang="scss" scoped>
.icon-svg {
    font-size: 16px;
}
.icon-svg + .icon-svg {
    margin-left: 10px;
}
</style>
