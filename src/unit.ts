import { comms, DataProps } from ".";

/**
 * 初始化 菜单列表
 */
export const initMenuData = (): Record<string, Array<DataProps>> => {
    const options = comms.config.options ?? [];

    const data: Record<string, Array<DataProps>> = {};
    if (options.length > 1) {
        for (let i = 1; i < options.length; i++) {
            const item = options[i];
            data[item.code] = [];
        }
    }
    return data;
};

/**
 * 初始化选中的值
 */
export const initSelectData = (): Record<string, string | null> => {
    const options = comms.config.options ?? [];

    const data: Record<string, string | null> = {};
    for (let i = 0; i < options.length; i++) {
        const item = options[i];
        data[item.code] = null;
    }
    return data;
};
