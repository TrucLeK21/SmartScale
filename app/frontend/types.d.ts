interface PythonArgs {
    input: string;
}

declare global {
    interface Window {
        electronAPI: {
            sendPython: (args: PythonArgs) => void;
            onPythonResult: (callback: (result: string) => void) => void;
            removeListener: (callback: (result: string) => void) => void;
            saveImage: (data: string) => void;
        }
    }
}


export {};