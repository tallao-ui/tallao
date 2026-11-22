import { mount } from "svelte";
import "tallao/tokens.css";
import "tallao/base.css";
import "./brand.css";
import "./docs.css";
import Docs from "./Docs.svelte";

mount(Docs, { target: document.getElementById("app")! });
