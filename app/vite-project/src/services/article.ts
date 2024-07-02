/**
 * @author: Tusi
 * @description: 文章服务
 */
import { ApiService } from "@/services/index";
import {
    ArrayResponse,
    PageResponse,
    QueryPageModel,
    QuerySearchModel,
    QueryHotColumnModel,
    RecordResponse,
    UpdateArticlePrivateModel,
    UpdateArticleDeletedModel,
} from "@/bean/xhr";
import { ArticleDTO } from "@/bean/dto";
import { PlainObject } from "@/bean/base";

class ArticleService extends ApiService {
    public page(params: QueryPageModel) {
        return this.$get<PageResponse<ArticleDTO>>("page", params);
    }

    public pageAdmin(params: QueryPageModel) {
        return this.$get<PageResponse<ArticleDTO>>("page_admin", params);
    }

    public detail(id: number) {
        return this.$get<RecordResponse<ArticleDTO>>("detail", { id });
    }

    public pageByCategory(params: QuerySearchModel) {
        return this.$get<PageResponse<ArticleDTO>>("page_by_category", params);
    }

    public pageByTag(params: QuerySearchModel) {
        return this.$get<PageResponse<ArticleDTO>>("page_by_tag", params);
    }

    public updateReadNum(id: number) {
        return this.$put("update_read_num", { id });
    }

    public topRead(params: QueryHotColumnModel) {
        return this.$get<ArrayResponse<ArticleDTO>>("top_read", params);
    }

    public neighbors(id: number) {
        return this.$get<ArrayResponse<ArticleDTO>>("neighbors", { id });
    }

    public updatePrivate(params: UpdateArticlePrivateModel) {
        return this.$put("update_private", params);
    }

    public updateDeleted(params: UpdateArticleDeletedModel) {
        return this.$put("update_deleted", params);
    }

    public delete(id: number) {
        return this.$del("delete", { id });
    }

    public add(params: PlainObject) {
        return this.$postJson("add", params);
    }

    public update(params: PlainObject) {
        return this.$putJson("update", params);
    }
}

export const articleService = new ArticleService("article");
