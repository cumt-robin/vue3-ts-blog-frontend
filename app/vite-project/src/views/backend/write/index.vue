<!--
 * @author: Tusi
 * @description: 写博客
-->
<template>
    <section class="workspace__wrapper">
        <a-spin :spinning="initLoading">
            <a-form class="form-write" ref="formRef" :model="formModel" :rules="rules" :wrapper-col="{ span: 24 }">
                <a-form-item>
                    <a-button type="primary" :loading="isPublishLoading" @click.prevent="onClickPublish">{{
                        isEdit ? "保存博客" : "发布博客"
                    }}</a-button>
                </a-form-item>
                <a-form-item name="poster" label="封面url">
                    <a-input
                        class="input-simple"
                        v-model:value="formModel.poster"
                        placeholder="暂时使用在线图片URL，比如七牛云等云存储地址"
                    >
                    </a-input>
                    <el-image :src="formModel.poster" class="articlePoster" fit="cover" />
                </a-form-item>
                <a-form-item name="articleTitle" label="文章标题">
                    <a-input class="input-simple" v-model:value="formModel.articleTitle" placeholder="请输入标题"> </a-input>
                </a-form-item>
                <a-form-item name="summary" label="文章摘要">
                    <a-textarea
                        class="input-simple"
                        v-model:value="formModel.summary"
                        placeholder="请输入文章摘要"
                        :auto-size="{ minRows: 2, maxRows: 4 }"
                    />
                </a-form-item>
                <a-form-item name="private" label="是否私密">
                    <a-radio-group v-model:value="formModel.private">
                        <a-radio :value="0">否</a-radio>
                        <a-radio :value="1">是</a-radio>
                    </a-radio-group>
                </a-form-item>

                <a-form-item name="articleText" label="正文部分">
                    <a-row :gutter="20">
                        <a-col :span="12">
                            <a-textarea
                                class="md-textarea"
                                v-model:value="formModel.articleText"
                                placeholder="请输入markdown格式的正文"
                                @change="onMdContentChange"
                            />
                        </a-col>
                        <a-col :span="12">
                            <section class="md-preview" v-html="purifiedContent"></section>
                        </a-col>
                    </a-row>
                </a-form-item>
            </a-form>
        </a-spin>

        <a-modal title="关联分类/标签" v-model:visible="isRelationVisible" :footer="null" width="860px">
            <a-form class="form-releation" ref="relFormRef" :model="relFormModel" :wrapper-col="{ span: 24 }">
                <a-form-item name="newTags" label="文章标签">
                    <a-row :gutter="16">
                        <a-col v-for="(tag, index) in newTagList" :key="index" :xs="8" :sm="4">
                            <a-auto-complete v-model:value="tag.value" :options="tagOptions" @focus="onTagFocus" @search="onSearchTag" />
                            <DeleteOutlined @click="deleteTag(index)" />
                        </a-col>
                        <a-col :span="4"><PlusOutlined @click="addTag" /></a-col>
                    </a-row>
                </a-form-item>
                <a-form-item name="newCategorys" label="新增分类">
                    <a-row :gutter="16">
                        <a-col v-for="(category, index) in newCategoryList" :key="index" :xs="8" :sm="4">
                            <a-input v-model:value="category.value" />
                            <DeleteOutlined @click="deleteCategory(index)" />
                        </a-col>
                        <a-col :span="4"><PlusOutlined @click="addCategory" /></a-col>
                    </a-row>
                </a-form-item>
                <a-form-item name="categorys" label="已有分类">
                    <div>
                        <a-input-search
                            v-model:value="categoryWd"
                            placeholder="模糊搜索"
                            :loading="categorySearchLoading"
                            style="width: 256px"
                            @input="onCategorySearchInput"
                        />
                        <br />
                        <a-checkbox-group v-model:value="relFormModel.oldCategoryIds" style="width: 100%">
                            <a-row :gutter="16">
                                <a-col v-for="category in categorys" :key="category.id" :xs="8" :sm="4">
                                    <a-checkbox class="category-checkbox" :value="category.id">{{ category.category_name }}</a-checkbox>
                                </a-col>
                            </a-row>
                        </a-checkbox-group>
                    </div>
                </a-form-item>
                <a-form-item class="align-center">
                    <a-button type="primary" :loading="isConfirmLoading" @click.prevent="onConfirmPublish">{{
                        isEdit ? "确认保存" : "确认发布"
                    }}</a-button>
                </a-form-item>
            </a-form>
        </a-modal>
    </section>
</template>

<script lang="ts">
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
import yaml from "highlight.js/lib/languages/yaml";
// 皮肤
import "highlight.js/styles/atom-one-dark.css";
import DOMPurify from "dompurify";
import { computed, defineComponent, reactive, ref } from "vue";
import { throttle, debounce } from "lodash-es";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons-vue";
import { Form, Input, message, Modal, Radio, Spin, AutoComplete } from "ant-design-vue";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import { REQUIRED_VALIDATOR_BLUR } from "@/utils/validator";
import { useAsyncLoading } from "@/hooks/async";
import { ArticleDTO, CategoryDTO, UserDTO } from "@/bean/dto";
import { categoryService } from "@/services/category";
import { key } from "@/store";
import { articleService } from "@/services/article";
import { tagService } from "@/services/tag";
import { sleep } from "@/utils/bom";

hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("html", html);
hljs.registerLanguage("css", css);
hljs.registerLanguage("shell", shell);
hljs.registerLanguage("json", json);
hljs.registerLanguage("plaintext", plaintext);
hljs.registerLanguage("yaml", yaml);

interface NewTagDTO {
    value: string;
}

interface NewCategoryDTO {
    value: string;
}

interface RelFormModel {
    oldCategoryIds: number[];
}

export default defineComponent({
    components: {
        PlusOutlined,
        DeleteOutlined,
        [Form.name as string]: Form,
        [Form.Item.name as string]: Form.Item,
        [Input.name as string]: Input,
        [Input.TextArea.name as string]: Input.TextArea,
        [Input.Search.name as string]: Input.Search,
        [Radio.name as string]: Radio,
        [Radio.Group.name as string]: Radio.Group,
        [Modal.name as string]: Modal,
        [Spin.name as string]: Spin,
        [AutoComplete.name as string]: AutoComplete,
    },
    setup() {
        // vuex
        const store = useStore(key);
        const userInfo = computed<UserDTO | null>(() => store.state.userInfo);

        // router
        const route = useRoute();
        const router = useRouter();

        const formRef = ref();

        const formModel = reactive({
            articleTitle: "",
            summary: "",
            poster: "",
            articleText: "",
            private: 0,
        });

        // 是否是编辑模式
        const isEdit = ref(false);

        const rules = reactive({
            poster: [REQUIRED_VALIDATOR_BLUR],
            articleTitle: [REQUIRED_VALIDATOR_BLUR],
            summary: [REQUIRED_VALIDATOR_BLUR],
            articleText: [REQUIRED_VALIDATOR_BLUR],
        });

        // 初始化函数，主要是做表单回写
        const articleDetail = ref<ArticleDTO | null>(null);
        const originalTagNames = computed(() => articleDetail.value?.tags.map((item) => item.tagName) || []);
        const originalCategoryIds = computed(() => articleDetail.value?.categories.map((item) => item.id) || []);

        const relFormModel = reactive<RelFormModel>({
            oldCategoryIds: [],
        });

        const init = async () => {
            if (route.params.id) {
                isEdit.value = true;
                const id = +route.params.id;
                const { data } = await articleService.detail(id);
                articleDetail.value = data;
                Object.assign(formModel, {
                    articleText: data.article_text,
                    articleTitle: data.article_name,
                    poster: data.poster,
                    summary: data.summary,
                    private: data.private,
                });

                // 渲染markdown
                if (formModel.articleText) {
                    const markedContent = marked(formModel.articleText);
                    purifiedContent.value = DOMPurify.sanitize(markedContent);
                }

                // 处理标签
                if (data.tags.length > 0) {
                    newTagList.value = data.tags.map((item) => {
                        return {
                            value: item.tagName,
                        };
                    });
                }

                // 处理分类
                if (data.categories.length > 0) {
                    relFormModel.oldCategoryIds = data.categories.map((item) => item.id);
                }

                setTimeout(() => {
                    mermaid.initialize({
                        theme: "default",
                        startOnLoad: false,
                    });

                    mermaid.run();
                }, 0);
            }
        };

        const { trigger: triggerInit, loading: initLoading } = useAsyncLoading(init);

        // 直接触发init
        triggerInit();

        // markdown处理
        const initMarked = () => {
            // https://marked.js.org/using_advanced
            const renderer = new marked.Renderer();
            renderer.link = function customLink(href, title, text) {
                return `<a class="link" href="${href}" target="_blank" rel="nofollow" title="${text}">${text}</a>`;
            };
            renderer.image = function customImage(href, title, text) {
                return (
                    `<a class="img-wrapper" href="${href}" target="_blank" rel="nofollow" title="${text}">` +
                    `<img src="${href}" alt="${text}">` +
                    "</a>"
                );
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
                // 只解析符合markdown.pl定义的，不修正markdown的错误
                pedantic: false,
                // 启动Github样式的Markdown
                gfm: true,
                // 支持Github换行符，必须打开gfm选项
                breaks: false,
                // deprecated，应该自己使用sanitize库
                sanitize: false,
                // 优化列表输出
                smartLists: true,
                smartypants: false,
                xhtml: false,
            });
        };

        initMarked();

        const purifiedContent = ref("");

        const handleRender = async ({ target }: { target: HTMLTextAreaElement }) => {
            const content = target.value;
            const markedContent = marked(content);
            purifiedContent.value = DOMPurify.sanitize(markedContent);
            await sleep(0);
            mermaid.run();
        };

        const onMdContentChange = throttle(handleRender, 300);

        // 处理关系表
        const isRelationVisible = ref(false);

        // 处理基本表单
        const handlePublish = async () => {
            await formRef.value.validate();
            isRelationVisible.value = true;
        };

        const { trigger: onClickPublish, loading: isPublishLoading } = useAsyncLoading(handlePublish);

        // 新tag处理
        const newTagList = ref<NewTagDTO[]>([]);

        const addTag = () => {
            if (newTagList.value.length > 0) {
                const emptyExsited = newTagList.value.some((item) => item.value === "");
                if (emptyExsited) {
                    // 如果有没填写的标签，提示必须填写
                    message.warning("请先输入已添加的标签内容");
                } else if (newTagList.value.length >= 4) {
                    // 限制标签数量
                    message.warning("最多添加4个标签");
                } else {
                    newTagList.value.push({
                        value: "",
                    });
                }
            } else {
                newTagList.value.push({
                    value: "",
                });
                tagOptions.value = [];
            }
        };

        const deleteTag = (index: number) => {
            newTagList.value.splice(index, 1);
        };

        const tagOptions = ref<{ value: string }[]>([]);

        const handleSearchTag = async (value: string) => {
            if (value) {
                const { data } = await tagService.fuzzy({
                    wd: value,
                });
                tagOptions.value = data.map((item) => {
                    return {
                        value: item.tag_name,
                    };
                });
            } else {
                tagOptions.value = [];
            }
        };
        const { trigger: searchTag } = useAsyncLoading(handleSearchTag);
        const debounceSearchTag = debounce(searchTag, 1000);

        const onTagFocus = () => {
            tagOptions.value = [];
        };

        const onSearchTag = (value: string) => {
            debounceSearchTag(value);
        };

        // 分类搜索
        const categoryWd = ref("");
        const handleSearchCategory = async () => {
            if (categoryWd.value) {
                const { data } = await categoryService.fuzzy({
                    wd: categoryWd.value,
                });
                categorys.value = data;
            } else {
                categorys.value = allCategorys.value;
            }
        };
        const { loading: categorySearchLoading, trigger: searchCategory } = useAsyncLoading(handleSearchCategory);
        const debounceSearchCategory = debounce(searchCategory, 1000);
        const onCategorySearchInput = () => {
            debounceSearchCategory();
        };

        // 新分类处理
        const newCategoryList = ref<NewCategoryDTO[]>([]);

        const addCategory = () => {
            if (newCategoryList.value.length > 0) {
                const emptyExsited = newCategoryList.value.some((item) => item.value === "");
                if (emptyExsited) {
                    // 如果有没填写的标签，提示必须填写
                    message.warning("请先输入已添加的分类");
                } else if (newCategoryList.value.length >= 4) {
                    // 限制标签数量
                    message.warning("最多添加4个分类");
                } else {
                    newCategoryList.value.push({
                        value: "",
                    });
                }
            } else {
                newCategoryList.value.push({
                    value: "",
                });
            }
        };

        const deleteCategory = (index: number) => {
            newCategoryList.value.splice(index, 1);
        };

        // 已存在的分类
        const allCategorys = ref<CategoryDTO[]>([]);
        const categorys = ref<Partial<CategoryDTO>[]>([]);
        const categoryNames = computed(() => categorys.value.map((item) => item.category_name));

        const getCategorys = async () => {
            const res = await categoryService.all();
            allCategorys.value = res.data;
            categorys.value = res.data;
        };

        getCategorys();

        // 校验通过后，正式提交
        const handleConfirmPublish = async () => {
            // 计算出所有的标签名
            const tagNames = newTagList.value.filter((item) => item.value.trim() !== "").map((item) => item.value.trim());
            if (tagNames.length === 0) {
                message.warning("至少输入一个标签");
                return Promise.reject(false);
            }

            // 计算出输入的新的分类名
            const newCategoryNames = newCategoryList.value.filter((item) => item.value.trim() !== "").map((item) => item.value.trim());
            // 和旧的分类名categoryNames做对比，存在重复则提示
            let isRepeatCategoryName = false;
            let repeatCategoryName = "";
            for (let index = 0, len = newCategoryNames.length; index < len; index++) {
                const categoryName = newCategoryNames[index];
                if (categoryNames.value.includes(categoryName)) {
                    isRepeatCategoryName = true;
                    repeatCategoryName = categoryName;
                    break;
                }
            }
            if (isRepeatCategoryName) {
                message.warning(`新增的分类名称[${repeatCategoryName}]已经存在，请删除后直接在已有分类中选择`);
                return Promise.reject(false);
            }

            // 如果没有新增分类，也没有勾选已有分类
            if (newCategoryNames.length === 0 && relFormModel.oldCategoryIds.length === 0) {
                message.warning("至少选择一个分类");
                return Promise.reject(false);
            }

            // 校验通过，开始提交表单
            if (isEdit.value) {
                // 编辑场景
                // 处理要删除的tag关系，即开始有，现在没有的那部分tag
                const deleteTagIDs = (articleDetail.value as ArticleDTO).tags
                    .filter((tag) => !tagNames.includes(tag.tagName))
                    .map((tag) => tag.id);

                // 处理要新增的tag关系，即现在有，开始没有的那部分tag
                const newTags = tagNames.filter((tagName) => !originalTagNames.value.includes(tagName));

                // 处理要删除的分类关系，即开始勾选了，现在没有勾选的分类
                const deleteCategoryIDs = (articleDetail.value as ArticleDTO).categories
                    .filter((category) => !relFormModel.oldCategoryIds.includes(category.id))
                    .map((category) => category.id);

                // 需要新增的分类关系，依然放在 newCategories 中

                // relatedCategoryIDs 存放的是需要新关联的分类关系，即现在勾选了，而开始没勾选的分类
                const relatedCategoryIDs = relFormModel.oldCategoryIds.filter(
                    (categoryId) => !originalCategoryIds.value.includes(categoryId)
                );

                const params = {
                    id: +route.params.id,
                    ...formModel,
                    deleteTagIDs: deleteTagIDs.length > 0 ? deleteTagIDs : null,
                    newTags: newTags.length > 0 ? newTags : null,
                    deleteCategoryIDs: deleteCategoryIDs.length > 0 ? deleteCategoryIDs : null,
                    newCategories: newCategoryNames.length > 0 ? newCategoryNames : null,
                    relatedCategoryIDs: relatedCategoryIDs.length > 0 ? relatedCategoryIDs : null,
                };
                await articleService.update(params);
                message.success("保存成功");
            } else {
                // 新建场景
                const params = {
                    authorId: userInfo.value?.id,
                    ...formModel,
                    oldCategoryIds: relFormModel.oldCategoryIds.length > 0 ? relFormModel.oldCategoryIds : null,
                    tags: tagNames,
                    newCategories: newCategoryNames.length > 0 ? newCategoryNames : null,
                };
                await articleService.add(params);
                message.success("创作成功");
            }

            router.push("/backend");
        };

        const { trigger: onConfirmPublish, loading: isConfirmLoading } = useAsyncLoading(handleConfirmPublish);

        return {
            isEdit,
            initLoading,
            formRef,
            formModel,
            rules,
            onClickPublish,
            onMdContentChange,
            purifiedContent,
            isPublishLoading,
            isRelationVisible,
            relFormModel,
            onConfirmPublish,
            isConfirmLoading,
            newTagList,
            addTag,
            deleteTag,
            newCategoryList,
            addCategory,
            deleteCategory,
            categorys,
            categoryWd,
            categorySearchLoading,
            onCategorySearchInput,
            tagOptions,
            onSearchTag,
            onTagFocus,
        };
    },
});
</script>

<style lang="scss" scoped>
.workspace__wrapper {
    background-color: #fff;
    padding: 20px;
}

:deep(.md-textarea),
.md-preview {
    height: 860px;
    padding: 16px 20px;
}

:deep(.md-textarea) {
    resize: none;
}

.md-preview {
    border: 1px solid #d9d9d9;
    overflow: auto;
}

:deep(.input-simple) {
    max-width: 640px;
}

:deep(.category-checkbox) {
    display: flex;
    align-items: center;
    .ant-checkbox + span {
        flex: 1;
        @include one-line-ellipsis;
    }
}

:deep(.articlePoster) {
    display: block;
    margin-top: 10px;
    width: 640px;
    height: 360px;
}
</style>

<style lang="scss" scoped src="@/views/article/md-render.scss"></style>
