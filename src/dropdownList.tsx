/**
 * @file 下拉框类型
 * @date 2023-02-20
 * @author xuejie.he
 * @lastModify xuejie.he 2023-02-20
 */
/* <------------------------------------ **** DEPENDENCE IMPORT START **** ------------------------------------ */
/** This section will include all the necessary dependence for this tsx file */
import React, { useLayoutEffect, useRef, useState } from "react";
import { Dropdown } from "./Components/Common/Dropdown";
import { DropdownBtn } from "./Components/Common/DropdownBtn";
import { DropdownContent } from "./Components/Common/DropdownContent";
import { Icon } from "./Components/Icon";
import { Popover } from "./Components/Popover";
import { ScrollComponent } from "./Components/Scroll";
import { useMobile } from "./Components/Scroll/Unit/useMobile";
import classNames from "./Components/Unit/classNames";
import { useLatest } from "./Components/Hooks/useLatest";
/* <------------------------------------ **** DEPENDENCE IMPORT END **** ------------------------------------ */
/* <------------------------------------ **** INTERFACE START **** ------------------------------------ */
/** This section will include all the interface for this tsx file */
interface TempProps {
    menus: Array<string>;

    onChange: (res: string) => void;

    value?: string;

    onActive: (status: boolean) => void;

    active: boolean;
}
/* <------------------------------------ **** INTERFACE END **** ------------------------------------ */
/* <------------------------------------ **** FUNCTION COMPONENT START **** ------------------------------------ */
const Temp: React.FC<TempProps> = ({ menus, onChange, value, onActive, active }) => {
    /* <------------------------------------ **** STATE START **** ------------------------------------ */
    /************* his section will include this component HOOK function *************/
    const ref = useRef<HTMLDivElement | null>(null);

    const [isDisable, setIsDisable] = useState(true);

    const mobileStatus = useMobile();

    const valueRef = useLatest(value);
    /* <------------------------------------ **** STATE END **** ------------------------------------ */
    /* <------------------------------------ **** PARAMETER START **** ------------------------------------ */
    /************* This section will include this component parameter *************/

    useLayoutEffect(() => {
        const node = ref.current;
        const fn = () => {
            if (active || mobileStatus || !valueRef) {
                setIsDisable(true);
                return;
            }

            if (node && node.offsetHeight + 10 < node.scrollHeight) {
                setIsDisable(false);
                return;
            }
            setIsDisable(true);
        };
        fn();
        const observer = new MutationObserver(fn);
        node &&
            observer.observe(node, {
                childList: true,
                subtree: true,
                characterData: true,
                attributes: true,
            });
        return () => {
            observer.disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active, mobileStatus]);

    /* <------------------------------------ **** PARAMETER END **** ------------------------------------ */
    /* <------------------------------------ **** FUNCTION START **** ------------------------------------ */
    /************* This section will include this component general function *************/

    /* <------------------------------------ **** FUNCTION END **** ------------------------------------ */
    return (
        <Dropdown trigger={"click"}>
            <Popover
                disable={isDisable}
                root={
                    <DropdownBtn className="colItem_dropdownBtn" ref={ref}>
                        {value ? (
                            <span className="colItem_content">{value}</span>
                        ) : (
                            <span className="colItem_placeholder">请选择</span>
                        )}

                        <div className="colItem_dropdownIconContainer">
                            <Icon
                                type="dropdown"
                                className="colItem_dropdownIcon"
                                style={active ? { transform: "rotate(180deg)" } : undefined}
                            />
                        </div>
                    </DropdownBtn>
                }
            >
                {value}
            </Popover>
            <DropdownContent
                placement="rb"
                handleVisibleChange={(status) => {
                    onActive(status);
                }}
                bodyClassName={"colItem_dropdownBody"}
            >
                <ScrollComponent bodyClassName="colItem_scrollBody" width="120px">
                    {menus.map((item, index) => {
                        return (
                            <div
                                className={classNames("colItem_dropdownItem", {
                                    colItem_dropdownItemActive: value === item,
                                })}
                                key={index}
                                onClick={() => {
                                    if (value !== item) {
                                        onChange(item);
                                    }
                                }}
                            >
                                {item}
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
