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

export function getPythonDirPath() {
  return path.join(app.getAppPath(), "..", "backend", "python-runtime");
}

export function getPythonEnvPath() {
  return path.join(getPythonDirPath(), "python.exe");
}

export function getPipPath() {
  return path.join(getPythonDirPath(), "Scripts", "pip.exe");
}

export function getPythonScriptPath(scriptName: string) {
  return path.join(app.getAppPath(), "..", "backend", scriptName);
}
