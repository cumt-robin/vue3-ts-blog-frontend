<!--
 * @author: Tusi
 * @description: 分页查询未审核的评论下的回复
-->
<template>
    <section class="admin-page-wrapper">
        <a-table row-key="id" :data-source="replyList" :columns="columns" :loading="loading" :scroll="{ x: 1500 }" :pagination="pagination">
            <template #action="{ record }">
                <a-space>
                    <a-button size="small" type="primary" ghost @click="onCommitReview(record, 1)">通过</a-button>
                    <a-button size="small" type="danger" ghost @click="onCommitReview(record, 2)">不通过</a-button>
                </a-space>
            </template>
        </a-table>
    </section>
</template>

<script lang="tsx">
import { defineComponent, reactive, ref } from "vue";
import { message, Modal, Image } from "ant-design-vue";
import { RouterLink } from "vue-router";
import { ReplyDTO } from "@/bean/dto";
import { useAsyncLoading } from "@/hooks/async";
import { replyService } from "@/services/reply";
import { format } from "@/utils/date-utils";
import CommentAvatarFallback from "@/assets/img/comment-avatar.svg";

export default defineComponent({
    name: "ReviewCommentReply",
    setup() {
        const replyList = ref<ReplyDTO[]>([]);

        const pagination = reactive({
            current: 1,
            pageSize: 10,
            total: 0,
            showTotal: (total: number) => `共计${total}条`,
            onChange: (page: number) => {
                pagination.current = page;
                search();
            },
        });

        // 分页查询
        const handleGetReplys = async () => {
            const res = await replyService.unreviewdReplyPage({
                type: 1, // 1代表评论
                pageNo: pagination.current,
                pageSize: pagination.pageSize,
            });
            replyList.value = res.data;
            pagination.total = res.total;
        };

        const { trigger: search, loading } = useAsyncLoading(handleGetReplys);

        // 直接调用
        search();

        // 提交审核
        const onCommitReview = (record: ReplyDTO, approved: 1 | 2) => {
            const action = approved === 1 ? "通过" : "不通过";
            Modal.confirm({
                title: `确认要执行${action}操作吗？`,
                onOk: async () => {
                    await replyService.review({
                        id: record.id,
                        approved,
                        email: record.email,
                        content: record.content,
                        jump_url: record.jump_url,
                    });
                    message.success("操作成功");
                    search();
                },
            });
        };

        const columns = ref([
            {
                title: "昵称",
                width: "120px",
                dataIndex: "nick_name",
            },
            {
                title: "头像",
                width: "100px",
                dataIndex: "avatar",
                customRender: ({ text }: { text: string }) => {
                    return <Image src={text || ""} fallback={CommentAvatarFallback} wrapperClassName="comment-avatar" />;
                },
            },
            {
                title: "回复内容",
                width: "160px",
                dataIndex: "content",
            },
            {
                title: "回复的文章",
                width: "160px",
                dataIndex: "article_name",
                customRender: ({ text, record }: { text: string; record: ReplyDTO }) => {
                    return <RouterLink to={`/article/${record.article_id}`}>{text}</RouterLink>;
                },
            },
            {
                title: "上一级回复内容",
                width: "180px",
                dataIndex: "reply_to_content",
            },
            {
                title: "回复的评论内容",
                width: "180px",
                dataIndex: "comment_content",
            },
            {
                title: "邮箱",
                width: "160px",
                dataIndex: "email",
            },
            {
                title: "个人网站",
                width: "160px",
                dataIndex: "site_url",
            },
            {
                title: "创建时间",
                width: "160px",
                dataIndex: "create_time",
                customRender: ({ text }: { text: string }) => {
                    return format(text);
                },
            },
            {
                title: "操作",
                width: "180px",
                key: "action",
                fixed: "right",
                slots: { customRender: "action" },
            },
        ]);

        return {
            replyList,
            columns,
            loading,
            onCommitReview,
            pagination,
        };
    },
});
</script>

<style lang="scss" scoped src="@/views/backend/styles/avatar.scss"></style>
