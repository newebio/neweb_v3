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
            this.currentPage = page;
            // client.on("navigate", (paramsurl: string) => this.navigate(url));
            client.on("navigated", () => this.navigated(client));
            yield this.navigated(client);
        });
    }
    navigated(client) {
        return __awaiter(this, void 0, void 0, function* () {
            const page = this.currentPage;
            yield Promise.all(page.frames.map((frame) => __awaiter(this, void 0, void 0, function* () {
                const controller = yield this.createController(frame.frameName, frame.params);
                controller.on((value) => {
                    const params = { data: value, frameId: frame.frameId };
                    client.emit("frame-data", params);
                });
                this.frames[frame.frameId] = { controller };
            })));
        });
    }
    navigate(url, client) {
        return __awaiter(this, void 0, void 0, function* () {
            const routePage = yield this.config.router.resolvePage(url);
            const page = yield this.resolvePage(routePage);
            const frames = [];
            const pageFrames = [...page.frames];
            pageFrames.forEach((frame, index) => {
                if (this.currentPage.frames[index] &&
                    this.currentPage.frames[index].frameName === frame.frameName) {
                    if (JSON.stringify(this.currentPage.frames[index].params) !==
                        JSON.stringify(frame.params)) {
                        const params = {
                            frameId: this.currentPage.frames[index].frameId,
                            params: frame.params,
                        };
                        client.emit("frame-params", params);
                    }
                    frames.push(this.currentPage.frames[index]);
                }
                else {
                    frames.push(frame);
                }
            });
            const newPage = {
                url,
                frames,
                id: this.config.id,
                sid: this.config.sid,
            };
            client.emit("change-page", { page: newPage });
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
            const page = {
                id: this.config.id,
                url: routePage.url,
                sid: this.config.sid,
                frames,
            };
            const meta = yield this.config.pageMetaGenerator.generate(page);
            return Object.assign({}, page, meta);
        });
    }
    resolveFrame(frame) {
        return __awaiter(this, void 0, void 0, function* () {
            const viewModule = yield this.config.app.resolveFrameViewModule(frame.name);
            const controller = yield this.createController(frame.name, frame.params);
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
    createController(frameName, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const ControllerClass = yield this.config.app.requireFrameController(frameName);
            const Config = yield this.config.app.getConfig();
            const ContextClass = yield this.config.app.requireContextModule();
            const context = new ContextClass(Config);
            const controller = new ControllerClass({
                context,
                params,
            });
            return controller;
        });
    }
    generateFrameId() {
        return (+new Date()).toString() + Math.round(Math.random() * 10000).toString();
    }
}
exports.default = PageController;
