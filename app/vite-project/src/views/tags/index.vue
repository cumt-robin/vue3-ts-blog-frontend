<!--
 * @author: Tusi
 * @description: 所有标签
-->
<template>
    <base-layout>
        <h2>文章标签</h2>

        <a-skeleton :loading="loading" active :paragraph="{ rows: 12 }">
            <template v-if="tagList.length > 0">
                <router-link v-for="tag in tagList" :key="tag.id" :to="`/tag/${tag.tag_name}`">
                    <a-tag class="tagtag">
                        <template #icon>
                            <a-badge :count="tag.tag_count" />
                        </template>
                        {{ tag.tag_name }}
                    </a-tag>
                </router-link>
            </template>

            <template v-else>
                <a-empty />
            </template>
        </a-skeleton>
    </base-layout>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { Badge, Tag } from "ant-design-vue";
import { TagDTO } from "@/bean/dto";
import { tagService } from "@/services/tag";
import { useAsyncLoading } from "@/hooks/async";

export default defineComponent({
    name: "Tag",
    components: {
        [Badge.name]: Badge,
        [Tag.name]: Tag,
    },
    setup() {
        const tagList = ref<TagDTO[]>([]);

        const handleGetAllTag = async () => {
            const res = await tagService.all({ getCount: true });
            tagList.value = res.data;
        };

        const { trigger: getTagList, loading } = useAsyncLoading(handleGetAllTag);

        // 初始化直接调用接口
        getTagList();

        return {
            loading,
            tagList,
        };
    },
});
</script>

<style lang="scss" scoped>
:deep(.base-layout__main) {
    padding: 24px 18px;
    background-color: #f5f5f5;
}
:deep(.card-hot) {
    margin: 24px 18px;
}
h2 {
    margin: 0;
    text-align: center;
}
:deep(.tagtag) {
    margin-top: 10px;
    padding: 4px 8px;
    font-size: 16px;
    cursor: pointer;
    > span {
        vertical-align: middle;
    }
    .ant-badge-count {
        background: #348ba9;
    }
}

@media screen and (min-width: 992px) {
    :deep(.base-layout__main) {
        background-color: transparent;
    }
}
</style>
