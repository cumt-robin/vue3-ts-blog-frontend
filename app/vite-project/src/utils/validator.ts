/**
 * @author: Tusi
 * @description: 通用校验
 */

export const REQUIRED_VALIDATOR_BLUR = {
    required: true,
    message: "必填项",
    trigger: "blur",
};

export const EMAIL_VALIDATOR = {
    pattern:
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    message: "邮箱格式不正确",
    trigger: "blur",
};

export const URL_VALIDATOR = {
    pattern: /(http|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-.,@?^=%&amp;:/~+#]*[\w\-@?^=%&amp;/~+#])?/,
    message: "链接格式不正确，注意以http或https开头",
    trigger: "blur",
};
