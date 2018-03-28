"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class PageController {
    constructor(config) {
        this.config = config;
        this.frames = {};
    }
    initialize(client, page) {
        return __awaiter(this, void 0, void 0, function* () {
            this.client = client;
            client.on("navigate", (url) => this.navigate(url));
            yield Promise.all(page.frames.map((frame) => __awaiter(this, void 0, void 0, function* () {
                const ControllerClass = yield this.config.app.requireFrameController(frame.frameName);
                const controller = new ControllerClass({
                    data: frame.data,
                });
                controller.on((value) => {
                    const params = { data: value, frameId: frame.frameId };
                    client.emit("frame-data", params);
                });
                this.frames[frame.frameId] = { controller };
            })));
        });
    }
    navigate(url) {
        //
    }
    dispatch(params) {
        this.frames[params.frameId].controller.dispatch(...params.args);
    }
    resolvePage(routePage) {
        return __awaiter(this, void 0, void 0, function* () {
            const frames = yield Promise.all(routePage.frames.map((frame) => this.resolveFrame(frame)));
            return {
                id: this.config.id,
                sid: this.config.sid,
                frames,
            };
        });
    }
    resolveFrame(frame) {
        return __awaiter(this, void 0, void 0, function* () {
            const viewModule = yield this.config.app.resolveFrameViewModule(frame.name);
            const ControllerClass = yield this.config.app.requireFrameController(frame.name);
            const controller = new ControllerClass();
            const data = yield controller.getInitialData();
            const frameId = this.generateFrameId();
            const frameName = frame.name;
            const frameVersion = viewModule.version;
            const modules = viewModule.modules;
            return {
                data,
                frameId,
                frameName,
                frameVersion,
                modules,
                params: frame.params,
            };
        });
    }
    generateFrameId() {
        return (+new Date()).toString() + Math.round(Math.random() * 10000).toString();
    }
}
exports.default = PageController;
