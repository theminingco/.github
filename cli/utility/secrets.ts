import { exec } from "child_process";

export async function getSecret(name: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(`yarn firebase functions:secrets:access ${name}`, (error, stdout) => {
      if (error) {
        reject(new Error(`Secret "${name}" not found.`));
      } else {
        resolve(stdout.trim());
      }
    });
  });
}
