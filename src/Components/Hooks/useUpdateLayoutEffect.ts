/**
 * @file
 * @date 2022-12-20
 * @author mingzhou.zhang
 * @lastModify  2022-12-20
 */

import { useLayoutEffect } from "react";
import { createUpdateEffect } from "./createUpdateEffect";

export default createUpdateEffect(useLayoutEffect);
