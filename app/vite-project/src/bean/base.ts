import { defineComponent } from "vue";

type IndexType = string | number | symbol;

export type PlainObject<K extends IndexType = string, V = unknown> = Record<K, V>;

export type PrimitiveType = number | string | boolean | undefined | null | symbol;

export type GeneralFunction<T = unknown> = (...args: any[]) => T;

export interface PlainNode extends PlainObject {
    id: number;
}

export interface TreeNode extends PlainObject {
    key: string;
    children?: this[];
}

export type Lazy<T> = () => Promise<T>;

export type DefineComponentOptions = Parameters<typeof defineComponent>[0];
