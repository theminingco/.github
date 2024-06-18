import { exec } from "child_process";

export async function getSecret(name: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(`cd .. && yarn firebase functions:secrets:access ${name}`, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`Failed to get secret. ${stdout.trim()} ${stderr.trim()}`));
      } else {
        resolve(stdout.trim());
      }
    });
  });
}
