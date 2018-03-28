import o, { Onemitter } from "onemitter";
import { IEmitter, IPage } from "./..";

import { IInitializeParams } from "./../remote";
export interface IAppConfig {
    initialPage: IPage;
    server: IEmitter;
}
class App {
    public page: Onemitter<IPage>;
    protected server: IEmitter;
    constructor(protected config: IAppConfig) {
        this.server = this.config.server;
        const initializeParams: IInitializeParams = {
            page: this.config.initialPage,
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
        this.server.emit("frame-action", frameId, ...args);
    }
    public navigate(url: string) {
        this.server.emit("navigate");
    }
}
export default App;
