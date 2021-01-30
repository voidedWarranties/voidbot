import { path as ffProbePath } from "ffprobe-static";
import { spawn } from "child_process";

export default source => {
    return new Promise((resolve, reject) => {
        const ffProbe = spawn(ffProbePath, [
            "-v", "error",
            "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1",
            source
        ]);

        const timeout = setTimeout(() => reject("Timed out"), 5000);

        ffProbe.stdout.on("data", data => {
            clearTimeout(timeout);
            resolve(parseFloat(data) * 1000);
        });

        ffProbe.stderr.on("data", data => {
            reject(data.toString());
        });
    });
};