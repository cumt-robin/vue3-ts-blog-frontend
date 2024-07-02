import { App } from "vue";
import Lazyload from "./lazyload";

export default {
    install(app: App): void {
        app.directive("lazyload", Lazyload);
    },
};
