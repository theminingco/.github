import { exec } from "child_process";

export const getSecret = async (name: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    exec(`npx firebase functions:secrets:access ${name}`, (error, stdout) => {
      if (error) {
        reject(new Error(`Secret "${name}" not found.`));
      } else {
        resolve(stdout.trim());
      }
    });
  });
};
