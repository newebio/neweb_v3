import { exists, readFile, writeFile } from "fs";
import mkdirp = require("mkdirp");
import { dirname } from "path";
import uid = require("uid-safe");
import { promisify } from "util";
import { IRequest, ISession } from "..";
export interface ISessionsManagerConfig {
    sessionsPath: string;
}
class SessionsManager {
    protected sessions: { [index: string]: { session: ISession } } = {};
    constructor(protected config: ISessionsManagerConfig) {

    }
    public async resolveFromRequest(req: IRequest): Promise<ISession> {
        let session: ISession | null = null;
        if (req.cookies.sid) {
            session = await this.getBySid(req.cookies.sid);
        }
        if (!session) {
            session = await this.createSession(req);
        }
        return session;
    }
    protected async createSession(_: IRequest): Promise<ISession> {
        const id = new Date().getTime().toString() + await uid(7);
        const hash = await uid(32);
        const session = { id, hash };
        this.sessions[id] = { session };
        await promisify(mkdirp)(dirname(this.getSessionPath(id)));
        await promisify(writeFile)(this.getSessionPath(id), JSON.stringify(session));
        return session;
    }
    protected async getBySid(sid: string): Promise<ISession | null> {
        const [id, hash] = sid.split(":");
        if (this.sessions[id] && this.sessions[id].session.hash === hash) {
            return this.sessions[id].session;
        }
        if (await promisify(exists)(this.getSessionPath(id))) {
            const sessionFromFile = JSON.parse(
                (await promisify(readFile)(this.getSessionPath(id))).toString());
            if (sessionFromFile.hash === hash) {
                return sessionFromFile;
            }
        }
        return null;
    }
    protected getSessionPath(id: string) {
        return this.config.sessionsPath + "/" + id + "/session.json";
    }
}
export default SessionsManager;
