<!--
 * @author: Tusi
 * @description: 热门栏目
-->
<template>
    <a-card class="card-hot" hoverable :loading="loading">
        <template #title>
            <div class="clearfix">
                <span>热门推荐</span>
            </div>
        </template>

        <ul class="hot-list" v-if="hotList.length > 0">
            <li v-for="article in hotList" :key="article.id" class="clearfix">
                <router-link :to="`/article/${article.id}`">
                    <el-image class="poster" :src="article.poster" fit="cover" lazy />
                    <div class="text-wrapper">
                        <h3 class="ellipsis" :title="article.article_name">
                            {{ article.article_name }}
                        </h3>
                        <span>阅读&nbsp;{{ article.read_num }}</span>
                    </div>
                </router-link>
            </li>
        </ul>

        <a-empty v-else />
    </a-card>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { Card } from "ant-design-vue";
import { ArticleDTO } from "@/bean/dto";
import { articleService } from "@/services/article";
import { useAsyncLoading } from "@/hooks/async";

export default defineComponent({
    name: "HotColumn",
    components: {
        [Card.name]: Card,
    },
    setup() {
        const hotList = ref<ArticleDTO[]>([]);

        const handleGetHotList = async () => {
            const res = await articleService.topRead({
                count: 6,
            });
            hotList.value = res.data;
        };

        const { trigger: getHotList, loading } = useAsyncLoading(handleGetHotList);

        getHotList();

        return {
            loading,
            hotList,
        };
    },
});
</script>

<style lang="scss" scoped>
.card-hot {
    margin: 36px 24px;
    box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
    :deep(.ant-card-head-title) {
        padding: 12px 0;
    }
}
.hot-list {
    > li + li {
        margin-top: 10px;
    }
}
:deep(.poster) {
    float: left;
    width: 60px;
    height: 60px;
}
.text-wrapper {
    margin-left: 70px;
    > h3 {
        margin: 0 0 10px 0;
        font-size: 14px;
        color: #333;
        font-weight: 700;
    }
    > span {
        font-size: 10px;
        color: #666;
    }
}

@media screen and (min-width: 992px) {
    .card-hot {
        width: 800px;
        // 处理 deep 优先问题
        margin: 36px auto !important;
    }
}
</style>
