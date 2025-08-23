import { spawn } from "child_process";

export function isDev(): boolean {
  return process.env.NODE_ENV === "development";
}

// export function runInCmd(
//   cmd: string,
//   args: string[],
//   cwd: string
// ): Promise<void> {
//   return new Promise((resolve, reject) => {
//     const fullCmd = [cmd, ...args].join(" ");
//     const child = spawn("cmd.exe", ["/k", fullCmd], {
//       cwd,
//       windowsHide: false,
//     });

//     child.on("close", (code) => {
//       if (code === 0) resolve();
//       else reject(new Error(`cmd closed with code ${code}`));
//     });
//   });
// }

export function runInCmd(
  cmd: string,
  args: string[],
  cwd: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const fullCmd = [cmd, ...args].join(" ");

    const child = spawn("cmd.exe", ["/c", "start", "cmd.exe", "/c", fullCmd], {
      cwd,
      windowsHide: false, // enable the cmd window
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        console.log(`Install successfully! Command: ${fullCmd}`);
        resolve();
      } else {
        reject(new Error(`Process exited with code ${code}`));
      }
    });
  });
}
