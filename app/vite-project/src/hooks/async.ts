/**
 * @author: Tusi
 * @description: 异步 Hook，用于 loading, error 等状态反馈
 */
import { Ref, ref } from "vue";
import { GeneralFunction } from "@/bean/base";

interface AsyncLoadingResponse {
    trigger: GeneralFunction;
    loading: Ref<boolean>;
    isError: Ref<boolean>;
    error: Ref<unknown>;
}

export const useAsyncLoading = (fn: GeneralFunction<Promise<unknown>>): AsyncLoadingResponse => {
    const loading = ref(false);
    const isError = ref(false);
    const error = ref();
    const trigger = async (...args: any[]) => {
        try {
            loading.value = true;
            await fn(...args);
        } catch (err) {
            isError.value = true;
            error.value = err;
        } finally {
            loading.value = false;
        }
    };
    return { trigger, loading, isError, error };
};
