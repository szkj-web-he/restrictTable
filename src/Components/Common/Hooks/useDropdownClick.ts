/**
 * @file dropdown的 globalClick
 * @date 2022-10-20
 * @author xuejie.he
 * @lastModify xuejie.he 2022-10-20
 */

import { MutableRefObject, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useDropdownContext } from "../Dropdown";
import { TriggerProps } from "../Unit/type";
import { useLatest } from "./../../Hooks/useLatest";

export const useDropdownClick = (
    visible: boolean,
    callback: () => void,
    eventId?: string,
    eventName?: TriggerProps | TriggerProps[],
    disable?: boolean,
): MutableRefObject<number | null> => {
    const { btnIsClick } = useDropdownContext();

    const timer = useRef<number | null>(null);

    const visibleRef = useLatest(visible);

    const disableRef = useLatest(disable);

    const destroy = useRef(false);

    const callbackRef = useLatest(callback);

    /**
     * 是否可以添加全局点击事件
     */
    const isClick = useMemo(() => {
        let status = false;
        for (const key in btnIsClick) {
            const data = btnIsClick[key];
            if (data.clickId === eventId) {
                status =
                    !data.disable &&
                    !!(data.trigger === "click" || data.trigger?.includes("click"));
            } else if (data.contextmenuId === eventId) {
                status =
                    !data.disable &&
                    !!(data.trigger === "contextmenu" || data.trigger?.includes("contextmenu"));
            }
        }
        return status;
    }, [btnIsClick, eventId]);

    useEffect(() => {
        destroy.current = false;
        return () => {
            destroy.current = true;
            timer.current && window.clearTimeout(timer.current);
        };
    }, []);

    /**
     *
     */
    useLayoutEffect(() => {
        const clickFn = () => {
            timer.current = window.setTimeout(() => {
                if (destroy.current || disableRef.current) {
                    return;
                }
                if (visibleRef.current) {
                    callbackRef.current();
                }
            });
        };

        if (
            eventName === "click" ||
            eventName?.includes("click") ||
            eventName === "contextmenu" ||
            eventName?.includes("contextmenu") ||
            isClick
        ) {
            document.addEventListener("click", clickFn, true);
            document.addEventListener("contextmenu", clickFn, true);
        }
        return () => {
            document.removeEventListener("click", clickFn, true);
            document.removeEventListener("contextmenu", clickFn, true);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isClick, eventId, eventName]);

    return timer;
};
