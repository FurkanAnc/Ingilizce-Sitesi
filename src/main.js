import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    console.error(error);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return React.createElement(
      "div",
      {
        style: {
          minHeight: "100vh",
          background: "#0f172a",
          color: "white",
          padding: 32,
          fontFamily: "system-ui, sans-serif",
        },
      },
      React.createElement("h1", null, "WordFlow could not start"),
      React.createElement("pre", { style: { whiteSpace: "pre-wrap", color: "#fca5a5" } }, String(this.state.error?.message || this.state.error))
    );
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  React.createElement(
    React.StrictMode,
    null,
    React.createElement(ErrorBoundary, null, React.createElement(App))
  )
);
