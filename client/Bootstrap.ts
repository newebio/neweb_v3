import ReactDOM = require("react-dom");
import SocketIO = require("socket.io-client");
import { IInitialInfo, IModule } from "./..";
import { IFrameDataParams } from "./../remote";
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
        server.on("frame-data", (params: IFrameDataParams) => renderer.newFrameData(params.frameId, params.data));

        ReactDOM.hydrate(renderer.render(), document.getElementById("root"), () => {
            logger.log("Hydrate finished");
        });
    }
}
export default Bootstrap;
