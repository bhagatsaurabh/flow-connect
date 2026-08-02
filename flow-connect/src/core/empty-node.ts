import { Node } from "./node.js";

export class EmptyNode extends Node {
  constructor() {
    super();
  }

  setupIO(): void {}
  created(): void {}
  process(): void {}
}
