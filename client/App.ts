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
    protected actions: {
        [index: string]: {
            resolve: () => void,
        };
    } = {};
    constructor(protected config: IAppConfig) {
        this.server = this.config.server;
        const initializeParams: IInitializeParams & IRemoteParams = {
            id: (+new Date()).toString(),
            page: this.config.initialPage,
            sid: this.config.initialPage.sid,
            pid: this.config.initialPage.id,
        };
        this.page = o({ value: this.config.initialPage });
        this.server.on("action-ready", (params: { actionId: string; frameId: string }) => {
            const id = params.frameId + ":" + params.actionId;
            if (this.actions[id]) {
                this.actions[id].resolve();
                delete this.actions[id];
            }
        });
        // this.page.emit(this.config.initialPage);
        /*server.on("new-frame-data", (frameId: string, dataName: string, data) => {
            this.renderer.newFrameData
        });
        server.on("changed-route", () => {

        });*/
        this.server.emit("initialize", initializeParams);
    }
    public dispatchFrameAction(frameId: string, ...args: any[]) {
        const actionId = this.generateActionId();
        const params: IFrameActionParams = { actionId, frameId, args };
        this.server.emit("frame-action", params);
        return new Promise((resolve) => {
            this.actions[frameId + ":" + actionId] = { resolve };
        });
    }
    public navigate(url: string) {
        const params: INavigateParams = { url };
        this.server.emit("navigate", params);
    }
    protected generateActionId() {
        return (+new Date()).toString() + Math.round(Math.random() * 10000).toString();
    }
}
export default App;
