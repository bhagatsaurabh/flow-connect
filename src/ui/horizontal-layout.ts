import { Color } from "../core/color";
import { HorizontalLayoutStyle, Serializable, SerializedHorizontalLayout } from "../core/interfaces";
import { Node } from "../core/node";
import { Constant, UIType } from "../math/constants";
import { Vector2 } from "../math/vector";
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
import { UINode } from "./ui-node";

export class HorizontalLayout extends UINode implements Serializable {

  constructor(
    node: Node,
    childs?: UINode[],
    style: HorizontalLayoutStyle = {},
    id?: string,
    hitColor?: Color
  ) {

    super(node, Vector2.Zero(), UIType.HorizontalLayout, false, { ...Constant.DefaultHorizontalLayoutStyle(), ...style }, null, null, null, id, hitColor);
    if (childs) this.children.push(...childs);
  }

  paint(): void { }
  paintLOD1() { }
  offPaint(): void {
    this.offUIContext.fillStyle = this.hitColor.hexValue;
    this.offUIContext.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
  reflow(): void {
    let availableWidth = this.width;
    let x = this.position.x;
    let maxHeight = 0;
    this.children.forEach(child => {
      maxHeight = Math.max(maxHeight, child.height);
    });
    this.height = maxHeight;

    this.children.forEach(child => {
      let childWidth = child.style.grow ? child.style.grow * this.width : (1 / this.children.length) * this.width;
      if (childWidth > availableWidth) childWidth = availableWidth;
      child.width = childWidth;

      if (child.height < this.height) child.height = this.height;
      child.position = new Vector2(x, this.position.y);

      availableWidth -= childWidth;
      x += childWidth;
    });
  }

  onPropChange() { }

  onOver(screenPosition: Vector2, realPosition: Vector2): void {
    this.call('over', this, screenPosition, realPosition);
  }
  onDown(screenPosition: Vector2, realPosition: Vector2): void {
    this.call('down', this, screenPosition, realPosition);
  }
  onUp(screenPosition: Vector2, realPosition: Vector2): void {
    this.call('up', this, screenPosition, realPosition);
  }
  onClick(screenPosition: Vector2, realPosition: Vector2): void {
    this.call('click', this, screenPosition, realPosition);
  }
  onDrag(screenPosition: Vector2, realPosition: Vector2): void {
    this.call('drag', this, screenPosition, realPosition);
  }
  onEnter(screenPosition: Vector2, realPosition: Vector2) {
    this.call('enter', this, screenPosition, realPosition);
  }
  onExit(screenPosition: Vector2, realPosition: Vector2) {
    this.call('exit', this, screenPosition, realPosition);
  }
  onContextMenu(): void { }

  serialize(): SerializedHorizontalLayout {
    return {
      id: this.id,
      type: this.type,
      hitColor: this.hitColor.serialize(),
      propName: this.propName,
      input: this.input ? this.input.serialize() : null,
      output: this.output ? this.output.serialize() : null,
      style: this.style,
      childs: this.children.map(child => (child as any).serialize())
    }
  }
  static deSerialize(node: Node, data: SerializedHorizontalLayout): HorizontalLayout {
    let hozLayout = new HorizontalLayout(node, [], data.style, data.id, Color.deSerialize(data.hitColor));
    hozLayout.children.push(...data.childs.map(serializedChild => {
      switch (serializedChild.type) {
        case UIType.Button: return Button.deSerialize(node, serializedChild);
        case UIType.Container: return Container.deSerialize(node, serializedChild);
        case UIType.Display: return Display.deSerialize(node, serializedChild);
        case UIType.HorizontalLayout: return HorizontalLayout.deSerialize(node, serializedChild);
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
    return hozLayout;
  }
}
