

export const timer = (handler: () => void, seconds = 1, repeats = 1) => {
    let id: NodeJS.Timeout;
    const scheduleTimer = (i = 0) => {
        if (repeats == 0 || i < repeats) {
            id = setTimeout(() => {
                scheduleTimer(i + 1);
                handler();
            }, seconds * 1000);
        }
    };
    scheduleTimer();
    return () => clearTimeout(id);
};