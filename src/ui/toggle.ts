import { Terminal, TerminalType, SerializedTerminal } from "../core/terminal";
import { Node } from "../core/node";
import { Vector2 } from "../core/vector";
import { SerializedUINode, UINode, UINodeStyle, UIType } from "./ui-node";
import { Serializable } from "../common/interfaces";
import { Color } from "../core/color";
import { FlowState } from "../core/flow";
import { get } from "../utils/utils";

export class Toggle extends UINode implements Serializable {
  private _checked: boolean = false;

  get checked(): boolean {
    if (this.propName) return this.getProp();
    return this._checked;
  }
  set checked(checked: boolean) {
    let oldVal = this.checked;
    let newVal = checked;

    if (this.propName)
      this.setProp(newVal);
    else
      this._checked = newVal;

    if (this.node.flow.state !== FlowState.Stopped) this.call('change', this, oldVal, newVal);
  }

  constructor(
    node: Node,
    options: ToggleOptions = DefaultToggleOptions(node)
  ) {
    super(node, Vector2.Zero(), UIType.Toggle, {
      style: options.style
        ? { ...DefaultToggleStyle(), ...options.style }
        : DefaultToggleStyle(),
      propName: options.propName,
      input: options.input && (typeof options.input === 'boolean'
        ? new Terminal(node, TerminalType.IN, 'boolean', '', {})
        : Terminal.deSerialize(node, options.input)),
      output: options.output && (typeof options.output === 'boolean'
        ? new Terminal(node, TerminalType.OUT, 'boolean', '', {})
        : Terminal.deSerialize(node, options.output)),
      id: options.id,
      hitColor: options.hitColor
    });

    this._checked = this.propName ? this.getProp() : options.value
    this.height = get(options.height, this.node.style.rowHeight);
    if (!this.style.grow) this.width = this.height * 2.5;

    if (this.input) {
      this.input.on('connect', (_, connector) => {
        if (connector.data) this.checked = connector.data;
      });
      this.input.on('data', (_, data) => {
        if (typeof data !== 'undefined') this.checked = data;
      });
    }
    if (this.output) this.output.on('connect', (_, connector) => connector.data = this.checked);

    this.node.on('process', () => {
      if (this.output) this.output.setData(this.checked);
    });
  }

  /** @hidden */
  paint(): void {
    let context = this.context;
    context.strokeStyle = this.style.backgroundColor;
    context.lineWidth = this.height * .75;
    context.lineCap = 'round';
    context.beginPath();
    context.moveTo(this.position.x + this.context.lineWidth / 2, this.position.y + this.height / 2);
    context.lineTo(this.position.x + this.width - this.context.lineWidth / 2, this.position.y + this.height / 2);
    context.stroke();

    context.fillStyle = this.style.color;
    context.beginPath();
    context.arc(
      this.checked ? this.position.x + this.width - this.height / 2 : this.position.x + this.height / 2,
      this.position.y + this.height / 2, this.height / 2, 0, 2 * Math.PI
    );
    context.fill();
  }
  /** @hidden */
  paintLOD1() {
    let context = this.context;
    context.strokeStyle = this.style.color;
    context.fillStyle = this.style.backgroundColor;
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

  /** @hidden */
  onPropChange(_oldVal: any, newVal: any) {
    this._checked = newVal;

    this.output && this.output.setData(this.checked);
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

    this.checked = !this.checked;

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
  onContextMenu(): void {
    if (this.disabled) return;
  }

  serialize(): SerializedToggle {
    return {
      checked: this.checked,
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
  static deSerialize(node: Node, data: SerializedToggle): Toggle {
    return new Toggle(node, {
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

export interface ToggleOptions {
  value?: boolean,
  propName?: string,
  input?: boolean | SerializedTerminal,
  output?: boolean | SerializedTerminal,
  height?: number,
  style?: ToggleStyle,
  id?: string,
  hitColor?: Color
}
/** @hidden */
let DefaultToggleOptions = (node: Node): ToggleOptions => {
  return {
    value: false,
    height: node.style.rowHeight * 1.5,
  }
};

export interface ToggleStyle extends UINodeStyle {
  backgroundColor?: string,
  color?: string
}
/** @hidden */
let DefaultToggleStyle = () => {
  return {
    backgroundColor: '#999',
    color: '#000',
    visible: true
  };
};

export interface SerializedToggle extends SerializedUINode {
  checked: boolean,
  height: number
}
