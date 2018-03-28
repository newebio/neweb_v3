import { Onemitter } from "onemitter";
import React = require("react");

class RootComponent extends React.Component<{
    children: Onemitter<any>;
}, {
        children: any;
    }> {
    protected childrenCallback: any;
    public componentWillMount() {
        this.childrenCallback = (value: any) => {
            this.setState({ children: value });
        };
        this.setState({ children: this.props.children.get() });
        this.props.children.on(this.childrenCallback);
    }
    public componentWillUnmount() {
        this.props.children.off(this.childrenCallback);
    }
    public render() {
        return this.state.children;
    }
}
export default RootComponent;
