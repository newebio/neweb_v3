import React = require("react");

export default class extends React.Component<{}, {
    loading: boolean;
}> {
    public state = { loading: false };
    public render() {
        return React.createElement("div", {
            onClick: async () => {
                this.setState({ loading: true });
                await this.props.dispatch("action1", "John");
                this.setState({ loading: false });
            },
        }, [
                React.createElement("a", {
                    onClick: () => {
                        this.props.navigate("/index?f0_name=Jack" + Math.random());
                    },
                }, ["CLICK!!!"]),
                "data::", this.state.loading ? "Loading" : this.props.data, JSON.stringify(this.props.params)]);
    }
}
