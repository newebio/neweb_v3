"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
class RootComponent extends React.Component {
    componentWillMount() {
        this.childrenCallback = (value) => {
            this.setState({ children: value });
        };
        this.setState({ children: this.props.children.get() });
        this.props.children.on(this.childrenCallback);
    }
    componentWillUnmount() {
        this.props.children.off(this.childrenCallback);
    }
    render() {
        return this.state.children;
    }
}
exports.default = RootComponent;
