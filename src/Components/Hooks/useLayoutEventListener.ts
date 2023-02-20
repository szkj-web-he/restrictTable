/**
 * @file 监听事件的 hook
 * @date 2023-01-11
 * @author xuejie.he
 * @lastModify xuejie.he 2023-01-11
 */

import { RefObject, useLayoutEffect } from "react";
import useEventListener from "./useEventListener";
import { useLatest } from "./useLatest";

/**
 * 等同于useEventListener
 * 不同的是 它是在useLayoutEffect进行绑定的事件
 */
const useLayoutEventListener: typeof useEventListener = <
    KW extends keyof WindowEventMap,
    KH extends keyof HTMLElementEventMap,
    KM extends keyof MediaQueryListEventMap,
    T extends HTMLElement | MediaQueryList | void = void,
>(
    eventName: KW | KH | KM,
    handler: (
        event: WindowEventMap[KW] | HTMLElementEventMap[KH] | MediaQueryListEventMap[KM] | Event,
    ) => void,
    element?: RefObject<T>,
    options?: boolean | AddEventListenerOptions,
) => {
    const handlerRef = useLatest(handler);

    useLayoutEffect(() => {
        const targetElement: T | Window = element?.current ?? window;

        if (!targetElement?.addEventListener) return;

        const listener: typeof handler = (event) => handlerRef.current(event);

        targetElement.addEventListener(eventName, listener, options);

        return () => {
            targetElement.removeEventListener(eventName, listener, options);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [eventName, element, options]);
};

export default useLayoutEventListener;
