<template>
    <div class="comment__wrapper">
        <el-image class="comment__avatar" :src="formattedComment.avatar" lazy>
            <template #error>
                <el-image :src="avatarFallback" />
            </template>
        </el-image>
        <div class="comment__info">
            <a
                class="comment__user"
                target="_blank"
                rel="nofollow"
                :href="formattedComment.jumpoutMiddleLink"
                v-if="formattedComment.site_url"
                >{{ formattedComment.nick_name }}</a
            >
            <span class="comment__user" v-else>{{ formattedComment.nick_name }}</span>

            <span class="comment__time">{{ formattedComment.fomattedTime }}</span>
            <div class="comment__content">{{ formattedComment.content }}</div>
            <my-button class="btn-reply" icon="reply" size="small" @click="showReplyRoot">回复</my-button>

            <div class="reply-form" v-if="isActive && isShowReplyInput">
                <a-input ref="rootReplyInputRef" v-model:value="replyRootContent" size="small" :placeholder="replyPlaceHolder" />
                <a-button class="btn-confirm-reply" type="primary" size="small" :loading="isReplyRootLoading" @click="onClickReplyRoot"
                    >发布</a-button
                >
            </div>

            <div class="reply__list" v-if="formattedComment.replies.length > 0">
                <div class="reply__card" v-for="reply in formattedComment.replies" :key="reply.id">
                    <div class="reply__header">
                        <el-image class="reply__avatar" :src="reply.avatar" lazy>
                            <template #error>
                                <el-image :src="replyAvatarFallback" />
                            </template>
                        </el-image>

                        <div class="reply__subinfo">
                            <span class="reply__info">{{ reply.nick_name }}回复{{ reply.reply_name || formattedComment.nick_name }}</span>
                            <span class="reply__time">{{ reply.fomattedTime }}</span>
                        </div>
                    </div>

                    <div class="reply__content">{{ reply.content }}</div>
                    <my-button class="btn-reply" icon="reply" size="small" @click="showReplySub(reply)">回复</my-button>

                    <div class="reply-form" v-if="isActive && reply.id === activeSubId && isShowSubReplyInput">
                        <a-input ref="subReplyInputRef" v-model:value="subReplyForm.content" size="small" :placeholder="replyPlaceHolder" />
                        <a-button
                            class="btn-confirm-reply"
                            type="primary"
                            size="small"
                            :loading="isReplySubLoading"
                            @click="onClickReplySub"
                            >发布</a-button
                        >
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/no-var-requires */

import { computed, defineComponent, nextTick, PropType, reactive, ref } from "vue";
import dayjs from "dayjs";
import { useStore } from "vuex";
import { Input, message, Modal } from "ant-design-vue";
import DOMPurify from "dompurify";
import { CommentDTO, ReplyDTO } from "@/bean/dto";
import { format } from "@/utils/date-utils";
import { key } from "@/store";
import { useAsyncLoading } from "@/hooks/async";
import { replyService } from "@/services/reply";

export default defineComponent({
    name: "CardComment",
    components: {
        [Input.name]: Input,
    },
    emits: ["userInfoEmpty", "setActive"],
    props: {
        comment: {
            type: Object as PropType<CommentDTO>,
            required: true,
        },
        isActive: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        // vuex
        const store = useStore(key);

        // 评论用户信息
        const commentUserInfo = computed(() => store.state.commentUserInfo);

        // 一级回复相关
        const replyRootContent = ref("");

        const replyPlaceHolder = ref("");

        const isShowReplyInput = ref(false);

        const rootReplyInputRef = ref();

        // 显示一级回复
        const showReplyRoot = () => {
            if (!commentUserInfo.value) {
                emit("userInfoEmpty");
            } else {
                emit("setActive", props.comment.id);
                replyPlaceHolder.value = `@ ${props.comment.nick_name}`;
                isShowReplyInput.value = true;
                isShowSubReplyInput.value = false;
                nextTick(() => {
                    rootReplyInputRef.value.focus();
                });
            }
        };

        // 对评论做回复
        const handleReplyRoot = async () => {
            if (!replyRootContent.value) {
                // 必填校验
                message.warning("您还未输入任何内容！");
                return;
            }
            const purifiedContent = DOMPurify.sanitize(replyRootContent.value);
            if (!purifiedContent) {
                // 输入了非法的内容
                message.warning("您的输入内容无效，请重新输入合法内容！");
                return;
            }
            await replyService.add({
                // 回复的评论id
                comment_id: props.comment.id,
                // 父级回复的id，这里是一级回复表单，所以为null即可
                parent_id: null,
                // 默认是待审核状态
                approved: 0,
                // 记录网页的url，用于发邮件时附上链接
                jump_url: window.location.href,
                // 文章id
                article_id: props.comment.article_id,
                // 回复内容
                content: purifiedContent,
                // 用户信息
                ...store.state.commentUserInfo,
            });

            Modal.success({
                title: "温馨提示",
                content: "您的回复已经提交成功，待审核后即可生效！",
            });

            isShowReplyInput.value = false;
            replyRootContent.value = "";
        };

        const { trigger: onClickReplyRoot, loading: isReplyRootLoading } = useAsyncLoading(handleReplyRoot);

        // 二级回复相关
        const isShowSubReplyInput = ref(false);

        const subReplyInputRef = ref();

        const activeSubId = ref(-1);

        // 显示二级回复
        const subReplyForm = reactive({
            content: "",
            parent_id: -1,
        });

        const showReplySub = (parentReply: ReplyDTO) => {
            if (!commentUserInfo.value) {
                emit("userInfoEmpty");
            } else {
                emit("setActive", props.comment.id);
                activeSubId.value = parentReply.id;
                replyPlaceHolder.value = `@ ${parentReply.nick_name}`;
                isShowReplyInput.value = false;
                isShowSubReplyInput.value = true;

                // 重置输入框内容
                subReplyForm.content = "";
                // 这里给二级回复表单的parent_id赋值
                subReplyForm.parent_id = parentReply.id;
                nextTick(() => {
                    subReplyInputRef.value.focus();
                });
            }
        };

        // 对回复做回复
        const handleReplySub = async () => {
            if (!subReplyForm.content) {
                // 必填校验
                message.warning("您还未输入任何内容！");
                return;
            }
            const purifiedContent = DOMPurify.sanitize(subReplyForm.content);
            if (!purifiedContent) {
                // 输入了非法的内容
                message.warning("您的输入内容无效，请重新输入合法内容！");
                return;
            }
            await replyService.add({
                // 回复的评论id
                comment_id: props.comment.id,
                // 父级回复的id
                parent_id: subReplyForm.parent_id,
                // 默认是待审核状态
                approved: 0,
                // 记录网页的url，用于发邮件时附上链接
                jump_url: window.location.href,
                // 文章id
                article_id: props.comment.article_id,
                // 回复内容
                content: purifiedContent,
                // 用户信息
                ...store.state.commentUserInfo,
            });

            Modal.success({
                title: "温馨提示",
                content: "您的回复已经提交成功，待审核后即可生效！",
            });

            isShowSubReplyInput.value = false;
            subReplyForm.content = "";
            subReplyForm.parent_id = -1;
        };

        const { trigger: onClickReplySub, loading: isReplySubLoading } = useAsyncLoading(handleReplySub);

        const formattedComment = computed(() => {
            const { comment } = props;
            return {
                ...comment,
                avatar: comment.avatar || avatarFallback,
                fomattedTime: format(comment.create_time, "YYYY年M月D日 HH:mm:ss"),
                jumpoutMiddleLink: comment.site_url ? `/jumpout/${encodeURIComponent(comment.site_url)}` : "",
                replies: comment.replies.map((reply) => {
                    return {
                        ...reply,
                        avatar: reply.avatar || replyAvatarFallback,
                        fomattedTime: dayjs(reply.create_time).fromNow(),
                    };
                }),
            };
        });

        const avatarFallback = require("@/assets/img/comment-avatar.svg");

        const replyAvatarFallback = require("@/assets/img/reply-avatar.svg");

        return {
            showReplyRoot,
            showReplySub,
            avatarFallback,
            replyAvatarFallback,
            formattedComment,
            replyPlaceHolder,
            isShowReplyInput,
            isShowSubReplyInput,
            rootReplyInputRef,
            onClickReplyRoot,
            isReplyRootLoading,
            replyRootContent,
            subReplyForm,
            subReplyInputRef,
            onClickReplySub,
            isReplySubLoading,
            activeSubId,
        };
    },
});
</script>

<style lang="scss" scoped>
.comment__wrapper {
    display: flex;
    padding: 8px 12px;
    background-color: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 26px rgb(7 17 27 / 12%);
}

:deep(.comment__avatar) {
    width: 40px;
    height: 40px;
    > img {
        height: 100%;
        border-radius: 100%;
        object-fit: cover;
    }
}
.comment__info {
    flex: 1;
    margin-left: 6px;
}
.comment__user {
    color: #5079b7;
    font-size: 16px;
}
.comment__time {
    display: block;
    font-size: 12px;
    color: #999;
}
.comment__content {
    color: #333;
    font-size: 16px;
    padding-bottom: 4px;
}

.reply__list {
    margin-top: 10px;
    border-top: 1px solid #ccc;
}
.reply__card {
    text-align: left;
    padding: 10px 0;
    border-bottom: 1px solid #eee;
}

.reply__header {
    display: flex;
}

:deep(.reply__avatar) {
    width: 24px;
    height: 24px;
    > img {
        height: 100%;
        border-radius: 100%;
        object-fit: cover;
    }
}

.reply__subinfo {
    margin-left: 4px;
    padding-top: 4px;
    display: flex;
    font-size: 12px;
}

.reply__info {
    flex: 1;
    @include one-line-ellipsis;
}

.reply__time {
    margin-left: 4px;
    color: #999;
}

.reply__content {
    margin-bottom: 4px;
    color: #333;
    font-size: 16px;
}

:deep(.btn-reply) {
    font-size: 12px;
}

.reply-form {
    margin-top: 10px;
    display: flex;
    align-items: center;
}

:deep(.btn-confirm-reply) {
    margin: 0 0 0 10px;
    font-size: 12px;
    height: 20px;
    padding: 0 4px;
}
</style>
