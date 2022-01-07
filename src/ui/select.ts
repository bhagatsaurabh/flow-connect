import { Terminal, TerminalType, SerializedTerminal } from "../core/terminal";
import { Node } from "../core/node";
import { Vector2 } from "../core/vector";
import { Label } from "./label";
import { SerializedUINode, UINode, UINodeStyle, UIType } from "./ui-node";
import { Constant } from "../resource/constants";
import { Serializable } from "../common/interfaces";
import { Color } from "../core/color";
import { FlowState } from "../core/flow";
import { Align } from "../common/enums";
import { exists, get } from "../utils/utils";

export class Select extends UINode implements Serializable {
  label: Label;
  private _selected: string;

  get selected(): string {
    if (this.propName) {
      let value = this.getProp();
      let slctdVal = this.values.includes(value) ? value : this.values[0];
      value = this.values.length === 0 ? 'None' : slctdVal;
      return value;
    }
    return this._selected;
  }
  set selected(selected: string) {
    let slctdVal = this.values.includes(selected) ? selected : this.values[0];

    let oldVal = this.selected;
    let newVal = this.values.length === 0 ? 'None' : slctdVal;

    if (this.propName) this.setProp(newVal);
    else {
      this._selected = newVal;
      this.label.text = newVal;
    }
    if (this.node.flow.state !== FlowState.Stopped) this.call('change', this, oldVal, newVal);
  }

  constructor(
    node: Node,
    public values: string[] = [],
    options: SelectOptions = DefaultSelectOptions(node)
  ) {
    super(node, Vector2.Zero(), UIType.Select, {
      style: options.style ? { ...DefaultSelectStyle(), ...options.style } : DefaultSelectStyle(),
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

    this.height = get(options.height, this.node.style.rowHeight);
    this._selected = this.values.length === 0 ? 'None' : this.values[0];

    this.label = new Label(this.node, this.selected, { style: { align: Align.Center, ...this.style }, height: this.height });
    this.children.push(this.label);

    if (this.input) {
      this.input.on('connect', (_, connector) => {
        if (typeof connector.data === 'number') this.selected = this.values[connector.data];
        else if (typeof connector.data === 'string') this.selected = connector.data;
      });
      this.input.on('data', (_, data) => {
        if (typeof data === 'number') this.selected = this.values[data];
        else if (typeof data === 'string') this.selected = data;
      });
    }
    if (this.output) this.output.on('connect', (_, connector) => connector.data = this.selected);

    this.node.on('process', () => {
      if (this.output) this.output.setData(this.selected);
    });
  }

  paint(): void {
    let context = this.context;
    context.fillStyle = this.style.arrowColor;
    context.beginPath();
    context.moveTo(this.position.x, this.position.y + this.height / 2);
    context.lineTo(this.position.x + this.height * Constant.SIN_60, this.position.y);
    context.lineTo(this.position.x + this.height * Constant.SIN_60, this.position.y + this.height);
    context.lineTo(this.position.x, this.position.y + this.height / 2);
    context.closePath();
    context.fill();

    context.fillStyle = this.style.arrowColor;
    context.beginPath();
    context.moveTo(this.position.x + this.width, this.position.y + this.height / 2);
    context.lineTo(this.position.x + this.width - (this.height * Constant.SIN_60), this.position.y);
    context.lineTo(this.position.x + this.width - (this.height * Constant.SIN_60), this.position.y + this.height);
    context.lineTo(this.position.x + this.width, this.position.y + this.height / 2);
    context.closePath();
    context.fill();
  }
  paintLOD1() {
    let context = this.context;
    context.fillStyle = this.style.arrowColor;
    context.strokeStyle = '#000';
    context.fillRect(this.position.x, this.position.y, this.width, this.height);
    context.strokeRect(this.position.x, this.position.y, this.width, this.height);
  }
  offPaint(): void {
    this.offUIContext.fillStyle = this.hitColor.hexValue;
    this.offUIContext.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  reflow(): void {
    this.label.width = this.width * .7;
    this.label.position.assign(
      this.position.x + this.width * .15,
      this.position.y + this.height / 2 - this.label.height / 2
    );

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

  onPropChange(_oldVal: any, newValue: any) {
    let slctdVal = this.values.includes(newValue) ? newValue : this.values[0];
    let value = this.values.length === 0 ? 'None' : slctdVal;
    this._selected = value;
    this.label.text = this._selected;

    this.output && this.output.setData(this.selected);
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

    if (this.values.length === 0) return;
    let direction;
    if (realPosition.x < this.position.x + this.width * .15) {
      direction = -1;
    } else if (realPosition.x > this.position.x + this.width * .85) {
      direction = 1;
    } else return;

    let length = this.values.length;
    this.selected = this.values[(((this.values.indexOf(this.selected) + direction) % length) + length) % length];
    this.label.text = this.selected;

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

  serialize(): SerializedSelect {
    return {
      values: this.values,
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
  static deSerialize(node: Node, data: SerializedSelect): Select {
    return new Select(node, data.values, {
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

export interface SelectStyle extends UINodeStyle {
  font?: string,
  fontSize?: string,
  color?: string,
  arrowColor?: string
}
let DefaultSelectStyle = () => {
  return {
    arrowColor: '#000',
    visible: true
  };
};

export interface SerializedSelect extends SerializedUINode {
  values: string[],
  height: number
}

interface SelectOptions {
  propName?: string,
  input?: boolean | SerializedTerminal,
  output?: boolean | SerializedTerminal,
  height?: number,
  style?: SelectStyle,
  id?: string,
  hitColor?: Color
}
let DefaultSelectOptions = (node: Node): SelectOptions => {
  return {
    height: node.style.rowHeight * 1.5
  }
}
