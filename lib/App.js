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
const fs_1 = require("fs");
const path_1 = require("path");
const util_1 = require("util");
const common_1 = require("./../common");
class App {
    constructor(config) {
        this.config = config;
        this.template = `<!doctype><html>
    <head></head><body>
    <div id="root">%html%</div>
    <script>%script%</script>
    <script async src="/bundle.js"></script>
    </body></html>`;
    }
    hasFrame(frameName) {
        return __awaiter(this, void 0, void 0, function* () {
            const viewPath = path_1.resolve(path_1.join(this.config.appDir, "frames", frameName, "view.js"));
            return util_1.promisify(fs_1.exists)(viewPath);
        });
    }
    fillTemplate(html, initialInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            const templatePath = path_1.join(this.config.appDir, "template.html");
            const template = (yield util_1.promisify(fs_1.exists)(templatePath)) ?
                (yield util_1.promisify(fs_1.readFile)(templatePath)).toString()
                : this.template;
            return template
                .replace("%html%", html)
                .replace("%script%", `
            window["${common_1.INITIAL_VAR}"]=${JSON.stringify(initialInfo)}
            `);
        });
    }
    resolveFrameViewModule(frameName) {
        return __awaiter(this, void 0, void 0, function* () {
            const viewModulePath = path_1.join(this.config.appDir, "frames", frameName, "view");
            if (this.config.noCache) {
                delete require.cache[require.resolve(viewModulePath)];
            }
            const packInfo = yield this.config.modulePacker.addLocalPackage(viewModulePath);
            return Object.assign({}, packInfo, { modules: packInfo.modules.concat([{
                        name: packInfo.name,
                        type: packInfo.type,
                        version: packInfo.version,
                    }]) });
        });
    }
    requireFrameView(frameName) {
        return __awaiter(this, void 0, void 0, function* () {
            const viewModulePath = path_1.join(this.config.appDir, "frames", frameName, "view");
            if (this.config.noCache) {
                delete require.cache[require.resolve(viewModulePath)];
            }
            return require(viewModulePath).default;
        });
    }
    requireFrameController(frameName) {
        return __awaiter(this, void 0, void 0, function* () {
            const controllerModulePath = path_1.join(this.config.appDir, "frames", frameName, "controller");
            if (this.config.noCache) {
                delete require.cache[require.resolve(controllerModulePath)];
            }
            return require(controllerModulePath).default;
        });
    }
}
exports.default = App;