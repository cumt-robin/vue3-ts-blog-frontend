<template>
    <a-form class="edit-form" ref="formRef" :model="formModel" :rules="rules" :wrapper-col="{ span: 24 }">
        <a-form-item label="分类名称" name="category_name">
            <a-input v-model:value="formModel.category_name" placeholder="请输入分类名称"></a-input>
        </a-form-item>
        <a-form-item label="海报" name="poster">
            <a-input v-model:value="formModel.poster" placeholder="请输入海报"></a-input>
            <div style="margin-top: 10px">
                <a-image :src="formModel.poster" />
            </div>
        </a-form-item>
        <a-form-item class="align-center">
            <a-button type="primary" :loading="loading" @click="onSave">保存</a-button>
        </a-form-item>
    </a-form>
</template>

<script lang="ts">
import { defineComponent, PropType, reactive } from "vue";
import { Form, Input, message } from "ant-design-vue";
import { useAsyncLoading } from "@/hooks/async";
import { REQUIRED_VALIDATOR_BLUR } from "@/utils/validator";
import { categoryService } from "@/services/category";
import { CategoryDTO } from "@/bean/dto";

export default defineComponent({
    props: {
        row: {
            type: Object as PropType<CategoryDTO>,
        },
    },
    components: {
        [Form.name]: Form,
        [Form.Item.name]: Form.Item,
        [Input.name]: Input,
    },
    emits: ["success"],
    setup(props, { emit }) {
        const row = props.row as CategoryDTO;
        const formModel = reactive({
            id: row.id,
            category_name: row.category_name,
            poster: row.poster,
        });

        const rules = {
            category_name: [REQUIRED_VALIDATOR_BLUR],
            poster: [REQUIRED_VALIDATOR_BLUR],
        };

        const handleSave = async () => {
            await categoryService.adminUpdate(formModel);
            message.success("保存成功");
            emit("success");
        };

        const { loading, trigger: onSave } = useAsyncLoading(handleSave);

        return {
            formModel,
            loading,
            rules,
            onSave,
        };
    },
});
</script>
