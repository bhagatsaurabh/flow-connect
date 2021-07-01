import { Color } from "../core/color";
import { DisplayStyle, Serializable, SerializedDisplay } from "../core/interfaces";
import { Node } from "../core/node";
import { Constant, UIType } from "../math/constants";
import { Vector2 } from "../math/vector";
import { UINode } from "./ui-node";

export class Display extends UINode implements Serializable {
  customRender: (context: CanvasRenderingContext2D, width: number, height: number) => void;

  constructor(
    node: Node,
    height: number,
    render: (context: CanvasRenderingContext2D, width: number, height: number) => void,
    style: DisplayStyle = {},
    id?: string,
    hitColor?: Color
  ) {

    super(node, Vector2.Zero(), UIType.Display, false, { ...Constant.DefaultDisplayStyle(), ...style }, null, null, null, id, hitColor);
    this.customRender = render;
    this.height = height;
  }

  paint(): void {
    this.context.strokeStyle = this.style.borderColor;
    this.context.lineWidth = 1;
    this.context.strokeRect(this.position.x, this.position.y, this.width, this.height);
    this.context.strokeStyle = null;
    this.context.translate(this.position.x, this.position.y);
    this.customRender(this.context, this.width, this.height);
    this.context.resetTransform();
  }
  paintLOD1() {
    this.context.strokeStyle = this.style.borderColor;
    this.context.strokeRect(this.position.x, this.position.y, this.width, this.height);
    this.context.fillStyle = 'lightgrey';
    this.context.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
  offPaint(): void {
    this.offUIContext.fillStyle = this.hitColor.hexValue;
    this.offUIContext.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
  reflow(): void { }

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
  onContextMenu(): void {
    this.call('rightclick', this);
  }

  serialize(): SerializedDisplay {
    return {
      id: this.id,
      type: this.type,
      hitColor: this.hitColor.serialize(),
      style: this.style,
      propName: this.propName,
      input: this.input ? this.input.serialize() : null,
      output: this.output ? this.output.serialize() : null,
      height: this.height,
      childs: []
    };
  }
  static deSerialize(node: Node, data: SerializedDisplay): Display {
    return new Display(node, data.height, null, data.style, data.id, Color.deSerialize(data.hitColor));
  }
}
