<template>
    <section class="jumpout__wrapper">
        <div class="jumpout__content">
            <img class="logo" src="@/assets/img/logo2.png" />
            <p>您即将离开Tusi博客，请确认目标网站链接，保护好您的个人信息和资产安全！</p>
            <p>{{ $route.params.target }}</p>
            <a-space>
                <a-button @click="goback" type="primary" ghost size="small">返回博客</a-button>
                <a-button @click="continueVisit" type="danger" ghost size="small">继续访问</a-button>
            </a-space>
        </div>
    </section>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useRoute } from "vue-router";

export default defineComponent({
    name: "Jumpout",
    setup() {
        const route = useRoute();

        const goback = () => {
            window.history.go(-1);
            window.close();
        };

        const continueVisit = () => {
            window.location.href = route.params.target as string;
        };

        return {
            goback,
            continueVisit,
        };
    },
});
</script>

<style lang="scss" scoped>
.jumpout__wrapper {
    padding-top: 100px;
}

.jumpout__content {
    width: 400px;
    max-width: 80%;
    margin: 0 auto;
    border: 1px solid #ccc;
    padding: 20px;
}

.logo {
    height: 36px;
    margin-bottom: 20px;
}
</style>
