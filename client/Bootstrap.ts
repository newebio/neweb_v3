import ReactDOM = require("react-dom");
import SocketIO = require("socket.io-client");
import { IInitialInfo, IModule, IPage } from "./..";
import { IFrameDataParams, IFrameParamsParams } from "./../remote";
import App from "./App";
import ModulesManager from "./ModulesManager";
import Renderer from "./Renderer";
const logger = console;
class Bootstrap {
    public async start(initialInfo: IInitialInfo) {
        const modulesManager = new ModulesManager({
            address: window.location.protocol + "//" + window.location.host + "/modules",
        });
        await modulesManager
            .preloadModules(initialInfo
                .page.frames.reduce((prev, curr) => prev.concat(curr.modules), [] as IModule[]));
        const server = SocketIO(window.location.protocol + "//" + window.location.host);
        const emitter = {
            emit: (eventName: string, params: any) => {
                params.sid = initialInfo.page.sid;
                params.pid = initialInfo.page.id;
                params.id = (+new Date()).toString();
                server.emit(eventName, params);
            },
            on: server.on.bind(server),
        };
        const app = new App({
            initialPage: initialInfo.page,
            server: emitter,
        });
        const renderer = new Renderer({
            navigate: (url: string) => app.navigate(url),
            dispatch: (frameId: string, ...args: any[]) =>
                app.dispatchFrameAction(frameId, ...args),
            resolveFrameView: async (name: string, version: string, modules: IModule[]) => {
                await modulesManager.preloadModules(modules);
                const mod = await modulesManager.loadModule("local", "frames/" + name + "/view", version);
                return mod.default;
            },
        });
        await renderer.onChangeFrames(initialInfo.page.frames);
        server.on("reconnect", () => {
            //
        });
        server.on("frame-data", (params: IFrameDataParams) => renderer.newFrameData(params.frameId, params.data));
        server.on("change-page", async (params: { page: IPage }) => {
            history.replaceState({}, "", params.page.url);
            await renderer.onChangeFrames(params.page.frames);
            if (params.page.title) {
                document.title = params.page.title;
            }
            const head = document.getElementsByTagName("head")[0];
            let isStartRemove = false;
            let metaEndNode: Node | undefined;
            for (const child of head.childNodes) {
                if (isStartRemove) {
                    if (child.nodeType === 8 && child.nodeValue === "__page_meta_end__") {
                        metaEndNode = child;
                        break;
                    }
                    head.removeChild(child);
                    continue;
                }
                if (child.nodeType === 8 && child.nodeValue === "__page_meta_start__") {
                    isStartRemove = true;
                }
            }
            if (params.page.meta && params.page.meta.length > 0 && metaEndNode) {
                for (const meta of params.page.meta) {
                    const metaEl = document.createElement("meta");
                    metaEl.name = meta.name;
                    metaEl.content = meta.content;
                    head.insertBefore(metaEl, metaEndNode);
                }
            }
            emitter.emit("navigated", {});
        });
        server.on("frame-params", async (params: IFrameParamsParams) => {
            renderer.newFrameParams(params.frameId, params.params);
        });
        // server.on("navigate", (params:IClientNavigateParams)=>renderer.onChangeFrames())

        ReactDOM.hydrate(renderer.render(), document.getElementById("root"), () => {
            logger.log("Hydrate finished");
        });
    }
}
export default Bootstrap;
