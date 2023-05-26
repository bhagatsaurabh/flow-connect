import { Node } from "../core/node.js";
import { UINode, UINodeOptions, UINodeStyle } from "./ui-node.js";
import { clamp } from "../utils/utils.js";

export class HorizontalLayout extends UINode<HorizontalLayoutStyle> {
  style: HorizontalLayoutStyle;

  constructor(_node: Node, _options: HorizontalLayoutOptions = DefaultHorizontalLayoutOptions()) {
    super();
  }

  protected created(options: HorizontalLayoutOptions): void {
    options = { ...DefaultHorizontalLayoutOptions(), ...options };
    const { style = {}, childs = [], height = this.node.style.rowHeight } = options;

    this.style = { ...DefaultHorizontalLayoutStyle(), ...style };
    this.height = height;

    if (childs && childs.length > 0) this.children.push(...childs);
  }

  paint() {}
  paintLOD1() {}
  offPaint() {
    this.offUIContext.fillStyle = this.hitColor.hexValue;
    this.offUIContext.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  reflow() {
    let children = this.children.filter((child) => child.visible);

    let availableWidth = this.width - (children.length > 0 ? children.length - 1 : 0) * this.style.spacing;
    let originalWidth = availableWidth;

    let maxHeight = 0;
    children.forEach((child) => (maxHeight = Math.max(maxHeight, child.height)));
    this.height = maxHeight;

    let fixedWidthChilds = this.children.filter((child) => !!child.width);
    fixedWidthChilds.forEach((child) => (child.width = clamp(child.width, 0, availableWidth)));
    let fixedWidth = fixedWidthChilds.reduce((acc, curr) => acc + curr.width, 0);

    let remainingWidth = originalWidth;
    fixedWidth = clamp(fixedWidth, 0, remainingWidth);
    remainingWidth -= fixedWidth;
    let flexWidth = remainingWidth;

    let x = this.position.x;
    children.forEach((child) => {
      let childWidth;
      if (!!child.width) childWidth = child.width;
      else if (typeof child.style.grow === "number") {
        childWidth = child.style.grow * flexWidth;
      } else {
        childWidth = 0;
      }

      childWidth = clamp(childWidth, 0, availableWidth);
      child.width = childWidth;

      let y;
      if (child.height < this.height) {
        y = this.position.y + this.height / 2 - child.height / 2;
      } else {
        child.height = this.height;
        y = this.position.y;
      }
      child.position.assign(x, y);

      availableWidth -= childWidth;
      x += childWidth + this.style.spacing;
    });

    if (this.input) {
      this.input.position.assign(
        this.node.position.x - this.node.style.terminalStripMargin - this.input.style.radius,
        this.position.y + this.height / 2
      );
    }
    if (this.output) {
      this.output.position.assign(
        this.node.position.x + this.node.width + this.node.style.terminalStripMargin + this.output.style.radius,
        this.position.y + this.height / 2
      );
    }

    // Bug, when creating HozLayout with childs argument, UI container's height won't update
    this.node.ui.reflow();
  }

  onPropChange() {}
}

export interface HorizontalLayoutStyle extends UINodeStyle {
  spacing?: number;
}
const DefaultHorizontalLayoutStyle = (): HorizontalLayoutStyle => ({
  spacing: 0,
});

export interface HorizontalLayoutOptions extends UINodeOptions<HorizontalLayoutStyle> {
  childs?: UINode[];
}
const DefaultHorizontalLayoutOptions = (): HorizontalLayoutOptions => ({
  childs: [],
});
