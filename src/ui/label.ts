import { Terminal } from "../core/terminal";
import { Node } from "../core/node";
import { Vector2 } from "../math/vector";
import { Align, Constant, TerminalType, UIType } from '../math/constants';
import { UINode } from "./ui-node";
import { LabelStyle, Serializable, SerializedLabel, SerializedTerminal } from "../core/interfaces";
import { Color } from "../core/color";
import { binarySearch } from "../utils/utils";

export class Label extends UINode implements Serializable {
  private displayText: string;
  private _text: string;
  private textWidth: number;
  private textHeight: number;

  get text(): string {
    if (this.propName) {
      if (typeof this.node.props[this.propName] !== 'string') return this.node.props[this.propName].toString();
      return this.node.props[this.propName];
    }
    return this._text;
  }
  set text(text: string) {
    if (this.propName) {
      this.node.props[this.propName] = text;
    } else {
      this._text = text;
      this.reflow();
    }
  }

  constructor(
    node: Node,
    text: string = '',
    propName?: string,
    input?: boolean | SerializedTerminal,
    output?: boolean | SerializedTerminal,
    style: LabelStyle = {},
    height?: number,
    id?: string,
    hitColor?: Color
  ) {

    super(node, Vector2.Zero(), UIType.Label, false, { ...Constant.DefaultLabelStyle(), ...style }, propName,
      input ?
        (typeof input === 'boolean' ?
          new Terminal(node, TerminalType.IN, 'string', '', {}) :
          Terminal.deSerialize(node, input)
        ) :
        null,
      output ?
        (typeof output === 'boolean' ?
          new Terminal(node, TerminalType.OUT, 'string', '', {}) :
          Terminal.deSerialize(node, output)
        ) :
        null,
      id, hitColor
    );

    this._text = this.propName ? this.node.props[this.propName] : text;
    this.reflow();

    if (!height) this.height = this.textHeight;
    else this.height = height;

    if (this.input) {
      this.input.on('connect', (_, connector) => {
        if (connector.data) this.text = connector.data;
      });
      this.input.on('data', (_, data) => {
        if (data) this.text = data;
      });
    }
    if (this.output) this.output.on('connect', (_, connector) => connector.data = this.text);

    this.node.on('process', () => {
      if (this.output) (this.output as any).setData(this.text);
    });
  }

  /** @hidden */
  paint(): void {
    let context = this.context;
    context.fillStyle = this.style.color;
    context.font = this.style.fontSize + ' ' + this.style.font;
    context.textBaseline = 'top';
    let y = this.position.y + this.height / 2 - this.textHeight / 2;
    let x = this.position.x;
    if (this.style.align === Align.Left) {
      x += 5;
    } else if (this.style.align === Align.Center) {
      x += this.width / 2 - this.textWidth / 2;
    } else if (this.style.align === Align.Right) {
      x += this.width - this.textWidth - 5;
    }
    context.fillText(this.displayText, x, y);
  }
  /** @hidden */
  paintLOD1() {
    let context = this.context;
    context.strokeStyle = '#000';
    context.fillStyle = this.style.color;
    context.strokeRect(this.position.x, this.position.y, this.width, this.height);
    context.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
  /** @hidden */
  offPaint(): void {
    this.offUIContext.fillStyle = this.hitColor.hexValue;
    this.offUIContext.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
  /** @hidden */
  reflow(): void {
    let context = this.context;
    context.font = this.style.fontSize + ' ' + this.style.font;
    this.displayText = this.getBestFitString();
    let metrics = context.measureText(this.displayText);
    context.font = null;
    this.textWidth = metrics.width;

    this.textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    if (typeof this.textHeight === 'undefined') {
      let d = document.createElement("span");
      d.style.font = this.style.fontSize + ' ' + this.style.font;
      d.textContent = "M";
      document.body.appendChild(d);
      this.textHeight = d.offsetHeight;
      document.body.removeChild(d);
    }

    if (this.input) {
      this.input.position.x = this.node.position.x - this.node.style.terminalStripMargin - this.input.style.radius;
      this.input.position.y = this.position.y + this.height / 2;
    }
    if (this.output) {
      this.output.position.x = this.node.position.x + this.node.width + this.node.style.terminalStripMargin + this.output.style.radius;
      this.output.position.y = this.position.y + this.height / 2;
    }
  }
  /** @hidden */
  getBestFitString(): string {
    let text = this.text;
    if (typeof (text as any) !== 'string') text = text.toString();

    let width = this.context.measureText(text).width;
    const ellipsis = '…';
    const ellipsisWidth = this.context.measureText(ellipsis).width;
    if (width <= this.width || width <= ellipsisWidth) return text;

    const index = binarySearch({
      max: text.length,
      getValue: (index: number) => this.context.measureText(text.substring(0, index)).width,
      match: this.width - ellipsisWidth,
    });

    return text.substring(0, index) + ellipsis;
  }

  /** @hidden */
  onPropChange(_: any, newValue: any) {
    this._text = newValue;
    this.reflow();

    this.output && (this.output as any)['setData'](this.text);
  }
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
  onContextMenu(): void {
    if (this.disabled) return;
  }

  serialize(): SerializedLabel {
    return {
      id: this.id,
      type: this.type,
      hitColor: this.hitColor.serialize(),
      style: this.style,
      propName: this.propName,
      input: this.input ? this.input.serialize() : null,
      output: this.output ? this.output.serialize() : null,
      height: this.height,
      text: this.text,
      childs: []
    }
  }
  static deSerialize(node: Node, data: SerializedLabel): Label {
    return new Label(node, data.text, data.propName, data.input, data.output, data.style, data.height, data.id, Color.deSerialize(data.hitColor));
  }
}
