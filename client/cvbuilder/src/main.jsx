import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./helpers/store";
import App from "./App";
import "./index.css";

/**
 * WHAT: Application entry point, wraps App with Redux Provider
 * INPUT: None
 * OUTPUT: Renders App component with Redux store available
 */

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
);
