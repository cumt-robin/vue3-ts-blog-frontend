import mitt from "mitt";

type Events = {
    // key 是事件名，类型是事件传值的类型
    sessionInvalid: void;
};

export const eventBus = mitt<Events>();
