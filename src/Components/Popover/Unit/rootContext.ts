/**
import { createContext } from 'react';
* @file 获取Kite root节点元素的context
* @date 2022-09-15
* @author xuejie.he
* @lastModify xuejie.he 2022-09-15
*/

import { createContext } from "react";
import { useContext } from "react";

export const KiteRoot = createContext<(res: Element) => void>(() => undefined);

export const useKiteRoot = () => useContext(KiteRoot);
