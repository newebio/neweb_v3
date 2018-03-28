import { Onemitter } from "onemitter";
class Controller extends Onemitter<any> {
    constructor() {
        super();
        setTimeout(() => {
            this.emit("HOOO");
        }, 5000);
    }
    public async getInitialData() {
        return "Hello, world";
    }
    public action1(value: string) {
        this.emit(value + ", dear!");
    }
    public dispatch(actionName: string, name: string) {
        if (actionName === "action1") {
            this.action1(name);
        }
    }
}
export default Controller;
