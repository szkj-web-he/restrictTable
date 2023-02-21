/**
 * @file
 * @date 2023-02-20
 * @author xuejie.he
 * @lastModify xuejie.he 2023-02-20
 */
/* <------------------------------------ **** DEPENDENCE IMPORT START **** ------------------------------------ */
/** This section will include all the necessary dependence for this tsx file */
import React, { useState } from "react";
import { TempProps } from "..";
import useUpdateEffect from "../../Components/Hooks/useUpdateEffect";
import ViewWrap from "../../Unit/view";
import Input from "./input";
/* <------------------------------------ **** DEPENDENCE IMPORT END **** ------------------------------------ */

/* <------------------------------------ **** FUNCTION COMPONENT START **** ------------------------------------ */
const Temp: React.FC<TempProps> = ({ onActive, active, onChange, value, mobileTitle }) => {
    /* <------------------------------------ **** STATE START **** ------------------------------------ */
    /************* This section will include this component HOOK function *************/
    const [open, setOpen] = useState(false);

    const [val, setVal] = useState(value);

    /* <------------------------------------ **** STATE END **** ------------------------------------ */
    /* <------------------------------------ **** PARAMETER START **** ------------------------------------ */
    /************* This section will include this component parameter *************/
    useUpdateEffect(() => {
        setVal(value);
    }, [value]);
    /* <------------------------------------ **** PARAMETER END **** ------------------------------------ */
    /* <------------------------------------ **** FUNCTION START **** ------------------------------------ */
    /************* This section will include this component general function *************/
    /* <------------------------------------ **** FUNCTION END **** ------------------------------------ */
    return (
        <div className="mobileTextInput_Wrapper">
            <div
                onClick={() => {
                    setOpen(true);
                }}
                className="mobileTextInput_mobileInputBtn"
            >
                {value ? (
                    <span className="mobileTextInput_viewContent">{value}</span>
                ) : (
                    <span className="mobileTextInput_viewPlaceholder">请输入</span>
                )}
            </div>
            <ViewWrap
                onBackClick={() => {
                    setOpen(false);
                }}
                onConfirmClick={() => {
                    onChange(val ?? "");
                    setOpen(false);
                }}
                show={open}
                title={mobileTitle ?? ""}
            >
                <Input
                    onActive={onActive}
                    active={active}
                    onChange={(res) => {
                        setVal(res);
                    }}
                    value={val}
                    className="mobileTextInput_ipt"
                />
            </ViewWrap>
        </div>
    );
};
/* <------------------------------------ **** FUNCTION COMPONENT END **** ------------------------------------ */
export default Temp;
