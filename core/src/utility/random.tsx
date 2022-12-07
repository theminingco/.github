

export const randomElement = <T,>(array: Array<T>) => {
    const index = Math.floor(Math.random() * array.length);
    return array[index];
};