import { Color } from "../core/color.js";
import { DataFetchProvider, DataPersistenceProvider, Serializable } from "../common/interfaces.js";
import { Node } from "../core/node.js";
import { Vector } from "../core/vector.js";
import { Button, Container, Dial, Display, Envelope, HorizontalLayout, Image, Input, Label, RadioGroup, Select, SerializedButton, SerializedContainer, SerializedDial, SerializedDisplay, SerializedEnvelope, SerializedHorizontalLayout, SerializedImage, SerializedInput, SerializedLabel, SerializedRadioGroup, SerializedSelect, SerializedSlider, SerializedSlider2D, SerializedSource, SerializedToggle, SerializedVSlider, Slider, Slider2D, Source, Toggle, VSlider } from "./index.js";
import { SerializedUINode, UINode, UINodeStyle, UIType } from "./ui-node.js";

export class Stack extends UINode implements Serializable<SerializedStack> {

  constructor(
    node: Node,
    options: StackOptions = DefaultStackOptions()
  ) {
    super(node, Vector.Zero(), UIType.Stack, {
      style: options.style ? { ...DefaultStackStyle(), ...options.style } : DefaultStackStyle(),
      id: options.id,
      hitColor: options.hitColor
    });

    if (options.childs) this.children.push(...options.childs);
  }

  paint(): void { /**/ }
  paintLOD1() { /**/ }
  offPaint(): void {
    this.offUIContext.fillStyle = this.hitColor.hexValue;
    this.offUIContext.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

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

  onPropChange() { /**/ }
  onOver(screenPosition: Vector, realPosition: Vector): void {
    if (this.disabled) return;

    this.call('over', this, screenPosition, realPosition);
  }
  onDown(screenPosition: Vector, realPosition: Vector): void {
    if (this.disabled) return;

    this.call('down', this, screenPosition, realPosition);
  }
  onUp(screenPosition: Vector, realPosition: Vector): void {
    if (this.disabled) return;

    this.call('up', this, screenPosition, realPosition);
  }
  onClick(screenPosition: Vector, realPosition: Vector): void {
    if (this.disabled) return;

    this.call('click', this, screenPosition, realPosition);
  }
  onDrag(screenPosition: Vector, realPosition: Vector): void {
    if (this.disabled) return;

    this.call('drag', this, screenPosition, realPosition);
  }
  onEnter(screenPosition: Vector, realPosition: Vector) {
    if (this.disabled) return;

    this.call('enter', this, screenPosition, realPosition);
  }
  onExit(screenPosition: Vector, realPosition: Vector) {
    if (this.disabled) return;

    this.call('exit', this, screenPosition, realPosition);
  }
  onWheel(direction: boolean, screenPosition: Vector, realPosition: Vector) {
    if (this.disabled) return;

    this.call('wheel', this, direction, screenPosition, realPosition);
  }
  onContextMenu(): void { /**/ }

  async serialize(persist?: DataPersistenceProvider): Promise<SerializedStack> {
    const childs = await Promise.all(this.children.map(child => (child as unknown as Serializable<SerializedUINode>).serialize(persist)));

    return Promise.resolve<SerializedStack>({
      style: this.style,
      id: this.id,
      hitColor: this.hitColor.serialize(),
      type: this.type,
      propName: null,
      input: null,
      output: null,
      childs
    });
  }
  static async deSerialize(node: Node, data: SerializedStack, receive?: DataFetchProvider): Promise<Stack> {
    let stack = new Stack(node, { style: data.style, id: data.id, hitColor: Color.deSerialize(data.hitColor), childs: [] });

    const deSerializingChilds = data.childs.map(serializedChild => {
      switch (serializedChild.type) {
        case UIType.Button: return Button.deSerialize(node, serializedChild as SerializedButton);
        case UIType.Container: return Container.deSerialize(node, serializedChild as SerializedContainer, receive);
        case UIType.Dial: return Dial.deSerialize(node, serializedChild as SerializedDial);
        case UIType.Display: return Display.deSerialize(node, serializedChild as SerializedDisplay);
        case UIType.Envelope: return Envelope.deSerialize(node, serializedChild as SerializedEnvelope);
        case UIType.HorizontalLayout: return HorizontalLayout.deSerialize(node, serializedChild as SerializedHorizontalLayout, receive);
        case UIType.Image: return Image.deSerialize(node, serializedChild as SerializedImage);
        case UIType.Input: return Input.deSerialize(node, serializedChild as SerializedInput);
        case UIType.Label: return Label.deSerialize(node, serializedChild as SerializedLabel);
        case UIType.RadioGroup: return RadioGroup.deSerialize(node, serializedChild as SerializedRadioGroup);
        case UIType.Select: return Select.deSerialize(node, serializedChild as SerializedSelect);
        case UIType.Slider2D: return Slider2D.deSerialize(node, serializedChild as SerializedSlider2D);
        case UIType.Slider: return Slider.deSerialize(node, serializedChild as SerializedSlider);
        case UIType.Source: return Source.deSerialize(node, serializedChild as SerializedSource, receive);
        case UIType.Stack: return Stack.deSerialize(node, serializedChild as SerializedStack, receive);
        case UIType.Toggle: return Toggle.deSerialize(node, serializedChild as SerializedToggle);
        case UIType.VSlider: return VSlider.deSerialize(node, serializedChild as SerializedVSlider);
        default: return;
      }
    })

    const children = await Promise.all(deSerializingChilds);
    stack.children.push(...children);

    return Promise.resolve<Stack>(stack);
  }
}

export interface StackStyle extends UINodeStyle {
  spacing?: number
}
let DefaultStackStyle = () => {
  return {
    spacing: 0,
    visible: true
  };
};

export interface SerializedStack extends SerializedUINode { }

interface StackOptions {
  childs?: UINode[],
  style?: StackStyle,
  id?: string,
  hitColor?: Color
}
let DefaultStackOptions = () => {
  return {}
};
