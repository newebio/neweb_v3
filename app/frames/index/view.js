"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
class default_1 extends React.Component {
    render() {
        return React.createElement("div", {
            onClick: () => this.props.dispatch("navigate"),
        }, ["data::", this.props.data]);
    }
}
exports.default = default_1;
