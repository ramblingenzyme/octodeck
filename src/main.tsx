import { render } from "preact";
import "./globals.css";
import { isDemo } from "@/env";
import { App } from "@/components/App";
import { DemoApp } from "@/components/DemoApp";

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

render(isDemo ? <DemoApp /> : <App />, root);
