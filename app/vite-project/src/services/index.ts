/* eslint-disable no-case-declarations */
/* eslint-disable camelcase */
import axios from "axios";
import qs from "qs";
import { message } from "ant-design-vue";
import { CommonResponse } from "@/bean/xhr";
import { PlainObject } from "@/bean/base";
import { requestParamsFilter } from "@/utils/helper";
import router from "@/router";
import { eventBus } from "@/utils/eventbus";

enum InnerCode {
    Unauthorized = "000001",
    TokenExpired = "000002",
    Forbidden = "000003",
}

const api = axios.create({
    baseURL: process.env.VUE_APP_BASE_API,
    timeout: 20000,
});

// axios初始化配置
api.defaults.headers.common["Content-Type"] = "application/x-www-form-urlencoded";
api.defaults.transformRequest = (data) => {
    return qs.stringify(data, { encode: true });
};

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 返回状态拦截
api.interceptors.response.use(
    (response) => {
        const res = response.data;
        const { code, msg } = res;
        if (code === "0") {
            // code 为 0 代表返回正常返回
            return Promise.resolve(res);
        }
        // inner code handler
        switch (code) {
            case InnerCode.Unauthorized:
            case InnerCode.TokenExpired:
            case InnerCode.Forbidden:
                eventBus.emit("sessionInvalid");
                router.push("/login");
                break;
            default:
                break;
        }
        if (msg) {
            message.error(msg);
        }
        return Promise.reject(res);
    },
    (error) => {
        console.error(error.response);
        if (error.toString().indexOf("timeout") !== -1) {
            // 超时
            message.error("网络请求超时，请检查网络连接！");
        } else if (error.response) {
            switch (error.response.status) {
                // http status handler
                case 400: // 客户端请求有误
                    message.error("客户端请求有误，请联系管理员！");
                    break;
                case 401: // 未授权
                    message.error("未授权，请联系管理员！");
                    break;
                case 403: // 禁止访问
                    message.error("禁止访问！");
                    break;
                case 404: // 找不到
                    message.error("访问的资源不存在，请稍后重试！");
                    break;
                case 502: // bad gateway
                case 503: // service unavailable
                case 504: // gateway timeout
                    message.error("服务器维护中，请稍后重试！");
                    break;
                case 500: // 服务器内部错误
                default:
                    const errmsg = error.response.data.message;
                    if (errmsg) {
                        message.error(errmsg);
                    } else {
                        message.error("系统内部错误！");
                    }
                    break;
            }
        }
        return Promise.reject(error.response);
    }
);

export class ApiService {
    // 特性
    private feature: string;

    constructor(feature: string) {
        this.feature = feature;
    }

    // get请求
    protected $get<T extends CommonResponse>(action: string, params: PlainObject = {}, config: PlainObject = {}): Promise<T> {
        return api.get(`/${this.feature}/${action}`, {
            ...config,
            params: requestParamsFilter(params, true),
        });
    }

    // delete请求
    protected $del<T extends CommonResponse>(action: string, params: PlainObject = {}, config: PlainObject = {}): Promise<T> {
        return api.delete(`/${this.feature}/${action}`, {
            ...config,
            params: requestParamsFilter(params, true),
        });
    }

    // delete application/json请求
    protected $delJson<T extends CommonResponse>(action: string, params: PlainObject = {}, config: PlainObject = {}): Promise<T> {
        const defaultConfig = {
            headers: { "Content-Type": "application/json" },
            transformRequest: (data: PlainObject) => JSON.stringify(data),
        };
        return api.delete(`/${this.feature}/${action}`, {
            ...defaultConfig,
            ...config,
            data: requestParamsFilter(params),
        });
    }

    // post请求
    protected $post<T extends CommonResponse>(action: string, params: PlainObject = {}, config: PlainObject = {}): Promise<T> {
        return api.post(`/${this.feature}/${action}`, requestParamsFilter(params), config);
    }

    // post application/json请求
    protected $postJson<T extends CommonResponse>(action: string, params: PlainObject = {}, config: PlainObject = {}): Promise<T> {
        const defaultConfig = {
            headers: { "Content-Type": "application/json" },
            transformRequest: (data: PlainObject) => JSON.stringify(data),
        };
        return this.$post(action, params, { ...defaultConfig, ...config });
    }

    // 上传请求，formdata
    protected $upload<T extends CommonResponse>(
        action: string,
        params: FormData = new FormData(),
        config: PlainObject = {
            headers: { "Content-Type": "multipart/form-data" },
            transformRequest: null,
        }
    ): Promise<T> {
        return api.post(`/${this.feature}/${action}`, params, config);
    }

    // put请求
    protected $put<T extends CommonResponse>(action: string, params: PlainObject = {}, config: PlainObject = {}): Promise<T> {
        return api.put(`/${this.feature}/${action}`, requestParamsFilter(params), config);
    }

    // put application/json请求
    protected $putJson<T extends CommonResponse>(action: string, params: PlainObject = {}, config: PlainObject = {}): Promise<T> {
        const defaultConfig = {
            headers: { "Content-Type": "application/json" },
            transformRequest: (data: PlainObject) => JSON.stringify(data),
        };
        return this.$put(action, params, { ...defaultConfig, ...config });
    }

    // patch请求
    protected $patch<T extends CommonResponse>(action: string, params: PlainObject = {}, config: PlainObject = {}): Promise<T> {
        return api.patch(`/${this.feature}/${action}`, requestParamsFilter(params), config);
    }

    // patch application/json请求
    protected $patchJson<T extends CommonResponse>(action: string, params: PlainObject = {}, config: PlainObject = {}): Promise<T> {
        const defaultConfig = {
            headers: { "Content-Type": "application/json" },
            transformRequest: (data: PlainObject) => JSON.stringify(data),
        };
        return this.$patch(action, params, { ...defaultConfig, ...config });
    }
}
