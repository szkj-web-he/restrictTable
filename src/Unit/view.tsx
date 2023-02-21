/**
 * @file
 * @date 2023-02-21
 * @author xuejie.he
 * @lastModify xuejie.he 2023-02-21
 */
/* <------------------------------------ **** DEPENDENCE IMPORT START **** ------------------------------------ */
/** This section will include all the necessary dependence for this tsx file */
import React, { useState } from "react";
import { Transition } from "../Components/Common/Transition";
import { Icon } from "../Components/Icon";
import "./style.scss";
/* <------------------------------------ **** DEPENDENCE IMPORT END **** ------------------------------------ */
/* <------------------------------------ **** INTERFACE START **** ------------------------------------ */
/** This section will include all the interface for this tsx file */
interface TempProps {
    title: string;

    show: boolean;

    children: React.ReactNode;

    onBackClick: () => void;

    onConfirmClick: () => void;
}
/* <------------------------------------ **** INTERFACE END **** ------------------------------------ */
/* <------------------------------------ **** FUNCTION COMPONENT START **** ------------------------------------ */
const Temp: React.FC<TempProps> = ({ title, show, children, onBackClick, onConfirmClick }) => {
    /* <------------------------------------ **** STATE START **** ------------------------------------ */
    /************* This section will include this component HOOK function *************/
    /* <------------------------------------ **** STATE END **** ------------------------------------ */
    /* <------------------------------------ **** PARAMETER START **** ------------------------------------ */
    /************* This section will include this component parameter *************/
    /* <------------------------------------ **** PARAMETER END **** ------------------------------------ */
    /* <------------------------------------ **** FUNCTION START **** ------------------------------------ */
    /************* This section will include this component general function *************/
    /* <------------------------------------ **** FUNCTION END **** ------------------------------------ */
    return (
        <Transition show={show} className="mobileView_wrapper" animationType="inRight">
            <div className="mobileView_top">
                <div className="mobileView_backBtn" onClick={onBackClick}>
                    <Icon type="nextArrow" className="mobileView_backIcon" />
                </div>
                <div className="mobileView_topName">表格填写</div>
                <div className="mobileView_confirmBtn" onClick={onConfirmClick}>
                    确认
                </div>
            </div>
            <div className="mobileView_main">
                <div className="mobileView_title">{title}</div>
                {children}
            </div>
        </Transition>
    );
};
/* <------------------------------------ **** FUNCTION COMPONENT END **** ------------------------------------ */
export default Temp;
