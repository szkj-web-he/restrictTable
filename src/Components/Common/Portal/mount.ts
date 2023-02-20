/**
 * @file mount
 * @date 2022-01-10
 * @author xuejie.he
 * @lastModify xuejie.he 2022-01-10
 */
import "./style.scss";

export const mountElement = (el?: Element): Element => {
    if (el) {
        return el;
    }
    let node = document.querySelector("body > div.r_portal");
    if (!node) {
        node = document.createElement("div");
        node.setAttribute("class", "r_portal");
        document.body.appendChild(node);
    }
    return node;
};
