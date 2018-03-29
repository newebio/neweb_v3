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
const ReactDOM = require("react-dom");
const SocketIO = require("socket.io-client");
const App_1 = require("./App");
const ModulesManager_1 = require("./ModulesManager");
const Renderer_1 = require("./Renderer");
const logger = console;
class Bootstrap {
    start(initialInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            const modulesManager = new ModulesManager_1.default({
                address: window.location.protocol + "//" + window.location.host + "/modules",
            });
            yield modulesManager
                .preloadModules(initialInfo
                .page.frames.reduce((prev, curr) => prev.concat(curr.modules), []));
            const server = SocketIO(window.location.protocol + "//" + window.location.host);
            const emitter = {
                emit: (eventName, params) => {
                    params.sid = initialInfo.page.sid;
                    params.pid = initialInfo.page.id;
                    params.id = (+new Date()).toString();
                    server.emit(eventName, params);
                },
                on: server.on.bind(server),
            };
            const app = new App_1.default({
                initialPage: initialInfo.page,
                server: emitter,
            });
            const renderer = new Renderer_1.default({
                navigate: (url) => app.navigate(url),
                dispatch: (frameId, ...args) => app.dispatchFrameAction(frameId, ...args),
                resolveFrameView: (name, version, modules) => __awaiter(this, void 0, void 0, function* () {
                    yield modulesManager.preloadModules(modules);
                    const mod = yield modulesManager.loadModule("local", "frames/" + name + "/view", version);
                    return mod.default;
                }),
            });
            yield renderer.onChangeFrames(initialInfo.page.frames);
            server.on("reconnect", () => {
            });
            server.on("frame-data", (params) => renderer.newFrameData(params.frameId, params.data));
            server.on("change-page", (params) => __awaiter(this, void 0, void 0, function* () {
                history.replaceState({}, "", params.page.url);
                yield renderer.onChangeFrames(params.page.frames);
                emitter.emit("navigated", {});
            }));
            server.on("frame-params", (params) => __awaiter(this, void 0, void 0, function* () {
                renderer.newFrameParams(params.frameId, params.params);
            }));
            // server.on("navigate", (params:IClientNavigateParams)=>renderer.onChangeFrames())
            ReactDOM.hydrate(renderer.render(), document.getElementById("root"), () => {
                logger.log("Hydrate finished");
            });
        });
    }
}
exports.default = Bootstrap;
