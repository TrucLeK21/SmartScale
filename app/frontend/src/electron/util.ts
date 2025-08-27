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
  cwd: string,
  showCmd: boolean = true
): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const fullCmd = [cmd, ...args].join(" ");

    const spawnArgs = showCmd
      ? ["/c", "start", "cmd.exe", "/c", fullCmd]
      : ["/c", fullCmd];

    const child = spawn("cmd.exe", spawnArgs, {
      cwd,
      windowsHide: !showCmd, // true = hide window, false = show window
    });

    let stdout = "";
    let stderr = "";

    child.stdout?.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr?.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("error", (err) => {
      reject(err);
    });

    child.on("close", (code) => {
      if (code === 0) {
        console.log(`Command executed successfully: ${fullCmd}`);
        resolve({ stdout, stderr });
      } else {
        reject(
          new Error(
            `Process exited with code ${code}\nSTDERR:\n${stderr}\nSTDOUT:\n${stdout}`
          )
        );
      }
    });
  });
}
