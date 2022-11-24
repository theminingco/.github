

export const timer = (handler: () => void, seconds = 1, repeats = 1) => {
    const scheduleTimer = (i = 0) => {
        if (repeats == 0 || i < repeats) {
            setTimeout(() => {
                scheduleTimer(i + 1);
                handler();
            }, seconds * 1000);
        }
    };
    scheduleTimer();
};