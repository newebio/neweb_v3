"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const onemitter_1 = require("onemitter");
class App {
    constructor(config) {
        this.config = config;
        this.server = this.config.server;
        const initializeParams = {
            id: (+new Date()).toString(),
            page: this.config.initialPage,
            sid: this.config.initialPage.sid,
            pid: this.config.initialPage.id,
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
        const params = { frameId, args };
        this.server.emit("frame-action", params);
    }
    navigate(url) {
        const params = { url };
        this.server.emit("navigate", params);
    }
}
exports.default = App;
