import { render } from "preact";
import { Provider } from "react-redux";
import { store } from "@/store";
import "./globals.css";
import { App } from "@/components/App";

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

render(
  <Provider store={store}>
    <App />
  </Provider>,
  root,
);
