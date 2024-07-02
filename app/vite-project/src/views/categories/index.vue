<!--
 * @author: Tusi
 * @description: 所有分类
-->
<template>
    <base-layout>
        <h2>文章分类</h2>

        <a-skeleton :loading="loading" active :paragraph="{ rows: 10 }">
            <a-row class="category__list" :gutter="16" v-if="categoryList.length > 0">
                <a-col v-for="category in categoryList" :key="category.id" :span="8" :md="6" :lg="4">
                    <router-link class="block" :to="{ name: 'Category', params: { name: category.category_name } }">
                        <a-badge class="block" :count="category.category_count">
                            <div class="category__card">
                                <el-image :src="category.poster || defaultCategoryPoster" class="category__poster" fit="contain" lazy />
                                <div class="category__title">
                                    {{ category.category_name }}
                                </div>
                            </div>
                        </a-badge>
                    </router-link>
                </a-col>
            </a-row>

            <template v-else>
                <a-empty />
            </template>
        </a-skeleton>
    </base-layout>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { Badge } from "ant-design-vue";
import { CategoryDTO } from "@/bean/dto";
import { categoryService } from "@/services/category";
import { useAsyncLoading } from "@/hooks/async";

export default defineComponent({
    name: "Category",
    components: {
        [Badge.name]: Badge,
    },
    setup() {
        const categoryList = ref<CategoryDTO[]>([]);

        const handleGetAllCategory = async () => {
            const res = await categoryService.all({ getCount: true });
            categoryList.value = res.data;
        };

        const { trigger: getCategoryList, loading } = useAsyncLoading(handleGetAllCategory);

        // 初始化直接调用接口
        getCategoryList();

        return {
            loading,
            categoryList,
            defaultCategoryPoster: require("@/assets/img/default_category.svg"),
        };
    },
});
</script>

<style lang="scss" scoped>
:deep(.base-layout__main) {
    padding: 24px 18px;
    background-color: #f5f5f5;
}
:deep(.card-hot) {
    margin: 24px 18px;
}
h2 {
    margin: 0;
    text-align: center;
}

.category__card {
    position: relative;
    margin-top: 20px;
    background-color: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
}
:deep(.category__poster) {
    width: 100%;
    height: 120px;
}
.category__title {
    text-align: center;
    font-size: 14px;
    color: #666;
    padding-bottom: 4px;
}

@media screen and (min-width: 992px) {
    :deep(.base-layout__main) {
        background-color: transparent;
    }
}
</style>
