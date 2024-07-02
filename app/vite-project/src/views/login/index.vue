<!--
 * @author: Tusi
 * @description: 登录页
-->
<template>
    <base-layout>
        <section class="login-page__wrapper">
            <h2>登录后台</h2>
            <a-form class="form-login" ref="formRef" :model="formModel" :rules="rules" :wrapper-col="{ span: 24 }">
                <a-form-item name="userName">
                    <a-input v-model:value="formModel.userName" placeholder="用户名" @keyup.enter="onClickLogin">
                        <template #prefix><UserOutlined style="color: rgba(0, 0, 0, 0.25)" /></template>
                    </a-input>
                </a-form-item>
                <a-form-item name="password">
                    <a-input v-model:value="formModel.password" type="password" placeholder="密码" @keyup.enter="onClickLogin">
                        <template #prefix><LockOutlined style="color: rgba(0, 0, 0, 0.25)" /></template>
                    </a-input>
                </a-form-item>
                <a-form-item name="captcha">
                    <a-input class="input-code" v-model:value="formModel.captcha" placeholder="验证码" @keyup.enter="onClickLogin">
                        <template #prefix><LockOutlined style="color: rgba(0, 0, 0, 0.25)" /></template>
                        <template #suffix>
                            <div class="verify-code" v-html="svgHtml" @click="getVerifyCode"></div>
                        </template>
                    </a-input>
                </a-form-item>
                <a-form-item class="align-center">
                    <a-button type="primary" :loading="loading" @click="onClickLogin">登录</a-button>
                </a-form-item>
            </a-form>
        </section>
    </base-layout>
</template>

<script lang="ts">
import Hashes from "jshashes";
import { defineComponent, reactive, ref } from "vue";
import { UserOutlined, LockOutlined } from "@ant-design/icons-vue";
import { Form, Input, message } from "ant-design-vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { REQUIRED_VALIDATOR_BLUR } from "@/utils/validator";
import { validatorService } from "@/services/validator";
import { format } from "@/utils/date-utils";
import { useAsyncLoading } from "@/hooks/async";
import { key } from "@/store";
import { LOGIN_ACTION } from "@/store/constants";

export default defineComponent({
    name: "Login",
    components: {
        UserOutlined,
        LockOutlined,
        [Form.name]: Form,
        [Form.Item.name]: Form.Item,
        [Input.name]: Input,
    },
    setup() {
        // vuex
        const store = useStore(key);
        // router
        const router = useRouter();

        const formRef = ref();

        const formModel = reactive({
            userName: "",
            password: "",
            captcha: "",
        });

        const rules = reactive({
            userName: [REQUIRED_VALIDATOR_BLUR],
            password: [REQUIRED_VALIDATOR_BLUR],
            captcha: [REQUIRED_VALIDATOR_BLUR],
        });

        // svg内容
        const svgHtml = ref("");

        // 获取验证码
        const getVerifyCode = async () => {
            const res = await validatorService.imgCode();

            svgHtml.value = res.data;
        };

        // 直接调用
        getVerifyCode();

        const handleLogin = async () => {
            await formRef.value.validate();
            const sha256 = new Hashes.SHA256();
            const params = {
                ...formModel,
                password: sha256.hex(formModel.password),
            };
            try {
                const userInfo = await store.dispatch(LOGIN_ACTION, params);
                message.success(`登录成功，上次登录时间：${format(userInfo.last_login_time)}`);
                router.push("/backend");
            } catch (error) {
                getVerifyCode();
            }
        };

        const { loading, trigger: onClickLogin } = useAsyncLoading(handleLogin);

        return {
            formRef,
            formModel,
            rules,
            onClickLogin,
            loading,
            svgHtml,
            getVerifyCode,
        };
    },
});
</script>

<style lang="scss" scoped>
.login-page__wrapper {
    position: relative;
    > h2 {
        text-align: center;
    }
}

:deep(.form-login) {
    width: 400px;
    max-width: 86%;
    margin: 0 auto;
}

:deep(.input-code) {
    padding-right: 90px;
}

$verifyimg-height: 30px;
.verify-code {
    position: absolute;
    right: 0;
    top: 0;
    height: $verifyimg-height;
    > :deep(svg) {
        width: 90px;
        height: $verifyimg-height;
        line-height: $verifyimg-height;
    }
}
</style>
