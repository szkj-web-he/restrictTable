/**
 * @file  通过克隆节点来获取宽高
 * @date 2023-02-02
 * @author xuejie.he
 * @lastModify xuejie.he 2023-02-02
 */
import { MutableRefObject, useEffect, useRef } from "react";
import { setStyle } from "../Transition/Unit/addStyle";
import { forceReflow } from "../Transition/Unit/forceReflow";
import "../Transition/style.scss";

export const useCloneElementSize = (
    ref: MutableRefObject<HTMLDivElement | null>,
    removeClassList: React.MutableRefObject<string[]>,
    originStyle: MutableRefObject<React.CSSProperties | undefined>,
): MutableRefObject<() => Promise<HTMLDivElement | null>> => {
    const timer = useRef<number | null>(null);

    const destroy = useRef(false);

    const cloneEl = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        destroy.current = false;
        return () => {
            destroy.current = true;
            cloneEl.current?.remove();
            timer.current && window.clearTimeout(timer.current);
        };
    }, []);

    return useRef(() => {
        //延时执行
        const delayFn = (delay = 1) => {
            return new Promise((resolve) => {
                timer.current = window.setTimeout(() => {
                    timer.current = null;
                    if (destroy.current) {
                        return;
                    }
                    resolve(undefined);
                }, delay);
            });
        };

        return new Promise<HTMLDivElement | null>((resolve) => {
            const el = ref.current;
            if (!el) {
                resolve(null);
                return;
            }

            void delayFn().then(() => {
                cloneEl.current?.remove();
                cloneEl.current = el.cloneNode(true) as HTMLDivElement;

                const parentEl = el.parentElement;
                parentEl?.appendChild(cloneEl.current);
                cloneEl.current.classList.add("transition_r__hidden");
                for (let i = 0; i < removeClassList.current.length; i++) {
                    cloneEl.current.classList.remove(removeClassList.current[i]);
                }
                setStyle(cloneEl.current, originStyle.current);

                forceReflow();
                const imgs = cloneEl.current?.querySelectorAll("img") ?? [];

                //结束时的行为

                const endFn = () => {
                    resolve(cloneEl.current);
                    void delayFn().then(() => {
                        cloneEl.current?.remove();
                        cloneEl.current = null;
                    });
                };

                if (!imgs.length) {
                    //如果没图片
                    void delayFn().then(() => {
                        endFn();
                    });
                    return;
                }

                let index = 0;
                for (let i = 0; i < imgs.length; i++) {
                    const readOverFn = () => {
                        ++index;
                        if (index === imgs.length) {
                            endFn();
                        }
                    };
                    if (imgs[i].complete) {
                        readOverFn();
                    } else {
                        imgs[i].addEventListener("load", readOverFn, { once: true });
                        imgs[i].addEventListener("error", readOverFn, { once: true });
                    }
                }
            });
        });
    });
};
