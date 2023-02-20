/**
 * @file 解决 IEEE 754导致的精度丢失的bug
 * @date 2023-01-16
 * @author xuejie.he
 * @lastModify xuejie.he 2023-01-16
 */

/**
 * 找出最小的number
 */
const findMin = (arr: Array<number>) => {
    let min = arr[0];
    for (let i = 1; i < arr.length; i++) {
        const val = arr[i];
        if (val < min) {
            min = val;
        }
    }
    return min;
};

/**
 * 获取小数位
 * @param args
 */
const fetchDecimal = (num: number) => {
    const numStr = num.toString();
    return numStr.includes(".") ? numStr.split(".")[1].length : 0;
};

/**
 * 将所有的数字扩大相应的倍数
 *
 * 产生新的数字
 */

const toBigForNumber = (arr: Array<number>, type: "+" | "-") => {
    const minVal = findMin(arr);
    const length = fetchDecimal(minVal);
    const expansion = 10 ** length;

    let total = arr[0] * expansion;
    for (let i = 1; i < arr.length; i++) {
        const value = arr[i] * expansion;
        if (type === "-") {
            total -= value;
        } else {
            total += value;
        }
    }
    return total / expansion;
};

/**
 * 相加
 */
export const sum = (...args: Array<number>): number => {
    return toBigForNumber(args, "+");
};

/**
 * 相减
 */
export const sub = (...args: Array<number>): number => {
    return toBigForNumber(args, "-");
};

/**
 * 相乘
 */

export const mul = (...args: Array<number>): number => {
    /**
     * 扩大多少
     */
    let expansion = 1;

    let value = args[0];

    const length = fetchDecimal(value);
    expansion = 10 ** length;

    value *= expansion;

    for (let i = 1; i < args.length; i++) {
        let item = args[i];

        const itemLength = fetchDecimal(item);
        if (itemLength) {
            const itemExpansion = 10 ** itemLength;
            item *= itemExpansion;
            expansion *= itemExpansion;
        }
        value *= item;
    }
    return value / expansion;
};

/**
 * 相除
 * @param numerator 分子
 * @param denominator 分母
 */
export const toDiv = (numerator: number, denominator: number): number => {
    const minNum = findMin([numerator, denominator]);

    /**
     * 小数点后的位数
     */
    const length = fetchDecimal(minNum);
    /**
     * 扩大多少个10的阶乘
     */
    const lnVal = 10 ** length;

    return (numerator * lnVal) / (denominator * lnVal);
};
