"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const onemitter_1 = require("onemitter");
const React = require("react");
const Frame_1 = require("./Frame");
const RootComponent_1 = require("./RootComponent");
class Renderer {
    constructor(config) {
        this.config = config;
        this.framesStates = [];
        this.rootChildren = onemitter_1.default();
    }
    render() {
        return React.createElement(RootComponent_1.default, {
            children: this.rootChildren,
        });
    }
    onChangeFrames(frames) {
        return __awaiter(this, void 0, void 0, function* () {
            const framesCount = frames.length;
            for (const [i, frame] of frames.reverse().entries()) {
                const index = framesCount - i - 1;
                if (!this.framesStates[index] ||
                    frame.frameId !== this.framesStates[index].frameId) {
                    this.disposeFrameState(this.framesStates[index]);
                    this.framesStates[index] = yield this.createFrameState(frame);
                    if (index === 0) {
                        this.rootChildren.emit(this.framesStates[index].element);
                    }
                    else {
                        this.framesStates[index - 1].children.emit(this.framesStates[index].element);
                    }
                }
            }
        });
    }
    newFrameParams(frameId, params) {
        const frame = this.framesStates.find((f) => f.frameId === frameId);
        if (frame) {
            frame.params.emit(params);
        }
    }
    newFrameData(frameId, data) {
        const frame = this.framesStates.find((f) => f.frameId === frameId);
        if (frame) {
            frame.data.emit(data);
        }
    }
    disposeFrameState(_) {
        //
    }
    createFrameState(frame) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = onemitter_1.default({ value: frame.data });
            const view = yield this.config.resolveFrameView(frame.frameName, frame.frameVersion, frame.modules);
            const params = onemitter_1.default({ value: frame.params || {} });
            const children = onemitter_1.default();
            const element = React.createElement(Frame_1.default, {
                data,
                view,
                dispatch: (...args) => this.config.dispatch(frame.frameId, ...args),
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
        });
    }
}
exports.default = Renderer;
