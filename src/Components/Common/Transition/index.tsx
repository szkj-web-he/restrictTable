/**
 * @file transition component
 * @date 2021-11-26
 * @author xuejie.he
 * @lastModify xuejie.he 2021-11-26
 */
/* <------------------------------------ **** DEPENDENCE IMPORT START **** ------------------------------------ */
/** This section will include all the necessary dependence for this tsx file */
import React, { forwardRef, useEffect, useLayoutEffect, useRef } from "react";
import { ActionType, useCssTransition } from "../Hooks/useCssTransition";
import { useRemoveOnHidden } from "../Hooks/useRemoveOnHidden";
import { useLatest } from "./../../Hooks/useLatest";
import { deepCloneData } from "./../../Unit/deepCloneData";

/* <------------------------------------ **** DEPENDENCE IMPORT END **** ------------------------------------ */
/* <------------------------------------ **** INTERFACE START **** ------------------------------------ */
/** This section will include all the interface for this tsx file */

export interface TransitionProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * is child component visible
     */
    show: boolean;
    /**
     * enter className
     * * Intersection of fromEnter and toEnter
     */
    enterActive?: string;
    /**
     * leave className
     * * Intersection of fromLeave and toLeave
     */
    leaveActive?: string;
    /**
     * ClassName when entering
     */
    toEnter?: string;
    /**
     * ClassName when leaving
     */
    toLeave?: string;
    /**
     * ClassName when starting to enter
     */
    fromEnter?: string;
    /**
     * ClassName when starting to leave
     */
    fromLeave?: string;
    /**
     * children of ReactNode
     */
    children?: React.ReactNode;
    /**
     * first animation
     */
    firstAnimation?: boolean;
    /**
     * The component library encapsulates several default animation libraries
     */
    animationType?:
        | "fade"
        | "zoom"
        | "taller"
        | "wider"
        | "inLeft"
        | "inRight"
        | "inTop"
        | "inBottom"
        | "slideDown"
        | "slideUp"
        | "slideLeft"
        | "slideRight";

    /**
     * 如果animationType为taller的时候
     * height 为多少像素
     * * 默认是auto
     */
    height?: number | "auto";
    /**
     * 如果animationType为wider的时候
     * width 为多少像素
     * * 默认是auto
     */
    width?: number | "auto";

    /**
     * ontransitionEnd callback
     */
    handleTransitionEnd?: () => void;

    /**
     * Remove when the element is hidden
     */
    removeOnHidden?: boolean;
    /**
     * Cache only works if removeOnHidden=true.
     * When cache=true, as long as the element has been rendered, it will no longer be removed.  The opposite is the state of cache=false.
     */
    cache?: boolean;
    /**
     * transitionStart callback
     */
    handleTransitionStart?: () => void;
    /**
     * transition cancel callback
     */
    handleTransitionCancel?: () => void;
}
/* <------------------------------------ **** INTERFACE END **** ------------------------------------ */
/* <------------------------------------ **** FUNCTION COMPONENT START **** ------------------------------------ */
export const Transition = forwardRef<HTMLDivElement, TransitionProps>(
    (
        {
            show,
            children,
            firstAnimation = false,
            handleTransitionEnd,
            handleTransitionStart,
            handleTransitionCancel,
            removeOnHidden = false,
            cache,
            ...props
        },
        ref,
    ) => {
        Transition.displayName = "Transition";
        /* <------------------------------------ **** HOOKS START **** ------------------------------------ */
        /************* This section will include this component HOOK function *************/

        const [endFn, isRemove, isFirst] = useRemoveOnHidden(show, removeOnHidden, cache);

        if (isRemove) {
            return <></>;
        }
        return (
            <Main
                show={show}
                ref={ref}
                isTransition={isFirst ? firstAnimation : true}
                handleTransitionStart={handleTransitionStart}
                handleTransitionEnd={() => {
                    handleTransitionEnd?.();
                    endFn();
                }}
                handleTransitionCancel={() => {
                    handleTransitionCancel?.();
                    endFn();
                }}
                {...props}
            >
                {children}
            </Main>
        );
    },
);
/* <------------------------------------ **** FUNCTION COMPONENT END **** ------------------------------------ */
Transition.displayName = "Transition";

const Main = forwardRef<
    HTMLDivElement,
    Omit<TransitionProps, "removeOnHidden" | "cache" | "firstAnimation"> & { isTransition: boolean }
>(
    (
        {
            className,
            style,
            children,
            handleTransitionStart,
            handleTransitionEnd,
            handleTransitionCancel,
            animationType,
            enterActive,
            fromEnter,
            fromLeave,
            leaveActive,
            toEnter,
            toLeave,
            height,
            width,
            show,
            isTransition,
            ...props
        },
        ref,
    ) => {
        Main.displayName = "Main";

        const cloneRef = useRef<HTMLDivElement | null>(null);

        const [dispatch, classList, currentStyle] = useCssTransition(
            style,
            handleTransitionStart,
            handleTransitionEnd,
            handleTransitionCancel,
            cloneRef,
            width,
            height,
        );

        const dispatchRef = useLatest(dispatch);

        const isTransitionRef = useLatest(isTransition);

        useLayoutEffect(() => {
            dispatchRef.current({
                type: ActionType.SetClassNameAction,
                payload: {
                    type: animationType,
                    enterActive,
                    fromEnter,
                    fromLeave,
                    leaveActive,
                    toEnter,
                    toLeave,
                },
            });
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [animationType, enterActive, fromEnter, fromLeave, leaveActive, toEnter, toLeave]);

        useEffect(() => {
            dispatchRef.current({
                type: ActionType.SwitchVisibleStatusAction,
                payload: {
                    value: show,
                    isTransition: isTransitionRef.current,
                },
            });
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [show]);

        // /**
        //  * 测试逻辑
        //  */

        // useLayoutEffect(() => {
        //     const node = cloneRef.current;
        //     if (!node) {
        //         return;
        //     }

        //     const fn = () => {
        //         console.log(" ******************** ");
        //         console.log("style", node.getAttribute("style"));
        //         console.log("className", node.getAttribute("class"));
        //         console.log(" ******************** ");
        //     };

        //     const ob = new MutationObserver(fn);
        //     ob.observe(node, {
        //         attributes: true,
        //     });
        //     return () => {
        //         ob.disconnect();
        //     };
        // }, [show]);

        const setClassName = () => {
            const arr = deepCloneData(classList.current);
            return arr.join(" ") + (className ? ` ${className}` : "");
        };

        return (
            <div
                ref={(el) => {
                    cloneRef.current = el;
                    if (typeof ref === "function") {
                        ref(el);
                    } else if (ref !== null) {
                        (ref as React.MutableRefObject<HTMLElement | null>).current = el;
                    }
                }}
                style={{ ...style, ...currentStyle.current }}
                className={setClassName()}
                {...props}
            >
                {children}
            </div>
        );
    },
);

Main.displayName = "Main";
