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
const mkdirp = require("mkdirp");
const path_1 = require("path");
const uid = require("uid-safe");
const util_1 = require("util");
class SessionsManager {
    constructor(config) {
        this.config = config;
        this.sessions = {};
    }
    resolveFromRequest(req) {
        return __awaiter(this, void 0, void 0, function* () {
            let session = null;
            if (req.cookies.sid) {
                session = yield this.getBySid(req.cookies.sid);
            }
            if (!session) {
                session = yield this.createSession(req);
            }
            return session;
        });
    }
    getBySid(sid) {
        return __awaiter(this, void 0, void 0, function* () {
            const [id, hash] = sid.split(":");
            if (this.sessions[id] && this.sessions[id].session.hash === hash) {
                return this.sessions[id].session;
            }
            if (yield util_1.promisify(fs_1.exists)(this.getSessionPath(id))) {
                const sessionFromFile = JSON.parse((yield util_1.promisify(fs_1.readFile)(this.getSessionPath(id))).toString());
                if (sessionFromFile.hash === hash) {
                    return sessionFromFile;
                }
            }
            return null;
        });
    }
    createSession(_) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = new Date().getTime().toString() + (yield uid(7));
            const hash = yield uid(32);
            const session = { id, hash, sid: id + ":" + hash };
            this.sessions[id] = { session };
            yield util_1.promisify(mkdirp)(path_1.dirname(this.getSessionPath(id)));
            yield util_1.promisify(fs_1.writeFile)(this.getSessionPath(id), JSON.stringify(session));
            return session;
        });
    }
    getSessionPath(id) {
        return this.config.sessionsPath + "/" + id + "/session.json";
    }
}
exports.default = SessionsManager;
