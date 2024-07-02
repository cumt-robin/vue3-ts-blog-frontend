/**
 * @author: Tusi
 * @description: 评论服务
 */
import { ApiService } from "@/services/index";
import { PageResponse, PlainResponse, QueryCommentPageModel, QueryPageModel, RecordResponse } from "@/bean/xhr";
import { CommentDTO } from "@/bean/dto";
import { PlainObject } from "@/bean/base";

class CommentService extends ApiService {
    public page(params: QueryCommentPageModel) {
        return this.$get<PageResponse<CommentDTO>>("page", params);
    }

    public detail(id: number) {
        return this.$get<RecordResponse<CommentDTO>>("detail", { id });
    }

    public add(params: PlainObject) {
        return this.$post("add", params);
    }

    public numberOfPeople() {
        return this.$get<PlainResponse<number>>("number_of_people");
    }

    public total() {
        return this.$get<PlainResponse<number>>("total");
    }

    public pageAdmin(params: QueryPageModel) {
        return this.$get<PageResponse<CommentDTO>>("page_admin", params);
    }

    public update(params: PlainObject) {
        return this.$put("update", params);
    }

    public delete(id: number) {
        return this.$del("delete", { id });
    }

    public pageNotApproved(params: QueryPageModel) {
        return this.$get<PageResponse<CommentDTO>>("page_not_approved", params);
    }

    public review(params: PlainObject) {
        return this.$put("review", params);
    }
}

export const commentService = new CommentService("comment");
