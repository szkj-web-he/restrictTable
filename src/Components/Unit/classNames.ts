/**
 * @file classnames file
 * @date 2022-06-09
 * @author mingzhou.zhang
 * @lastModify  2022-06-09
 */

export type Value = string | number | boolean | undefined | null;
export type Mapping = Record<string, unknown>;
export type ArgumentArray = Array<Argument>;
export type Argument = Value | Mapping | ArgumentArray;

export type ClassNames = (...args: ArgumentArray) => string;

const classNames: ClassNames = (...args: ArgumentArray) => {
    const classes: Array<Value> = [];

    for (const arg of args) {
        if (!arg) continue;

        if (typeof arg === "string" || typeof arg === "number") {
            classes.push(arg);
        } else if (Array.isArray(arg)) {
            if (arg.length) {
                const inner = classNames.apply(null, [...arg]);
                if (inner) {
                    classes.push(inner);
                }
            }
        } else if (typeof arg === "object") {
            if (arg.toString === Object.prototype.toString) {
                for (const key in arg) {
                    if (Object.prototype.hasOwnProperty.call(arg, key) && arg[key]) {
                        classes.push(key);
                    }
                }
            } else {
                classes.push(arg.toString());
            }
        }
    }

    return classes.join(" ");
};

export default classNames;
