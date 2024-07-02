import dayjs, { OpUnitType, QUnitType } from "dayjs";
import { merge } from "lodash-es";
import zhCN from "dayjs/locale/zh-cn";
import relativeTime from "dayjs/plugin/relativeTime";
import { PlainObject } from "@/bean/base";

export function init(): void {
    dayjs.locale(zhCN);
    dayjs.extend(relativeTime);
}

export const DATE_STANDARD_FORMAT = "YYYY-MM-DD HH:mm:ss";

export const DATE_STANDARD_FORMAT_CN = "YYYY年M月D日 HH:mm:ss";

export const HOUR_FORMAT = "HH:mm:ss";

export const ONE_DAY_MILLSECONDS = 86400000;

export const ONE_WEEK_MILLSECONDS = ONE_DAY_MILLSECONDS * 7;

export function format(date: Date | string = new Date(), fmt = DATE_STANDARD_FORMAT): string {
    return dayjs(date).format(fmt);
}

export function getValueOfDate(date = new Date()): number {
    return dayjs(date).valueOf();
}

export function getTime(date = new Date()): number {
    return dayjs(date).toDate().getTime();
}

interface DayjsAddOption extends PlainObject {
    offset: number;
    unit: OpUnitType;
    format: string;
}

/**
 * 根据指定日期和选项获取另一个日期
 * @param {String|Date} date 指定日期
 * @param {Object} options 选项，options.offset大于0则获得更大的日期，否则获取更小的日期，options.unit是时间单位，默认是天('d')，options.format是输出的时间格式
 */
export function getDateByOffset(date = new Date(), options: DayjsAddOption): string {
    const defaultOptions: DayjsAddOption = {
        offset: 0,
        unit: "d",
        format: DATE_STANDARD_FORMAT,
    };
    const mergedOptions = merge(defaultOptions, options) as DayjsAddOption;
    const targetDate = dayjs(date).add(mergedOptions.offset, mergedOptions.unit);
    return targetDate.format(mergedOptions.format);
}

/**
 * 获取两个日期间隔
 * @param {String} dateStr1 日期1
 * @param {String} dateStr2 日期2
 * @param {String} unit 结果时间单位
 */
export function getTimeInterval(dateStr1: string, dateStr2: string, unit: QUnitType | OpUnitType = "minute"): number {
    const date1 = dayjs(dateStr1);
    const date2 = dayjs(dateStr2);
    return Math.abs(date1.diff(date2, unit, true));
}

export function getDayStart(date = new Date(), fmt = DATE_STANDARD_FORMAT, offset = 0): string | number {
    let res = dayjs(date).startOf("day");
    if (typeof offset === "number" && offset !== 0) {
        res = offset > 0 ? res.add(offset, "d") : res.subtract(Math.abs(offset), "d");
    }
    if (fmt === "valueOf") {
        return res.valueOf();
    }
    return res.format(fmt);
}

export function getDayEnd(date = new Date(), fmt = DATE_STANDARD_FORMAT, offset = 0): string | number {
    let res = dayjs(date).endOf("day");
    if (typeof offset === "number" && offset !== 0) {
        res = offset > 0 ? res.add(offset, "d") : res.subtract(Math.abs(offset), "d");
    }
    if (fmt === "valueOf") {
        return res.valueOf();
    }
    return res.format(fmt);
}

export function getOneDayRange(date = new Date(), fmt = DATE_STANDARD_FORMAT, offset = 0): (string | number)[] {
    return [getDayStart(date, fmt, offset), getDayEnd(date, fmt, offset)];
}

export function isMoreThanOneDay(date1: Date | string, date2: Date | string): boolean {
    const dayjs1 = dayjs(date1);
    const dayjs2 = dayjs(date2);
    const diff = Math.abs(dayjs1.diff(dayjs2, "days"));
    return diff >= 1;
}

export function isBefore(date1: Date | string, date2: Date | string): boolean {
    const dayjs1 = dayjs(date1);
    const dayjs2 = dayjs(date2);
    return dayjs1.isBefore(dayjs2);
}

export function isSameDay(date1: Date, date2: Date): boolean {
    return format(date1) === format(date2);
}

export function getWeekStart(date = new Date(), fmt = DATE_STANDARD_FORMAT, offset = 0): string {
    let res = dayjs(date).startOf("week");
    if (typeof offset === "number" && offset !== 0) {
        res = offset > 0 ? res.add(offset, "w") : res.subtract(Math.abs(offset), "w");
    }
    return res.format(fmt);
}

export function getWeekEnd(date = new Date(), fmt = DATE_STANDARD_FORMAT, offset = 0): string {
    let res = dayjs(date).endOf("week");
    if (typeof offset === "number" && offset !== 0) {
        res = offset > 0 ? res.add(offset, "w") : res.subtract(Math.abs(offset), "w");
    }
    return res.format(fmt);
}

export function getOneWeekRange(date = new Date(), fmt = DATE_STANDARD_FORMAT, offset = 0): string[] {
    return [getWeekStart(date, fmt, offset), getWeekEnd(date, fmt, offset)];
}

export function getMonthStart(date = new Date(), fmt = DATE_STANDARD_FORMAT, offset = 0): string {
    let res = dayjs(date).startOf("month");
    if (typeof offset === "number" && offset !== 0) {
        res = offset > 0 ? res.add(offset, "M") : res.subtract(Math.abs(offset), "M");
    }
    return res.format(fmt);
}

export function getMonthEnd(date = new Date(), fmt = DATE_STANDARD_FORMAT, offset = 0): string {
    let res = dayjs(date).endOf("month");
    if (typeof offset === "number" && offset !== 0) {
        res = offset > 0 ? res.add(offset, "M") : res.subtract(Math.abs(offset), "M");
    }
    return res.format(fmt);
}

export function getOneMonthRange(date = new Date(), fmt = DATE_STANDARD_FORMAT, offset = 0): string[] {
    return [getMonthStart(date, fmt, offset), getMonthEnd(date, fmt, offset)];
}

export function getYearStart(date = new Date(), fmt = DATE_STANDARD_FORMAT, offset = 0): string {
    let res = dayjs(date).startOf("year");
    if (typeof offset === "number" && offset !== 0) {
        res = offset > 0 ? res.add(offset, "y") : res.subtract(Math.abs(offset), "y");
    }
    return res.format(fmt);
}

export function getYearEnd(date = new Date(), fmt = DATE_STANDARD_FORMAT, offset = 0): string {
    let res = dayjs(date).endOf("year");
    if (typeof offset === "number" && offset !== 0) {
        res = offset > 0 ? res.add(offset, "y") : res.subtract(Math.abs(offset), "y");
    }
    return res.format(fmt);
}

export function getOneYearRange(date = new Date(), fmt = DATE_STANDARD_FORMAT, offset = 0): string[] {
    return [getYearStart(date, fmt, offset), getYearEnd(date, fmt, offset)];
}

export function humanizeDuration(seconds: string | number): string {
    if (typeof seconds !== "number") {
        return "";
    }
    if (seconds < 60) {
        // 如果小于1分钟
        return `${seconds}秒`;
    }
    if (seconds >= 60 && seconds < 3600) {
        // 如果大于1分钟，小于1小时
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds - minutes * 60;
        const secondsDescription = remainingSeconds > 0 ? `${remainingSeconds}秒` : "";
        return `${minutes}分钟${secondsDescription}`;
    }
    if (seconds >= 3600 && seconds < 86400) {
        // 如果大于1小时，小于1天
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds - hours * 3600) / 60);
        // const remainingSeconds = seconds - hours * 3600 - minutes * 60
        const minutesDescription = minutes > 0 ? `${minutes}分钟` : "";
        return `${hours}小时${minutesDescription}`;
    }
    if (seconds >= 86400) {
        // 如果大于1天
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds - days * 86400) / 3600);
        // const minutes = Math.floor((seconds - days * 86400 - hours * 3600) / 60)
        // const remainingSeconds = seconds - days * 86400 - hours * 3600 - minutes * 60
        const hoursDescription = hours > 0 ? `${hours}小时` : "";
        return `${days}天${hoursDescription}`;
    }
    return "";
}
