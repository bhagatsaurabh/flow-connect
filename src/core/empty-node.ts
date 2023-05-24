import { Node } from "./node";

export class EmptyNode extends Node {
  constructor() {
    super();
  }

  setupIO(): void {}
  created(): void {}
  process(): void {}
}
