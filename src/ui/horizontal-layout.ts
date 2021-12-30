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
import { Stack } from "./stack";
import { Toggle } from "./toggle";
import { SerializedUINode, UINode, UINodeStyle, UIType } from "./ui-node";
import { clamp } from "../utils/utils";
import { SerializedTerminal, Terminal, TerminalType } from "../core/terminal";

export class HorizontalLayout extends UINode implements Serializable {

  constructor(
    node: Node,
    childs: UINode[] = [],
    options: HorizontalLayoutOptions = DefaultHorizontalLayoutOptions()
  ) {
    super(node, Vector2.Zero(), UIType.HorizontalLayout, {
      style: options.style ? { ...DefaultHorizontalLayoutStyle(), ...options.style } : DefaultHorizontalLayoutStyle(),
      input: options.input && (typeof options.input === 'boolean'
        ? new Terminal(node, TerminalType.IN, 'any', '', {})
        : Terminal.deSerialize(node, options.input)),
      output: options.output && (typeof options.output === 'boolean'
        ? new Terminal(node, TerminalType.OUT, 'any', '', {})
        : Terminal.deSerialize(node, options.output)),
      id: options.id,
      hitColor: options.hitColor
    });

    if (childs && childs.length > 0) this.children.push(...childs);
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

    let availableWidth = this.width - (children.length > 0 ? (children.length - 1) : 0) * this.style.spacing;
    let originalWidth = availableWidth;

    let maxHeight = 0;
    children.forEach(child => maxHeight = Math.max(maxHeight, child.height));
    this.height = maxHeight;

    let fixedWidthChilds = this.children.filter(child => !!child.width);
    fixedWidthChilds.forEach(child => child.width = clamp(child.width, 0, availableWidth));
    let fixedWidth = fixedWidthChilds.reduce((acc, curr) => acc + curr.width, 0);

    let remainingWidth = originalWidth;
    fixedWidth = clamp(fixedWidth, 0, remainingWidth);
    remainingWidth -= fixedWidth;
    let flexWidth = remainingWidth;

    let x = this.position.x;
    children.forEach(child => {
      let childWidth;
      if (!!child.width) childWidth = child.width;
      else if (typeof child.style.grow === 'number') {
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
        child.height = this.height
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

    // To fix a bug, when creating HozLayout with childs argument, UI container's height won't update
    this.node.ui.reflow();
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

  serialize(): SerializedHorizontalLayout {
    return {
      propName: this.propName,
      input: this.input ? this.input.serialize() : null,
      output: this.output ? this.output.serialize() : null,
      id: this.id,
      style: this.style,
      hitColor: this.hitColor.serialize(),
      type: this.type,
      childs: this.children.map(child => (child as any).serialize())
    }
  }
  static deSerialize(node: Node, data: SerializedHorizontalLayout): HorizontalLayout {
    let hozLayout = new HorizontalLayout(node, [], {
      style: data.style,
      input: data.input,
      output: data.output,
      id: data.id,
      hitColor: Color.deSerialize(data.hitColor)
    });

    hozLayout.children.push(...data.childs.map(serializedChild => {
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
    return hozLayout;
  }
}

export interface HorizontalLayoutStyle extends UINodeStyle {
  spacing?: number
}
/** @hidden */
let DefaultHorizontalLayoutStyle = () => {
  return {
    spacing: 0,
    visible: true
  };
};

export interface SerializedHorizontalLayout extends SerializedUINode { }

interface HorizontalLayoutOptions {
  style?: HorizontalLayoutStyle,
  input?: boolean | SerializedTerminal,
  output?: boolean | SerializedTerminal,
  id?: string,
  hitColor?: Color
}
/** @hidden */
let DefaultHorizontalLayoutOptions = (): HorizontalLayoutOptions => {
  return {};
};
