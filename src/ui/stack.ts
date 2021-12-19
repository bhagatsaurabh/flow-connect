import { Color } from "../core/color";
import { Serializable } from "../common/interfaces";
import { Node } from "../core/node";
import { Vector2 } from "../core/vector";
import { Button } from "./button";
import { Container } from "./container";
import { Display } from "./display";
import { Image } from './image';
import { Input } from "./input";
import { Label } from "./label";
import { Select } from "./select";
import { Slider } from "./slider";
import { Source } from "./source";
import { Toggle } from "./toggle";
import { SerializedUINode, UINode, UINodeStyle, UIType } from "./ui-node";

export class Stack extends UINode implements Serializable {

  constructor(
    node: Node,
    options: StackOptions = DefaultStackOptions()
  ) {

    super(
      node, Vector2.Zero(), UIType.Stack, false, false, true,
      options.style ? { ...DefaultStackStyle(), ...options.style } : DefaultStackStyle(),
      null, null, null, options.id, options.hitColor
    );
    if (options.childs) this.children.push(...options.childs);
  }

  /** @hidden */
  paint(): void { /**/ }
  /** @hidden */
  paintLOD1() { /**/ }
  /** @hidden */
  offPaint(): void {
    this.offUIContext.fillStyle = this.hitColor.hexValue;
    this.offUIContext.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
  /** @hidden */
  reflow(): void {
    let children = this.children.filter(child => child.visible);
    let actualTotalHeight = children.reduce((acc, curr) => (acc + curr.height), 0);
    let effectiveSpacing = (children.length - 1) * this.style.spacing;
    this.height = actualTotalHeight + effectiveSpacing;

    let y = this.position.y;
    children.forEach(child => {
      child.position.assign(this.position.x, y);
      child.width = this.width;
      y += child.height + this.style.spacing;
    });
  }

  /** @hidden */
  onPropChange() { /**/ }
  /** @hidden */
  onOver(screenPosition: Vector2, realPosition: Vector2): void {
    if (this.disabled) return;

    this.call('over', this, screenPosition, realPosition);
  }
  /** @hidden */
  onDown(screenPosition: Vector2, realPosition: Vector2): void {
    if (this.disabled) return;

    this.call('down', this, screenPosition, realPosition);
  }
  /** @hidden */
  onUp(screenPosition: Vector2, realPosition: Vector2): void {
    if (this.disabled) return;

    this.call('up', this, screenPosition, realPosition);
  }
  /** @hidden */
  onClick(screenPosition: Vector2, realPosition: Vector2): void {
    if (this.disabled) return;

    this.call('click', this, screenPosition, realPosition);
  }
  /** @hidden */
  onDrag(screenPosition: Vector2, realPosition: Vector2): void {
    if (this.disabled) return;

    this.call('drag', this, screenPosition, realPosition);
  }
  /** @hidden */
  onEnter(screenPosition: Vector2, realPosition: Vector2) {
    if (this.disabled) return;

    this.call('enter', this, screenPosition, realPosition);
  }
  /** @hidden */
  onExit(screenPosition: Vector2, realPosition: Vector2) {
    if (this.disabled) return;

    this.call('exit', this, screenPosition, realPosition);
  }
  /** @hidden */
  onWheel(direction: boolean, screenPosition: Vector2, realPosition: Vector2) {
    if (this.disabled) return;

    this.call('wheel', this, direction, screenPosition, realPosition);
  }
  /** @hidden */
  onContextMenu(): void { /**/ }

  serialize(): SerializedStackLayout {
    return {
      style: this.style,
      id: this.id,
      hitColor: this.hitColor.serialize(),
      type: this.type,
      propName: null,
      input: null,
      output: null,
      childs: this.children.map(child => (child as any).serialize())
    }
  }
  static deSerialize(node: Node, data: SerializedStackLayout): Stack {
    let stack = new Stack(node, { style: data.style, id: data.id, hitColor: Color.deSerialize(data.hitColor), childs: [] });

    stack.children.push(...data.childs.map(serializedChild => {
      switch (serializedChild.type) {
        case UIType.Button: return Button.deSerialize(node, serializedChild);
        case UIType.Container: return Container.deSerialize(node, serializedChild);
        case UIType.Display: return Display.deSerialize(node, serializedChild);
        case UIType.HorizontalLayout: return Stack.deSerialize(node, serializedChild);
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
    return stack;
  }
}

export interface StackStyle extends UINodeStyle {
  spacing?: number
}
/** @hidden */
let DefaultStackStyle = () => {
  return {
    spacing: 0,
    visible: true
  };
};

export interface SerializedStackLayout extends SerializedUINode { }

interface StackOptions {
  childs?: UINode[],
  style?: StackStyle,
  id?: string,
  hitColor?: Color
}
/** @hidden */
let DefaultStackOptions = () => {
  return {}
};
