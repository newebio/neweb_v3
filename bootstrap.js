"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cookieParser = require("cookie-parser");
const express = require("express");
const http_1 = require("http");
const neweb_pack_1 = require("neweb-pack");
const path_1 = require("path");
const SocketIOServer = require("socket.io");
const common_1 = require("./common");
const App_1 = require("./lib/App");
const FramesBasedRouter_1 = require("./lib/FramesBasedRouter");
const ModulesServer_1 = require("./lib/ModulesServer");
const PageMetaGenerator_1 = require("./lib/PageMetaGenerator");
const PagesManager_1 = require("./lib/PagesManager");
const Server_1 = require("./lib/Server");
const ServerRenderer_1 = require("./lib/ServerRenderer");
const SessionsManager_1 = require("./lib/SessionsManager");
const logger = console;
const appDir = path_1.resolve(path_1.join(process.cwd(), "app"));
const modulesPath = path_1.join(appDir, "cache", "modules");
const modulePacker = new neweb_pack_1.ModulePacker({
    appRoot: appDir,
    excludedModules: ["react", "react-dom"],
    modulesPath,
    REQUIRE_FUNC_NAME: common_1.REQUIRE_FUNC_NAME,
});
const env = process.env.NODE_ENV === "production" ? "production" : "development";
const app = new App_1.default({
    appDir,
    modulePacker,
    noCache: true,
    env,
});
const router = new FramesBasedRouter_1.default({
    app,
});
const sessionManager = new SessionsManager_1.default({
    sessionsPath: path_1.join(appDir, "sessions"),
});
const pageMetaGenerator = new PageMetaGenerator_1.default();
const pageManager = new PagesManager_1.default({
    app,
    router,
    sessionManager,
    pageMetaGenerator,
});
const renderer = new ServerRenderer_1.default({
    app,
});
const expressApp = express();
const httpServer = http_1.createServer(expressApp);
const io = SocketIOServer(httpServer, {
    wsEngine: "ws",
});
const server = new Server_1.default({
    router,
    app,
    pageManager,
    renderer,
    sessionManager,
});
const modulesServer = new ModulesServer_1.default({
    modulesPath,
});
modulesServer.attach(expressApp);
expressApp.get("/bundle.js", (_, res) => res.sendFile(path_1.resolve(__dirname + "/dist/bundle.js")));
expressApp.use(express.static(path_1.join(appDir, "public")));
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
httpServer.listen(port, (err) => {
    if (err) {
        logger.log(err);
        return;
    }
    logger.log("Started at " + port);
});
