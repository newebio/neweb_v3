import { exists, readFile } from "fs";
import { IPackInfo, ModulePacker } from "neweb-pack";
import { join, resolve } from "path";
import { promisify } from "util";
import { IApp, IPageMetaInfo } from "./..";
import { INITIAL_VAR } from "./../common";
export interface IAppConfig {
    appDir: string;
    modulePacker: ModulePacker;
    noCache: boolean;
    env: "production" | "development";
}
class App implements IApp {
    protected template = `<!doctype><html>
    <head><title>{%title%}</title>{%meta%}
    <meta charset="utf8" /></head><body>
    <div id="root">{%html%}</div>
    <script>{%script%}</script>
    <script async src="/bundle.js"></script>
    </body></html>`;
    constructor(protected config: IAppConfig) {

    }
    public async hasFrame(frameName: string) {
        const viewPath = resolve(join(this.config.appDir, "frames", frameName, "view.js"));
        return promisify(exists)(viewPath);
    }
    public async fillTemplate(html: string, meta: IPageMetaInfo, initialInfo: any) {
        const templatePath = join(this.config.appDir, "template.html");
        const template = await promisify(exists)(templatePath) ?
            (await promisify(readFile)(templatePath)).toString()
            : this.template;
        return template
            .replace("{%html%}", html)
            .replace("{%title%}", meta.title || "")
            .replace("{%meta%}", "<!--__page_meta_start__-->" + (meta.meta ? meta.meta.map((m) =>
                `<meta name="${m.name}" content="${m.content}" />`).join("") : "") + "<!--__page_meta_end__-->")
            .replace("{%script%}", `
            window["${INITIAL_VAR}"]=${JSON.stringify(initialInfo)}
            `);
    }
    public getConfig() {
        const configModule = join(this.config.appDir, "config." + this.config.env);
        try {
            if (this.config.noCache) {
                delete require.cache[require.resolve(configModule)];
            }
            return require(configModule).default;
        } catch (_) {
            return {};
        }
    }
    public requireContextModule() {
        const contextModule = join(this.config.appDir, "Context");
        try {
            if (this.config.noCache) {
                delete require.cache[require.resolve(contextModule)];
            }
            return require(contextModule).default;
        } catch (e) {
            // tslint:disable-next-line:max-classes-per-file
            return class { };
        }
    }
    public async resolveFrameViewModule(frameName: string): Promise<IPackInfo> {
        const viewModulePath = join(this.config.appDir, "frames", frameName, "view");
        if (this.config.noCache) {
            delete require.cache[require.resolve(viewModulePath)];
        }
        const packInfo = await this.config.modulePacker.addLocalPackage(viewModulePath);
        return {
            ...packInfo, modules: packInfo.modules.concat([{
                name: packInfo.name,
                type: packInfo.type,
                version: packInfo.version,
            }]),
        };
    }
    public async requireFrameView(frameName: string) {
        const viewModulePath = join(this.config.appDir, "frames", frameName, "view");
        if (this.config.noCache) {
            delete require.cache[require.resolve(viewModulePath)];
        }
        return require(viewModulePath).default;
    }
    public async requireFrameController(frameName: string) {
        const controllerModulePath = join(this.config.appDir, "frames", frameName, "controller");
        if (this.config.noCache) {
            delete require.cache[require.resolve(controllerModulePath)];
        }
        return require(controllerModulePath).default;
    }
}
export default App;
