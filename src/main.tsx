/**
 * @file 选择日期的主体
 * @date 2023-02-09
 * @author xuejie.he
 * @lastModify xuejie.he 2023-02-09
 */
/* <------------------------------------ **** DEPENDENCE IMPORT START **** ------------------------------------ */
/** This section will include all the necessary dependence for this tsx file */
import React, { Fragment, useState } from "react";
import classNames from "./Components/Unit/classNames";
import { deepCloneData } from "./Components/Unit/deepCloneData";
import DropdownList from "./dropdownList";
import { comms, DataProps, EumTypeProps } from "./index";
import NumberInput from "./NumberInput";
import TextInput from "./TextInput";
import { useRef } from "react";
import { useEffect } from "react";
import { useMemo } from "react";
/* <------------------------------------ **** DEPENDENCE IMPORT END **** ------------------------------------ */
/* <------------------------------------ **** INTERFACE START **** ------------------------------------ */
/** This section will include all the interface for this tsx file */

interface TempProps {
    colData: Record<string, DataProps>;
    /**
     * 答案的回溯
     */
    state?: Record<string, Record<string, string | null>>;
}

/* <------------------------------------ **** INTERFACE END **** ------------------------------------ */
/* <------------------------------------ **** FUNCTION COMPONENT START **** ------------------------------------ */
const Temp: React.FC<TempProps> = ({ colData, state }) => {
    /* <------------------------------------ **** STATE START **** ------------------------------------ */
    /************* This section will include this component HOOK function *************/

    const itemsWidth = useMemo(() => {
        const cols = deepCloneData(comms.config.options?.[1]) ?? [];
        cols.unshift({ code: "", content: "" });
        return cols.map(() => {
            return `calc(100vw / ${cols.length})`;
        });
    }, []);

    const [active, setActive] = useState<{
        row: number;
        col: number;
    }>();

    const [itemsValue, setItemsValue] = useState(() => {
        const rows = comms.config.options?.[0] ?? [];
        const cols = comms.config.options?.[1] ?? [];
        const data: Record<string, Record<string, string | null>> = {};
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];

            const colData: Record<string, string | null> = {};
            for (let j = 0; j < cols.length; j++) {
                const col = cols[j];
                colData[col.code] = state?.[row.code]?.[col.code] ?? null;
            }
            data[row.code] = colData;
        }
        return data;
    });

    const itemsValueRef = useRef(deepCloneData(itemsValue));

    const count = useRef(0);

    /* <------------------------------------ **** STATE END **** ------------------------------------ */
    /* <------------------------------------ **** PARAMETER START **** ------------------------------------ */
    /************* This section will include this component parameter *************/

    const rows = comms.config.options?.[0] ?? [];
    const cols = comms.config.options?.[1] ?? [];

    const getItemType = (rowIndex: number, colIndex: number, active: boolean) => {
        const colCode = cols[colIndex]?.code;
        const rowCode = rows[rowIndex]?.code;

        const title =
            rows[rowIndex] && cols[colIndex]
                ? `${rows[rowIndex].content} - ${cols[colIndex].content}`
                : "";

        const handleChange = (res: string) => {
            if (rowCode && colCode) {
                itemsValueRef.current[rowCode][colCode] = res;
                setItemsValue(deepCloneData(itemsValueRef.current));
            }
        };

        const itemVal = itemsValue?.[rowCode]?.[colCode] ?? undefined;

        switch (colCode && colData[colCode].type) {
            case "eum":
                return (
                    <DropdownList
                        menus={(colData[colCode] as EumTypeProps).options ?? []}
                        onChange={handleChange}
                        active={active}
                        value={itemVal}
                        onActive={(status) => {
                            setActive((pre) => {
                                if (status) {
                                    return {
                                        row: rowIndex,
                                        col: colIndex,
                                    };
                                } else {
                                    if (
                                        JSON.stringify(pre) ===
                                        JSON.stringify({
                                            row: rowIndex,
                                            col: colIndex,
                                        })
                                    ) {
                                        return undefined;
                                    }
                                    return pre;
                                }
                            });
                        }}
                    />
                );
            case "string":
                return (
                    <TextInput
                        active={active}
                        value={itemVal}
                        mobileTitle={title}
                        onActive={(res) => {
                            setActive(
                                res
                                    ? {
                                          row: rowIndex,
                                          col: colIndex,
                                      }
                                    : undefined,
                            );
                        }}
                        onChange={handleChange}
                    />
                );
            case "number":
                return (
                    <NumberInput
                        active={active}
                        value={itemVal}
                        mobileTitle={title}
                        onActive={(res) => {
                            setActive(
                                res
                                    ? {
                                          row: rowIndex,
                                          col: colIndex,
                                      }
                                    : undefined,
                            );
                        }}
                        onChange={handleChange}
                    />
                );
        }
    };

    useEffect(() => {
        if (count.current) {
            const rows = comms.config.options?.[0] ?? [];
            const cols = comms.config.options?.[1] ?? [];
            const data: Record<string, Record<string, string | null>> = {};
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];

                const colData: Record<string, string | null> = {};
                for (let j = 0; j < cols.length; j++) {
                    const col = cols[j];
                    colData[col.code] = state?.[row.code]?.[col.code] ?? null;
                }
                data[row.code] = colData;
            }

            setItemsValue(deepCloneData(data));

            itemsValueRef.current = deepCloneData(data);
        } else {
            ++count.current;
        }
    }, [state]);

    useEffect(() => {
        comms.state = itemsValue as unknown as Record<string, string | null>;
    }, [itemsValue]);

    /* <------------------------------------ **** FUNCTION END **** ------------------------------------ */

    return (
        <div className={"table_wrapper"}>
            {rows?.map((row, index) => {
                let tableTitle = <></>;
                if (index === 0) {
                    tableTitle = (
                        <div className={"row_wrapper"}>
                            {cols.map((col, i) => {
                                /**
                                 * 如果是第一行
                                 */
                                if (i === 0) {
                                    /**
                                     * 如果是第一列
                                     */
                                    return (
                                        <Fragment key={`${index}+${i}`}>
                                            <div
                                                className={"col_wrapper col_bolder"}
                                                style={{ width: itemsWidth[i] }}
                                            />
                                            <div
                                                className={"col_wrapper col_bolder"}
                                                style={{ width: itemsWidth[i + 1] }}
                                            >
                                                {col.content}
                                            </div>
                                        </Fragment>
                                    );
                                }
                                return (
                                    <Fragment key={`${index}+${i}`}>
                                        <div
                                            className={"col_wrapper col_bolder"}
                                            style={{ width: itemsWidth[i + 1] }}
                                        >
                                            {col.content}
                                        </div>
                                    </Fragment>
                                );
                            })}
                        </div>
                    );
                }

                return (
                    <Fragment key={`aaa${index}`}>
                        {tableTitle}
                        <div className={"row_wrapper"}>
                            {cols?.map((col, i) => {
                                const colEl = (
                                    <div
                                        className={classNames("col_wrapper", {
                                            col_active:
                                                active && index === active.row && i === active.col,
                                        })}
                                        style={{ width: itemsWidth[i + 1] }}
                                    >
                                        {getItemType(
                                            index,
                                            i,
                                            (active && index === active.row && i === active.col) ||
                                                false,
                                        )}
                                    </div>
                                );

                                if (i === 0) {
                                    return (
                                        <Fragment key={`${row.code}-${col.code}`}>
                                            <div
                                                className={"col_wrapper col_bolder"}
                                                style={{ width: itemsWidth[i] }}
                                            >
                                                {row.content}
                                            </div>
                                            {colEl}
                                        </Fragment>
                                    );
                                }

                                return <Fragment key={`${row.code}-${col.code}`}>{colEl}</Fragment>;
                            })}
                        </div>
                    </Fragment>
                );
            })}
        </div>
    );
};
/* <------------------------------------ **** FUNCTION COMPONENT END **** ------------------------------------ */
export default Temp;
