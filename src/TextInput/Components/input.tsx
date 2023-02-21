/**
 * @file
 * @date 2023-02-21
 * @author xuejie.he
 * @lastModify xuejie.he 2023-02-21
 */
/* <------------------------------------ **** DEPENDENCE IMPORT START **** ------------------------------------ */
/** This section will include all the necessary dependence for this tsx file */
import React, { useEffect, useRef } from "react";
import { TempProps } from "..";
import classNames from "../../Components/Unit/classNames";
/* <------------------------------------ **** DEPENDENCE IMPORT END **** ------------------------------------ */
/* <------------------------------------ **** INTERFACE START **** ------------------------------------ */
/** This section will include all the interface for this tsx file */
interface ChildTempProps extends TempProps {
    className?: string;
    style?: React.CSSProperties;
}

/* <------------------------------------ **** INTERFACE END **** ------------------------------------ */
/* <------------------------------------ **** FUNCTION COMPONENT START **** ------------------------------------ */
const Temp: React.FC<ChildTempProps> = ({
    onChange,
    style,
    onActive,
    value = "",
    active,
    className,
}) => {
    /* <------------------------------------ **** STATE START **** ------------------------------------ */
    /************* This section will include this component HOOK function *************/
    const ref = useRef<HTMLTextAreaElement | null>(null);
    /* <------------------------------------ **** STATE END **** ------------------------------------ */
    /* <------------------------------------ **** PARAMETER START **** ------------------------------------ */
    /************* This section will include this component parameter *************/
    useEffect(() => {
        if (!active && ref.current) {
            ref.current.value = value;
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, active]);

    /* <------------------------------------ **** PARAMETER END **** ------------------------------------ */
    /* <------------------------------------ **** FUNCTION START **** ------------------------------------ */
    /************* This section will include this component general function *************/
    /* <------------------------------------ **** FUNCTION END **** ------------------------------------ */
    return (
        <textarea
            placeholder="请输入"
            className={classNames("textInput_edit", className)}
            onInput={(e) => {
                onChange(e.currentTarget.value);
            }}
            ref={ref}
            style={style}
            onBlur={() => {
                onActive(false);
            }}
            onFocus={() => {
                onActive(true);
            }}
        />
    );
};
/* <------------------------------------ **** FUNCTION COMPONENT END **** ------------------------------------ */
export default Temp;
