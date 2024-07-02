export const sleep = (seconds = 0) => {
    return new Promise((resolve) => {
        window.setTimeout(() => {
            resolve(true);
        }, seconds * 1000);
    });
};
