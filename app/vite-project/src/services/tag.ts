/**
 * @author: Tusi
 * @description: 标签服务
 */
import { ApiService } from "@/services/index";
import { ArrayResponse, PageResponse, QueryPageModel, QueryTagModel } from "@/bean/xhr";
import { TagDTO } from "@/bean/dto";

class TagService extends ApiService {
    public all(params: QueryTagModel) {
        return this.$get<ArrayResponse<TagDTO>>("all", params);
    }

    public adminPage(params?: QueryPageModel) {
        return this.$get<PageResponse<TagDTO>>("admin/page", params);
    }

    public fuzzy(params: { wd: string }) {
        return this.$get<ArrayResponse<TagDTO>>("fuzzy", params);
    }
}

export const tagService = new TagService("tag");
