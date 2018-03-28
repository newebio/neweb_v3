import React = require("react");

export default class extends React.Component<{}, {}> {
    public render() {
        return React.createElement("div", {
            onClick: () => this.props.dispatch("action1", "John"),
        }, ["data::", this.props.data]);
    }
}
