/**
 * @file
 * @date 2021-12-13
 * @author xuejie.he
 * @lastModify xuejie.he 2021-12-13
 */
/* <------------------------------------ **** DEPENDENCE IMPORT START **** ------------------------------------ */
/** This section will include all the necessary dependence for this tsx file */
import React, { forwardRef, useEffect, useRef, useState } from "react";
import { useId } from "../../Hooks/useId";
import { useKiteRoot } from "../../Popover/Unit/rootContext";
import { useGlobalClick } from "../Hooks/useGlobalClick";
import Portal from "../Portal";
import Root from "./Unit/kiteRoot";
import { GlobalClick, MainProps } from "./Unit/type";
/* <------------------------------------ **** DEPENDENCE IMPORT END **** ------------------------------------ */
/* <------------------------------------ **** INTERFACE START **** ------------------------------------ */
/** This section will include all the interface for this tsx file */
export interface KiteProps extends MainProps {
    /**
     * The kite will fly around root
     */
    root: React.ReactElement | Element;
    /**
     * show of 'Kite
     */
    show?: boolean;
    /**
     * Callback function for global click
     *
     * isBtn => click on root element
     * isMenu => click on kite child element
     */
    handleGlobalClick?: GlobalClick;
    /**
     * Remove when the element is hidden
     */
    removeOnHidden?: boolean;
    /**
     * Cache only works if removeOnHidden=true.
     * When cache=true, as long as the element has been rendered, it will no longer be removed.  The opposite is the state of cache=false.
     */
    cache?: boolean;
}

/* <------------------------------------ **** INTERFACE END **** ------------------------------------ */
/* <------------------------------------ **** FUNCTION COMPONENT START **** ------------------------------------ */
export const Kite = forwardRef<HTMLDivElement, KiteProps>(
    (
        {
            root,
            children,
            show = false,
            handleGlobalClick,
            placement = "cb",
            direction = "vertical",
            removeOnHidden = true,
            cache = true,
            offset,
            handleTransitionEnd,
            handleTransitionStart,
            handleTransitionCancel,
            animate,
            triangle,
            ...props
        },
        ref,
    ) => {
        Kite.displayName = "Kite";
        /* <------------------------------------ **** STATE START **** ------------------------------------ */
        /************* This section will include this component HOOK function *************/
        const id = useId();

        const [rootEl, setRootEl] = useState<Element>();

        const portalRef = useRef<HTMLDivElement | null>(null);

        const [ready, setReady] = useState(false);

        useGlobalClick(handleGlobalClick, rootEl, portalRef);

        const setRootElement = useKiteRoot();

        const [visible, setVisible] = useState<boolean>();
        /* <------------------------------------ **** STATE END **** ------------------------------------ */
        /* <------------------------------------ **** PARAMETER START **** ------------------------------------ */
        /************* This section will include this component parameter *************/

        useEffect(() => {
            if (ready) {
                setVisible(show);
            }
        }, [show, ready]);

        /* <------------------------------------ **** FUNCTION END **** ------------------------------------ */
        return (
            <>
                <Root
                    id={id}
                    getRootEl={(el: Element | undefined) => {
                        setRootEl(el);
                        setReady(!!el);
                        if (el) {
                            setRootElement(el);
                        }
                    }}
                >
                    {root}
                </Root>

                <Portal
                    removeOnHidden={removeOnHidden}
                    cache={cache}
                    direction={direction}
                    placement={placement}
                    show={visible ?? false}
                    root={rootEl}
                    hashId={id}
                    ref={(el) => {
                        portalRef.current = el;

                        if (typeof ref === "function") {
                            ref(el);
                        } else if (ref !== null) {
                            (ref as React.MutableRefObject<HTMLElement | null>).current = el;
                        }
                    }}
                    handleTransitionStart={handleTransitionStart}
                    offset={offset}
                    triangle={triangle}
                    handleTransitionEnd={handleTransitionEnd}
                    handleTransitionCancel={handleTransitionCancel}
                    animate={animate}
                    {...props}
                >
                    {children}
                </Portal>
            </>
        );
    },
);
/* <------------------------------------ **** FUNCTION COMPONENT END **** ------------------------------------ */
Kite.displayName = "Kite";
