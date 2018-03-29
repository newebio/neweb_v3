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
const PageController_1 = require("./PageController");
class PagesManager {
    constructor(config) {
        this.config = config;
        this.pages = {};
    }
    createPageController(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const pageId = params.pid ? params.pid : this.generatePageId();
            const controller = new PageController_1.default({
                app: this.config.app,
                router: this.config.router,
                id: pageId,
                sid: params.session.sid,
            });
            this.pages[pageId] = { controller, sid: params.session.sid };
            return controller;
        });
    }
    onNewClient(client) {
        client.on("navigate", (params) => __awaiter(this, void 0, void 0, function* () {
            try {
                const pageController = yield this.getPageController(params);
                yield pageController.navigate(params.url, client);
            }
            catch (e) {
                client.emit("error", "Invalid session");
                return;
            }
        }));
        client.on("frame-action", (params) => __awaiter(this, void 0, void 0, function* () {
            try {
                const pageController = yield this.getPageController(params);
                yield pageController.dispatch(params);
                client.emit("action-ready", {
                    actionId: params.actionId,
                    frameId: params.frameId,
                    id: params.id,
                });
            }
            catch (e) {
                client.emit("error", "Invalid session");
                return;
            }
        }));
        client.on("initialize", (params) => __awaiter(this, void 0, void 0, function* () {
            try {
                const pageController = yield this.getPageController(params);
                yield pageController.initialize(client, params.page);
                client.emit("initialized");
            }
            catch (e) {
                client.emit("error", "Invalid session");
                return;
            }
        }));
        client.on("close", () => {
            //
        });
        client.on("error", () => {
            //
        });
    }
    getPageController(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield this.config.sessionManager.getBySid(params.sid);
            if (!session) {
                throw new Error("Invalid session");
            }
            if (!this.pages[params.pid]) {
                if (this.pages[params.pid].sid !== session.sid) {
                    throw new Error("Invalid session");
                }
                this.pages[params.pid] = {
                    controller: yield this.createPageController({
                        session,
                        pid: params.pid,
                    }),
                    sid: params.sid,
                };
            }
            return this.pages[params.pid].controller;
        });
    }
    generatePageId() {
        return (+new Date()).toString() + Math.round(Math.random() * 10000).toString();
    }
}
exports.default = PagesManager;
