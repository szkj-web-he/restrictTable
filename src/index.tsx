import React, { useMemo } from "react";
import "./font.scss";
import "./style.scss";

import { ConfigYML, PluginComms } from "@datareachable/dr-plugin-sdk";
import Header from "./header";
import MainContent from "./main";
import { ScrollComponent } from "./Components/Scroll";
// import VConsole from "vconsole";

// new VConsole();

export const comms = new PluginComms({
    defaultConfig: new ConfigYML(),
}) as {
    config: {
        question?: string;
        instruction?: string;
        options?: Array<Array<{ code: string; content: string }>>;
        data?: string;
    };
    state: unknown;
    renderOnReady: (res: React.ReactNode) => void;
};

/**
 * 枚举类型
 */
export interface EumTypeProps {
    type: "eum";
    options: Array<string>;
}

/**
 * 数字类型
 */
interface NumberTypeProps {
    type: "number";
}

/**
 * 文本类型
 */
interface TextTypeProps {
    type: "string";
}

export type DataProps = EumTypeProps | NumberTypeProps | TextTypeProps;

const Main: React.FC = () => {
    /* <------------------------------------ **** STATE START **** ------------------------------------ */
    /************* This section will include this component HOOK function *************/
    const data = useMemo(() => {
        let json: Record<string, DataProps> = {};

        let isError = false;

        const checkData = (data: Record<string, DataProps>) => {
            const cols = comms.config.options?.[1] ?? [];

            const keys = Object.keys(data);

            for (let i = 0; i < cols.length; ) {
                const col = cols[i];
                if (keys.some((key) => key === col.code)) {
                    ++i;
                } else {
                    console.error("data的键和options里的键不匹配");
                    i = cols.length;
                    return;
                }
            }

            /**
             * 检查数据是否规范
             */

            for (const key in data) {
                const item = data[key];
                switch (item.type) {
                    case "eum":
                        if (Array.isArray(item.options)) {
                            if (!item.options.every((val) => typeof val === "string")) {
                                isError = true;
                            }
                        } else {
                            isError = true;
                        }
                        break;
                    case "number":
                        break;
                    case "string":
                        break;
                    default:
                        isError = true;
                        break;
                }
                if (isError) {
                    break;
                }
            }
        };

        try {
            json = JSON.parse(comms.config?.data ?? `{}`) as Record<string, DataProps>;
            checkData(json);
        } catch (error) {
            isError = true;
        }
        if (isError) {
            console.error("数据格式不正确");
            return {};
        }
        return json;
    }, []);
    /* <------------------------------------ **** STATE END **** ------------------------------------ */
    /* <------------------------------------ **** PARAMETER START **** ------------------------------------ */
    /************* This section will include this component parameter *************/
    /* <------------------------------------ **** PARAMETER END **** ------------------------------------ */
    /* <------------------------------------ **** FUNCTION START **** ------------------------------------ */
    /************* This section will include this component general function *************/

    /* <------------------------------------ **** FUNCTION END **** ------------------------------------ */
    return (
        <ScrollComponent className="wrapper">
            <Header />
            <MainContent colData={data} />
        </ScrollComponent>
    );
};
/* <------------------------------------ **** FUNCTION COMPONENT END **** ------------------------------------ */
document.documentElement.style.fontSize = "10px";
void comms.renderOnReady(<Main />);
