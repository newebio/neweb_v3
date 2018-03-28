import React = require("react");

export default class extends React.Component<{}, {}> {
    public render() {
        return React.createElement("div", {
            onClick: () => this.props.dispatch("navigate"),
        }, ["data::", this.props.data]);
    }
}
