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
class Controller extends onemitter_1.Onemitter {
    constructor() {
        super();
        setTimeout(() => {
            this.emit("HOOO");
        }, 5000);
    }
    getInitialData() {
        return __awaiter(this, void 0, void 0, function* () {
            return "Hello, world";
        });
    }
    action1(value) {
        this.emit(value + ", dear!");
    }
    dispatch(actionName, name) {
        if (actionName === "action1") {
            this.action1(name);
        }
    }
}
exports.default = Controller;
