const MAX_FPS = 60;
const interval = Math.round(1000 / MAX_FPS);
const renderSyncFunctions: Function[] = [];
let lastFrameRenderingCompleted = true;
let drawerInterval: number;
let mainRenderFunction: Function = () => {};

function runSyncFunctions() {
    while (renderSyncFunctions.length) {
        renderSyncFunctions.shift()?.call(undefined);
    }

    mainRenderFunction();

    lastFrameRenderingCompleted = true;
}

function startRenderer() {
    drawerInterval = setInterval(() => {
        if (lastFrameRenderingCompleted === false) {
            return;
        }
        lastFrameRenderingCompleted = false;

        requestAnimationFrame(runSyncFunctions);
    }, interval);
}

export const setMainRenderFunction = (callback: Function) => {
    mainRenderFunction = callback;
};

export const requestRenderFrame = (callback: Function) => {
    renderSyncFunctions.push(callback);
};

startRenderer();