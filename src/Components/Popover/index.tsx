/**
 * @file popover file
 * @date 2022-01-15
 * @author xuejie.he
 * @lastModify xuejie.he 2022-01-15
 */
/* <------------------------------------ **** DEPENDENCE IMPORT START **** ------------------------------------ */
/** This section will include all the necessary dependence for this tsx file */

import "./style.scss";

import React, { forwardRef, useEffect, useRef, useState } from "react";
import { defaultAttr, TriangleProps } from "./Unit/defaultAttr";

import { Kite } from "../Common/Kite";
import { useLatest } from "./../Hooks/useLatest";
import useLayoutEventListener from "./../Hooks/useLayoutEventListener";
import { KiteRoot } from "./Unit/rootContext";

/* <------------------------------------ **** DEPENDENCE IMPORT END **** ------------------------------------ */
/* <------------------------------------ **** INTERFACE START **** ------------------------------------ */
/** This section will include all the interface for this tsx file */
export interface PopoverProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * The kite will fly around root
     */
    root: React.ReactElement | Element;
    /**
     * children
     */
    children?: React.ReactNode;
    /**
     * width : The width of the box where the triangle is located
     * height : The width of the box where the triangle is located
     * color : Triangle color
     * offset : Triangle offset
     */
    triangle?: {
        width: string;
        height: string;
        color?: string;
        offset?: {
            x?:
                | number
                | ((
                      val: number,
                      width: { triangle?: number; root: number; kite: number },
                  ) => number);
            y?:
                | number
                | ((
                      val: number,
                      height: { triangle?: number; root: number; kite: number },
                  ) => number);
        };
    };
    /**
     * offset of 'Kite'
     */
    offset?: {
        x?:
            | number
            | ((val: number, width: { triangle: number; root: number; kite: number }) => number);
        y?:
            | number
            | ((val: number, height: { triangle: number; root: number; kite: number }) => number);
    };
    /**
     * Where to put it in root
     */
    placement?: "lb" | "rb" | "cb" | "lt" | "rt" | "ct" | "rc" | "lc";
    /**
     * The direction of the main axis
     */
    direction?: "vertical" | "horizontal";
    /**
     * where to mount
     */
    mount?: Element;
    /**
     * delay show
     * ms
     */
    delay?: number;
    /**
     * happen when visible changes
     */
    handleVisibleChange?: (res: boolean) => void;
    /**
     * body className
     */
    bodyClassName?: string;

    /**
     * 会不会弹框
     */
    disable?: boolean;
}

/* <------------------------------------ **** INTERFACE END **** ------------------------------------ */
/* <------------------------------------ **** FUNCTION COMPONENT START **** ------------------------------------ */
export const Popover = forwardRef<HTMLDivElement, PopoverProps>(
    (
        {
            root,
            children,
            triangle,
            className,
            style,
            offset,
            placement = "ct",
            direction = "vertical",
            onMouseLeave,
            onMouseEnter,
            mount,
            delay = 0,
            handleVisibleChange,
            bodyClassName,
            disable,
            ...props
        },
        ref,
    ) => {
        Popover.displayName = "Popover";

        const visibleRef = useRef(false);

        const [visible, setVisible] = useState(false);

        const kiteHover = useRef(false);

        const rootHover = useRef(false);

        const hoverTimer = useRef<number>();

        const delayTimer = useRef<number>();

        const isDestroy = useRef(false);

        const [rootEl, setRootEl] = useState<Element>();

        const handleVisibleChangeRef = useLatest(handleVisibleChange);

        const delayRef = useLatest(delay);

        /* <------------------------------------ **** FUNCTION START **** ------------------------------------ */
        /************* This section will include this component general function *************/

        const handleHoverChange = () => {
            if (!isDestroy.current) {
                delayTimer.current && window.clearTimeout(delayTimer.current);
                hoverTimer.current && window.clearTimeout(hoverTimer.current);
                if (kiteHover.current || rootHover.current) {
                    if (!visibleRef.current) {
                        delayTimer.current = window.setTimeout(() => {
                            visibleRef.current = true;
                            setVisible(visibleRef.current);
                            handleVisibleChangeRef.current?.(true);
                        }, delayRef.current);
                    }
                } else {
                    hoverTimer.current = window.setTimeout(() => {
                        if (visibleRef.current !== false) {
                            handleVisibleChangeRef.current?.(false);
                        }

                        visibleRef.current = false;
                        setVisible(false);
                    }, 5);
                }
            }
        };
        useLayoutEventListener(
            "mouseleave",
            () => {
                rootHover.current = false;
                handleHoverChange();
            },
            { current: rootEl as HTMLElement | null },
        );

        useLayoutEventListener(
            "mouseenter",
            () => {
                if (disable) {
                    return;
                }
                rootHover.current = true;
                handleHoverChange();
            },
            { current: rootEl as HTMLElement | null },
        );

        useEffect(() => {
            console.log("disable", disable, root);
            if (disable) {
                delayTimer.current && window.clearTimeout(delayTimer.current);
                hoverTimer.current && window.clearTimeout(hoverTimer.current);
                delayTimer.current = undefined;
                hoverTimer.current = undefined;
                visibleRef.current = false;
                setVisible(false);
                handleVisibleChangeRef.current?.(false);
            }

            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [disable]);

        useEffect(() => {
            isDestroy.current = false;
            return () => {
                delayTimer.current && window.clearTimeout(delayTimer.current);
                hoverTimer.current && window.clearTimeout(hoverTimer.current);
                isDestroy.current = true;
            };
        }, []);

        const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
            kiteHover.current = true;
            handleHoverChange();
            onMouseEnter?.(e);
        };

        const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
            kiteHover.current = false;
            handleHoverChange();
            onMouseLeave?.(e);
        };

        const classNameList: string[] = [];
        let defaultAttrData: {
            triangle: TriangleProps;
        } | null = null;

        const bodyClassNameList: string[] = [];
        classNameList.push(`popover_${direction}`);
        defaultAttrData = rootEl ? defaultAttr(direction) : null;

        bodyClassNameList.push("popover_body");

        return (
            <KiteRoot.Provider value={setRootEl}>
                <Kite
                    root={root}
                    mount={mount}
                    show={visible}
                    style={style}
                    animate="fade"
                    onMouseLeave={handleMouseLeave}
                    onMouseEnter={handleMouseEnter}
                    className={classNameList.join(" ") + (className ? ` ${className}` : "")}
                    placement={placement}
                    direction={direction}
                    offset={offset}
                    triangle={Object.assign({}, defaultAttrData?.triangle, triangle)}
                    bodyClassName={
                        bodyClassNameList.join(" ") + (bodyClassName ? ` ${bodyClassName}` : "")
                    }
                    ref={ref}
                    {...props}
                >
                    {children}
                </Kite>
            </KiteRoot.Provider>
        );

        /* <------------------------------------ **** FUNCTION END **** ------------------------------------ */
    },
);
Popover.displayName = "Popover";
/* <------------------------------------ **** FUNCTION COMPONENT END **** ------------------------------------ */
