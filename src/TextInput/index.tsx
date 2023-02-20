/**
 * @file 数字输入框类型
 * @date 2023-02-20
 * @author xuejie.he
 * @lastModify xuejie.he 2023-02-20
 */
/* <------------------------------------ **** DEPENDENCE IMPORT START **** ------------------------------------ */
/** This section will include all the necessary dependence for this tsx file */
import React from "react";
import { useMobile } from "../Components/Scroll/Unit/useMobile";
import Desk from "./Components/desk";
import Mobile from "./Components/mobile";
/* <------------------------------------ **** DEPENDENCE IMPORT END **** ------------------------------------ */
/* <------------------------------------ **** INTERFACE START **** ------------------------------------ */
/** This section will include all the interface for this tsx file */
export interface TempProps {
    onActive: (res: boolean) => void;
    active: boolean;
    onChange: (res: string) => void;
}
/* <------------------------------------ **** INTERFACE END **** ------------------------------------ */
/* <------------------------------------ **** FUNCTION COMPONENT START **** ------------------------------------ */
const Temp: React.FC<TempProps> = ({ onActive, active, onChange }) => {
    /* <------------------------------------ **** STATE START **** ------------------------------------ */
    /************* This section will include this component HOOK function *************/
    const mobileStatus = useMobile();
    /* <------------------------------------ **** STATE END **** ------------------------------------ */
    /* <------------------------------------ **** PARAMETER START **** ------------------------------------ */
    /************* This section will include this component parameter *************/
    /* <------------------------------------ **** PARAMETER END **** ------------------------------------ */
    /* <------------------------------------ **** FUNCTION START **** ------------------------------------ */
    /************* This section will include this component general function *************/
    /* <------------------------------------ **** FUNCTION END **** ------------------------------------ */
    if (mobileStatus) {
        return <Mobile onActive={onActive} active={active} onChange={onChange} />;
    }
    return <Desk onActive={onActive} active={active} onChange={onChange} />;
};
/* <------------------------------------ **** FUNCTION COMPONENT END **** ------------------------------------ */
export default Temp;
