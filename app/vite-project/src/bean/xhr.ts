/**
 * @author: Tusi
 * @description: xhr相关类型定义
 */
import { PlainObject, PrimitiveType } from "./base";
import { RecordDTO } from "./dto";

// 条件Model
export interface QueryPageModel extends PlainObject {
    pageNo: number;
    pageSize: number;
}

export interface QuerySearchModel extends QueryPageModel {
    keyword: string;
}

export interface QueryHotColumnModel extends PlainObject {
    count: number;
}

export interface QueryCategoryModel extends PlainObject {
    getCount?: boolean;
}

export interface QueryTagModel extends PlainObject {
    getCount?: boolean;
}

export interface QueryCommentPageModel extends QueryPageModel {
    id?: number; // 文章id
}

export interface LoginModel extends PlainObject {
    userName: string;
    password: string;
    captcha: string;
}

export interface UpdateArticlePrivateModel extends PlainObject {
    id: number;
    private: 0 | 1;
}

export interface UpdateArticleDeletedModel extends PlainObject {
    id: number;
    deleted: 0 | 1;
}

export interface UpdateCategoryModel extends PlainObject {
    id: number;
    category_name: string;
    poster: string;
}

// 响应Model
export interface CommonResponse<T = unknown> {
    code: string;
    extra?: PlainObject | null;
    msg?: string;
    data?: T | T[];
}

export interface ArrayResponse<T extends RecordDTO> extends CommonResponse {
    data: T[];
}

export interface PageResponse<T extends RecordDTO> extends CommonResponse {
    data: T[];
    total: number;
}

export interface RecordResponse<T extends RecordDTO> extends CommonResponse {
    data: T;
}

export interface PlainResponse<T extends PrimitiveType> extends CommonResponse {
    data: T;
}
