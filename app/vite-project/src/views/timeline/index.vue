<!--
 * @author: Tusi
 * @description: 时间轴
-->
<template>
    <base-layout>
        <template v-if="articleList.length > 0">
            <a-timeline>
                <a-timeline-item v-for="article in articleList" :key="article.id" color="#2b82a8">
                    <router-link :to="`/article/${article.id}`">
                        <a-card class="timeline-card">
                            <el-image :src="article.poster" class="timeline-card__poster" fit="cover" lazy />
                            <div class="timeline-card__info">
                                <time>{{ article.formattedCreateTime }}</time>
                                <h4 class="ellipsis" :title="article.article_name">{{ article.article_name }}</h4>
                                <router-link
                                    v-for="category in article.categories"
                                    :key="category.id"
                                    :to="{ name: 'Category', params: { name: category.categoryName } }"
                                    class="category"
                                >
                                    <span>{{ category.categoryName }}</span>
                                </router-link>
                            </div>
                        </a-card>
                    </router-link>
                </a-timeline-item>
            </a-timeline>
        </template>

        <template v-else-if="!loading">
            <a-empty />
        </template>

        <a-skeleton :loading="loading" active :paragraph="{ rows: 6 }" />

        <bottom-tips>
            <a-button shape="round" type="primary" @click="loadMore" v-if="articleList.length < total">加载更多</a-button>
            <span v-else>没有更多了</span>
        </bottom-tips>
    </base-layout>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from "vue";
import { Card, Timeline } from "ant-design-vue";
import { ArticleDTO } from "@/bean/dto";
import { articleService } from "@/services/article";
import { useAsyncLoading } from "@/hooks/async";
import { format } from "@/utils/date-utils";

export default defineComponent({
    name: "Timeline",
    components: {
        [Timeline.name]: Timeline,
        [Timeline.Item.name]: Timeline.Item,
        [Card.name]: Card,
    },
    setup() {
        const articleList = ref<ArticleDTO[]>([]);

        const pageInfo = reactive({
            pageNo: 1,
            pageSize: 6,
        });

        const total = ref(0);

        const handleGetArticleList = async (isLoadMore = false) => {
            const res = await articleService.page(pageInfo);
            const mappedData = res.data.map((item) => {
                return {
                    ...item,
                    formattedCreateTime: format(item.create_time),
                };
            });
            if (isLoadMore) {
                articleList.value = [...articleList.value, ...mappedData];
            } else {
                articleList.value = mappedData;
            }
            total.value = res.total;
        };

        const { trigger: getPageList, loading } = useAsyncLoading(handleGetArticleList);

        getPageList();

        // 分页改变
        const loadMore = () => {
            if (articleList.value.length < total.value) {
                pageInfo.pageNo++;
                getPageList(true);
            }
        };

        return {
            loading,
            articleList,
            pageInfo,
            total,
            loadMore,
        };
    },
});
</script>

<style lang="scss" scoped>
:deep(.timeline-card) {
    border: 0;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    .ant-card-body {
        display: flex;
        padding: 10px;
    }

    .timeline-card__poster {
        width: 80px;
        height: 60px;
    }

    .timeline-card__info {
        flex: 1;
        margin-left: 10px;
        font-size: 12px;
        overflow: hidden;

        > time {
            color: #999;
        }

        > h4 {
            margin: 3px 0;
            font-size: 14px;
            line-height: 1.2em;
        }

        .category {
            font-weight: 700;

            + .category::before {
                content: ", ";
            }
        }
    }
}

.no-more {
    font-size: 14px;
    color: #999;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    margin-top: -6px;
}
</style>
