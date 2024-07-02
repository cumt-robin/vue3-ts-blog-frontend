<!--
 * @author: Tusi
 * @description: 在线聊天室
-->
<template>
    <base-layout>
        <section class="chat-room">
            <a-card class="card-chat" hoverable>
                <template #title>
                    <span>我是一个基于OpenAI的对话机器人...</span>
                    <a-button
                        class="btn-send"
                        style="margin-left: 20px"
                        ghost
                        type="primary"
                        size="small"
                        :loading="isChangeTopicLoading"
                        @click="onClickChangeTopic"
                        >换个话题</a-button
                    >
                </template>
                <ul class="msg-box" ref="msgBoxRef">
                    <li v-for="(msg, index) in msgList" :key="index" :class="msg.customClass">
                        <div v-if="msg.type == 'sys_msg'">
                            <span class="content">{{ msg.content }}</span>
                        </div>
                        <div v-if="msg.type == 'mine'" class="chat-item-wrap">
                            <img src="@/assets/img/chat-avatar.png" />
                            <div class="txt-wrap">
                                <span>{{ msg.time }}</span
                                >{{ msg.user }}
                                <div class="chat-text">
                                    <span>{{ msg.content }}</span>
                                </div>
                            </div>
                        </div>
                        <div v-if="msg.type == 'others'" class="chat-item-wrap">
                            <img src="@/assets/img/chat-avatar.png" />
                            <div class="txt-wrap">
                                <span>{{ msg.user }}</span
                                >{{ msg.time }}
                                <div class="chat-text">
                                    <span>{{ msg.content }}</span>
                                </div>
                            </div>
                        </div>
                    </li>
                </ul>
                <a-form ref="chatFormRef" :model="chatForm" :rules="chatRules" class="form-chat">
                    <a-form-item name="chatContent" class="form-item--content" :wrapper-col="{ span: 24 }">
                        <a-textarea
                            v-model:value="chatForm.chatContent"
                            placeholder="输入内容后点击发送..."
                            :autosize="{ minRows: 2, maxRows: 4 }"
                            @keydown="onKeydownChat"
                        />
                    </a-form-item>
                    <a-form-item class="form-item--btn">
                        <a-button class="btn-send" ghost type="primary" size="small" :loading="loading" @click="sendChatContent"
                            >发送</a-button
                        >
                        <a-dropdown class="dropdown-send" :trigger="['click', 'hover']">
                            <DownOutlined />

                            <template #overlay>
                                <a-menu>
                                    <a-radio-group v-model:value="triggerType">
                                        <a-menu-item :key="1">
                                            <a-radio :value="1">按Enter键发送消息</a-radio>
                                        </a-menu-item>
                                        <a-menu-item :key="2">
                                            <a-radio :value="2">按Ctrl+Enter键发送消息</a-radio>
                                        </a-menu-item>
                                    </a-radio-group>
                                </a-menu>
                            </template>
                        </a-dropdown>
                    </a-form-item>
                </a-form>
            </a-card>
        </section>
    </base-layout>
</template>

<script>
import { defineComponent, watch, ref, reactive, nextTick } from "vue";
import { DownOutlined } from "@ant-design/icons-vue";
import { Card, Dropdown, Form, Input, Menu, message, Radio } from "ant-design-vue";
import { format } from "@/utils/date-utils";
import { setScrollTop } from "@/utils/dom";
import { chatgptService } from "@/services/chatgpt";
import { useAsyncLoading } from "@/hooks/async";

export default defineComponent({
    components: {
        DownOutlined,
        [Dropdown.name]: Dropdown,
        [Menu.name]: Menu,
        [Menu.Item.name]: Menu.Item,
        [Form.name]: Form,
        [Form.Item.name]: Form.Item,
        [Input.name]: Input,
        [Input.TextArea.name]: Input.TextArea,
        [Radio.name]: Radio,
        [Radio.Group.name]: Radio.Group,
        [Card.name]: Card,
    },
    setup() {
        const msgList = ref([
            {
                time: format(new Date(), "HH:mm:ss"),
                user: "Chat AI",
                content:
                    "感谢大家的支持，我Open AI个人账户的免费额度已经用尽，非常抱歉，请大家自行按照源码搭建体验吧，或者使用我付费搭建的产品 https://chat.wbjiang.cn/",
                type: "others",
                customClass: "others",
            },
        ]);

        setTimeout(() => {
            msgList.value.push({
                time: format(new Date(), "HH:mm:ss"),
                user: "Chat AI",
                content:
                    "源码地址如下，前端：https://github.com/cumt-robin/vue3-ts-blog-frontend，后端：https://github.com/cumt-robin/express-blog-backend",
                type: "others",
                customClass: "others",
            });
        }, 1000);

        const chatForm = reactive({
            chatContent: "",
        });

        const chatRules = reactive({
            chatContent: [{ required: true, message: "请输入聊天内容", trigger: "blur" }],
        });

        // 1代表Enter触发，2代表Ctrl+Enter触发
        const triggerType = ref(1);

        const msgBoxRef = ref();

        const chatFormRef = ref();

        const updateScrollTop = () => {
            nextTick(() => {
                const el = msgBoxRef.value;
                const scrollTop = el.scrollHeight - el.clientHeight;
                setScrollTop({
                    target: el,
                    useAnimation: true,
                    targetValue: scrollTop,
                });
            });
        };

        watch(
            () => msgList.value.length,
            () => {
                updateScrollTop();
            }
        );

        const loading = ref(false);

        const sendChatContent = async () => {
            if (chatForm.chatContent.length <= 1) {
                return message.warn("你说得太少，我不明白");
            }
            if (chatForm.chatContent.length >= 60) {
                return message.warn("我的脑容量不够了，可以少说点吗？");
            }
            await chatFormRef.value.validate();
            loading.value = true;
            msgList.value.push({
                time: format(new Date(), "HH:mm:ss"),
                user: "我说",
                content: chatForm.chatContent,
                type: "mine",
                customClass: "mine",
            });
            // 调用 AI 接口
            const es = new EventSource(`/api/chatgpt/chat?wd=${chatForm.chatContent}`);

            let content = "";

            es.onerror = (e) => {
                console.error(e);
                message.error("AI忙不过来了，请稍后重试");
                loading.value = false;
            };

            es.onmessage = (e) => {
                if (e.data === "[DONE]") {
                    // 数据结束，反馈给服务器
                    chatgptService.feedback(content);
                    es.close();
                    loading.value = false;
                    updateScrollTop();
                    return;
                }
                const { text } = JSON.parse(e.data).choices[0];
                if (text) {
                    if (!content) {
                        // 第一条数据来了
                        msgList.value.push({
                            time: format(new Date(), "HH:mm:ss"),
                            user: "Chat AI",
                            content: text,
                            type: "others",
                            customClass: "others",
                        });
                        content += text;
                    } else {
                        // 拼接后面的数据
                        content += text;
                        msgList.value[msgList.value.length - 1].content = content;
                    }
                }
            };

            es.onopen = () => {
                chatFormRef.value.resetFields();
            };
        };

        // const sendChatContentV1 = async () => {
        //     msgList.value.push({
        //         time: format(new Date(), "HH:mm:ss"),
        //         user: "我说",
        //         content: chatForm.chatContent,
        //         type: "mine",
        //         customClass: "mine",
        //     });
        //     loading.value = true;
        //     try {
        //         const { result } = await chatgptService.chatV1({ wd: chatForm.chatContent });
        //         msgList.value.push({
        //             time: format(new Date(), "HH:mm:ss"),
        //             user: "Chat AI",
        //             content: result,
        //             type: "others",
        //             customClass: "others",
        //         });
        //     } finally {
        //         loading.value = false;
        //         chatFormRef.value.resetFields();
        //     }
        // };

        const onKeydownChat = (e) => {
            if (loading.value) {
                message.info("机器人正在思考中，请稍候");
                return;
            }
            if ((triggerType.value === 1 && e.keyCode === 13) || (triggerType.value === 2 && e.ctrlKey && e.keyCode === 13)) {
                e.preventDefault();
                sendChatContent();
                // sendChatContentV1();
            }
        };

        const handleChangeTopic = async () => {
            await chatgptService.changeTopic();
            msgList.value = [
                {
                    time: format(new Date(), "HH:mm:ss"),
                    user: "Chat AI",
                    content: "好的，你想聊什么新的话题？",
                    type: "others",
                    customClass: "others",
                },
            ];
            chatForm.chatContent = "";
        };

        const { trigger: onClickChangeTopic, loading: isChangeTopicLoading } = useAsyncLoading(handleChangeTopic);

        return {
            msgBoxRef,
            chatFormRef,
            msgList,
            chatForm,
            chatRules,
            triggerType,
            loading,
            sendChatContent,
            onKeydownChat,
            onClickChangeTopic,
            isChangeTopicLoading,
        };
    },
});
</script>

<style lang="scss" scoped>
:deep(.card-chat) {
    box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);

    .ant-card-head {
        background: #daf1ef;
    }

    .ant-card-head-title {
        display: flex;
        align-items: center;
        white-space: normal;
        > span {
            flex: 1;
        }
    }

    .ant-card-body {
        padding: 10px;
    }
}

.msg-box {
    position: relative;
    padding: 12px 18px;
    min-height: 400px;
    max-height: 800px;
    overflow: auto;
    &::-webkit-scrollbar {
        width: 6px;
        height: 6px;
    }

    &::-webkit-scrollbar-thumb {
        border-radius: 4px;
        background-color: #ccc;
    }

    &::-webkit-scrollbar-track {
        background: rgba(240, 227, 227, 0.5);
    }
    > li {
        + li {
            margin-top: 10px;
        }
        &.sys_msg {
            text-align: center;
            .content {
                display: inline-block;
                line-height: 30px;
                padding: 0 15px;
                border-radius: 3px;
                background-color: #e2e2e2;
                cursor: default;
                font-size: 14px;
            }
        }
        &.mine {
            text-align: right;
            .chat-item-wrap {
                .txt-wrap {
                    padding-right: 60px;
                    .chat-text span {
                        background-color: #5fb878;
                        color: #fff;
                        &::after {
                            right: -10px;
                            border-color: #5fb878 transparent transparent;
                        }
                    }
                }
                img {
                    float: right;
                }
            }
        }
        &.others {
            text-align: left;
            .chat-item-wrap {
                .txt-wrap {
                    padding-left: 60px;
                    .chat-text span {
                        background-color: #e2e2e2;
                        color: #000;
                        &::after {
                            left: -10px;
                            border-color: #e2e2e2 transparent transparent;
                        }
                    }
                }
                img {
                    float: left;
                }
            }
        }
    }

    .chat-item-wrap {
        .txt-wrap {
            line-height: 24px;
            font-size: 12px;
            color: #999;
            > span {
                margin-right: 10px;
            }
            .chat-text {
                margin-top: 5px;
                span {
                    position: relative;
                    display: inline-block;
                    border-radius: 4px;
                    padding: 8px 15px;
                    font-size: 14px;
                    &::after {
                        content: "";
                        position: absolute;
                        top: 7px;
                        width: 0;
                        height: 0;
                        border-style: solid dashed dashed;
                        overflow: hidden;
                        border-width: 10px;
                    }
                }
            }
        }
        img {
            width: 40px;
            height: 40px;
            border-radius: 100%;
        }
    }
}

:deep(.form-chat) {
    display: flex;
    .form-item--content {
        flex: 1;
        margin: 0 16px 0 0;
    }
    .form-item--btn {
        .ant-form-item-control {
            line-height: 1;
        }
    }
}

:deep(.btn-send) {
    margin-right: 6px;
}

:deep(.dropdown-send) {
    display: none;
}

@media screen and (min-width: 768px) {
    :deep(.dropdown-send) {
        display: inline-block;
    }
}
</style>
