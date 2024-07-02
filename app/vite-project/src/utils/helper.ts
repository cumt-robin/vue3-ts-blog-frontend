import { PlainObject } from "@/bean/base";
import { getType, isArray, isDefined } from "./type";

/**
 * 处理参数对象
 * @param {Object} obj 参数对象
 * @param {options} isArrayToString 是否需要将数组处理成逗号分隔的string
 * @returns {Object} 处理后的参数对象
 */
export function requestParamsFilter(obj: PlainObject, isArrayToString = false): PlainObject {
    if (isArray(obj)) {
        return obj;
    }
    if (getType(obj) !== "object") {
        return {};
    }
    const newObj: PlainObject = {};
    Object.keys(obj).forEach((key) => {
        const element = obj[key];
        if (Array.isArray(element)) {
            if (element.length > 0) {
                newObj[key] = isArrayToString ? element.join(",") : [...element];
            }
        } else if (isDefined(element)) {
            newObj[key] = element;
        }
    });
    return newObj;
}
