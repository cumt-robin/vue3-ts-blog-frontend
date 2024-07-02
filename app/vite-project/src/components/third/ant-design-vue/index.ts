/**
 * @author: Tusi
 * @description: 全局按需引入 antd 组件，对于特别需要优化的情况，可以拆出部分组件到特定页面加载
 */
import { App } from "vue";
import { Button, Image, Space, Row, Col, Skeleton, Empty } from "ant-design-vue";

const components = [Button, Image, Space, Row, Col, Skeleton, Empty];

export default {
    install(app: App): App {
        components.forEach((comp) => {
            app.use(comp);
        });
        return app;
    },
};
