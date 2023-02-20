/**
 * @file 电脑端数字输入框
 * @date 2023-02-20
 * @author xuejie.he
 * @lastModify xuejie.he 2023-02-20
 */
/* <------------------------------------ **** DEPENDENCE IMPORT START **** ------------------------------------ */
/** This section will include all the necessary dependence for this tsx file */
import React, { useRef, useState } from "react";
import { TempProps } from "..";
import { Popover } from "../../Components/Popover";
import "../style.scss";
/* <------------------------------------ **** DEPENDENCE IMPORT END **** ------------------------------------ */

/* <------------------------------------ **** FUNCTION COMPONENT START **** ------------------------------------ */
const Temp: React.FC<TempProps> = ({ onActive, active, onChange }) => {
    /* <------------------------------------ **** STATE START **** ------------------------------------ */
    /************* This section will include this component HOOK function *************/
    /**
     * 在输入非英文的时候临时存储下来的input值
     */
    const compositionVal = useRef("");

    const [content, setContent] = useState("");

    const ref = useRef<HTMLInputElement | null>(null);

    /* <------------------------------------ **** STATE END **** ------------------------------------ */
    /* <------------------------------------ **** PARAMETER START **** ------------------------------------ */
    /************* This section will include this component parameter *************/

    /* <------------------------------------ **** PARAMETER END **** ------------------------------------ */
    /* <------------------------------------ **** FUNCTION START **** ------------------------------------ */
    /************* This section will include this component general function *************/
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        /**
         * 限制只能输入数字
         */
        const keyVal = e.key;
        const exclude = [
            " ",
            // "_",
            // ".",
            "-",
            "/",
            "+",
            "*",
            "=",
            "(",
            ")",
            "&",
            "^",
            "%",
            "$",
            "#",
            "@",
            "!",
            "~",
            "`",
            ",",
            "?",
            "<",
            ">",
            "{",
            "}",
            "[",
            "]",
            "|",
            ":",
            ";",
            "'",
            '"',
            "\\",
        ];

        if (exclude.some((item) => item === keyVal)) {
            e.preventDefault();
            return;
        }

        if (/^[a-z]$/gi.test(keyVal) && e.ctrlKey === false && e.altKey === false) {
            e.preventDefault();
            return;
        }
    };

    /**
     * 在输入的时候
     */
    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.currentTarget;
        const reg = /[^0-9_.]/g;
        const status = reg.test(value);

        if (status === false) {
            e.currentTarget.value = value.replace(reg, "");
        }
        setContent(e.currentTarget.value);
        onChange(e.currentTarget.value);
    };

    const isDisable = () => {
        if (active) {
            return true;
        }

        if (ref.current && ref.current.scrollWidth > ref.current.offsetWidth) {
            return false;
        }
        return true;
    };

    /* <------------------------------------ **** FUNCTION END **** ------------------------------------ */

    return (
        <Popover
            offset={{
                y: 10,
            }}
            disable={isDisable()}
            root={
                <input
                    type="text"
                    onInput={handleInput}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                        onActive(true);
                    }}
                    ref={ref}
                    onBlur={() => {
                        onActive(false);
                    }}
                    onCompositionStart={(e) => {
                        compositionVal.current = e.currentTarget.value;
                    }}
                    onCompositionEnd={(e) => {
                        e.currentTarget.value = compositionVal.current;
                        compositionVal.current = "";
                    }}
                    placeholder="请输入数字"
                    className={"numberInput_wrapper"}
                />
            }
        >
            {content}
        </Popover>
    );
};
/* <------------------------------------ **** FUNCTION COMPONENT END **** ------------------------------------ */
export default Temp;
