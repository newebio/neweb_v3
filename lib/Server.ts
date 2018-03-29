import express = require("express");
import { IApp, IInitialInfo, IRequest, IRouter } from "./..";
import PagesManager from "./PagesManager";
import ServerRenderer from "./ServerRenderer";
import SessionsManager from "./SessionsManager";
export interface IServerConfig {
    app: IApp;
    router: IRouter;
    renderer: ServerRenderer;
    pageManager: PagesManager;
    sessionManager: SessionsManager;
}
class Server {
    constructor(protected config: IServerConfig) {

    }
    public async onRequest(req: IRequest, res: express.Response): Promise<void> {
        const route = await this.config.router.resolve(req);
        if (route.status === 404) {
            res.status(404).send(route.text);
            return;
        }
        if (route.status === 500) {
            res.status(404).send(route.text);
            return;
        }
        const { page: pageRoute } = route;

        const session = await this.config.sessionManager.resolveFromRequest(req);

        const pageController = await this.config.pageManager.createPageController({ session });
        const page = await pageController.resolvePage(pageRoute);
        const { html } = await this.config.renderer.render(page);
        const initialInfo: IInitialInfo = {
            page,
        };
        res.cookie("sid", session.id + ":" + session.hash);
        res.status(200).send(await this.config.app.fillTemplate(html,
            { title: page.title, meta: page.meta }, initialInfo));
    }
}
export default Server;
