import cookieParser = require("cookie-parser");
import express = require("express");
import { createServer } from "http";
import { ModulePacker } from "neweb-pack";
import { join, resolve } from "path";
import SocketIOServer = require("socket.io");
import { REQUIRE_FUNC_NAME } from "./common";
import App from "./lib/App";
import Router from "./lib/FramesBasedRouter";
import ModulesServer from "./lib/ModulesServer";
import PageMetaGenerator from "./lib/PageMetaGenerator";
import PagesManager from "./lib/PagesManager";
import Server from "./lib/Server";
import ServerRenderer from "./lib/ServerRenderer";
import SessionsManager from "./lib/SessionsManager";
const logger = console;
const appDir = resolve(join(process.cwd(), "app"));
const modulesPath = join(appDir, "cache", "modules");
const modulePacker = new ModulePacker({
    appRoot: appDir,
    excludedModules: ["react", "react-dom"],
    modulesPath,
    REQUIRE_FUNC_NAME,
});
const env = process.env.NODE_ENV === "production" ? "production" : "development";
const app = new App({
    appDir,
    modulePacker,
    noCache: true,
    env,
});
const router = new Router({
    app,
});
const sessionManager = new SessionsManager({
    sessionsPath: join(appDir, "sessions"),
});
const pageMetaGenerator = new PageMetaGenerator();
const pageManager = new PagesManager({
    app,
    router,
    sessionManager,
    pageMetaGenerator,
});
const renderer = new ServerRenderer({
    app,
});
const expressApp = express();
const httpServer = createServer(expressApp);
const io = SocketIOServer(httpServer as any, {
    wsEngine: "ws",
} as any);
const server = new Server({
    router,
    app,
    pageManager,
    renderer,
    sessionManager,
});
const modulesServer = new ModulesServer({
    modulesPath,
});

modulesServer.attach(expressApp);
expressApp.get("/bundle.js", (_, res) => res.sendFile(resolve(__dirname + "/dist/bundle.js")));
expressApp.use(express.static(join(appDir, "public")));
expressApp.use(cookieParser(), (req, res) => {
    server.onRequest({
        cookies: req.cookies || {},
        headers: req.headers || {},
        host: req.hostname,
        url: req.url,
    }, res);
});
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

io.on("connection", (socket) => {
    pageManager.onNewClient(socket);
});

httpServer.listen(port, (err: any) => {
    if (err) {
        logger.log(err);
        return;
    }
    logger.log("Started at " + port);
});
