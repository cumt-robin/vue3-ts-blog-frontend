/**
 * @author: Tusi
 * @description: 回复服务
 */
import { ApiService } from "@/services/index";
import { PlainObject } from "@/bean/base";
import { PageResponse, QueryPageModel } from "@/bean/xhr";
import { ReplyDTO } from "@/bean/dto";

class ReplyService extends ApiService {
    public add(params: PlainObject) {
        return this.$post("add", params);
    }

    public unreviewdReplyPage(params: QueryPageModel) {
        return this.$get<PageResponse<ReplyDTO>>("unreviewd_reply_page", params);
    }

    public review(params: PlainObject) {
        return this.$put("review", params);
    }
}

export const replyService = new ReplyService("reply");
