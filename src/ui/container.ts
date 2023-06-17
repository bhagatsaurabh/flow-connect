import { Renderer } from "../common/interfaces.js";
import { Node } from "../core/node.js";
import { Vector } from "../core/vector.js";
import { UINode, UINodeStyle, UINodeRenderParams, UINodeOptions } from "./ui-node.js";
import { Align } from "../common/enums.js";

export class Container extends UINode<ContainerStyle> {
  style: ContainerStyle;

  renderer: Renderer<Container, ContainerRenderParams> = () => null;
  contentWidth: number;

  constructor(_node: Node, _options: ContainerOptions) {
    super();
  }

  protected created(options: ContainerOptions): void {
    options = { ...DefaultContainerOptions(this.node), ...options };
    const { width, height, style = {} } = options;

    this.width = width;
    this.height = height ?? this.node.style.padding * 2;
    this.contentWidth = width - 2 * this.node.style.padding;
    this.style = { ...DefaultContainerStyle(), ...style };

    this.position = this.node.position;
  }

  paint(): void {
    const context = this.context;

    const scopeFlowConnect = this.node.flow.flowConnect.getRegisteredRenderer("background");
    const scopeFlow = this.node.flow.renderers.background;
    const scopeNode = this.node.renderers.background;
    const scopeContainer = this.renderer;
    const renderFn =
      (scopeContainer && scopeContainer(this)) ||
      (scopeNode && scopeNode(this)) ||
      (scopeFlow && scopeFlow(this)) ||
      (scopeFlowConnect && scopeFlowConnect(this)) ||
      this._paint;
    renderFn(context, this.getRenderParams(), this);
  }
  private _paint(context: CanvasRenderingContext2D, params: ContainerRenderParams, container: Container) {
    context.shadowColor = container.style.shadowColor;
    context.shadowBlur = container.style.shadowBlur;
    context.shadowOffsetX = container.style.shadowOffset.x;
    context.shadowOffsetY = container.style.shadowOffset.y;
    context.fillStyle = container.style.backgroundColor;
    context.strokeStyle = container.style.borderColor;
    context.lineWidth = container.style.borderWidth;
    context.roundRect(params.position.x, params.position.y, params.width, params.height, 5);
    context.stroke();
    context.fill();
  }
  paintLOD1() {
    let context = this.context;
    context.fillStyle = this.style.backgroundColor;
    context.strokeStyle = this.style.borderColor;
    context.lineWidth = this.style.borderWidth;
    context.roundRect(
      this.position.x,
      this.position.y + this.node.style.titleHeight,
      this.width,
      this.height - this.node.style.titleHeight,
      5
    );
    context.stroke();
    context.fill();
  }
  offPaint(): void {
    this.offUIContext.fillStyle = this.hitColor.hexValue;
    this.offUIContext.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
  getRenderParams(): ContainerRenderParams {
    let position = this.position.serialize();
    position.y += this.node.style.titleHeight;
    return {
      position: position,
      width: this.width,
      height: this.height - this.node.style.titleHeight,
    };
  }

  reflow(): void {
    const nodeStyle = this.node.style;

    this.position = this.node.position;
    let terminalsDisplayHeight =
      Math.max(this.node.inputs.length, this.node.outputs.length) * nodeStyle.terminalRowHeight + nodeStyle.titleHeight;
    let x = this.position.x + nodeStyle.padding;
    let y = this.position.y + terminalsDisplayHeight;
    this.children
      .filter((child) => child.visible)
      .forEach((child) => {
        y += nodeStyle.spacing;
        let availableWidth = this.width - nodeStyle.padding * 2;
        child.width = (child.width > availableWidth ? availableWidth : child.width) || availableWidth;

        if (child.width < availableWidth) {
          let childX;
          if (child.style.align === Align.Center) {
            childX = this.position.x + this.width / 2 - child.width / 2;
          } else if (child.style.align === Align.Right) {
            childX = this.position.x + this.width - nodeStyle.padding - child.width;
          } else {
            childX = x;
          }
          child.position = Vector.create(childX, y);
        } else {
          child.position = Vector.create(x, y);
        }
        y += child.height;
      });
    this.height = y + nodeStyle.padding - this.position.y;
  }
  onPropChange() {}
}

export interface ContainerStyle extends UINodeStyle {
  backgroundColor?: string;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffset?: Vector;
  borderColor?: string;
  borderWidth?: number;
}
const DefaultContainerStyle = (): ContainerStyle => ({
  backgroundColor: "#ddd",
  shadowColor: "#666",
  shadowBlur: 3,
  shadowOffset: Vector.create(3, 3),
  borderWidth: 1,
  borderColor: "#444",
});

export interface ContainerOptions extends UINodeOptions<ContainerStyle> {
  width: number;
}
let DefaultContainerOptions = (node: Node): ContainerOptions => ({
  width: node.width,
});

export interface ContainerRenderParams extends UINodeRenderParams {}
