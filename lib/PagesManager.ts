import { IApp, ISession } from "./..";
import PageController from "./PageController";
import SessionsManager from "./SessionsManager";
export interface IServerConfig {
    sessionManager: SessionsManager;
    app: IApp;
}
class PagesManager {
    protected pages: { [index: string]: { controller: PageController } } = {};
    constructor(protected config: IServerConfig) { }
    public async createPageController(_: {
        session: ISession;
    }): Promise<PageController> {
        const pageId = this.generatePageId();
        const controller = new PageController({
            app: this.config.app,
            id: pageId,
        });
        this.pages[pageId] = { controller };
        return controller;
    }
    /*public onNewClient(client: IEmitter) {
        client.on("initialize", async () => {
            const page = new Page();
            await page.initialize();
        });
        client.on("close", () => {

        });
        client.on("error", () => {

        });
    }*/
    protected generatePageId() {
        return (+new Date()).toString() + Math.round(Math.random() * 10000).toString();
    }
}
export default PagesManager;
