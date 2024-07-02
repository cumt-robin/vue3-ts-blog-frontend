<template>
    <section class="admin-page-wrapper">
        <a-table
            row-key="id"
            :data-source="categoryList"
            :columns="columns"
            :loading="loading"
            :scroll="{ x: 1500 }"
            :pagination="pagination"
        >
            <template #action="{ record }">
                <a-space>
                    <a-button size="small" type="primary" ghost @click="onClickEdit(record)">编辑</a-button>
                    <a-button size="small" type="primary" ghost @click="onViewArticles(record)">分类下文章</a-button>
                </a-space>
            </template>
        </a-table>

        <a-modal title="编辑分类" v-model:visible="isEditVisible" width="640px" :footer="null">
            <edit v-if="isEditVisible" :row="detailRow" @cancel="isEditVisible = false" @success="onEditSuccess" />
        </a-modal>
    </section>
</template>

<script lang="tsx">
import { defineComponent, reactive, ref } from "vue";
import { Image, Modal } from "ant-design-vue";
import { useRouter } from "vue-router";
import { CategoryDTO } from "@/bean/dto";
import { categoryService } from "@/services/category";
import { useAsyncLoading } from "@/hooks/async";
import { format } from "@/utils/date-utils";
import LogoFallback from "@/assets/img/logo2.png";
import Edit from "./edit.vue";

export default defineComponent({
    components: {
        Edit,
        [Modal.name]: Modal,
    },
    setup() {
        const router = useRouter();

        const categoryList = ref<CategoryDTO[]>([]);

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
        const handleGetCategorys = async () => {
            const res = await categoryService.adminPage({
                pageNo: pagination.current,
                pageSize: pagination.pageSize,
            });
            categoryList.value = res.data;
            pagination.total = res.total;
        };

        const { trigger: search, loading } = useAsyncLoading(handleGetCategorys);

        // 直接调用
        search();

        const isEditVisible = ref(false);

        const detailRow = ref<CategoryDTO>();

        const onClickEdit = (record: CategoryDTO) => {
            detailRow.value = record;
            isEditVisible.value = true;
        };

        const onViewArticles = (record: CategoryDTO) => {
            router.push(`/category/${record.category_name}`);
        };

        const onEditSuccess = () => {
            isEditVisible.value = false;
            search();
        };

        const columns = ref([
            {
                title: "分类名称",
                width: "160px",
                dataIndex: "category_name",
                ellipsis: true,
                fixed: "left",
            },
            {
                title: "封面",
                width: "140px",
                dataIndex: "poster",
                customRender: ({ text }: { text: string }) => {
                    return <Image class="category-poster" src={text} fallback={LogoFallback} />;
                },
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
                width: "200px",
                key: "action",
                fixed: "right",
                slots: { customRender: "action" },
            },
        ]);

        return {
            categoryList,
            columns,
            loading,
            isEditVisible,
            detailRow,
            pagination,
            onClickEdit,
            onEditSuccess,
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
