import { IncomingHttpHeaders } from "http";
import { IPackInfo } from "neweb-pack";

export interface IPage {
    id: string;
    sid: string;
    url: string;
    frames: IPageFrame[];
}
export interface IPageFrame {
    frameId: string;
    frameName: string;
    frameVersion: string;
    params: any;
    data: any;
    modules: IModule[];
}
export interface IEmitter {
    on: (eventName: string, ...args: any[]) => void;
    emit: (...args: any[]) => void;
}
export interface IModule {
    type: string;
    name: string;
    version?: string;
}
export interface IInitialInfo {
    page: IPage;
}
export type IRoute = IPageRoute | INotFoundRoute | IUnknownErrorRoute;
export interface IPageRoute {
    status: 200;
    page: IRoutePage;
}
export interface IRoutePage {
    url: string;
    frames: IRoutePageFrame[];
}
export interface IRoutePageFrame {
    name: string;
    params: any;
}
export interface INotFoundRoute {
    status: 404;
    text: string;
}
export interface IUnknownErrorRoute {
    status: 500;
    text: string;
}
export interface IRouter {
    resolve(req: IRequest): Promise<IRoute>;
    resolvePage(url: string): Promise<IRoutePage>;
}
export interface IApp {
    fillTemplate(html: string, initial: any): Promise<string>;
    hasFrame(frameName: string): Promise<boolean>;
    resolveFrameViewModule(frameName: string): Promise<IPackInfo>;
    requireFrameController(frameName: string): any;
    requireFrameView(frameName: string): Promise<React.ComponentClass<any>>;
}
export interface IRequest {
    url: string;
    host: string;
    cookies: { [index: string]: string };
    headers: IncomingHttpHeaders;
}

export interface ICookie {
    name: string;
    value: string;
    expired: Date;
}
export interface ISession {
    id: string;
    hash: string;
    sid: string;
}
export interface IPageRenderResult {
    html: string;
    data: any[];
}
