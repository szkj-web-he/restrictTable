/**

 * @file

 * @date 2022-09-09

 * @author xuejie.he

 * @lastModify xuejie.he 2022-09-09

 */

import { MutableRefObject, useLayoutEffect } from "react";
import { findReactElementFromDoms, includeElsProps } from "../Kite/Unit/findDomNode";

import { GlobalClick } from "../Kite/Unit/type";
import { useLatest } from "./../../Hooks/useLatest";

/**

 *

 * @param {GlobalClick | undefined} callback 全局点击的回调函数

 * @param {Element | undefined} root 根节点

 * @param {HTMLDivElement | null} portal portal节点

 */

export const useGlobalClick = (
    callback: GlobalClick | undefined,

    root: MutableRefObject<Element | HTMLElement | undefined | null>,

    portal: MutableRefObject<HTMLDivElement | null>,
): void => {
    const callbackFn = useLatest(callback);

    useLayoutEffect(() => {
        const globalFn = (e: MouseEvent) => {
            if (callbackFn.current) {
                let el = e.target;

                const elements: Element[] = [];

                while (
                    el instanceof Element &&
                    typeof el.tagName === "string" &&
                    !["BODY", "HTML"].includes(el.tagName)
                ) {
                    elements.push(el);
                    el = el.parentElement;
                }

                const arr: includeElsProps[] = [];

                root.current &&
                    arr.push({
                        name: "isBtn",
                        el: root.current,
                    });
                portal.current && arr.push({ name: "isMenu", el: portal.current });

                /**
                 * 这里记录了状态
                 */
                const status = findReactElementFromDoms(elements, [...arr]);
                const data = {
                    isBtn: false,
                    isMenu: false,
                };
                for (let i = 0; i < status.length; i++) {
                    const item = status[i];
                    if (item.name in data) {
                        const name = item.name as keyof typeof data;
                        data[name] = item.status;
                    }
                }

                callbackFn.current?.({ ...data });
            }
        };

        document.addEventListener("click", globalFn, true);

        return () => {
            document.removeEventListener("click", globalFn, true);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [root]);
};
