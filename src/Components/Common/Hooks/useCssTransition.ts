/**
 * @file css过渡
 * @date 2022-09-08
 * @author xuejie.he
 * @lastModify xuejie.he 2022-09-08
 */

import { MutableRefObject, useCallback, useEffect, useRef, useState } from "react";
import { SizeProps } from "../Kite/Unit/type";
import "../Transition/style.scss";
import { setStyle } from "../Transition/Unit/addStyle";
import { forceReflow } from "../Transition/Unit/forceReflow";
import { getTransitionAttr } from "../Transition/Unit/getTransitionAttr";
import {
    GetClassNameProps,
    initClassName,
    InitClassNameProps,
} from "../Transition/Unit/initClassName";
import { useLatest } from "./../../Hooks/useLatest";
import { useLayoutEffect } from "react";

/**
 * 过滤数组
 * @param { Array<string>} original 原始的数组
 * @param { Array<string>} exclude 剔除的数组
 * @returns {string[]} 新的数组
 */
const filterArray = (original: Array<string>, exclude: Array<string>): Array<string> => {
    const arr: string[] = [];
    for (let i = 0; i < original.length; i++) {
        let status = false;
        for (let j = 0; j < exclude.length; ) {
            if (original[i] === exclude[j]) {
                status = true;
                j = exclude.length;
            } else {
                ++j;
            }
        }
        if (!status) {
            arr.push(original[i]);
        }
    }
    return arr;
};

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
    style: React.CSSProperties | undefined,
    onTransitionStart: (() => void) | undefined,
    onTransitionEnd: (() => void) | undefined,
    onTransitionCancel: (() => void) | undefined,
    node: MutableRefObject<HTMLDivElement | null>,
    width: number | "auto" = "auto",
    height: number | "auto" = "auto",
): [
    (action: TransitionAction) => void,
    MutableRefObject<string[]>,
    MutableRefObject<React.CSSProperties | undefined>,
] => {
    /**
     * 过渡切换时的类名
     */
    const transitionClassName = useRef<GetClassNameProps>();

    const insertedClassName = useRef(["transition_hidden"]);

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

    /**
     * root的原始style
     */
    const styleRef = useLatest(style);

    /**
     * 执行过渡行为时 操作过的style
     */
    const addStyleRef = useRef<React.CSSProperties>();

    /**
     * 延时销毁
     */
    const destroyTimer = useRef<number | null>(null);

    useLayoutEffect(() => {
        const root = node.current;
        let timer: number | null = null;
        let destroy = false;
        let count = 0;
        let transitionAttr: ReturnType<typeof getTransitionAttr> | null = null;
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

        /**
         * 添加或删除className
         */
        const operationClassName = (type: "add" | "remove", cs: string[]) => {
            const arr: string[] = [];

            for (let i = 0; i < cs.length; i++) {
                if (cs[i]) {
                    arr.push(cs[i]);
                }
            }

            switch (type) {
                case "add":
                    root?.classList.add(...arr);
                    insertedClassName.current.push(...arr);
                    break;
                case "remove":
                    root?.classList.remove(...arr);
                    insertedClassName.current = filterArray(insertedClassName.current, arr);
                    break;
            }
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

        /**
         * 声明周期结束时要执行的事件
         */
        const returnFn = () => {
            root?.removeEventListener("transitionend", transitionendWhenHidden, false);
            root?.removeEventListener("transitionend", transitionendWhenShow, false);
            destroy = true;
            if (timer) {
                window.clearTimeout(timer);
            }
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
                if (count === transitionAttr?.propCount) {
                    enterEnd();
                }
            }
        };

        /**
         * 结束进入
         */
        const enterEnd = () => {
            // console.log("enter end");
            timer && window.clearTimeout(timer);
            timer = null;
            transitionEnd.current = true;
            isPending.current = false;

            operationClassName("remove", insertedClassName.current);
            setStyle(root, styleRef.current);
            count = 0;
            transitionAttr = null;
            addStyleRef.current = undefined;

            transitionEndFn.current?.();
            root.removeEventListener("transitionend", transitionendWhenShow, false);
        };

        /**
         *  进入 后
         */
        const enterTo = () => {
            // console.log("enter to");
            operationClassName("remove", [transitionClass.enter.from]);

            if (nodeSize.current) {
                switch (animationName.current) {
                    case "taller":
                        addStyleRef.current = {
                            height: `${nodeSize.current.height}px`,
                        };
                        break;
                    case "wider":
                        addStyleRef.current = {
                            width: `${nodeSize.current.width}px`,
                        };
                        break;
                    default:
                        break;
                }
            }
            if (addStyleRef.current) {
                setStyle(root, Object.assign({}, addStyleRef.current, styleRef.current));
            }

            operationClassName("add", [transitionClass.enter.to]);

            transitionAttr = getTransitionAttr(root);

            void delayTimeFn(transitionAttr.timeout + 1).then(enterEnd);

            root.addEventListener("transitionend", transitionendWhenShow, false);
        };

        /**
         * 进入前
         *
         */
        const enterFrom = () => {
            // console.log("enter from", root);
            operationClassName("add", [transitionClass.enter.from, transitionClass.enter.active]);
            operationClassName(
                "remove",
                filterArray(insertedClassName.current, [
                    transitionClass.enter.from,
                    transitionClass.enter.active,
                ]),
            );
            forceReflow();

            void delayTimeFn().then(enterTo);
        };

        /**
         * 结束离开
         */
        const leaveEnd = () => {
            transitionEnd.current = true;
            isPending.current = false;

            operationClassName("remove", insertedClassName.current);
            operationClassName("add", ["transition_hidden"]);
            count = 0;
            transitionAttr = null;
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
                if (count === transitionAttr?.propCount) {
                    leaveEnd();
                }
            }
        };

        /**
         * 离开后
         */
        const leaveTo = () => {
            operationClassName("remove", [transitionClass.leave.from]);
            setStyle(root, styleRef.current);
            addStyleRef.current = undefined;
            operationClassName("add", [transitionClass.leave.to]);

            void delayTimeFn((transitionAttr?.timeout ?? 0) + 1).then(leaveEnd);

            // console.log("leaveTo");
            root.addEventListener("transitionend", transitionendWhenHidden, false);
        };

        /**
         * 离开前
         */
        const leaveFrom = () => {
            // console.log("leaveFrom");

            if (nodeSize.current) {
                switch (animationName.current) {
                    case "taller":
                        addStyleRef.current = {
                            height: `${nodeSize.current.height}px`,
                        };
                        break;
                    case "wider":
                        addStyleRef.current = {
                            width: `${nodeSize.current.width}px`,
                        };
                        break;
                    default:
                        break;
                }
            }

            if (addStyleRef.current) {
                setStyle(root, Object.assign({}, addStyleRef.current, styleRef.current));
            }

            operationClassName("add", [transitionClass.leave.from, transitionClass.leave.active]);
            transitionAttr = getTransitionAttr(root);
            void delayTimeFn().then(leaveTo);
        };

        //转为可见
        const toVisible = (needInit: boolean) => {
            const toTransition = () => {
                void readSize().then(() => {
                    /**
                     * 读取完尺寸
                     * 再执行过渡动画
                     */
                    transitionEnd.current = false;
                    enterFrom();
                });
            };

            /**
             * 当变成可见的时候
             */
            if (hasClassClassValue("enter")) {
                /**
                 * enter的过渡className有过渡属性
                 */
                if (needInit && !root.classList.contains("transition_hidden")) {
                    operationClassName("add", ["transition_hidden"]);
                    forceReflow();
                    void delayTimeFn().then(toTransition);
                    return;
                }
                toTransition();
                return;
            }

            /**
             * enter的过渡className 没有 过渡属性
             */
            transitionEnd.current = false;
            enterEnd();
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
                    transitionEnd.current = false;
                    leaveFrom();
                });
            } else {
                transitionEnd.current = false;
                leaveEnd();
            }
        };

        /**
         * 重置dom的属性
         * 只有在过渡没有结束的情况下
         */
        const revertAttr = () => {
            addStyleRef.current = undefined;

            setStyle(root, styleRef.current);
            operationClassName("remove", insertedClassName.current);
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
                    operationClassName("add", ["transition_hidden"]);
                    forceReflow();
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
                return;
            } else if (show === false && window.getComputedStyle(root, null).display !== "none") {
                /**
                 * 要变成可见
                 * 此时不可见
                 */
                await delayTimeFn().then(() => {
                    const rect = root.getBoundingClientRect();
                    nodeSize.current = {
                        width: rect.width,
                        height: rect.height,
                    };
                });
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
        const mainFn = (needInit = false) => {
            if (isTransition.current) {
                /**
                 * 如果需要执行过渡动画
                 */
                if (show) {
                    toVisible(needInit);
                } else {
                    toHidden();
                }
            } else {
                transitionEnd.current = false;
                /**
                 * 如果不需要执行过渡动画
                 */
                if (show) {
                    enterEnd();
                } else {
                    leaveEnd();
                }
            }
        };

        /**
         * 当 show的类型为boolean
         */
        if (typeof show === "boolean") {
            destroyTimer.current && window.clearTimeout(destroyTimer.current);
            if (isPending.current) {
                /**
                 * 清除上次动画遗留的属性
                 */
                revertAttr();
                transitionCancelFn.current?.();

                /**
                 * 开始这一次的
                 */
                transitionStartFn.current?.();
                isPending.current = true;
                mainFn();
            } else {
                transitionStartFn.current?.();
                isPending.current = true;
                mainFn(true);
            }
        }
        return () => {
            mustRevertClass.remove && root.classList.add(mustRevertClass.remove);
            mustRevertClass.add && root.classList.remove(mustRevertClass.add);
            returnFn();
            cloneRoot?.remove();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [show]);

    /**
     * 当生命周期结束的时候
     * 要还原
     */
    useEffect(() => {
        const root = node.current;
        const operationClassName = (type: "add" | "remove", cs: string[]) => {
            const arr: string[] = [];

            for (let i = 0; i < cs.length; i++) {
                if (cs[i]) {
                    arr.push(cs[i]);
                }
            }

            switch (type) {
                case "add":
                    root?.classList.add(...arr);
                    insertedClassName.current.push(...arr);
                    break;
                case "remove":
                    root?.classList.remove(...arr);
                    insertedClassName.current = filterArray(insertedClassName.current, arr);
                    break;
            }
        };

        const initStyleData = styleRef.current;

        const cancelFn = transitionCancelFn.current;

        return () => {
            destroyTimer.current = window.setTimeout(() => {
                /**
                 * 这里为什么加延时
                 * 因为存在组件销毁
                 * 又马上创建的问题
                 */

                if (showRef.current) {
                    operationClassName("remove", insertedClassName.current);
                } else {
                    operationClassName(
                        "remove",
                        filterArray(insertedClassName.current, ["transition_hidden"]),
                    );
                }
                addStyleRef.current = undefined;

                if (root) {
                    setStyle(root, initStyleData);
                }

                if (isPending.current) {
                    cancelFn?.();
                }
                isPending.current = false;
                transitionEnd.current = true;
            });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
    return [dispatch, insertedClassName, addStyleRef];
};
