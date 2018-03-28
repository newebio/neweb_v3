import o, { Onemitter } from "onemitter";
import React = require("react");
import { IModule, IPageFrame } from "./..";
import Frame, { IFrameConfig } from "./Frame";
import RootComponent from "./RootComponent";
interface IFrameState {
    frameId: string;
    data: Onemitter<any>;
    params: Onemitter<any>;
    children: Onemitter<any>;
    element: React.ReactElement<IFrameConfig>;
}
export interface IRendererConfig {
    resolveFrameView: (
        frameName: string, version: string, modules: IModule[]) => Promise<React.ReactElement<any>>;
    dispatch: (...args: any[]) => void;
    navigate: (url: string) => void;
}
class Renderer {
    protected framesStates: IFrameState[] = [];
    protected rootChildren = o();
    constructor(protected config: IRendererConfig) {
    }
    public render() {
        return React.createElement(RootComponent, {
            children: this.rootChildren,
        });
    }
    public async onChangeFrames(frames: IPageFrame[]) {
        const framesCount = frames.length;
        for (const [i, frame] of frames.reverse().entries()) {
            const index = framesCount - i - 1;
            if (!this.framesStates[index] ||
                frame.frameId !== this.framesStates[index].frameId) {
                this.disposeFrameState(this.framesStates[index]);
                this.framesStates[index] = await this.createFrameState(frame);
                if (index === 0) {
                    this.rootChildren.emit(this.framesStates[index].element);
                } else {
                    this.framesStates[index - 1].children.emit(this.framesStates[index].element);
                }
            }
        }
    }
    public newFrameParams(frameId: string, params: any) {
        const frame = this.framesStates.find((f) => f.frameId === frameId);
        if (frame) {
            frame.params.emit(params);
        }
    }
    public newFrameData(frameId: string, data: any) {
        const frame = this.framesStates.find((f) => f.frameId === frameId);
        if (frame) {
            frame.data.emit(data);
        }
    }
    protected disposeFrameState(_: IFrameState) {
        //
    }
    protected async createFrameState(frame: IPageFrame): Promise<IFrameState> {
        const data = o({ value: frame.data });
        const view = await this.config.resolveFrameView(frame.frameName, frame.frameVersion, frame.modules);
        const params = o({ value: frame.params || {} });
        const children = o();
        const element = React.createElement(Frame, {
            data,
            view,
            dispatch: (...args: any[]) =>
                this.config.dispatch(frame.frameId, ...args),
            navigate: this.config.navigate,
            frameId: frame.frameId,
            params,
            children,
            key: frame.frameId,
        });
        return {
            children,
            data,
            element,
            frameId: frame.frameId,
            params,
        };
    }
}
export default Renderer;
