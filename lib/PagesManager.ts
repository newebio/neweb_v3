import { IFrameActionParams, IInitializeParams, INavigateParams, IRemoteParams } from "../remote";
import { IApp, IEmitter, IRouter, ISession } from "./..";
import PageController from "./PageController";
import PageMetaGenerator from "./PageMetaGenerator";
import SessionsManager from "./SessionsManager";
export interface IServerConfig {
    sessionManager: SessionsManager;
    app: IApp;
    context: any;
    router: IRouter;
    pageMetaGenerator: PageMetaGenerator;
}
class PagesManager {
    protected pages: {
        [index: string]: {
            controller: PageController;
            sid: string;
        };
    } = {};
    constructor(protected config: IServerConfig) { }
    public async createPageController(params: {
        pid?: string;
        session: ISession;
    }): Promise<PageController> {
        const pageId = params.pid ? params.pid : this.generatePageId();
        const controller = new PageController({
            app: this.config.app,
            router: this.config.router,
            pageMetaGenerator: this.config.pageMetaGenerator,
            id: pageId,
            context: this.config.context,
            sid: params.session.sid,
        });
        this.pages[pageId] = { controller, sid: params.session.sid };
        return controller;
    }
    public onNewClient(client: IEmitter) {
        client.on("navigate", async (params: INavigateParams & IRemoteParams) => {
            try {
                const pageController = await this.getPageController(params);
                await pageController.navigate(params.url, client);
            } catch (e) {
                client.emit("error", "Invalid session");
                return;
            }
        });
        client.on("frame-action", async (params: IFrameActionParams & IRemoteParams) => {
            try {
                const pageController = await this.getPageController(params);
                await pageController.dispatch(params);
                client.emit("action-ready", {
                    actionId: params.actionId,
                    frameId: params.frameId,
                    id: params.id,
                });
            } catch (e) {
                client.emit("error", "Invalid session");
                return;
            }
        });
        client.on("initialize", async (params: IInitializeParams & IRemoteParams) => {
            try {
                const pageController = await this.getPageController(params);
                await pageController.initialize(client, params.page);
                client.emit("initialized");
            } catch (e) {
                client.emit("error", "Invalid session");
                return;
            }
        });
        client.on("close", () => {
            //
        });
        client.on("error", () => {
            //
        });
    }
    protected async getPageController(params: IRemoteParams) {
        const session = await this.config.sessionManager.getBySid(params.sid);
        if (!session) {
            throw new Error("Invalid session");
        }
        if (!this.pages[params.pid]) {
            if (this.pages[params.pid].sid !== session.sid) {
                throw new Error("Invalid session");
            }
            this.pages[params.pid] = {
                controller: await this.createPageController({
                    session,
                    pid: params.pid,
                }),
                sid: params.sid,
            };
        }
        return this.pages[params.pid].controller;
    }
    protected generatePageId() {
        return (+new Date()).toString() + Math.round(Math.random() * 10000).toString();
    }
}
export default PagesManager;
