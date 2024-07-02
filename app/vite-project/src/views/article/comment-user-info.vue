<!--
 * @author: Tusi
 * @description: 评论用户信息录入
-->
<template>
    <a-form ref="formRef" :rules="rules" :model="formModel" :label-col="{ style: { width: '140px' } }">
        <a-form-item label="昵称" name="nick_name">
            <a-input v-model:value="formModel.nick_name" placeholder="Hi，期待与您的互动" />
        </a-form-item>
        <a-form-item label="邮箱" name="email">
            <a-input v-model:value="formModel.email" placeholder="邮箱不会被公开，仅用于反馈与您相关的消息" />
        </a-form-item>
        <a-form-item label="个人网址" name="site_url">
            <a-input v-model:value="formModel.site_url" placeholder="个人网址会被公开，便于他人与您的交流与互动" />
        </a-form-item>
        <a-form-item class="align-center" :wrapper-col="{ span: 24 }">
            <a-space>
                <a-button @click="onClickCancel">取消</a-button>
                <a-button type="primary" @click="onClickSave">保存</a-button>
            </a-space>
        </a-form-item>
    </a-form>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, ref } from "vue";
import { useStore } from "vuex";
import { message, Form, Input } from "ant-design-vue";
import { CommentUserInfo } from "@/bean/dto";
import { EMAIL_VALIDATOR, REQUIRED_VALIDATOR_BLUR, URL_VALIDATOR } from "@/utils/validator";
import { key } from "@/store";
import { SET_COMMENT_USER_INFO } from "@/store/constants";

export default defineComponent({
    name: "CommentUserInfo",
    components: {
        [Form.name]: Form,
        [Form.Item.name]: Form.Item,
        [Input.name]: Input,
    },
    emits: ["cancel", "success"],
    props: {
        topic: {
            type: String,
            default: "评论",
        },
    },
    setup(props, { emit }) {
        // vuex
        const store = useStore(key);

        const commentUserInfo = computed(() => store.state.commentUserInfo);

        const formModel = reactive<CommentUserInfo>(
            commentUserInfo.value || {
                nick_name: "",
                email: "",
                site_url: "",
            }
        );

        const rules = reactive({
            nick_name: [REQUIRED_VALIDATOR_BLUR],
            email: [REQUIRED_VALIDATOR_BLUR, EMAIL_VALIDATOR],
            site_url: [URL_VALIDATOR],
        });

        const formRef = ref();

        const onClickCancel = () => {
            emit("cancel");
        };

        const onClickSave = async () => {
            await formRef.value.validate();

            store.commit(SET_COMMENT_USER_INFO, formModel);

            message.success(`辛苦啦，可以去创建${props.topic}了！`);

            emit("success");
        };

        return {
            formModel,
            onClickCancel,
            onClickSave,
            formRef,
            rules,
        };
    },
});
</script>
