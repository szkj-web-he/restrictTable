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
import { useLatest } from "../../Hooks/useLatest";

export const useCloneElementSize = (
    ref: MutableRefObject<HTMLDivElement | null>,
    removeClassList: string[],
    originStyle: MutableRefObject<React.CSSProperties | undefined>,
) => {
    const timer = useRef<number | null>(null);

    const destroy = useRef(false);

    const cloneEl = useRef<HTMLDivElement | null>(null);

    const removeClassListRef = useLatest(removeClassList);

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
                for (let i = 0; i < removeClassListRef.current.length; i++) {
                    cloneEl.current.classList.remove(removeClassListRef.current[i]);
                }
                setStyle(cloneEl.current, originStyle.current);

                forceReflow();

                //结束时的行为

                const endFn = () => {
                    resolve(cloneEl.current);
                    void delayFn().then(() => {
                        cloneEl.current?.remove();
                        cloneEl.current = null;
                    });
                };

                //如果没图片
                void delayFn().then(() => {
                    endFn();
                });
                return;
            });
        });
    });
};
