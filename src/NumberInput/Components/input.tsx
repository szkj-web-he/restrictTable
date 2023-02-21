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
import { useLatest } from "./../../Components/Hooks/useLatest";
/* <------------------------------------ **** DEPENDENCE IMPORT END **** ------------------------------------ */

interface ChildTempProps extends TempProps {
    handleIsDisableChange?: (res: boolean) => void;
    className?: string;
}

/* <------------------------------------ **** FUNCTION COMPONENT START **** ------------------------------------ */
const Temp: React.FC<ChildTempProps> = ({
    onActive,
    active,
    onChange,
    value = "",
    className,
    handleIsDisableChange,
}) => {
    /* <------------------------------------ **** STATE START **** ------------------------------------ */
    /************* This section will include this component HOOK function *************/
    /**
     * 在输入非英文的时候临时存储下来的input值
     */
    const compositionVal = useRef("");

    const ref = useRef<HTMLInputElement | null>(null);

    const handleIsDisableChangeRef = useLatest(handleIsDisableChange);

    const isComposition = useRef(false);

    /* <------------------------------------ **** STATE END **** ------------------------------------ */
    /* <------------------------------------ **** PARAMETER START **** ------------------------------------ */
    /************* This section will include this component parameter *************/

    useEffect(() => {
        if (!active && ref.current) {
            ref.current.value = value;
        }

        if (active) {
            handleIsDisableChangeRef.current?.(true);
        } else if (ref.current && ref.current.scrollWidth > ref.current.offsetWidth) {
            handleIsDisableChangeRef.current?.(false);
        } else {
            handleIsDisableChangeRef.current?.(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, active]);

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

        if (status && isComposition.current === false) {
            e.currentTarget.value = value.replace(reg, "");
        }

        onChange(e.currentTarget.value);
    };

    /* <------------------------------------ **** FUNCTION END **** ------------------------------------ */
    return (
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
                isComposition.current = true;
                compositionVal.current = e.currentTarget.value;
            }}
            onCompositionEnd={(e) => {
                isComposition.current = false;
                e.currentTarget.value = compositionVal.current;
                compositionVal.current = "";
            }}
            pattern="[0-9._]*"
            placeholder="请输入数字"
            className={classNames(className, "numberInput_wrapper")}
        />
    );
};
/* <------------------------------------ **** FUNCTION COMPONENT END **** ------------------------------------ */
export default Temp;
