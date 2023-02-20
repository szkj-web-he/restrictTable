/**
 * @file 深克隆一下数据
 * @date 2022-06-14
 * @author xuejie.he
 * @lastModify xuejie.he 2022-06-14
 */

import * as corejs from "core-js";

export const deepCloneData = <T>(data: T): T => {
    if (!window.structuredClone) {
        window.structuredClone = corejs.structuredClone;
    }
    return window.structuredClone(data);
};
