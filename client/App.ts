import o, { Onemitter } from "onemitter";
import { IEmitter, IPage } from "./..";

import { IFrameActionParams, IInitializeParams, INavigateParams, IRemoteParams } from "./../remote";
export interface IAppConfig {
    initialPage: IPage;
    server: IEmitter;
}
class App {
    public page: Onemitter<IPage>;
    protected server: IEmitter;
    constructor(protected config: IAppConfig) {
        this.server = this.config.server;
        const initializeParams: IInitializeParams & IRemoteParams = {
            id: (+new Date()).toString(),
            page: this.config.initialPage,
            sid: this.config.initialPage.sid,
            pid: this.config.initialPage.id,
        };
        this.page = o({ value: this.config.initialPage });
        // this.page.emit(this.config.initialPage);
        /*server.on("new-frame-data", (frameId: string, dataName: string, data) => {
            this.renderer.newFrameData
        });
        server.on("changed-route", () => {

        });*/
        this.server.emit("initialize", initializeParams);
    }
    public dispatchFrameAction(frameId: string, ...args: any[]) {
        const params: IFrameActionParams = { frameId, args };
        this.server.emit("frame-action", params);
    }
    public navigate(url: string) {
        const params: INavigateParams = { url };
        this.server.emit("navigate", params);
    }
}
export default App;
