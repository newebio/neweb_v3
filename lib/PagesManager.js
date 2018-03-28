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
const PageController_1 = require("./PageController");
class PagesManager {
    constructor(config) {
        this.config = config;
        this.pages = {};
    }
    createPageController(_) {
        return __awaiter(this, void 0, void 0, function* () {
            const pageId = this.generatePageId();
            const controller = new PageController_1.default({
                app: this.config.app,
                id: pageId,
            });
            this.pages[pageId] = { controller };
            return controller;
        });
    }
    /*public onNewClient(client: IEmitter) {
        client.on("initialize", async () => {
            const page = new Page();
            await page.initialize();
        });
        client.on("close", () => {

        });
        client.on("error", () => {

        });
    }*/
    generatePageId() {
        return (+new Date()).toString() + Math.round(Math.random() * 10000).toString();
    }
}
exports.default = PagesManager;
