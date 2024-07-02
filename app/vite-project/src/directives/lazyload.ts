/**
 * @author: Tusi
 * @description: 图片懒加载
 */

import { throttle } from "lodash-es";
import { getOffset } from "@/utils/dom";
import { GeneralFunction } from "@/bean/base";

function inView(element: HTMLElement) {
    // + 20 是为了防止底部加载不出来，另外也是为了提前一点点加载出来
    return element.style.display !== "none" && window.innerHeight + document.documentElement.scrollTop + 20 >= getOffset(element).offsetTop;
}

interface LazyloadElement extends HTMLElement {
    lazyloadHelper: LazyloadHelper;
}

class LazyloadHelper {
    private el: HTMLElement;

    private onScrollThrottle: GeneralFunction;

    constructor(el: HTMLElement) {
        this.el = el;
        this.onScrollThrottle = throttle(this.onScroll, 300, { leading: true });
    }

    setSrc() {
        if (!this.el.getAttribute("src") && inView(this.el)) {
            this.el.setAttribute("src", this.el.getAttribute("data-src") || "");
        }
    }

    onScroll() {
        this.setSrc();
    }

    handleInserted() {
        this.setSrc();
        window.addEventListener("scroll", this.onScrollThrottle);
    }

    handleUpdated() {
        this.setSrc();
    }

    handleBeforeUnmount() {
        window.removeEventListener("scroll", this.onScrollThrottle);
    }
}

export default {
    mounted(el: LazyloadElement): void {
        el.lazyloadHelper = new LazyloadHelper(el);
        el.lazyloadHelper.handleInserted();
    },
    updated(el: LazyloadElement): void {
        el.lazyloadHelper.handleUpdated();
    },
    beforeUnmount(el: LazyloadElement): void {
        el.lazyloadHelper.handleBeforeUnmount();
    },
};
