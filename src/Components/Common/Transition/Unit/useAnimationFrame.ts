/**
 * @file useAnimationFrame
 * @date 2021-06-24
 * @author xuejie.he
 * @lastModify xuejie.he 2021-06-24
 */

/**
 *
 * @param { () => void } fn
 * @param {{ current: number | null }} timer
 * @param { number } delay
 * @returns {Promise<void> }
 */
export const nextFrame = <T>(
    fn: () => T,
    timer: { current: number | null },
    delay = 1,
): Promise<T> => {
    let count = 0;
    const clock = (frameFn: () => void) => {
        timer.current && window.cancelAnimationFrame(timer.current);
        timer.current = window.requestAnimationFrame(() => {
            ++count;
            if (count >= delay) {
                frameFn();
            } else {
                clock(frameFn);
            }
        });
    };
    return new Promise<T>((resolve) => {
        clock(() => {
            const result = fn();
            resolve(result);
        });
    });
};

export const delayFn = <T>(fn: () => T, timer: { current: number | null }, ms = 1): Promise<T> => {
    const clock = (frameFn: () => void) => {
        timer.current && window.clearTimeout(timer.current);
        timer.current = window.setTimeout(frameFn, ms);
    };

    return new Promise<T>((resolve) => {
        clock(() => {
            const result = fn();
            resolve(result);
        });
    });
};
