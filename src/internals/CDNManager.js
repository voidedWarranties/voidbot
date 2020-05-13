import path from "path";
import fs from "fs-extra";
import log from "../logger";

export default class CDNManager {
    constructor() {
        this.staticDir = path.join(__dirname, "../../cdn");

        this.endpoints = {
            recording: new Endpoint(this.staticDir, "recording")
        };
    }
}

class Endpoint {
    constructor(staticDir, name) {
        this.name = name;
        this.path = path.join(staticDir, name);

        fs.ensureDirSync(this.path);

        log.debug(`Endpoint created: ${this.path}`);
    }

    store(fileName, data) {
        const filePath = path.join(this.path, fileName);

        try {
            fs.accessSync(filePath, fs.constants.F_OK);
        } catch (e) {
            fs.writeFileSync(filePath, data);
        }

        return `${process.env.HOST_URL}/file/${this.name}/${fileName}`;
    }
}