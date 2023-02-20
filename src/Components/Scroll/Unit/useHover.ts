/**
 * @file 原生绑定事件
 * @date 2023-02-07
 * @author xuejie.he
 * @lastModify xuejie.he 2023-02-07
 */
import { MutableRefObject, useLayoutEffect, useRef, useState } from "react";
import { addEventList, EventParams, removeEventList } from "../../Common/Kite/Unit/eventListener";
import { setScrollBar } from "./setScrollBar";
import { useMobile } from "./useMobile";

/**
 * 判断鼠标或手的触摸
 * 是否在滚动容器内触发
 */
export const useHover = (): [boolean, MutableRefObject<HTMLDivElement | null>] => {
    const ref = useRef<HTMLDivElement | null>(null);

    const isMobile = useMobile();

    const [hover, setHover] = useState(false);

    /**
     * 手机端
     */
    useLayoutEffect(() => {
        const el = ref?.current;
        const eventList: EventParams[] = [
            {
                type: "touchstart",
                listener: (e: Event) => {
                    setScrollBar(e.currentTarget as HTMLElement);
                    setHover(true);
                },
            },
            {
                type: "touchend",
                listener: () => {
                    setHover(false);
                },
            },
            {
                type: "touchcancel",
                listener: () => {
                    setHover(false);
                },
            },
        ];

        if (isMobile && el) {
            addEventList(el, eventList);
        }
        return () => {
            if (el) {
                removeEventList(el, eventList);
            }
        };
    }, [isMobile]);

    /**
     * 桌面端
     */
    useLayoutEffect(() => {
        const el = ref?.current;
        const eventList: EventParams[] = [
            {
                type: "mouseenter",
                listener: (e: Event) => {
                    setScrollBar(e.currentTarget as HTMLElement);
                    setHover(true);
                },
            },
            {
                type: "mouseleave",
                listener: () => {
                    setHover(false);
                },
            },
        ];
        if (!isMobile && el) {
            addEventList(el, eventList);
        }
        return () => {
            if (el) {
                removeEventList(el, eventList);
            }
        };
    }, [isMobile]);

    return [hover, ref];
};
