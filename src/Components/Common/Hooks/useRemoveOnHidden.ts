/**
 * @file 隐藏时删除节点统一管理hook
 * @date 2023-02-03
 * @author xuejie.he
 * @lastModify xuejie.he 2023-02-03
 */

import { useLayoutEffect, useRef, useState } from "react";

/**
 *
 * @param show {boolean} 是否可见
 * @param removeOnHidden {boolean} 删除时是否隐藏
 * @param cache {boolean} 是否希望缓存节点
 * @returns [过渡结束后要调用的事件, 当前这个子节点要不要移除,当前这个子节点渲染了几次]
 */
export const useRemoveOnHidden = (
    /**
     * 是否可见
     */
    show?: boolean,
    /**
     * 删除时是否隐藏
     */
    removeOnHidden?: boolean,
    /**
     * 是否希望缓存节点
     */
    cache?: boolean,
): [() => void, boolean, boolean] => {
    /***
     * 记录上一次的show的状态
     */
    const showRef = useRef<{
        from?: boolean;
        to?: boolean;
    }>({
        from: undefined,
        to: undefined,
    });

    /**
     * 过渡动画是否结束
     */
    const [transitionEnd, setTransitionEnd] = useState<boolean | undefined>(true);

    /* <------------------------------------ **** HOOKS END **** ------------------------------------ */

    useLayoutEffect(() => {
        return () => {
            showRef.current = {
                from: undefined,
                to: undefined,
            };
        };
    }, []);

    {
        if (show !== showRef.current.to) {
            showRef.current = {
                from: showRef.current.to,
                to: show,
            };

            if (showRef.current.from === true && showRef.current.to === false) {
                setTransitionEnd(false);
            }
        }
    }

    /**
     * 当过渡动画结束后 要调用这个
     * 仅在show=false的执行
     */
    const endFn = () => {
        if (removeOnHidden) {
            if (showRef.current.to === false) {
                setTransitionEnd(true);
            } else {
                setTransitionEnd(undefined);
            }
        }
    };

    const isRemove = () => {
        /**
         * 为可见的时候
         * dom节点一直存在
         */
        if (show) {
            return false;
        }

        if (showRef.current.from === undefined && showRef.current.to === false) {
            return true;
        }

        /**
         * 为不可见的时候
         */

        if (removeOnHidden) {
            /**
             * 如果 在隐藏时需要删除节点
             */
            if (cache && showRef.current.from !== undefined) {
                /**
                 * 如果 希望缓存节点
                 * 且加载过节点的次数大于0次
                 * 就不需要删除节点
                 */
                return false;
            }
            if (transitionEnd) {
                /**
                 * 看看过渡是否结束
                 * 如果结束 且为隐藏的过渡
                 * 则需要删除节点
                 */
                return true;
            }

            return false;
        }

        /**
         * 如果在隐藏的时候不需要删除节点
         */
        return false;
    };

    const removeStatus = isRemove();

    /**
     * 是不是首次传入show值
     */
    const isFirst = showRef.current.from === undefined;
    return [endFn, removeStatus, isFirst];
};
