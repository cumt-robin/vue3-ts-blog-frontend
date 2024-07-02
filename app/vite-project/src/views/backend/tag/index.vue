<template>
    <section class="admin-page-wrapper">
        <a-table row-key="id" :data-source="tagList" :columns="columns" :loading="loading" :scroll="{ x: 1500 }" :pagination="pagination">
            <template #action="{ record }">
                <a-space>
                    <a-button size="small" type="primary" ghost @click="onViewArticles(record)">标签下文章</a-button>
                </a-space>
            </template>
        </a-table>
    </section>
</template>

<script lang="tsx">
import { defineComponent, reactive, ref } from "vue";
import { Modal } from "ant-design-vue";
import { useRouter } from "vue-router";
import { TagDTO } from "@/bean/dto";
import { tagService } from "@/services/tag";
import { useAsyncLoading } from "@/hooks/async";
import { format } from "@/utils/date-utils";

export default defineComponent({
    components: {
        [Modal.name]: Modal,
    },
    setup() {
        const router = useRouter();

        const tagList = ref<TagDTO[]>([]);

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
        const handleGetTags = async () => {
            const res = await tagService.adminPage({
                pageNo: pagination.current,
                pageSize: pagination.pageSize,
            });
            tagList.value = res.data;
            pagination.total = res.total;
        };

        const { trigger: search, loading } = useAsyncLoading(handleGetTags);

        // 直接调用
        search();

        const onViewArticles = (record: TagDTO) => {
            router.push(`/tag/${record.tag_name}`);
        };

        const columns = ref([
            {
                title: "标签名称",
                width: "160px",
                dataIndex: "tag_name",
                ellipsis: true,
                fixed: "left",
            },
            {
                title: "文章数量",
                width: "120px",
                dataIndex: "article_count",
                ellipsis: true,
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
                width: "120px",
                key: "action",
                fixed: "right",
                slots: { customRender: "action" },
            },
        ]);

        return {
            tagList,
            columns,
            loading,
            pagination,
            onViewArticles,
        };
    },
});
</script>

<style lang="scss" scoped>
:deep(.ant-table-wrapper) {
    .category-poster {
        width: 160px;
        height: 92px;
        object-fit: contain;
    }
}
</style>
