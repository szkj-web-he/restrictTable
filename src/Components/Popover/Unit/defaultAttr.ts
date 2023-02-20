/**
 * @file defaultAttr
 * @date 2022-01-14
 * @author xuejie.he
 * @lastModify xuejie.he 2022-01-14
 */

import { OffsetHeightFn, OffsetWidthFn } from "../../Common/Kite/Unit/autoPosition";
import { Direction } from "../../Common/Kite/Unit/type";

export interface TriangleProps {
    width: string;
    height: string;
    color?: string;
    offset?: {
        x?: number | OffsetWidthFn;
        y?: number | OffsetHeightFn;
    };
}

export interface OffsetProps {
    x?: number | OffsetWidthFn;
    y?: number | OffsetWidthFn;
}

export const defaultAttr = (
    d: Direction,
): {
    triangle: TriangleProps;
} => {
    let triangle: TriangleProps | undefined = undefined;
    switch (d) {
        case "horizontal":
            triangle = {
                width: "0.5rem",
                height: "1rem",
                color: "rgba(0,0,0,0.7)",
            };

            break;
        case "vertical":
            triangle = {
                width: "1rem",
                height: "0.5rem",
                color: "rgba(0,0,0,0.7)",
            };
            break;
    }
    return {
        triangle,
    };
};
