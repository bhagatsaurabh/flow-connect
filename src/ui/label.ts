import { Terminal, TerminalType, SerializedTerminal } from "../core/terminal";
import { Node } from "../core/node";
import { Vector2 } from "../core/vector";
import { SerializedUINode, UINode, UINodeStyle, UIType } from "./ui-node";
import { Serializable } from "../common/interfaces";
import { Color } from "../core/color";
import { binarySearch, exists, get } from "../utils/utils";
import { FlowState } from "../core/flow";
import { Align } from "../common/enums";

export class Label extends UINode implements Serializable {
  private displayText: string;
  private _text: string | number;
  private textWidth: number;    // This may be smaller due to surrounding width constraints (this is som...)
  private orgTextWidth: number; // While this is the actual width                           (this is some text)
  private textHeight: number;

  get text(): string {
    let value;
    if (this.propName) value = this.getProp();
    else value = this._text;

    if (typeof value === 'number') value = this.format(value);
    return value;
  }
  set text(text: string | number) {
    let oldVal = this._text;
    let newVal = text;

    if (this.propName) {
      this.setProp(newVal);
    } else {
      this._text = newVal;
      this.reflow();
    }

    if (this.node.flow.state !== FlowState.Stopped) this.call('change', this, oldVal, newVal);
  }

  constructor(
    node: Node,
    text: string | number,
    options: LabelOptions = DefaultLabelOptions(node)
  ) {
    super(node, Vector2.Zero(), UIType.Label, {
      style: options.style ? { ...DefaultLabelStyle(), ...options.style } : DefaultLabelStyle(),
      propName: options.propName,
      input: options.input && (typeof options.input === 'boolean'
        ? new Terminal(node, TerminalType.IN, 'any', '', {})
        : Terminal.deSerialize(node, options.input)),
      output: options.output && (typeof options.output === 'boolean'
        ? new Terminal(node, TerminalType.OUT, 'string', '', {})
        : Terminal.deSerialize(node, options.output)),
      id: options.id,
      hitColor: options.hitColor
    });

    this._text = this.propName ? this.getProp() : text;
    this.reflow();

    this.height = get(options.height, this.textHeight + 5);
    if (!this.style.grow) this.width = this.orgTextWidth;

    if (this.input) {
      this.input.on('connect', (_, connector) => {
        if (exists(connector.data)) this.text = connector.data;
      });
      this.input.on('data', (_, data) => {
        if (exists(data)) this.text = data;
      });
    }
    if (this.output) this.output.on('connect', (_, connector) => connector.data = this.text);

    this.node.on('process', () => {
      if (this.output) this.output.setData(this.text);
    });
  }

  paint(): void {
    let context = this.context;

    context.fillStyle = this.style.backgroundColor;
    context.fillRect(this.position.x, this.position.y, this.width, this.height);

    context.fillStyle = this.style.color;
    context.font = this.style.fontSize + ' ' + this.style.font;
    context.textBaseline = 'middle';
    let y = this.position.y + this.height / 2;
    let x = this.position.x;
    if (this.style.align === Align.Center) {
      x += this.width / 2 - this.textWidth / 2;
    } else if (this.style.align === Align.Right) {
      x += this.width - this.textWidth - this.style.padding;
    } else {
      x += this.style.padding
    }

    context.fillText(this.displayText, x, y);
  }
  paintLOD1() {
    let context = this.context;
    context.strokeStyle = '#000';
    context.fillStyle = this.style.color;
    context.strokeRect(this.position.x, this.position.y, this.width, this.height);
    context.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
  offPaint(): void {
    this.offUIContext.fillStyle = this.hitColor.hexValue;
    this.offUIContext.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  reflow(): void {
    let context = this.context;
    context.font = this.style.fontSize + ' ' + this.style.font;
    this.orgTextWidth = context.measureText(this.text).width;
    this.displayText = this.getBestFitString();
    let metrics = context.measureText(this.displayText);
    context.font = null;
    this.textWidth = metrics.width;

    this.textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent + 5;

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
  }
  getBestFitString(): string {
    let text = this.text;
    if (typeof (text as any) !== 'string') text = text.toString();

    let width = this.context.measureText(text).width;
    const ellipsis = '…';
    const ellipsisWidth = this.context.measureText(ellipsis).width;
    if (width <= this.width || width <= ellipsisWidth) return text;

    const index = binarySearch({
      max: text.length,
      getValue: (idx: number) => this.context.measureText(text.substring(0, idx)).width,
      match: this.width - ellipsisWidth,
    });

    return text.substring(0, index) + ellipsis;
  }
  format(value: number): string {
    return exists(this.style.precision) ? value.toFixed(this.style.precision) : value.toString();
  }

  onPropChange(_oldVal: any, newVal: any) {
    this._text = newVal;
    this.reflow();

    this.output && this.output.setData(this._text);
  }
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
  onContextMenu(): void {
    if (this.disabled) return;
  }

  serialize(): SerializedLabel {
    return {
      text: this.text,
      propName: this.propName,
      input: this.input ? this.input.serialize() : null,
      output: this.output ? this.output.serialize() : null,
      height: this.height,
      style: this.style,
      id: this.id,
      hitColor: this.hitColor.serialize(),
      type: this.type,
      childs: []
    }
  }
  static deSerialize(node: Node, data: SerializedLabel): Label {
    return new Label(node, data.text, {
      propName: data.propName,
      input: data.input,
      output: data.output,
      height: data.height,
      style: data.style,
      id: data.id,
      hitColor: Color.deSerialize(data.hitColor)
    });
  }
}

export interface LabelStyle extends UINodeStyle {
  color?: string,
  backgroundColor?: string,
  fontSize?: string,
  font?: string,
  align?: Align,
  precision?: number,
  padding?: number
}
let DefaultLabelStyle = () => {
  return {
    color: '#000',
    backgroundColor: 'transparent',
    fontSize: '11px',
    font: 'arial',
    align: Align.Left,
    padding: 0,
    visible: true
  };
};

export interface SerializedLabel extends SerializedUINode {
  text: string,
  height: number
}

interface LabelOptions {
  propName?: string,
  input?: boolean | SerializedTerminal,
  output?: boolean | SerializedTerminal,
  height?: number,
  style?: LabelStyle,
  id?: string,
  hitColor?: Color
}
let DefaultLabelOptions = (node: Node): LabelOptions => {
  return {
    height: node.style.rowHeight * 1.5
  }
};
