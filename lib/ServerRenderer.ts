import React = require("react");
// tslint:disable-next-line:no-submodule-imports
import ReactDOMServer = require("react-dom/server");
import { IApp, IPage, IPageFrame } from "./..";
export interface IServerRendererConfig {
    app: IApp;
}
class ServerRenderer {
    constructor(protected config: IServerRendererConfig) {

    }
    public async render(page: IPage) {
        let el: any;
        const data = [];
        const frames = [...page.frames];
        for (const pageFrame of frames.reverse()) {
            el = await this.renderFrame(pageFrame, el);
            data.push(pageFrame.data);
        }
        return {
            html: ReactDOMServer.renderToString(el),
            data: data.reverse(),
        };
    }
    protected async renderFrame(frame: IPageFrame, children: any) {
        const ViewClass = await this.config.app.requireFrameView(frame.frameName);
        return React.createElement(ViewClass, { params: frame.params, data: frame.data, children });
    }
}
export default ServerRenderer;
