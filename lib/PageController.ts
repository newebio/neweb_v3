import { IApp, IEmitter, IPage, IPageFrame, IRoutePage, IRoutePageFrame, IRouter } from "./..";
import { IFrameActionParams, IFrameDataParams, IFrameParamsParams } from "./../remote";
export interface IPageConfig {
    app: IApp;
    router: IRouter;
    id: string;
    sid: string;
}
class PageController {
    protected client: IEmitter;
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
        this.currentPage = page;
        // client.on("navigate", (paramsurl: string) => this.navigate(url));
        client.on("navigated", () => this.navigated());
        await this.navigated();
    }
    public async navigated() {
        const page = this.currentPage;
        await Promise.all(page.frames.map(async (frame) => {
            const ControllerClass = await this.config.app.requireFrameController(frame.frameName);
            const controller = new ControllerClass({
                data: frame.data,
                params: frame.params,
            });
            controller.on((value: any) => {
                const params: IFrameDataParams = { data: value, frameId: frame.frameId };
                this.client.emit("frame-data", params);
            });
            this.frames[frame.frameId] = { controller };
        }));
    }
    public async navigate(url: string) {
        const routePage = await this.config.router.resolvePage(url);
        const page = await this.resolvePage(routePage);
        const frames: IPageFrame[] = [];
        for (const [index, frame] of page.frames.entries()) {
            if (this.currentPage.frames[index].frameName === frame.frameName) {
                if (JSON.stringify(this.currentPage.frames[index].params) !==
                    JSON.stringify(frame.params)) {
                    const params: IFrameParamsParams = {
                        frameId: this.currentPage.frames[index].frameId,
                        params: frame.params,
                    };
                    this.client.emit("frame-params", params);
                }
                frames.push(this.currentPage.frames[index]);
            } else {
                frames.push(frame);
            }
        }
        const newPage: IPage = {
            url,
            frames,
            id: this.config.id,
            sid: this.config.sid,
        };
        this.client.emit("change-page", { page: newPage });
    }
    public async dispatch(params: IFrameActionParams) {
        await this.frames[params.frameId].controller.dispatch(...params.args);
    }
    public async resolvePage(routePage: IRoutePage): Promise<IPage> {
        const frames = await Promise.all(routePage.frames.map((frame) => this.resolveFrame(frame)));
        return {
            id: this.config.id,
            url: routePage.url,
            sid: this.config.sid,
            frames,
        };
    }
    public async resolveFrame(frame: IRoutePageFrame): Promise<IPageFrame> {
        const viewModule = await this.config.app.resolveFrameViewModule(frame.name);
        const ControllerClass = await this.config.app.requireFrameController(frame.name);
        const controller = new ControllerClass({
            params: frame.params,
        });
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
