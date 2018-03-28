import { IApp, IEmitter, IPage, IPageFrame, IRoutePage, IRoutePageFrame } from "./..";
import { IFrameActionParams, IFrameDataParams } from "./../remote";
export interface IPageConfig {
    app: IApp;
    id: string;
    sid: string;
}
class PageController {
    protected client?: IEmitter;
    protected currentPage: IPage;
    protected frames: {
        [index: string]: {
            controller: any;
        };
    } = {};
    constructor(protected config: IPageConfig) {
    }
    public async initialize(client: IEmitter, page: IPage) {
        this.client = client;
        client.on("navigate", (url: string) => this.navigate(url));

        await Promise.all(page.frames.map(async (frame) => {
            const ControllerClass = await this.config.app.requireFrameController(frame.frameName);
            const controller = new ControllerClass({
                data: frame.data,
            });
            controller.on((value: any) => {
                const params: IFrameDataParams = { data: value, frameId: frame.frameId };
                client.emit("frame-data", params);
            });
            this.frames[frame.frameId] = { controller };
        }));
    }
    public navigate(url: string) {
        //
    }
    public dispatch(params: IFrameActionParams) {
        this.frames[params.frameId].controller.dispatch(...params.args);
    }
    public async resolvePage(routePage: IRoutePage): Promise<IPage> {
        const frames = await Promise.all(routePage.frames.map((frame) => this.resolveFrame(frame)));
        return {
            id: this.config.id,
            sid: this.config.sid,
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
