import { GeneralFunction, PlainObject } from "@/bean/base";

enum DataType {
    Number = "number",
    String = "string",
    Boolean = "boolean",
    Undefined = "undefined",
    Null = "null",
    Symbol = "symbol",
    Object = "object",
    Date = "date",
    Map = "map",
    Set = "set",
    BigInt = "bigint",
    Function = "function",
    Promise = "promise",
    File = "file",
    Blob = "blob",
}

/**
 * 判断变量的数据类型
 * @param {unknown} val 变量值
 * @returns {string} 数据类型
 */
export function getType(val: unknown): string {
    return Object.prototype.toString
        .call(val)
        .replace(/\[object\s(\w+)\]/, "$1")
        .toLowerCase();
}

/**
 * 判断变量是否有具体定义，即非null,非undefined,非空字符串
 * @param {unknown} val 变量值
 * @returns {boolean} 变量是否有具体定义
 */
export function isDefined(val: unknown): boolean {
    return val !== null && val !== undefined && val !== "";
}

export function isObject<T = PlainObject>(val: unknown): val is T {
    return getType(val) === DataType.Object;
}

export function isArray<T = unknown>(val: unknown): val is T[] {
    return Array.isArray(val);
}

export function isNumber(val: unknown): val is number {
    return typeof val === DataType.Number;
}

export function isString(val: unknown): val is string {
    return typeof val === DataType.String;
}

export function isBool(val: unknown): val is boolean {
    return typeof val === DataType.Boolean;
}

export function isUndefined(val: unknown): val is undefined {
    return typeof val === DataType.Undefined;
}

export function isNull(val: unknown): val is null {
    return val === DataType.Null;
}

export function isUndefOrNull(val: unknown): val is undefined | null {
    return isUndefined(val) || isNull(val);
}

export function isFunction(val: unknown): val is GeneralFunction {
    return getType(val) === DataType.Function;
}

export function isSymbol(val: unknown): val is symbol {
    return typeof val === DataType.Symbol;
}

export function isMap(val: unknown): val is Map<unknown, unknown> {
    return getType(val) === DataType.Map;
}

export function isSet(val: unknown): val is Set<unknown> {
    return getType(val) === DataType.Set;
}

export function isPromise<T = unknown>(val: unknown): val is Promise<T> {
    return getType(val) === DataType.Promise;
}

export function isFile<T extends File>(val: unknown): val is T {
    return getType(val) === DataType.File;
}

export function isBlob(val: unknown): val is Blob {
    return getType(val) === DataType.Blob;
}

export function isBasicType(val: unknown): boolean {
    const type = getType(val) as DataType;
    return [DataType.Number, DataType.Boolean, DataType.String, DataType.Symbol, DataType.Undefined, DataType.Null].includes(type);
}
