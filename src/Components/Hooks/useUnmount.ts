/**
 * @file
 * @date 2022-12-07
 * @author mingzhou.zhang
 * @lastModify  2022-12-07
 */

import { useEffect } from "react";
import { useLatest } from "./useLatest";

export const useUnmount = (fn: () => void) => {
    const fnRef = useLatest(fn);

    useEffect(
        () => () => {
            fnRef.current();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );
};
