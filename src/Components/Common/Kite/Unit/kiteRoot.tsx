/**
 * @file
 * @date 2021-12-13
 * @author xuejie.he
 * @lastModify xuejie.he 2021-12-13
 */
/* <------------------------------------ **** DEPENDENCE IMPORT START **** ------------------------------------ */
/** This section will include all the necessary dependence for this tsx file */
import React, { Fragment, isValidElement, useLayoutEffect, useRef, useState } from "react";
import "../../Portal/style.scss";
import { useLatest } from "./../../../Hooks/useLatest";
import { findDomFn } from "./findDomNode";

/* <------------------------------------ **** DEPENDENCE IMPORT END **** ------------------------------------ */
/* <------------------------------------ **** INTERFACE START **** ------------------------------------ */
/** This section will include all the interface for this tsx file */
interface KiteRootProps {
    /**
     *
     */
    children: React.ReactElement | Element;
    /**
     *
     */
    id: string;
    /**
     *
     */
    getRootEl: (res?: Element | undefined) => void;
}
/* <------------------------------------ **** INTERFACE END **** ------------------------------------ */
/* <------------------------------------ **** FUNCTION COMPONENT START **** ------------------------------------ */
const KiteRoot: React.FC<KiteRootProps> = ({ children, id, getRootEl }) => {
    KiteRoot.displayName = "KiteRoot";

    /* <------------------------------------ **** STATE START **** ------------------------------------ */
    /************* This section will include this component HOOK function *************/

    const showIRef = useRef<boolean>();

    const [showI, setShowI] = useState(showIRef.current);

    const ref = useRef<HTMLElement | null>(null);

    const getRootElFn = useLatest(getRootEl);

    useLayoutEffect(() => {
        const show = isValidElement(children);
        if (showIRef.current !== show) {
            setShowI(show);
        }

        if (!isValidElement(children) && children.nodeType === 1) {
            getRootElFn.current(children);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [children]);

    useLayoutEffect(() => {
        if (showI) {
            const el = ref.current;
            if (!el) {
                return;
            }
            const node = el.parentElement;

            const childrenList = node?.children;

            if (!childrenList) {
                return;
            }

            for (let i = 0; i < childrenList.length; i++) {
                const childrenItem = childrenList[i] as HTMLElement;
                if (childrenItem !== el) {
                    const status = findDomFn(childrenItem, id);
                    if (status) {
                        getRootElFn.current(childrenItem);
                    }
                }
            }

            showIRef.current = false;
            setShowI(showIRef.current);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, showI]);

    /* <------------------------------------ **** STATE END **** ------------------------------------ */

    /* <------------------------------------ **** FUNCTION START **** ------------------------------------ */
    /************* This section will include this component general function *************/
    if (isValidElement(children)) {
        return (
            <Fragment key={`kiteRoot${id}`}>
                {children}
                {showI && <i ref={ref} className={"kiteRoot_i"} />}
            </Fragment>
        );
    } else {
        if (children?.nodeType !== 1) {
            console.error(`Wrong root node type!`);
        }
        return <></>;
    }
};
KiteRoot.displayName = "KiteRoot";
/* <------------------------------------ **** FUNCTION COMPONENT END **** ------------------------------------ */
export default KiteRoot;
