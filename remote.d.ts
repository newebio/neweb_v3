import { IRoute, IPage } from ".";

export interface IInitializeParams{
    page: IPage;
}
export interface IRemoteParams {
    id: string;
    sid: string;
    pid: string;
}
export interface INavigateParams {
    url: string;
}
export interface IFrameActionParams {
    frameId: string;
    args: any[];
}
export interface IFrameDataParams {
    frameId: string;
    data: any;
}
