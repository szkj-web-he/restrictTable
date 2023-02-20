/**
 * @file
 * @date 2023-02-16
 * @author xuejie.he
 * @lastModify xuejie.he 2023-02-16
 */
/* <------------------------------------ **** DEPENDENCE IMPORT START **** ------------------------------------ */
/** This section will include all the necessary dependence for this tsx file */
import React, { useState } from "react";
import { DataProps } from ".";
import { Dropdown } from "./Components/Common/Dropdown";
import { DropdownBtn } from "./Components/Common/DropdownBtn";
import { DropdownContent } from "./Components/Common/DropdownContent";
import { Icon } from "./Components/Icon";
import { ScrollComponent } from "./Components/Scroll";
import classNames from "./Components/Unit/classNames";
import { deepCloneData } from "./Components/Unit/deepCloneData";
/* <------------------------------------ **** DEPENDENCE IMPORT END **** ------------------------------------ */
/* <------------------------------------ **** INTERFACE START **** ------------------------------------ */
/** This section will include all the interface for this tsx file */
interface TempProps {
    /**
     * 可不可以编辑
     */
    disable?: boolean;

    list?: Array<DataProps>;
    /**
     * 这个选的是什么
     */
    name: string;
    /**
     * 选中的值
     */
    value?: string;
    /**
     *
     */
    onChange: (res: DataProps) => void;
}
/* <------------------------------------ **** INTERFACE END **** ------------------------------------ */
/* <------------------------------------ **** FUNCTION COMPONENT START **** ------------------------------------ */
const Temp: React.FC<TempProps> = ({ disable, list, name, value, onChange }) => {
    /* <------------------------------------ **** STATE START **** ------------------------------------ */
    /************* This section will include this component HOOK function *************/
    const [show, setShow] = useState(false);

    /* <------------------------------------ **** STATE END **** ------------------------------------ */
    /* <------------------------------------ **** PARAMETER START **** ------------------------------------ */
    /************* This section will include this component parameter *************/
    /* <------------------------------------ **** PARAMETER END **** ------------------------------------ */
    /* <------------------------------------ **** FUNCTION START **** ------------------------------------ */
    /************* This section will include this component general function *************/
    /* <------------------------------------ **** FUNCTION END **** ------------------------------------ */
    return (
        <Dropdown trigger={"click"} disable={disable}>
            <DropdownBtn
                className={classNames("option_btn", {
                    option_btnActive: show,
                    option_btnDisable: disable,
                })}
            >
                <div className="option_btnBorder" />
                <div className="option_btnContent">
                    {value ? (
                        <span className="option_value">{value}</span>
                    ) : (
                        <span className="option_placeholder">请选择{name}</span>
                    )}
                    <div className="option_btnIconContainer">
                        <Icon type="dropdown" className="option_btnIcon" />
                    </div>
                </div>
            </DropdownBtn>
            <DropdownContent
                bodyClassName="option_dropdownBody"
                handleVisibleChange={(res) => {
                    setShow(res);
                }}
                offset={{
                    y: 4,
                }}
            >
                <ScrollComponent
                    className="option_dropdownScrollWrapper"
                    bodyClassName="option_dropdownScrollBody"
                >
                    {list?.map((item, index) => {
                        return (
                            <div
                                className={classNames("option_item", {
                                    option_itemActive: item.name === value,
                                })}
                                key={index}
                                onClick={() => {
                                    if (value !== item.name) {
                                        onChange(deepCloneData(item));
                                    }
                                }}
                            >
                                {item.name}
                            </div>
                        );
                    })}
                </ScrollComponent>
            </DropdownContent>
        </Dropdown>
    );
};
/* <------------------------------------ **** FUNCTION COMPONENT END **** ------------------------------------ */
export default Temp;
