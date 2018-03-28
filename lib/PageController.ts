import { ModulePacker } from "neweb-pack";
import { IApp, IEmitter, IPage, IPageFrame, IRoute, IRoutePage, IRoutePageFrame } from "./..";
export interface IPageConfig {
    app: IApp;
    id: string;
}
class PageController {
    protected client?: IEmitter;
    protected currentPage: IPage;
    constructor(protected config: IPageConfig) {
    }
    /*public initialize(client: IEmitter) {
        this.client = client;
        client.on("navigate", () => this.navigate());
    }
    public navigate(url: string) {

    }*/
    public async resolvePage(routePage: IRoutePage): Promise<IPage> {
        const frames = await Promise.all(routePage.frames.map((frame) => this.resolveFrame(frame)));
        return {
            id: this.config.id,
            frames,
        };
    }
    public async resolveFrame(frame: IRoutePageFrame): Promise<IPageFrame> {
        const viewModule = await this.config.app.resolveFrameViewModule(frame.name);
        const ControllerClass = await this.config.app.requireFrameController(frame.name);
        const controller = new ControllerClass();
        const data = await controller.getInitialData();
        const frameId = this.generateFrameId();
        const frameName = frame.name;
        const frameVersion = viewModule.version as string;
        const modules = viewModule.modules;
        return {
            data,
            frameId,
            frameName,
            frameVersion,
            modules,
            params: frame.params,
        };
    }
    protected generateFrameId() {
        return (+new Date()).toString() + Math.round(Math.random() * 10000).toString();
    }
}
export default PageController;
