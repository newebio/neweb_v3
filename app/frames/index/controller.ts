import { Onemitter } from "onemitter";
class Controller extends Onemitter<any> {
    constructor(config: any) {
        super();
        setTimeout(() => {
            this.emit(config.params.name);
        }, 5000);
    }
    public async getInitialData() {
        return "Hello, worldmm no";
    }
    public action1(value: string) {
        return new Promise((resolve) => {
            setTimeout(() => {
                this.emit(value + ", dear!!!!!!");
                resolve();
            }, 5000);
        });
    }
    public dispatch(actionName: string, name: string) {
        if (actionName === "action1") {
            return this.action1(name);
        }
    }
}
export default Controller;
