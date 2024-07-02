<template>
    <article class="article__wrapper">
        <header class="article__header">
            <ul class="article__infolist">
                <li title="发布日期">
                    <icon-svg class="align-middle" icon="time" />
                    <time class="align-middle">{{ createTime }}</time>
                </li>
                <li title="文章分类">
                    <icon-svg class="align-middle" icon="folder" />
                    <router-link
                        v-for="category in article.categories"
                        :key="category.id"
                        :to="{ name: 'Category', params: { name: category.categoryName } }"
                        class="category align-middle"
                    >
                        <span>{{ category.categoryName }}</span>
                    </router-link>
                </li>
                <li title="阅读量">
                    <icon-svg class="align-middle" icon="eye" />
                    <span class="align-middle">{{ article.read_num }}</span>
                </li>
            </ul>
            <router-link :to="`/article/${article.id}`">
                <h2 class="article-title">
                    {{ article.article_name }}
                </h2>
            </router-link>
        </header>
        <section>
            <router-link :to="`/article/${article.id}`">
                <el-image :src="article.poster" fit="cover" class="article__poster" lazy />
            </router-link>
            <p class="article__summary">{{ article.summary }}</p>
        </section>
        <div class="article__footer">
            <router-link class="read-more" :to="`/article/${article.id}`">
                <span class="read-more__text">继续阅读</span><icon-svg icon="read" class="align-middle" />
            </router-link>
        </div>
    </article>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from "vue";
import { ArticleDTO } from "@/bean/dto";
import { format } from "@/utils/date-utils";

export default defineComponent({
    name: "CardArticle",
    props: {
        article: {
            type: Object as PropType<ArticleDTO>,
            required: true,
        },
    },
    setup(props) {
        const createTime = computed(() => format(props.article.create_time, "YYYY年M月D日"));

        return {
            createTime,
        };
    },
});
</script>

<style lang="scss" scoped>
.article__wrapper {
    padding-bottom: 30px;
    border-bottom: 1px solid #ccc;
    perspective: 400;
    + .article__wrapper {
        margin-top: 30px;
    }
}
.article__header {
    font-size: 14px;
    color: #7a7a7a;
    font-weight: 700;
    .article__infolist {
        > li {
            display: inline-block;
            + li {
                margin-left: 20px;
            }
            .category + .category::before {
                content: ", ";
            }
        }
    }
    .icon-svg {
        margin-right: 4px;
    }
    h2 {
        color: #333;
        font-size: 1.5em;
        font-weight: 700;
    }
}

.article__summary {
    font-size: 16px;
    margin: 20px 0;
}

:deep(.article__poster) {
    width: 100%;
    height: 200px;
    transition: transform 0.2s ease-in-out;
    box-shadow: 0 0 6px rgba(109, 43, 43, 0.1), 10px 10px 100px rgba(112, 100, 212, 0.24);
    &:hover {
        transform: scale(1.01);
    }
}
.read-more {
    display: inline-block;
    line-height: 0;
    color: #1761c5;
    font-weight: 700;
    padding: 6px 10px;
    background: #eee;
    border-radius: 4px;
    > .read-more__text {
        vertical-align: middle;
        font-size: 16px;
        margin-right: 4px;
    }
}

@media screen and (min-width: 576px) {
    :deep(.article__poster) {
        height: 360px;
    }
}
</style>
