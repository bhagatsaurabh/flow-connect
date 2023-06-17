import { Node } from "../core/node.js";
import { UINode, UINodeOptions, UINodeStyle } from "./ui-node.js";

export class Stack extends UINode<StackStyle> {
  style: StackStyle;

  constructor(node: Node, _options: StackOptions = DefaultStackOptions(node)) {
    super();
  }

  protected created(options: StackOptions): void {
    options = { ...DefaultStackOptions(this.node), ...options };
    const { height, style = {}, childs = [] } = options;

    this.style = { ...DefaultStackStyle(), ...style };
    this.height = height ?? this.node.style.rowHeight;

    if (childs) this.children.push(...childs);
  }

  paint(): void {}
  paintLOD1() {}
  offPaint(): void {
    this.offUIContext.fillStyle = this.hitColor.hexValue;
    this.offUIContext.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  reflow(): void {
    let children = this.children.filter((child) => child.visible);
    let actualTotalHeight = children.reduce((acc, curr) => acc + curr.height, 0);
    let effectiveSpacing = (children.length - 1) * this.style.spacing;
    this.height = actualTotalHeight + effectiveSpacing;

    let y = this.position.y;
    children.forEach((child) => {
      child.position.assign(this.position.x, y);
      child.width = this.width;
      y += child.height + this.style.spacing;
    });
  }

  onPropChange() {}
}

export interface StackStyle extends UINodeStyle {
  spacing?: number;
}
const DefaultStackStyle = (): StackStyle => ({
  spacing: 0,
});

export interface StackOptions extends UINodeOptions<StackStyle> {
  childs?: UINode[];
}
const DefaultStackOptions = (node: Node): StackOptions => ({
  height: node.style.rowHeight,
});
