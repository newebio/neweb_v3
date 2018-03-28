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
class Server {
    constructor(config) {
        this.config = config;
    }
    onRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const route = yield this.config.router.resolve(req);
            if (route.status === 404) {
                res.status(404).send(route.text);
                return;
            }
            if (route.status === 500) {
                res.status(404).send(route.text);
                return;
            }
            const { page: pageRoute } = route;
            const session = yield this.config.sessionManager.resolveFromRequest(req);
            const pageController = yield this.config.pageManager.createPageController({ session });
            const page = yield pageController.resolvePage(pageRoute);
            const { html } = yield this.config.renderer.render(page);
            const initialInfo = {
                page,
            };
            res.cookie("sid", session.id + ":" + session.hash);
            res.status(200).send(yield this.config.app.fillTemplate(html, initialInfo));
        });
    }
}
exports.default = Server;
