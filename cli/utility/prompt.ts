import prompt from "prompts";

export const promptText = async (message: string, initial?: string): Promise<string> => {
  const response = await prompt({
    type: "text",
    name: "text",
    message,
    initial
  }) as { text: string };
  if (Object.keys(response).length === 0) { throw new Error("Prompt cancelled"); }
  const result = response.text.trim();
  if (result.length === 0) { throw new Error("Prompt empty"); }
  return result;
};

export const promptNumber = async (message: string, initial?: number): Promise<number> => {
  const response = await prompt({
    type: "number",
    name: "number",
    float: true,
    message,
    initial
  }) as { number: number };
  if (Object.keys(response).length === 0) { throw new Error("Prompt cancelled"); }
  return response.number;
};

export interface Choice<T> {
  readonly title: string;
  readonly description?: string;
  readonly value: T;
}

export const promptChoice = async <T>(message: string, choices: Array<Choice<T>>): Promise<T> => {
  const response = await prompt({
    type: "select",
    name: "choice",
    message,
    choices
  }) as { choice: T };
  if (Object.keys(response).length === 0) { throw new Error("Prompt cancelled"); }
  return response.choice;
};

export const promptConfirm = async (message: string): Promise<boolean> => {
  const choices = [
    { title: "Yes", value: true },
    { title: "No", value: false }
  ];
  return promptChoice(message, choices);
};
