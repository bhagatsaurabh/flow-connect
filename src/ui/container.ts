import { Color } from "../core/color";
import { RenderResolver, Serializable } from "../common/interfaces";
import { Node } from "../core/node";
import { Vector2 } from "../core/vector";
import { Button, Display, HorizontalLayout, Stack, Image, Input, Label, Select, Slider, Source, Toggle } from "./index";
import { SerializedUINode, UINode, UINodeStyle, UIType, UINodeRenderParams } from "./ui-node";
import { Align } from "../common/enums";

export class Container extends UINode implements Serializable {
  renderResolver: RenderResolver<Container, ContainerRenderParams> = () => null;
  contentWidth: number;

  constructor(
    node: Node,
    width: number,
    options: ContainerOptions = DefaultContainerOptions()
  ) {
    super(node, node.position, UIType.Container, {
      style: options.style ? { ...DefaultContainerStyle(), ...options.style } : DefaultContainerStyle(),
      id: options.id,
      hitColor: options.hitColor
    });

    this.width = width;
    this.height = this.node.style.padding * 2;
    this.contentWidth = this.width - 2 * this.node.style.padding;
  }

  paint(): void {
    let context = this.context;
    let nodeRenderResolver = this.node.renderResolver.uiContainer;
    let flowRenderResolver = this.node.flow.renderResolver.uiContainer;
    let flowConnectRenderResolver = this.node.flow.flowConnect.renderResolver.uiContainer;
    ((this.renderResolver && this.renderResolver(this))
      || (nodeRenderResolver && nodeRenderResolver(this))
      || (flowRenderResolver && flowRenderResolver(this))
      || (flowConnectRenderResolver && flowConnectRenderResolver(this))
      || this._paint
    )(context, this.getRenderParams(), this);
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
      this.position.x, this.position.y + this.node.style.titleHeight,
      this.width, this.height - this.node.style.titleHeight, 5
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
    position.y += this.node.style.titleHeight
    return {
      position: position,
      width: this.width,
      height: this.height - this.node.style.titleHeight
    }
  }

  reflow(): void {
    this.position = this.node.position;
    let terminalsDisplayHeight = Math.max(this.node.inputs.length, this.node.outputs.length) * this.node.style.terminalRowHeight + this.node.style.titleHeight;
    let x = this.position.x + this.node.style.padding;
    let y = this.position.y + terminalsDisplayHeight;
    this.children.filter(child => child.visible).forEach(child => {
      y += this.node.style.spacing;
      let availableWidth = this.width - this.node.style.padding * 2;
      child.width = (child.width > availableWidth ? availableWidth : child.width) || availableWidth;
      if (child.width < availableWidth) {
        let childX;
        if (child.style.align === Align.Center) {
          childX = this.position.x + this.width / 2 - child.width / 2;
        } else if (child.style.align === Align.Right) {
          childX = this.position.x + this.width - this.node.style.padding - child.width;
        } else {
          childX = x;
        }
        child.position = new Vector2(childX, y);
      } else {
        child.position = new Vector2(x, y);
      }
      y += child.height;
    });
    this.height = y + this.node.style.padding - this.position.y;
  }

  onPropChange() { /**/ }
  onOver(screenPosition: Vector2, realPosition: Vector2): void {
    if (this.disabled) return;

    this.call('over', this, screenPosition, realPosition);
  }
  onDown(screenPosition: Vector2, realPosition: Vector2): void {
    if (this.disabled) return;

    this.call('down', this, screenPosition, realPosition);
  }
  onUp(screenPosition: Vector2, realPosition: Vector2): void {
    if (this.disabled) return;

    this.call('up', this, screenPosition, realPosition);
  }
  onClick(screenPosition: Vector2, realPosition: Vector2): void {
    if (this.disabled) return;

    this.call('click', this, screenPosition, realPosition);
  }
  onDrag(screenPosition: Vector2, realPosition: Vector2): void {
    if (this.disabled) return;

    this.call('drag', this, screenPosition, realPosition);
  }
  onEnter(screenPosition: Vector2, realPosition: Vector2) {
    if (this.disabled) return;

    this.call('enter', this, screenPosition, realPosition);
  }
  onExit(screenPosition: Vector2, realPosition: Vector2) {
    if (this.disabled) return;

    this.call('exit', this, screenPosition, realPosition);
  }
  onWheel(direction: boolean, screenPosition: Vector2, realPosition: Vector2) {
    if (this.disabled) return;

    this.call('wheel', this, direction, screenPosition, realPosition);
  }
  onContextMenu(): void { /**/ }

  serialize(): SerializedContainer {
    return {
      width: this.width,
      propName: this.propName,
      input: this.input ? this.input.serialize() : null,
      output: this.output ? this.output.serialize() : null,
      id: this.id,
      style: {
        backgroundColor: this.style.backgroundColor,
        shadowColor: this.style.shadowColor,
        shadowBlur: this.style.shadowBlur,
        shadowOffset: this.style.shadowOffset.serialize(),
        borderWidth: this.style.borderWidth,
        borderColor: this.style.borderColor
      },
      hitColor: this.hitColor.serialize(),
      type: this.type,
      childs: this.children.map(child => (child as any).serialize())
    }
  }
  static deSerialize(node: Node, data: SerializedContainer): Container {
    let uiContainer = new Container(node, data.width, {
      style: data.style,
      id: data.id,
      hitColor: Color.deSerialize(data.hitColor)
    });

    uiContainer.children.push(...data.childs.map(serializedChild => {
      switch (serializedChild.type) {
        case UIType.Button: return Button.deSerialize(node, serializedChild);
        case UIType.Container: return Container.deSerialize(node, serializedChild);
        case UIType.Display: return Display.deSerialize(node, serializedChild);
        case UIType.HorizontalLayout: return HorizontalLayout.deSerialize(node, serializedChild);
        case UIType.Stack: return Stack.deSerialize(node, serializedChild);
        case UIType.Image: return Image.deSerialize(node, serializedChild);
        case UIType.Input: return Input.deSerialize(node, serializedChild);
        case UIType.Label: return Label.deSerialize(node, serializedChild);
        case UIType.Select: return Select.deSerialize(node, serializedChild);
        case UIType.Slider: return Slider.deSerialize(node, serializedChild);
        case UIType.Source: return Source.deSerialize(node, serializedChild);
        case UIType.Toggle: return Toggle.deSerialize(node, serializedChild);
        default: return;
      }
    }));
    return uiContainer;
  }
}

export interface ContainerStyle extends UINodeStyle {
  backgroundColor?: string,
  shadowColor?: string,
  shadowBlur?: number,
  shadowOffset?: Vector2,
  borderColor?: string,
  borderWidth?: number
}
let DefaultContainerStyle = () => {
  return {
    backgroundColor: '#ddd',
    shadowColor: '#666',
    shadowBlur: 3,
    shadowOffset: new Vector2(3, 3),
    borderWidth: 1,
    borderColor: '#444',
    visible: true
  };
};

export interface SerializedContainer extends SerializedUINode {
  width: number
}

interface ContainerOptions {
  style?: ContainerStyle,
  id?: string,
  hitColor?: Color
}
let DefaultContainerOptions = () => {
  return {};
};

export interface ContainerRenderParams extends UINodeRenderParams { }
