/**
 * @file css过渡
 * @date 2022-09-08
 * @author xuejie.he
 * @lastModify xuejie.he 2022-09-08
 */

import { MutableRefObject, useCallback, useEffect, useRef, useState } from "react";
import { useLatest } from "../../Hooks/useLatest";
import { SizeProps } from "../Kite/Unit/type";
import "../Transition/style.scss";
import { forceReflow } from "../Transition/Unit/forceReflow";
import { getTransitionAttr } from "../Transition/Unit/getTransitionAttr";
import {
    GetClassNameProps,
    initClassName,
    InitClassNameProps,
} from "../Transition/Unit/initClassName";

export enum ActionType {
    /**
     * 赋值过渡类名
     */
    SetClassNameAction = "SETCLASSNAME",
    /**
     * 切换可见状态
     * 合并了 获取宽高 和 切换可见状态
     */
    SwitchVisibleStatusAction = "SWITCHVISIBLESTATUS",
}
/**
 * 赋值过渡类名
 */
interface SetClassNameAction {
    type: ActionType.SetClassNameAction;
    payload: InitClassNameProps;
}

/**
 * 切换可见状态
 * 合并了 获取宽高 和 切换可见状态
 */
interface SwitchVisibleStatusAction {
    type: ActionType.SwitchVisibleStatusAction;
    payload: {
        value: boolean;
        isTransition: boolean;
    };
}

export function compareFn<T>(newData: T, oldData: T): T {
    if (typeof newData === "object" || typeof oldData === "object") {
        if (JSON.stringify(newData) === JSON.stringify(oldData)) {
            return oldData;
        }

        return newData;
    }

    return newData;
}

type TransitionAction = SetClassNameAction | SwitchVisibleStatusAction;

interface InsertAttrProps {
    className: Array<string>;
    style?: React.CSSProperties;
}

/**
 * transition-clock  用来获取过渡之前的数据
 * @param style: React.CSSProperties | undefined,
 * @param onTransitionStart 过渡开始
 * @param onTransitionEnd 过渡结束
 * @param onTransitionCancel 过渡取消
 * @param onTransitionCancel 过渡取消
 * @param root 要变化的节点
 * @returns
 */
export const useCssTransition = (
    onTransitionStart: (() => void) | undefined,
    onTransitionEnd: (() => void) | undefined,
    onTransitionCancel: (() => void) | undefined,
    node: MutableRefObject<HTMLDivElement | null>,
    width: number | "auto" = "auto",
    height: number | "auto" = "auto",
): [(action: TransitionAction) => void, InsertAttrProps] => {
    /**
     * 过渡切换时的类名
     */
    const transitionClassName = useRef<GetClassNameProps>();

    /**
     * 执行过渡动画时的临时 属性
     */
    const [insertAttr, setInsertAttr] = useState<InsertAttrProps>({
        className: ["transition_hidden"],
        style: undefined,
    });

    const isTransition = useRef(false);

    const [show, setShow] = useState<boolean>();
    const showRef = useRef<boolean>();

    const animationName = useRef<InitClassNameProps["type"]>();

    const transitionStartFn = useLatest(onTransitionStart);
    const transitionEndFn = useLatest(onTransitionEnd);
    const transitionCancelFn = useLatest(onTransitionCancel);

    const widthRef = useLatest(width);
    const heightRef = useLatest(height);

    /**
     * 过渡是否结束
     */
    const transitionEnd = useRef(true);
    /**
     * 是否在执行任务中
     */
    const isPending = useRef(false);

    /**
     * dom尺寸
     */
    const nodeSize = useRef<SizeProps>();

    useEffect(() => {
        const root = node.current;
        let timer: number | null = null;
        let destroy = false;
        let count = 0;
        let cloneRoot: HTMLDivElement | null = null;

        /**
         * 必须还原的class
         */
        const mustRevertClass = {
            add: "",
            remove: "",
        };

        /**判断是否有过渡类名 */
        const hasClassClassValue = (res: "enter" | "leave") => {
            if (!transitionClassName.current || !root) {
                return false;
            }
            const data = transitionClassName.current[res];
            cloneRoot = root.cloneNode(false) as HTMLDivElement | null;

            if (!root.parentElement || !cloneRoot) {
                return false;
            }
            root.parentElement.appendChild(cloneRoot);
            data.active && cloneRoot.classList.add(data.active);
            data.from && cloneRoot.classList.add(data.from);
            data.to && cloneRoot.classList.add(data.to);
            cloneRoot.classList.add("transition_r__hidden");

            const attr = getTransitionAttr(cloneRoot);
            const status = attr.propCount || attr.timeout;
            cloneRoot.remove();
            return status;
        };

        const changeAttr = (res: typeof insertAttr) => {
            return new Promise((resolve) => {
                setInsertAttr(() => {
                    timer && window.clearTimeout(timer);
                    timer = window.setTimeout(() => {
                        timer = null;
                        if (destroy) {
                            return;
                        }
                        forceReflow();
                        resolve(undefined);
                    });

                    return res;
                });
            });
        };

        /**
         * 延时执行
         */
        const delayTimeFn = (ms?: number) => {
            timer && window.clearTimeout(timer);
            return new Promise((resolve) => {
                timer = window.setTimeout(() => {
                    timer = null;
                    if (destroy) {
                        return;
                    }
                    resolve(undefined);
                }, ms);
            });
        };

        const transitionClass = transitionClassName.current;

        if (!root || !transitionClass) {
            return;
        }

        /**
         * 当可见时
         * 过渡结束时
         */
        const transitionendWhenShow = (e: TransitionEvent) => {
            if (e.target === root) {
                ++count;

                if (count >= getTransitionAttr(root).propCount) {
                    void enterEnd();
                }
            }
        };

        /**
         * 结束进入
         */
        const enterEnd = async () => {
            // console.log("enter end");
            timer && window.clearTimeout(timer);
            timer = null;

            await changeAttr({
                className: [],
                style: undefined,
            });

            transitionEnd.current = true;
            isPending.current = false;

            count = 0;

            transitionEndFn.current?.();
            root.removeEventListener("transitionend", transitionendWhenShow, false);
        };

        /**
         *  进入 后
         */
        const enterTo = async () => {
            // console.log("enter to");

            let styleData: React.CSSProperties | undefined = undefined;
            if (nodeSize.current) {
                switch (animationName.current) {
                    case "taller":
                        styleData = {
                            height: `${nodeSize.current.height}px`,
                        };
                        break;
                    case "wider":
                        styleData = {
                            width: `${nodeSize.current.width}px`,
                        };
                        break;
                    default:
                        break;
                }
            }
            await changeAttr({
                className: [transitionClass.enter.active, transitionClass.enter.to],
                style: styleData,
            });

            void delayTimeFn(getTransitionAttr(root).timeout + 1).then(enterEnd);

            root.addEventListener("transitionend", transitionendWhenShow, false);
        };

        /**
         * 进入前
         *
         */
        const enterFrom = async () => {
            // console.log("enter from", root);

            await changeAttr({
                className: [transitionClass.enter.from, transitionClass.enter.active],
            });
            await delayTimeFn();
            void enterTo();
        };

        /**
         * 结束离开
         */
        const leaveEnd = async () => {
            await changeAttr({
                className: ["transition_hidden"],
                style: undefined,
            });

            transitionEnd.current = true;
            isPending.current = false;

            count = 0;
            root.removeEventListener("transitionend", transitionendWhenHidden, false);

            timer && window.clearTimeout(timer);
            // console.log("leaveEnd");
            timer = null;
            transitionEndFn.current?.();
        };

        /**
         * 当transitionend事件结束时
         * 当可见度等于hidden
         */
        const transitionendWhenHidden = (e: TransitionEvent) => {
            if (e.target === root) {
                ++count;
                if (count >= getTransitionAttr(root).propCount) {
                    void leaveEnd();
                }
            }
        };

        /**
         * 离开后
         */
        const leaveTo = async () => {
            await changeAttr({
                className: [transitionClass.leave.to, transitionClass.leave.active],
                style: undefined,
            });

            void delayTimeFn(getTransitionAttr(root).timeout + 1).then(leaveEnd);

            // console.log("leaveTo");
            root.addEventListener("transitionend", transitionendWhenHidden, false);
        };

        /**
         * 离开前
         */
        const leaveFrom = async () => {
            // console.log("leaveFrom");

            let styleData: React.CSSProperties | undefined = undefined;

            if (nodeSize.current) {
                switch (animationName.current) {
                    case "taller":
                        styleData = {
                            height: `${nodeSize.current.height}px`,
                        };
                        break;
                    case "wider":
                        styleData = {
                            width: `${nodeSize.current.width}px`,
                        };
                        break;
                    default:
                        break;
                }
            }

            await changeAttr({
                className: [transitionClass.leave.from, transitionClass.leave.active],
                style: styleData,
            });

            void delayTimeFn().then(leaveTo);
        };

        //转为可见
        const toVisible = () => {
            const toTransition = () => {
                void readSize().then(() => {
                    /**
                     * 读取完尺寸
                     * 再执行过渡动画
                     */
                    transitionEnd.current = false;
                    void enterFrom();
                });
            };

            /**
             * 当变成可见的时候
             */
            if (hasClassClassValue("enter")) {
                /**
                 * enter的过渡className有过渡属性
                 */
                if (window.getComputedStyle(root, null).display !== "none") {
                    void changeAttr({
                        className: ["transition_hidden"],
                        style: undefined,
                    }).then(() => {
                        void delayTimeFn().then(toTransition);
                    });
                } else {
                    toTransition();
                }
                return;
            }

            /**
             * enter的过渡className 没有 过渡属性
             */
            transitionEnd.current = false;
            void enterEnd();
        };

        //转为不可见
        const toHidden = () => {
            if (hasClassClassValue("leave")) {
                /**
                 * leave的过渡className有过渡属性
                 */
                void readSize().then(() => {
                    /**
                     * 读取完尺寸
                     * 再执行过渡动画
                     */
                    forceReflow();
                    transitionEnd.current = false;
                    void leaveFrom();
                });
            } else {
                transitionEnd.current = false;
                void leaveEnd();
            }
        };

        /**
         * 重置dom的属性
         * 只有在过渡没有结束的情况下
         */
        const revertAttr = () => {
            return changeAttr({
                className: show ? ["transition_hidden"] : [],
                style: undefined,
            });
        };

        /**
         * 读取尺寸
         */
        const readSize = async () => {
            /**
             * 先看看需不需要获取宽高
             */
            if (!(animationName.current && ["taller", "wider"].includes(animationName.current))) {
                return;
            }

            /**
             * 在已经告知宽高的情况下
             */
            if (animationName.current === "wider") {
                const widthVal = widthRef.current;
                if (widthVal !== "auto") {
                    nodeSize.current = { height: 0, width: widthVal };
                    return;
                }
            } else if (animationName.current === "taller") {
                const heightVal = heightRef.current;
                if (heightVal !== "auto") {
                    nodeSize.current = { height: heightVal, width: 0 };
                    return;
                }
            }

            /**
             * 在没有告知宽高的情况下
             */
            if (!transitionEnd.current) {
                /**
                 * 如果过渡动画没有结束
                 * 就不通过操作class获取dom的宽高
                 */
                return;
            }

            /**
             * 过渡动画结束的情况下读取宽高
             */
            if (show) {
                /**
                 * 要变成可见
                 * 此时是不可见
                 */

                if (window.getComputedStyle(root, null).display !== "none") {
                    /**
                     * 如果状态不对
                     * 那就让他变成对的
                     */

                    await changeAttr({
                        className: ["transition_hidden"],
                    });

                    await delayTimeFn();
                }

                mustRevertClass.add = "transition_r__hidden";
                mustRevertClass.remove = "transition_hidden";
                root.classList.add(mustRevertClass.add);
                root.classList.remove(mustRevertClass.remove);
                forceReflow();

                await delayTimeFn().then(() => {
                    const rect = root.getBoundingClientRect();
                    nodeSize.current = {
                        width: rect.width,
                        height: rect.height,
                    };
                });

                await delayTimeFn().then(() => {
                    root.classList.add(mustRevertClass.remove);
                    root.classList.remove(mustRevertClass.add);
                    mustRevertClass.add = "";
                    mustRevertClass.remove = "";
                    forceReflow();
                });
            } else if (show === false) {
                if (window.getComputedStyle(root, null).display === "none") {
                    await changeAttr({
                        className: [],
                        style: undefined,
                    });
                }
                /**
                 * 要变成可见
                 * 此时不可见
                 */
                await delayTimeFn();

                const rect = root.getBoundingClientRect();
                nodeSize.current = {
                    width: rect.width,
                    height: rect.height,
                };
            }
            return;
        };

        /**
         * 过渡动画的主体函数
         * @param needInit 需不需要判断 要变成可见之前有没有 hidden这个className
         *
         * 1. 在needInit为true的时候
         * 2. 在需要过渡动画的时候
         * 3. 判断show===true
         * 4. 没有transition_hidden的时候
         * 添加transition_hidden这个属性
         *
         */
        const mainFn = () => {
            if (isTransition.current) {
                /**
                 * 如果需要执行过渡动画
                 */
                if (show) {
                    toVisible();
                } else {
                    toHidden();
                }
            } else {
                transitionEnd.current = false;
                /**
                 * 如果不需要执行过渡动画
                 */
                if (show) {
                    void enterEnd();
                } else {
                    void leaveEnd();
                }
            }
        };

        /**
         * 当 show的类型为boolean
         */
        if (typeof show === "boolean") {
            if (isPending.current) {
                /**
                 * 清除上次动画遗留的属性
                 */

                void revertAttr().then(() => {
                    transitionCancelFn.current?.();

                    /**
                     * 开始这一次的
                     */
                    transitionStartFn.current?.();
                    isPending.current = true;
                    mainFn();
                });
            } else {
                transitionStartFn.current?.();
                isPending.current = true;
                mainFn();
            }
        }

        return () => {
            mustRevertClass.remove && root.classList.add(mustRevertClass.remove);
            mustRevertClass.add && root.classList.remove(mustRevertClass.add);

            root?.removeEventListener("transitionend", transitionendWhenHidden, false);
            root?.removeEventListener("transitionend", transitionendWhenShow, false);
            destroy = true;
            if (timer) {
                window.clearTimeout(timer);
            }

            cloneRoot?.remove();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [show]);

    const dispatch = useCallback((action: TransitionAction) => {
        switch (action.type) {
            case ActionType.SetClassNameAction:
                animationName.current = action.payload.type;
                transitionClassName.current = initClassName(action.payload);
                break;
            case ActionType.SwitchVisibleStatusAction:
                // console.log(JSON.stringify(action.payload));
                if (showRef.current === action.payload.value) {
                    return;
                }
                if (showRef.current === undefined && action.payload.value === false) {
                    return;
                }

                showRef.current = action.payload.value;

                isTransition.current = action.payload.isTransition;
                setShow(action.payload.value);
                break;
        }
    }, []);

    return [dispatch, insertAttr];
};
