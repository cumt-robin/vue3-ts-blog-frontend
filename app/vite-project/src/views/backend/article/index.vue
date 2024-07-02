<!--
 * @author: Tusi
 * @description: 审核留言
-->
<template>
    <section class="admin-page-wrapper">
        <a-table
            row-key="id"
            :data-source="articleList"
            :columns="columns"
            :loading="loading"
            :scroll="{ x: 1500 }"
            :pagination="pagination"
        >
            <template #action="{ record, index }">
                <a-space>
                    <a-button
                        size="small"
                        type="primary"
                        ghost
                        :loading="index === activeIndex && isPrivateLoading"
                        @click="onClickPrivate(record, index)"
                        >{{ record.private == 1 ? "公开" : "私密" }}</a-button
                    >
                    <a-button size="small" type="primary" ghost @click="onClickEdit(record)">编辑</a-button>
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
import { message, Modal, Image, Space, Tag } from "ant-design-vue";
import { RouterLink, useRouter } from "vue-router";
import { ColumnProps } from "ant-design-vue/lib/table/interface";
import { ArticleDTO } from "@/bean/dto";
import { articleService } from "@/services/article";
import { useAsyncLoading } from "@/hooks/async";
import { format } from "@/utils/date-utils";
import LogoFallback from "@/assets/img/logo2.png";
import styles from "./index.module.scss";

export default defineComponent({
    name: "AritlceAdmin",
    setup() {
        // router
        const router = useRouter();

        const articleList = ref<ArticleDTO[]>([]);

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
        const handleGetArticles = async () => {
            const res = await articleService.pageAdmin({
                pageNo: pagination.current,
                pageSize: pagination.pageSize,
            });
            articleList.value = res.data;
            pagination.total = res.total;
        };

        const { trigger: search, loading } = useAsyncLoading(handleGetArticles);

        // 直接调用
        search();

        // 处理私密
        const activeIndex = ref(-1);
        const handlePrivate = async (record: ArticleDTO, index: number) => {
            activeIndex.value = index;
            await articleService.updatePrivate({
                id: record.id,
                private: record.private === 0 ? 1 : 0,
            });
            message.success("操作成功");
            search();
        };

        const { trigger: onClickPrivate, loading: isPrivateLoading } = useAsyncLoading(handlePrivate);

        // 处理逻辑删除
        const onClickLogicDel = (record: ArticleDTO) => {
            const isDeleted = record.deleted === 1;
            Modal.confirm({
                title: `确认要执行${isDeleted ? "逻辑恢复" : "逻辑删除"}吗？`,
                onOk: async () => {
                    await articleService.updateDeleted({
                        id: record.id,
                        deleted: isDeleted ? 0 : 1,
                    });
                    message.success("操作成功");
                    search();
                },
            });
        };

        // 处理物理删除
        const onClickDel = (record: ArticleDTO) => {
            Modal.confirm({
                title: "确认要删除吗？",
                onOk: async () => {
                    await articleService.delete(record.id);
                    message.success("操作成功");
                    pagination.current = 1;
                    search();
                },
            });
        };

        const onClickEdit = (record: ArticleDTO) => {
            router.push(`/backend/article/edit/${record.id}`);
        };

        const columns = ref<ColumnProps[]>([
            {
                title: "文章",
                width: "160px",
                dataIndex: "article_name",
                ellipsis: true,
                customRender: ({ record }: { record: ArticleDTO }) => {
                    return <RouterLink to={`/article/${record.id}`}>{record.article_name}</RouterLink>;
                },
            },
            {
                title: "封面",
                width: "110px",
                dataIndex: "poster",
                customRender: ({ text }: { text: string }) => {
                    return <Image src={text} fallback={LogoFallback} wrapperClassName={styles.articlePoster} />;
                },
            },
            {
                title: "作者",
                width: "80px",
                dataIndex: "author",
            },
            {
                title: "阅读量",
                width: "80px",
                dataIndex: "read_num",
            },
            {
                title: "分类",
                width: "200px",
                dataIndex: "categories",
                customRender: ({ record }: { record: ArticleDTO }) => {
                    return (
                        <Space size={2} style="flex-wrap: wrap;row-gap:10px">
                            {record.categories.map((item) => {
                                return (
                                    <RouterLink to={`/category/${item.categoryName}`}>
                                        <Tag color="blue" style="cursor: pointer">
                                            {item.categoryName}
                                        </Tag>
                                    </RouterLink>
                                );
                            })}
                        </Space>
                    );
                },
            },
            {
                title: "标签",
                width: "200px",
                dataIndex: "tags",
                customRender: ({ record }: { record: ArticleDTO }) => {
                    return (
                        <Space size={2} style="flex-wrap: wrap;row-gap:10px">
                            {record.tags.map((item) => {
                                return (
                                    <RouterLink to={`/tag/${item.tagName}`}>
                                        <Tag color="green" style="cursor: pointer">
                                            {item.tagName}
                                        </Tag>
                                    </RouterLink>
                                );
                            })}
                        </Space>
                    );
                },
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
                title: "更新时间",
                width: "140px",
                dataIndex: "update_time",
                customRender: ({ text }: { text: string }) => {
                    return text ? format(text) : "-";
                },
            },
            {
                title: "操作",
                width: "300px",
                key: "action",
                fixed: "right",
                slots: { customRender: "action" },
            },
        ]);

        return {
            articleList,
            columns,
            loading,
            onClickPrivate,
            isPrivateLoading,
            onClickLogicDel,
            onClickDel,
            activeIndex,
            pagination,
            onClickEdit,
        };
    },
});
</script>
