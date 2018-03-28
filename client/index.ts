import { INITIAL_VAR } from "./../common";
import Bootstrap from "./Bootstrap";

const initial = (window as any)[INITIAL_VAR];

new Bootstrap().start(initial);
