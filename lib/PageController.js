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
            this.currentPage = page;
            // client.on("navigate", (paramsurl: string) => this.navigate(url));
            client.on("navigated", () => this.navigated());
            yield this.navigated();
        });
    }
    navigated() {
        return __awaiter(this, void 0, void 0, function* () {
            const page = this.currentPage;
            yield Promise.all(page.frames.map((frame) => __awaiter(this, void 0, void 0, function* () {
                const ControllerClass = yield this.config.app.requireFrameController(frame.frameName);
                const controller = new ControllerClass({
                    data: frame.data,
                    params: frame.params,
                });
                controller.on((value) => {
                    const params = { data: value, frameId: frame.frameId };
                    this.client.emit("frame-data", params);
                });
                this.frames[frame.frameId] = { controller };
            })));
        });
    }
    navigate(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const routePage = yield this.config.router.resolvePage(url);
            const page = yield this.resolvePage(routePage);
            const frames = [];
            for (const [index, frame] of page.frames.entries()) {
                if (this.currentPage.frames[index].frameName === frame.frameName) {
                    if (JSON.stringify(this.currentPage.frames[index].params) !==
                        JSON.stringify(frame.params)) {
                        const params = {
                            frameId: this.currentPage.frames[index].frameId,
                            params: frame.params,
                        };
                        this.client.emit("frame-params", params);
                    }
                    frames.push(this.currentPage.frames[index]);
                }
                else {
                    frames.push(frame);
                }
            }
            const newPage = {
                url,
                frames,
                id: this.config.id,
                sid: this.config.sid,
            };
            this.client.emit("change-page", { page: newPage });
        });
    }
    dispatch(params) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.frames[params.frameId].controller.dispatch(...params.args);
        });
    }
    resolvePage(routePage) {
        return __awaiter(this, void 0, void 0, function* () {
            const frames = yield Promise.all(routePage.frames.map((frame) => this.resolveFrame(frame)));
            return {
                id: this.config.id,
                url: routePage.url,
                sid: this.config.sid,
                frames,
            };
        });
    }
    resolveFrame(frame) {
        return __awaiter(this, void 0, void 0, function* () {
            const viewModule = yield this.config.app.resolveFrameViewModule(frame.name);
            const ControllerClass = yield this.config.app.requireFrameController(frame.name);
            const controller = new ControllerClass({
                params: frame.params,
            });
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
