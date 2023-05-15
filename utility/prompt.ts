import prompt from "prompts";
import { exit } from "./exit.js";

export const promptText = async (message: string, initial?: string): Promise<string> => {
    const response = await prompt({
        type: "text",
        name: "text",
        message,
        initial
    }) as { text: string };
    if (Object.keys(response).length === 0) { exit(5); }
    return response.text;
};

export const promptNumber = async (message: string, initial?: string): Promise<number> => {
    const response = await prompt({
        type: "number",
        name: "number",
        message,
        initial
    }) as { number: number };
    if (Object.keys(response).length === 0) { exit(5); }
    return response.number;
};

export const promptChoice = async <T>(message: string, choices: Array<{ title: string, value: T }>): Promise<T> => {
    const response = await prompt({
        type: "select",
        name: "choice",
        message,
        choices
    }) as { choice: T };
    if (Object.keys(response).length === 0) { exit(5); }
    return response.choice;
};
