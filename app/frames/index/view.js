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
const React = require("react");
class default_1 extends React.Component {
    constructor() {
        super(...arguments);
        this.state = { loading: false };
    }
    render() {
        return React.createElement("div", {
            onClick: () => __awaiter(this, void 0, void 0, function* () {
                this.setState({ loading: true });
                yield this.props.dispatch("action1", "John");
                this.setState({ loading: false });
            }),
        }, [
            React.createElement("a", {
                onClick: () => {
                    this.props.navigate("/index?f0_name=Jack" + Math.random());
                },
            }, ["CLICK!!!"]),
            "data::", this.state.loading ? "Loading" : this.props.data, JSON.stringify(this.props.params)
        ]);
    }
}
exports.default = default_1;
