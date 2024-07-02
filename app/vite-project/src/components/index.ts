import { App } from "vue";

// 自动注册全局组件
export default {
    install(app: App): App {
        const componentsContext = require.context("./", true, /index.(vue|ts|tsx)$/);
        componentsContext.keys().forEach((fileName) => {
            const componentConfig = componentsContext(fileName).default;
            if (/.(vue|tsx)$/.test(fileName)) {
                app.component(componentConfig.name, componentConfig);
            } else if (fileName !== "./index.ts") {
                app.use(componentConfig);
            }
        });
        return app;
    },
};
