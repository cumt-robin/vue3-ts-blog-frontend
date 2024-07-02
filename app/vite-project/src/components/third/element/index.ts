/*
 * @Author: 蒋文斌
 * @Date: 2021-04-25 19:56:29
 * @LastEditors: 蒋文斌
 * @LastEditTime: 2021-06-22 20:45:52
 * @Description: 全局按需引入 element-plus 组件
 */

import { App } from "vue";

import { ElImage } from "element-plus";

import "element-plus/packages/theme-chalk/src/base.scss";

const components = [ElImage];

export default {
    install(app: App): App {
        components.forEach((comp) => {
            app.component(comp.name, comp);
        });
        return app;
    },
};
