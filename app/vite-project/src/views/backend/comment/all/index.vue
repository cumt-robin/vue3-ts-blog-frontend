<!--
 * @author: Tusi
 * @description: 所有评论
-->
<template>
    <section class="admin-page-wrapper">
        <a-table
            row-key="id"
            :data-source="commentList"
            :columns="columns"
            :loading="loading"
            :scroll="{ x: 1500 }"
            :pagination="pagination"
        >
            <template #action="{ record }">
                <a-space>
                    <a-button size="small" :type="record.deleted == 1 ? 'primary' : 'danger'" ghost @click="onClickLogicDel(record)">{{
                        record.deleted == 1 ? "逻辑恢复" : "逻辑删除"
                    }}</a-button>
                    <a-button size="small" type="danger" ghost @click="onClickDel(record)">物理删除</a-button>
                </a-space>
            </template>
        </a-table>
    </section>
</template>

<script lang="tsx">
import { defineComponent, reactive, ref } from "vue";
import { message, Modal, Image } from "ant-design-vue";
import { RouterLink } from "vue-router";
import { CommentDTO } from "@/bean/dto";
import { useAsyncLoading } from "@/hooks/async";
import { commentService } from "@/services/comment";
import { format } from "@/utils/date-utils";
import { approvedFormatter } from "@/utils/formatter";
import CommentAvatarFallback from "@/assets/img/comment-avatar.svg";

export default defineComponent({
    name: "AllMessage",
    setup() {
        const commentList = ref<CommentDTO[]>([]);

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
        const handleGetComments = async () => {
            const res = await commentService.pageAdmin({
                pageNo: pagination.current,
                pageSize: pagination.pageSize,
                type: 1, // 1代表是文章评论
            });
            commentList.value = res.data;
            pagination.total = res.total;
        };

        const { trigger: search, loading } = useAsyncLoading(handleGetComments);

        // 直接调用
        search();

        // 处理逻辑删除
        const onClickLogicDel = (record: CommentDTO) => {
            const isDeleted = record.deleted === 1;
            Modal.confirm({
                title: `确认要执行${isDeleted ? "逻辑恢复" : "逻辑删除"}吗？`,
                onOk: async () => {
                    await commentService.update({
                        id: record.id,
                        deleted: isDeleted ? 0 : 1,
                    });
                    message.success("操作成功");
                    search();
                },
            });
        };

        // 处理物理删除
        const onClickDel = (record: CommentDTO) => {
            Modal.confirm({
                title: "确认要删除吗？",
                onOk: async () => {
                    await commentService.delete(record.id);
                    message.success("操作成功");
                    pagination.current = 1;
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
                title: "评论内容",
                width: "180px",
                dataIndex: "content",
            },
            {
                title: "评论的文章",
                width: "180px",
                dataIndex: "article_name",
                customRender: ({ text, record }: { text: string; record: CommentDTO }) => {
                    return <RouterLink to={`/article/${record.article_id}`}>{text}</RouterLink>;
                },
            },
            {
                title: "审核状态",
                width: "120px",
                dataIndex: "approved",
                customRender: ({ text }: { text: 1 | 0 }) => {
                    return approvedFormatter(text);
                },
            },
            {
                title: "邮箱",
                width: "140px",
                dataIndex: "email",
            },
            {
                title: "个人网站",
                width: "160px",
                dataIndex: "site_url",
            },
            {
                title: "创建时间",
                width: "140px",
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
            commentList,
            columns,
            loading,
            onClickLogicDel,
            onClickDel,
            pagination,
        };
    },
});
</script>

<style lang="scss" scoped src="@/views/backend/styles/avatar.scss"></style>
