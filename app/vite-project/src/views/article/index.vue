<!--
 * @author: Tusi
 * @description: 文章详情
-->
<template>
    <base-layout>
        <template #default>
            <a-skeleton :loading="loading" active avatar :paragraph="{ rows: 20 }">
                <article v-if="article">
                    <header class="article__header">
                        <img class="avatar" src="@/assets/img/avatar.jpg" />
                        <div class="article__infos">
                            <span class="author">Tusi</span>
                            <sup class="role-tag">博主</sup>
                            <div>
                                <time>发布于{{ formattedTime }}</time>
                                <span class="read_total">阅读&nbsp;&nbsp;{{ article.read_num }}</span>
                            </div>
                        </div>
                    </header>
                    <main class="article__main">
                        <el-image :src="article.poster" class="article__poster" fit="cover" />
                        <h2>
                            {{ article.article_name }}
                        </h2>
                        <section class="md-preview" v-html="purifiedContent" @click="onClickRichContent"></section>
                    </main>

                    <div class="copyright">
                        <p>
                            本文链接：<a :href="postLink">{{ postLink }}</a>
                            <br />
                            版权声明：本文由<strong>Tusi</strong>原创，发表于{{ formattedTime }}，如需转载，请联系作者授权！
                        </p>
                    </div>

                    <div class="relation-info">
                        <div>
                            分类：
                            <router-link v-for="item in article.categories" :key="item.id" :to="`/category/${item.categoryName}`">
                                <a-tag>{{ item.categoryName }}</a-tag>
                            </router-link>
                        </div>

                        <div style="margin-top: 20px">
                            标签：
                            <router-link v-for="item in article.tags" :key="item.id" :to="`/tag/${item.tagName}`">
                                <a-tag>{{ item.tagName }}</a-tag>
                            </router-link>
                        </div>
                    </div>

                    <div class="reward__wrapper">
                        <p class="reward__tips">您的支持将鼓励我继续创作！</p>
                        <a-button type="primary" @click="isRewardVisible = true">赏</a-button>
                    </div>
                </article>

                <a-empty v-else />
            </a-skeleton>

            <div class="pre-next-wrap">
                <div class="prev" v-if="prevArticle">
                    <SwapLeftOutlined />
                    <span>上一篇：</span>
                    <router-link :to="`/article/${prevArticle.id}`">
                        <span>{{ prevArticle.article_name }}</span>
                    </router-link>
                </div>
                <div class="next" v-if="nextArticle">
                    <SwapRightOutlined />
                    <span>下一篇：</span>
                    <router-link :to="`/article/${nextArticle.id}`">
                        <span>{{ nextArticle.article_name }}</span>
                    </router-link>
                </div>
            </div>

            <div class="comment__trigger">
                <a-button type="primary" @click="isCommentVisible = true">查看评论</a-button>
            </div>

            <a-modal v-model:visible="isRewardVisible" :footer="null">
                <div class="reward-popup__wrapper">
                    <p class="reward__tips">感谢您的赞赏支持！</p>
                    <img class="payme" src="@/assets/img/wechat_payme.jpg" />
                </div>
            </a-modal>

            <a-drawer width="84%" class="drawer-comment" :visible="isCommentVisible" @close="isCommentVisible = false">
                <template #title>
                    <span>评论区</span>
                    <EditOutlined style="margin-left: 10px" @click="showUserInfoForm" />
                </template>

                <comments ref="commentsRef" :article-id="articleId" />
            </a-drawer>

            <a-image :src="previewImgSrc" style="display: none" ref="previewRef" />
        </template>

        <template #aside>
            <icon-svg class="icon--aside" icon="edit" @click="goToEdit" v-if="isAuthed"></icon-svg>
            <icon-svg class="icon--aside icon-message" icon="leave-message" @click="isCommentVisible = true"></icon-svg>
        </template>
    </base-layout>
</template>

<script>
import marked from "marked";
import mermaid from "mermaid";
// hljs 按需加载
import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import html from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";
import shell from "highlight.js/lib/languages/shell";
import json from "highlight.js/lib/languages/json";
import plaintext from "highlight.js/lib/languages/plaintext";
// 皮肤
import "highlight.js/styles/atom-one-dark.css";
import DOMPurify from "dompurify";
import { useRoute, useRouter } from "vue-router";
import { computed, defineComponent, onBeforeUnmount, onMounted, ref } from "vue";
import { maxBy, minBy } from "lodash-es";
import { SwapLeftOutlined, SwapRightOutlined, EditOutlined } from "@ant-design/icons-vue";
import { useStore } from "vuex";
import { Drawer, Modal, Tag } from "ant-design-vue";
import { setScrollTop } from "@/utils/dom";
import { articleService } from "@/services/article";
import { useAsyncLoading } from "@/hooks/async";
import { format } from "@/utils/date-utils";
import { key } from "@/store";
import Comments from "./comments.vue";

hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("html", html);
hljs.registerLanguage("css", css);
hljs.registerLanguage("shell", shell);
hljs.registerLanguage("json", json);
hljs.registerLanguage("plaintext", plaintext);

export default defineComponent({
    name: "Article",
    components: {
        SwapLeftOutlined,
        SwapRightOutlined,
        EditOutlined,
        Comments,
        [Drawer.name]: Drawer,
        [Modal.name]: Modal,
        [Tag.name]: Tag,
    },
    setup() {
        // vuex
        const store = useStore(key);
        const isAuthed = computed(() => !!store.getters.isAuthed);

        // route
        const route = useRoute();
        const router = useRouter();

        const articleId = computed(() => +route.params.id);

        const article = ref();

        const formattedTime = computed(() => article.value && format(article.value.create_time, "YYYY年M月D日"));

        const purifiedContent = ref("");

        let reportTimer = null;

        const getArticleDetail = async () => {
            const res = await articleService.detail(articleId.value);

            article.value = res.data;

            const markedContent = marked(res.data.article_text);

            // 防XSS
            purifiedContent.value = DOMPurify.sanitize(markedContent);

            startReportTimer();

            // 此处不能用 await sleep，否则会影响 loading
            setTimeout(() => {
                mermaid.initialize({
                    theme: "default",
                    startOnLoad: false,
                });

                mermaid.run();
            }, 0);
        };

        const { trigger: getDetail, loading } = useAsyncLoading(getArticleDetail);

        onMounted(() => {
            setScrollTop();
            setMarkedOptions();
            getDetail();
            getPreAndNexArticle();
        });

        onBeforeUnmount(() => {
            clearReportTimer();
        });

        const startReportTimer = () => {
            reportTimer = setTimeout(() => {
                articleService.updateReadNum(article.value.id);
            }, 5000);
        };

        const clearReportTimer = () => {
            if (reportTimer) {
                clearTimeout(reportTimer);
                reportTimer = null;
            }
        };

        const setMarkedOptions = () => {
            const renderer = new marked.Renderer();
            renderer.link = function customLink(href, title, text) {
                return `<a class="link" rel="nofollow" href="${href}" title="${text}">${text}</a>`;
            };
            renderer.image = function customImage(href, title, text) {
                return `<div class="img-wrapper" title="${text}">
                    <img src="${href}" alt="${text}">
                </div>`;
            };
            renderer.code = function customCode(code, language) {
                if (language === "mermaid") {
                    return `<div class="mermaid">${code}</div>`;
                }
                return `<pre><code>${code}</code></pre>`;
            };
            marked.setOptions({
                renderer,
                highlight(code, lang) {
                    const language = hljs.getLanguage(lang) ? lang : "plaintext";
                    return hljs.highlight(code, { language }).value;
                },
                pedantic: false,
                gfm: true,
                breaks: false,
                sanitize: false,
                smartLists: true,
                smartypants: false,
                xhtml: false,
            });
        };

        const previewImgSrc = ref();
        const previewRef = ref();

        const onClickRichContent = (e) => {
            if (e.target.tagName === "A") {
                e.preventDefault();
                router.push(`/jumpout/${encodeURIComponent(e.target.href)}`);
            } else if (e.target.tagName === "IMG") {
                e.preventDefault();
                previewImgSrc.value = e.target.src;
                previewRef.value.$el.nextElementSibling.click();
            }
        };

        // 前后文章
        const prevArticle = ref();
        const nextArticle = ref();

        const getPreAndNexArticle = async () => {
            const res = await articleService.neighbors(articleId.value);
            const results = res.data;
            if (results.length > 0) {
                switch (results.length) {
                    case 1:
                        const singleArticle = results[0];
                        singleArticle.id < articleId.value ? (prevArticle.value = singleArticle) : (nextArticle.value = singleArticle);
                        break;
                    case 2:
                        prevArticle.value = minBy(results, "id");
                        nextArticle.value = maxBy(results, "id");
                        break;
                    default:
                        break;
                }
            }
        };

        // 赞赏
        const isRewardVisible = ref(false);

        // 评论
        const isCommentVisible = ref(false);

        // 修改个人信息
        const commentsRef = ref();
        const showUserInfoForm = () => {
            commentsRef.value.isEditUserInfoVisible = true;
        };

        // 去编辑页
        const goToEdit = () => {
            router.push(`/backend/article/edit/${articleId.value}`);
        };

        return {
            isAuthed,
            article,
            articleId,
            purifiedContent,
            loading,
            formattedTime,
            prevArticle,
            nextArticle,
            postLink: window.location.href,
            isRewardVisible,
            isCommentVisible,
            commentsRef,
            showUserInfoForm,
            goToEdit,
            onClickRichContent,
            previewImgSrc,
            previewRef,
        };
    },
});
</script>

<style lang="scss" scoped>
.avatar {
    width: 48px;
    border-radius: 50%;
    vertical-align: middle;
}

.article__infos {
    margin-left: 14px;
    display: inline-block;
    vertical-align: top;
    color: #999;
    font-size: 14px;
    .author {
        font-size: 18px;
        font-weight: 700;
        color: #333;
    }
    .role-tag {
        margin-left: 6px;
        background: #1989fa;
        padding: 0 4px;
        border-radius: 4px;
        color: #fff;
        font-size: 12px;
        display: inline-block;
        line-height: 1.5;
    }
    .read_total {
        margin-left: 8px;
    }
}

.article__main {
    > h2 {
        margin: 0 0 0.6em 0;
        font-size: 1.8em;
    }
}

.relation {
    &-info {
        padding-bottom: 40px;
        .ant-tag {
            cursor: pointer;
            border-radius: 2px;
        }
    }
}

:deep(.icon-svg + .icon-svg) {
    margin-left: 0;
}

:deep(.article__poster) {
    margin: 20px 0;
    width: 100%;
    height: 200px;
    transition: transform 0.2s ease-in-out;
    box-shadow: 0 0 6px rgba(109, 43, 43, 0.1), 10px 10px 100px rgba(112, 100, 212, 0.24);
    &:hover {
        transform: scale(1.01);
    }
}

@keyframes pulse {
    0% {
        transform: scale(1);
    }
    100% {
        transform: scale(1.1);
    }
}

.anim-pulse {
    will-change: transform;
    animation: pulse 0.6s ease-in-out infinite alternate;
}

:deep(.icon-message) {
    > svg {
        @extend .anim-pulse;
    }
}

.copyright {
    padding: 20px 0;
    > p {
        padding: 10px;
        color: $color-black;
        background: $color-bg--secondary;
        border-left: 6px solid $color-black;
        > strong {
            font-size: 18px;
            color: $color-primary;
            margin: 0 4px;
        }
    }
}
.reward__wrapper {
    text-align: center;
    padding: 20px 0;
    :deep(.ant-btn) {
        width: 48px;
        height: 48px;
        margin-top: 10px;
        font-size: 18px;
        font-weight: 500;
        border: 0;
        border-radius: 100%;
        line-height: 48px;
        text-align: center;
        padding: 0;
    }
}

.reward__tips {
    position: relative;
    color: $color-info;
    font-weight: 600;
    padding: 0 24px;
    &::before {
        content: "\201C";
        position: absolute;
        left: 0;
        bottom: 0;
        color: #392570;
    }
    &::after {
        content: "\201D";
        position: absolute;
        right: 0;
        top: 0;
        color: #392570;
        font-size: 45px;
    }
}

.pre-next-wrap {
    margin-top: 10px;
}

.prev,
.next {
    padding: 6px 10px;
    border-radius: 2px;
    box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
}

.prev + .next {
    margin-top: 20px;
}

.reward-popup__wrapper {
    padding: 50px 0 20px;
    text-align: center;
}

.payme {
    margin-top: 20px;
    width: 100%;
}

.comment__trigger {
    text-align: center;
    margin-top: 36px;
}

@media screen and (min-width: 576px) {
    :deep(.article__poster) {
        height: 300px;
    }
}

@media screen and (min-width: 1200px) {
    :deep(.base-layout__main) {
        width: 1000px;
    }
    :deep(.article__poster) {
        height: 420px;
    }
}
</style>
<style lang="scss" scoped src="./md-render.scss"></style>
