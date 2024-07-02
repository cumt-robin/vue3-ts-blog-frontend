import BezierEasing from "bezier-easing";
import { GeneralFunction } from "@/bean/base";

interface OffsetResponse {
    offsetLeft: number;
    offsetTop: number;
}

export function getOffset(el: HTMLElement, relativeNode = document.body): OffsetResponse {
    let offsetLeft = 0;
    let offsetTop = 0;
    let parent: HTMLElement | null = el;
    while (parent !== null && parent !== relativeNode) {
        offsetLeft += parent.offsetLeft;
        offsetTop += parent.offsetTop;
        parent = parent.offsetParent as HTMLElement | null;
    }
    return {
        offsetLeft,
        offsetTop,
    };
}

const easingFunc = BezierEasing(0.42, 0, 1, 1);

function setElementScrollTop({ target = document.documentElement, value }: { target?: HTMLElement; value: number }) {
    if (target === document.body || target === document.documentElement) {
        document.body.scrollTop = value;
        document.documentElement.scrollTop = value;
    } else {
        target.scrollTop = value;
    }
}

function getNextScrollTopValue(start: number, end: number, stepNo: number, stepTotal: number): number {
    if (start > end) {
        return start - easingFunc(stepNo / stepTotal) * (start - end);
    }
    return start + easingFunc(stepNo / stepTotal) * (end - start);
}

interface StepOptions {
    target?: HTMLElement;
    start: number;
    end: number;
    stepNo?: number;
    stepTotal: number;
}

function animateSetScrollTop({ target = document.documentElement, start, end, stepNo = 1, stepTotal }: StepOptions) {
    const next = getNextScrollTopValue(start, end, stepNo, stepTotal);
    window.requestAnimationFrame(() => {
        setElementScrollTop({
            target,
            value: next,
        });
        if (stepNo !== stepTotal) {
            const nextStepNo = stepNo + 1;
            animateSetScrollTop({
                target,
                start,
                end,
                stepNo: nextStepNo,
                stepTotal,
            });
        }
    });
}

interface SetScrollTopOptions {
    target?: HTMLElement;
    targetValue?: number;
    useAnimation?: boolean;
    duration?: number;
}

function getEleScrollTop(target = document.body): number {
    if (target === document.body || target === document.documentElement) {
        return document.body.scrollTop || document.documentElement.scrollTop;
    }
    return target.scrollTop;
}

export function setScrollTop({
    target = document.documentElement,
    targetValue = 0,
    useAnimation = false,
    duration = 0.5,
}: SetScrollTopOptions = {}): void {
    if (useAnimation) {
        const currScrollTop = getEleScrollTop(target);
        const stepTotal = duration * 60;
        if (currScrollTop === targetValue) {
            return;
        }
        animateSetScrollTop({
            target,
            start: currScrollTop,
            end: targetValue,
            stepTotal,
        });
    } else {
        setElementScrollTop({
            target,
            value: targetValue,
        });
    }
}

// 重新激活动画，需要传入移除动画class的方法，和设置动画class的方法
export default function triggerC3Animation(removeAnimClass: GeneralFunction, setAnimClass: GeneralFunction): void {
    removeAnimClass();
    window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
            setAnimClass();
        });
    });
}

export function addClass(ele: HTMLElement | string, cls: string | Array<string>): void {
    const element = typeof ele === "string" ? document.querySelector("ele") : ele;
    if (element !== null) {
        if (typeof cls === "string") {
            element.classList.add(cls);
        } else if (Array.isArray(cls)) {
            cls.forEach((item) => {
                element.classList.add(item);
            });
        }
    }
}

export function removeClass(ele: HTMLElement | string, cls: string | Array<string>): void {
    const element = typeof ele === "string" ? document.querySelector("ele") : ele;
    if (element !== null) {
        if (typeof cls === "string") {
            element.classList.remove(cls);
        } else if (Array.isArray(cls)) {
            cls.forEach((item) => {
                element.classList.remove(item);
            });
        }
    }
}

function isScroll(el: HTMLElement, direction?: string) {
    const isDirectionDefined = typeof direction === "string";
    let overflowVal: string | null = "";
    if (isDirectionDefined) {
        overflowVal = direction === "horizontal" ? el.style.overflowX : el.style.overflowY;
    } else {
        overflowVal = el.style.overflow;
    }
    return typeof overflowVal === "string" && /(scroll|auto)/.test(overflowVal);
}

export function getScrollContainer(el: HTMLElement, direction?: string): HTMLElement | null {
    let parent = el;
    while (parent) {
        if (parent === document.body || parent === document.documentElement) {
            return parent;
        }
        if (isScroll(parent, direction)) {
            return parent;
        }
        parent = parent.parentNode as HTMLElement;
    }
    return parent;
}

// type WritableCSSProperty = Omit<CSSStyleDeclaration, "length" | "parentRule">;
// type WritableCSSPropertyKeys = keyof WritableCSSProperty;
// type WritableCSSPropertyValues = CSSStyleDeclaration[WritableCSSPropertyKeys];

// export function setStyle(el: HTMLElement | string, property: WritableCSSPropertyKeys, val: WritableCSSPropertyValues): void {
//     const dom: HTMLElement | null = typeof el === "string" ? document.querySelector(el) : el;
//     if (dom) {
//         dom.style[property] = val;
//     }
// }
