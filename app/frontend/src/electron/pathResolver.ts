import path from "path";
import { app } from "electron";
import { isDev } from "./util.js";

export function getPreloadPath() {
  return path.join(
    app.getAppPath(),
    isDev() ? "." : "..",
    "dist-electron/preload.cjs"
  );
}

export function getSavedImagesPath() {
  return path.join(app.getAppPath(), "../backend/images");
}

export function getPythonEnvPath() {
  return path.join(
    app.getAppPath(),
    "..",
    "backend",
    "python-runtime",
    "python.exe"
  );
}

export function getPythonScriptPath(scriptName: string) {
  return path.join(app.getAppPath(), "..", "backend", scriptName);
}
