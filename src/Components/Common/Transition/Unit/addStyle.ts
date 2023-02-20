/**
 * @file add style
 * @date 2021-11-26
 * @author xuejie.he
 * @lastModify xuejie.he 2021-11-26
 */

import React from "react";

/**
 *
 * @param {string} cssText
 * @returns
 */
export const parseStyleText = (cssText: string): React.CSSProperties => {
    const res: Record<string, string> = {};
    cssText.split(";").forEach((item) => {
        if (item) {
            const tmp = item.split(":");
            if (tmp.length > 1) {
                let key = tmp[0].trim();
                const val = tmp[1].trim();

                key = key.replace(/-[a-z]/gi, (regVal) => {
                    return regVal.slice(1, 2).toUpperCase();
                });
                res[key] = val;
            }
        }
    });
    return res as React.CSSProperties;
};

/**
 *
 * @param {HTMLElement} el
 * @param {React.CSSProperties} css
 * @returns {void}
 */
export const setStyle = (el: HTMLElement, css?: React.CSSProperties): void => {
    el.removeAttribute("style");
    Object.assign(el.style, css);
    if (!el.getAttribute("style")) {
        el.removeAttribute("style");
    }
};
