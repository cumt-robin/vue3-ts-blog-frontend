<!--
 * @author: Tusi
 * @description: 留言板
-->

<template>
    <base-layout>
        <section class="messages__wrapper">
            <div class="stats-info">
                <div class="msgs-stats">
                    已有<strong class="user-count">{{ userCount }}</strong
                    >人在这留下了足迹
                </div>
                <div class="msgs-stats">
                    留言总数：<strong class="user-count">{{ messageTotal }}</strong
                    >条
                </div>

                <div class="modify-info" v-if="commentUserInfo" @click="showUserInfoForm">
                    个人信息有误？点击修改<EditOutlined style="margin-left: 6px" />
                </div>
            </div>

            <comments ref="commentsRef" topic="留言" :auto-load="false" place-top />
        </section>
    </base-layout>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import { useStore } from "vuex";
import { EditOutlined } from "@ant-design/icons-vue";
import Comments from "@/views/article/comments.vue";
import { commentService } from "@/services/comment";
import { key } from "@/store";

export default defineComponent({
    name: "Messages",
    components: {
        Comments,
        EditOutlined,
    },
    setup() {
        // vuex
        const store = useStore(key);

        const commentUserInfo = computed(() => store.state.commentUserInfo);

        const userCount = ref(0);
        const messageTotal = ref(0);

        // 获取留言总人数
        const getMessageUserCount = async () => {
            const res = await commentService.numberOfPeople();
            userCount.value = res.data;
        };

        getMessageUserCount();

        // 获取留言总数
        const getMessageTotal = async () => {
            const res = await commentService.total();
            messageTotal.value = res.data;
        };

        getMessageTotal();

        // 修改个人信息
        const commentsRef = ref();
        const showUserInfoForm = () => {
            commentsRef.value.isEditUserInfoVisible = true;
        };

        return {
            userCount,
            messageTotal,
            commentUserInfo,
            commentsRef,
            showUserInfoForm,
        };
    },
});
</script>

<style lang="scss" scoped>
.msgs-stats {
    font-size: 12px;
    color: #999;
    text-align: center;
    padding-bottom: 10px;
}

.user-count {
    font-size: 16px;
    color: #333;
    font-weight: 700;
}

.modify-info {
    text-align: center;
    font-size: 10px;
    color: #999;
    margin-bottom: 10px;
    cursor: pointer;
}

:deep(.comment__wrapper) {
    box-shadow: 0 2px 12px rgb(7 17 27 / 12%);
}
</style>
