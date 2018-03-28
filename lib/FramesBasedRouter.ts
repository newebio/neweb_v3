import { parse } from "url";
import { IApp, IRequest, IRoute, IRouter } from "./..";

export interface IFramesBasedRouter {
    app: IApp;
}
class FramesBasedRouter implements IRouter {
    protected basePath = "/";
    constructor(protected config: IFramesBasedRouter) {

    }
    public async resolvePage(rawUrl: string) {
        const url = parse(rawUrl);
        if (!url.pathname) {
            throw new Error("Url should contain path: " + url);
        }
        const pathname = this.basePath ? url.pathname.substr(this.basePath.length) : url.pathname;
        const framesNames = pathname.split("_").map((frameName) => frameName || "index");
        const isExistings =
            (await Promise.all(framesNames.map((frameName) => this.config.app.hasFrame(frameName))));

        for (const [index, isExisting] of isExistings.entries()) {
            if (!isExisting) {
                throw new Error("Not found frame " + framesNames[index]);
            }
        }

        const params = url.query ? this.parseParams(url.query) : [];
        const page = {
            url: rawUrl,
            frames: framesNames.map((name, i) => {
                return {
                    name,
                    params: params[i] || {},
                };
            }),
        };
        return page;
    }
    public async resolve(request: IRequest): Promise<IRoute> {
        try {
            const page = await this.resolvePage(request.url);
            return {
                status: 200,
                page,
            };
        } catch (e) {
            return {
                status: 404,
                text: e.toString(),
            };
        }
    }
    protected parseParams(query: string) {
        const queryParams = query.split("&");
        const params: Array<{ [index: string]: string }> = [];
        for (const param of queryParams) {
            const [paramFullName, paramValue] = param.split("=");
            const [frameShortName, paramName] = paramFullName.split("_");
            const frameNumber = parseInt(frameShortName.substr(1), 10);
            if (!params[frameNumber]) {
                params[frameNumber] = {};
            }
            params[frameNumber][paramName] = decodeURIComponent(paramValue);
        }
        return params;
    }
}
export default FramesBasedRouter;
