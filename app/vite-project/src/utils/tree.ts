import { TreeNode } from "@/bean/base";

// overload
export function tree2Arr<T extends TreeNode>(tree: Array<T>, replaceChildren?: string): Array<T>;
export function tree2Arr<T extends TreeNode, D = unknown>(
    tree: Array<T>,
    replaceChildren?: string,
    mapper?: (item: T, index: number, arr: Array<T>) => D
): Array<D>;
export function tree2Arr<T extends TreeNode, D = unknown>(
    tree: Array<T>,
    replaceChildren = "children",
    mapper?: (item: T, index: number, arr: Array<T>) => D
): Array<T> | Array<D> {
    const result = tree.reduce((prev, curr) => {
        const children = curr[replaceChildren] as T[];
        const list = children && children.length > 0 ? [curr, ...tree2Arr(children, replaceChildren, mapper)] : [curr];
        return prev.concat(list as ConcatArray<T>);
    }, [] as Array<T>);
    return typeof mapper === "function" ? result.map(mapper) : result;
}
