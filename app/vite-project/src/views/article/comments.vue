<!--
 * @author: Tusi
 * @description: 评论区
-->

<template>
    <section class="comments__wrapper">
        <div class="leave-comment" v-if="placeTop">
            <a-input ref="commentInputRef" v-model:value="content" :placeholder="`发表${topic}`" />
            <a-button class="btn-publish" type="primary" size="small" :loading="isPublishLoading" @click="onClickPublish">发布</a-button>
        </div>

        <div v-infinite-scroll="loadMore" :infinite-scroll-distance="50" :infinite-scroll-disabled="!autoLoad" class="comments__body">
            <ul class="comments__list" v-if="comments.length > 0">
                <li v-for="comment in comments" :key="comment.id">
                    <card-comment
                        :comment="comment"
                        :is-active="activeId === comment.id"
                        @userInfoEmpty="onUserInfoEmpty"
                        @setActive="onSetActive"
                    />
                </li>
            </ul>

            <a-empty v-else-if="!isFetchLoading">
                <template #description>
                    暂无{{ topic }}，快来说两句吧！
                    <my-button class="btn-add" type="primary" @click="createComment">创建{{ topic }}</my-button>
                </template>
            </a-empty>

            <a-skeleton :loading="isFetchLoading" active avatar :paragraph="{ rows: 6 }"> </a-skeleton>

            <bottom-tips v-if="isAllLoaded" content="没有更多了" />

            <bottom-tips v-else-if="comments.length > 0">
                <a-button shape="round" type="primary" @click="loadMore">加载更多</a-button>
            </bottom-tips>
        </div>

        <div class="leave-comment" v-if="!placeTop">
            <a-input ref="commentInputRef" v-model:value="content" :placeholder="`发表${topic}`" />
            <a-button class="btn-publish" type="primary" size="small" :loading="isPublishLoading" @click="onClickPublish">发布</a-button>
        </div>

        <a-modal v-model:visible="isEditUserInfoVisible" :footer="null">
            <comment-user-info :topic="topic" @cancel="isEditUserInfoVisible = false" @success="isEditUserInfoVisible = false" />
        </a-modal>
    </section>
</template>

<script lang="ts">
import { ElInfiniteScroll } from "element-plus";
import { computed, defineComponent, reactive, ref } from "vue";
import { useStore } from "vuex";
import { Input, message, Modal } from "ant-design-vue";
import DOMPurify from "dompurify";
import { commentService } from "@/services/comment";
import { CommentDTO } from "@/bean/dto";
import CardComment from "@/components/card/card-comment.vue";
import { useAsyncLoading } from "@/hooks/async";
import { key } from "@/store";
import { app } from "@/main";
import CommentUserInfo from "./comment-user-info.vue";

app.use(ElInfiniteScroll);

export default defineComponent({
    name: "Comments",
    components: {
        CardComment,
        CommentUserInfo,
        [Input.name]: Input,
        [Modal.name]: Modal,
    },
    props: {
        articleId: {
            type: Number,
        },
        topic: {
            type: String,
            default: "评论",
        },
        autoLoad: {
            type: Boolean,
            default: true,
        },
        placeTop: {
            type: Boolean,
            default: false,
        },
    },
    setup(props) {
        // vuex
        const store = useStore(key);

        const comments = ref<CommentDTO[]>([]);

        const activeId = ref(-1);
        const onSetActive = (id: number) => {
            activeId.value = id;
        };

        const total = ref(0);

        const isAllLoaded = computed(() => total.value > 0 && total.value === comments.value.length);

        const pageInfo = reactive({
            pageNo: 1,
            pageSize: 6,
        });

        const handleGetComments = async (isLoadMore = false) => {
            const res = await commentService.page({
                ...pageInfo,
                id: props.articleId,
            });

            if (isLoadMore) {
                comments.value = [...comments.value, ...res.data];
            } else {
                comments.value = res.data;
            }
            total.value = res.total;
        };

        const { trigger: getComments, loading: isFetchLoading } = useAsyncLoading(handleGetComments);

        getComments();

        // 加载更多
        const loadMore = () => {
            if (!isFetchLoading.value && comments.value.length < total.value) {
                pageInfo.pageNo++;
                getComments(true);
            }
        };

        // 评论用户信息
        const commentUserInfo = computed(() => store.state.commentUserInfo);
        const isEditUserInfoVisible = ref(false);

        // 没有评论用户信息，先提示用户录入信息
        const remindCreateUserInfo = () => {
            message.warning(`请在${props.topic}前填写部分必要信息，我们不会公开您的私密信息！`);
            isEditUserInfoVisible.value = true;
        };

        const onUserInfoEmpty = () => {
            remindCreateUserInfo();
        };

        // 评论
        const content = ref("");
        const commentInputRef = ref();
        const createComment = () => {
            commentInputRef.value.focus();
        };
        const handlePublish = async () => {
            // 首先校验有没有用户信息
            if (!commentUserInfo.value) {
                remindCreateUserInfo();
                return;
            }
            if (!content.value) {
                // 必填校验
                message.warning("您还未输入任何内容！");
                return;
            }
            const purifiedContent = DOMPurify.sanitize(content.value);
            if (!purifiedContent) {
                // 输入了非法的内容
                message.warning("您的输入内容无效，请重新输入合法内容！");
                return;
            }

            // 提交评论
            const params = {
                article_id: props.articleId,
                // 用article_id来区分是留言板还是文章评论，留言是没有文章id的，而文章评论是有的
                content: purifiedContent,
                // 默认是未审核状态
                approved: 0,
                // 回访url
                jump_url: window.location.href,
                // 用户信息
                ...store.state.commentUserInfo,
            };

            await commentService.add(params);
            // 重置输入内容，防止重复提交
            content.value = "";
            message.success(`您的${props.topic}已经提交成功，待审核后即可生效！`);
        };

        const { trigger: onClickPublish, loading: isPublishLoading } = useAsyncLoading(handlePublish);

        return {
            comments,
            isFetchLoading,
            createComment,
            loadMore,
            isAllLoaded,
            content,
            onClickPublish,
            isPublishLoading,
            isEditUserInfoVisible,
            commentInputRef,
            onUserInfoEmpty,
            activeId,
            onSetActive,
        };
    },
});
</script>

<style lang="scss" scoped>
.comments__wrapper {
    display: flex;
    flex-direction: column;
    flex: 1;
}

.comments__body {
    overflow: auto;
    flex: 1;
    padding: 20px;
}

.comments__list {
    > li + li {
        margin-top: 20px;
    }
}

:deep(.btn-add) {
    margin: 20px auto;
    display: block;
}

.leave-comment {
    display: flex;
    align-items: center;
    padding: 12px 20px;
    box-shadow: 0 -1px 10px 0 rgba(0, 0, 0, 0.1);
    z-index: 2;
}

:deep(.btn-publish) {
    margin-left: 10px;
}
</style>
