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
const url_1 = require("url");
class FramesBasedRouter {
    constructor(config) {
        this.config = config;
        this.basePath = "/";
    }
    resolvePage(rawUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = url_1.parse(rawUrl);
            if (!url.pathname) {
                throw new Error("Url should contain path: " + url);
            }
            const pathname = this.basePath ? url.pathname.substr(this.basePath.length) : url.pathname;
            const framesNames = pathname.split("_").map((frameName) => frameName || "index");
            const isExistings = (yield Promise.all(framesNames.map((frameName) => this.config.app.hasFrame(frameName))));
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
        });
    }
    resolve(request) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = yield this.resolvePage(request.url);
                return {
                    status: 200,
                    page,
                };
            }
            catch (e) {
                return {
                    status: 404,
                    text: e.toString(),
                };
            }
        });
    }
    parseParams(query) {
        const queryParams = query.split("&");
        const params = [];
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
exports.default = FramesBasedRouter;
