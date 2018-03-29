import { IApp, IEmitter, IPage, IPageFrame, IRoutePage, IRoutePageFrame, IRouter } from "./..";
import { IFrameActionParams, IFrameDataParams, IFrameParamsParams } from "./../remote";
import PageMetaGenerator from "./PageMetaGenerator";
export interface IPageConfig {
    app: IApp;
    router: IRouter;
    context: any;
    pageMetaGenerator: PageMetaGenerator;
    id: string;
    sid: string;
}
class PageController {
    protected currentPage: IPage;
    protected frames: {
        [index: string]: {
            controller: any;
        };
    } = {};
    constructor(protected config: IPageConfig) {
    }
    public async initialize(client: IEmitter, page: IPage) {
        this.currentPage = page;
        // client.on("navigate", (paramsurl: string) => this.navigate(url));
        client.on("navigated", () => this.navigated(client));
        await this.navigated(client);
    }
    public async navigated(client: IEmitter) {
        const page = this.currentPage;
        await Promise.all(page.frames.map(async (frame) => {
            const controller = await this.createController(frame.frameName, frame.params);
            controller.on((value: any) => {
                const params: IFrameDataParams = { data: value, frameId: frame.frameId };
                client.emit("frame-data", params);
            });
            this.frames[frame.frameId] = { controller };
        }));
    }
    public async navigate(url: string, client: IEmitter) {
        const routePage = await this.config.router.resolvePage(url);
        const page = await this.resolvePage(routePage);
        const frames: IPageFrame[] = [];
        const pageFrames = [...page.frames];
        pageFrames.forEach((frame, index) => {
            if (this.currentPage.frames[index] &&
                this.currentPage.frames[index].frameName === frame.frameName) {
                if (JSON.stringify(this.currentPage.frames[index].params) !==
                    JSON.stringify(frame.params)) {
                    const params: IFrameParamsParams = {
                        frameId: this.currentPage.frames[index].frameId,
                        params: frame.params,
                    };
                    client.emit("frame-params", params);
                }
                frames.push(this.currentPage.frames[index]);
            } else {
                frames.push(frame);
            }
        });
        const newPage: IPage = {
            url,
            frames,
            id: this.config.id,
            sid: this.config.sid,
            meta: page.meta,
            title: page.title,
        };
        client.emit("change-page", { page: newPage });
    }
    public async dispatch(params: IFrameActionParams) {
        await this.frames[params.frameId].controller.dispatch(...params.args);
    }
    public async resolvePage(routePage: IRoutePage): Promise<IPage> {
        const frames = await Promise.all(routePage.frames.map((frame) => this.resolveFrame(frame)));
        const page = {
            id: this.config.id,
            url: routePage.url,
            sid: this.config.sid,
            frames,
        };
        const meta = await this.config.pageMetaGenerator.generate(page);
        return { ...page, ...meta };
    }
    public async resolveFrame(frame: IRoutePageFrame): Promise<IPageFrame> {
        const viewModule = await this.config.app.resolveFrameViewModule(frame.name);
        const controller = await this.createController(frame.name, frame.params);
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
    protected async createController(frameName: string, params: any) {
        const ControllerClass = await this.config.app.requireFrameController(frameName);
        /*        const Config = await this.config.app.getConfig();
                const ContextClass = await this.config.app.requireContextModule();
                const context = new ContextClass(Config);*/
        const controller = new ControllerClass({
            context: this.config.context,
            params,
        });
        return controller;
    }
    protected generateFrameId() {
        return (+new Date()).toString() + Math.round(Math.random() * 10000).toString();
    }
}
export default PageController;
