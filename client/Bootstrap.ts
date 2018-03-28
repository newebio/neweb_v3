import ReactDOM = require("react-dom");
import SocketIO = require("socket.io-client");
import { IInitialInfo, IModule } from "./..";
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
        const app = new App({
            initialPage: initialInfo.page,
            server: SocketIO(window.location.protocol + "//" + window.location.host),
        });
        const renderer = new Renderer({
            dispatch: (frameId: string, ...args: any[]) => app.dispatchFrameAction(frameId, ...args),
            resolveFrameView: async (name: string, version: string, modules: IModule[]) => {
                await modulesManager.preloadModules(modules);
                const mod = await modulesManager.loadModule("local", "frames/" + name + "/view", version);
                return mod.default;
            },
        });
        await renderer.onChangeFrames(initialInfo.page.frames);
        app.page.on((page) => renderer.onChangeFrames(page.frames));

        ReactDOM.hydrate(renderer.render(), document.getElementById("root"), () => {
            logger.log("Hydrate finished");
        });
    }
}
export default Bootstrap;
