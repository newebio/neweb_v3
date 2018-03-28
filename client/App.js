"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const onemitter_1 = require("onemitter");
class App {
    constructor(config) {
        this.config = config;
        this.server = this.config.server;
        const initializeParams = {
            page: this.config.initialPage,
        };
        this.page = onemitter_1.default({ value: this.config.initialPage });
        // this.page.emit(this.config.initialPage);
        /*server.on("new-frame-data", (frameId: string, dataName: string, data) => {
            this.renderer.newFrameData
        });
        server.on("changed-route", () => {

        });*/
        this.server.emit("initialize", initializeParams);
    }
    dispatchFrameAction(frameId, ...args) {
        this.server.emit("frame-action", frameId, ...args);
    }
    navigate(url) {
        this.server.emit("navigate");
    }
}
exports.default = App;
