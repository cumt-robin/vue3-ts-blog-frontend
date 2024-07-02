<!--
 * @author: Tusi
 * @description: 在线聊天室
-->
<template>
    <base-layout>
        <section class="chat-room">
            <a-card class="card-chat" hoverable>
                <template #title>
                    <span>一个简单的在线交流功能，正在升级中...</span>
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
                <a-form ref="chatForm" :model="chatForm" :rules="chatRules" class="form-chat">
                    <a-form-item name="chatContent" class="form-item--content" :wrapper-col="{ span: 24 }">
                        <a-textarea
                            v-model:value="chatForm.chatContent"
                            placeholder="输入内容后点击发送..."
                            :autosize="{ minRows: 2, maxRows: 4 }"
                            @keydown="onKeydownChat"
                        />
                    </a-form-item>
                    <a-form-item class="form-item--btn">
                        <a-button class="btn-send" ghost type="primary" size="small" @click="sendChatContent">发送</a-button>
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
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-this-alias */

import io from "socket.io-client";
import { defineComponent } from "vue";
import { DownOutlined } from "@ant-design/icons-vue";
import { Card, Dropdown, Form, Input, Menu, Radio } from "ant-design-vue";
import { format } from "@/utils/date-utils";
import { setScrollTop } from "@/utils/dom";

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
    data() {
        return {
            socket: null,
            msgList: [],
            chatForm: {
                chatContent: "",
            },
            chatRules: {
                chatContent: [{ required: true, message: "请输入聊天内容", trigger: "blur" }],
            },
            // 1代表Enter触发，2代表Ctrl+Enter触发
            triggerType: 1,
        };
    },
    mounted() {
        this.createSocket();
        this.$watch(
            "msgList",
            () => {
                this.$nextTick(() => {
                    const el = this.$refs.msgBoxRef;
                    const scrollTop = el.scrollHeight - el.clientHeight;
                    setScrollTop({
                        target: this.$refs.msgBoxRef,
                        useAnimation: true,
                        targetValue: scrollTop,
                    });
                });
            },
            { deep: true }
        );
    },
    beforeUnmount() {
        if (this.socket) {
            this.socket.close();
        }
    },
    methods: {
        createSocket() {
            const self = this;
            this.socket = io(`${process.env.VUE_APP_SOCKET_SERVER}/chatroom`);
            this.socket.on("connect", function () {
                console.log("连上了");
            });
            this.socket.on("singleMsg", function (msg) {
                console.log(msg);
                switch (msg.event) {
                    case "greet_from_server":
                        self.msgList.push({
                            time: format(new Date(), "HH:mm:ss"),
                            user: "系统通知",
                            content: msg.data.content,
                            type: "sys_msg",
                            customClass: "sys_msg",
                        });
                        break;
                    default:
                        break;
                }
            });
            this.socket.on("broadcastAll", function (msg) {
                console.log(msg);
            });
            this.socket.on("broadcast", function (msg) {
                console.log(msg);
                switch (msg.event) {
                    case "new_user_join":
                        self.msgList.push({
                            time: format(new Date(), "HH:mm:ss"),
                            user: "系统通知",
                            content: `用户 ${msg.data.user} 加入了聊天室......`,
                            type: "sys_msg",
                            customClass: "sys_msg",
                        });
                        break;
                    case "someone_exit":
                        self.msgList.push({
                            time: format(new Date(), "HH:mm:ss"),
                            user: "系统通知",
                            content: `用户 ${msg.data.user} 退出了聊天室......`,
                            type: "sys_msg",
                            customClass: "sys_msg",
                        });
                        break;
                    case "new_chat_content":
                        self.msgList.push({
                            time: format(new Date(), "HH:mm:ss"),
                            user: msg.data.user,
                            content: msg.data.content,
                            type: "others",
                            customClass: "others",
                        });
                        break;
                    default:
                        break;
                }
            });
            this.socket.on("disconnect", function () {
                console.log("连接断开了");
            });
        },
        async sendChatContent() {
            const self = this;
            await self.$refs.chatForm.validate();
            self.socket.emit("chat", self.chatForm.chatContent);
            self.msgList.push({
                time: format(new Date(), "HH:mm:ss"),
                user: "我说",
                content: self.chatForm.chatContent,
                type: "mine",
                customClass: "mine",
            });
            self.$refs.chatForm.resetFields();
        },
        onKeydownChat(e) {
            if ((this.triggerType === 1 && e.keyCode === 13) || (this.triggerType === 2 && e.ctrlKey && e.keyCode === 13)) {
                e.preventDefault();
                this.sendChatContent();
            }
        },
    },
});
</script>

<style lang="scss" scoped>
:deep(.card-chat) {
    box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);

    .ant-card-head {
        background: #daf1ef;
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
            white-space: nowrap;
            color: #999;
            > span {
                margin-right: 10px;
            }
            .chat-text {
                margin-top: 5px;
                span {
                    position: relative;
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
