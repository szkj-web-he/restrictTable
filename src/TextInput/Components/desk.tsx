/**
 * @file 电脑端数字输入框
 * @date 2023-02-20
 * @author xuejie.he
 * @lastModify xuejie.he 2023-02-20
 */
/* <------------------------------------ **** DEPENDENCE IMPORT START **** ------------------------------------ */
/** This section will include all the necessary dependence for this tsx file */
import React, { useRef } from "react";
import { TempProps } from "..";
import { Popover } from "../../Components/Popover";
import "../style.scss";
import Input from "./input";
/* <------------------------------------ **** DEPENDENCE IMPORT END **** ------------------------------------ */

/* <------------------------------------ **** FUNCTION COMPONENT START **** ------------------------------------ */
const Temp: React.FC<TempProps> = ({ onActive, active, onChange, value = "" }) => {
    /* <------------------------------------ **** STATE START **** ------------------------------------ */
    /************* This section will include this component HOOK function *************/

    const ref = useRef<HTMLDivElement | null>(null);

    /* <------------------------------------ **** STATE END **** ------------------------------------ */
    /* <------------------------------------ **** PARAMETER START **** ------------------------------------ */
    /************* This section will include this component parameter *************/

    /* <------------------------------------ **** PARAMETER END **** ------------------------------------ */
    /* <------------------------------------ **** FUNCTION START **** ------------------------------------ */
    /************* This section will include this component general function *************/

    const textStyle = () => {
        let style: React.CSSProperties | undefined = undefined;
        if (!(active || value.length === 0)) {
            style = { opacity: "0" };
        }

        if (value.length === 0 || (ref.current && ref.current?.offsetHeight <= 20)) {
            return { ...style, height: "2rem" };
        }
        return style;
    };

    const isDisable = () => {
        if (active) {
            return true;
        }

        if (ref.current && ref.current.scrollHeight > ref.current.offsetHeight + 10) {
            return false;
        }
        return true;
    };

    /* <------------------------------------ **** FUNCTION END **** ------------------------------------ */
    return (
        <div className="textInput_wrapper">
            <div
                className="textInput_view"
                ref={ref}
                style={!active && value.length > 0 ? { visibility: "visible" } : undefined}
            >
                {value}
            </div>
            <Popover
                disable={isDisable()}
                root={
                    <Input
                        active={active}
                        value={value}
                        style={textStyle()}
                        onChange={onChange}
                        onActive={onActive}
                    />
                }
            >
                {value}
            </Popover>
        </div>
    );
};
/* <------------------------------------ **** FUNCTION COMPONENT END **** ------------------------------------ */
export default Temp;
