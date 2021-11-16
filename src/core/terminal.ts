import { Vector2 } from "../math/vector";
import { Constant, TerminalType } from '../math/constants';
import { getNewGUID, canConnect } from "../utils/utils";
import { Color } from "./color";
import { Connector } from './connector';
import { Hooks } from './hooks';
import { Node } from './node';
import { Events, Serializable, SerializedTerminal, TerminalStyle } from "./interfaces";
import { ConnectorStyle } from "./interfaces";

export class Terminal extends Hooks implements Events, Serializable {
  connectors: Connector[];
  focus: boolean;

  /** @hidden */
  position: Vector2;
  /** @hidden */
  hitColor: Color;

  constructor(
    public node: Node,
    public type: TerminalType,
    public dataType: string,
    public name: string,
    public style: TerminalStyle = {},
    public id?: string,
    hitColor?: Color) {

    super();
    this.hitColor = hitColor;
    this.style = { ...Constant.DefaultTerminalStyle(), ...style };
    this.id = id ? id : getNewGUID();
    this.setHitColor(hitColor);
    this.connectors = [];
    this.position = Vector2.Zero();
    this.focus = false;

    if (this.type === TerminalType.IN) (this as any)['getData'] = () => {
      if (this.connectors.length > 0) return this.connectors[0].data;
      return null;
    };
    else (this as any)['setData'] = (data: any) => {
      this.connectors.forEach(connector => connector.data = data);
    };
  }

  private setHitColor(hitColor: Color) {
    if (!hitColor) {
      hitColor = Color.Random();
      while (this.node.hitColorToTerminal[hitColor.rgbaString] || this.node.hitColorToUI[hitColor.rgbaString]) hitColor = Color.Random();
    }
    this.hitColor = hitColor;
    this.node.hitColorToTerminal[this.hitColor.rgbaString] = this;
  }
  render() {
    let context = this.node.context;
    context.save();

    if (this.focus) {
      context.beginPath();
      context.arc(this.position.x, this.position.y, this.style.radius * 3, 0, 2 * Math.PI);
      context.fillStyle = this.style.focusColor;
      context.fill();
    }

    if (this.dataType === 'event') {
      context.beginPath();
      context.moveTo(this.position.x, this.position.y - this.style.radius * 1.3);
      context.lineTo(this.position.x + this.style.radius * 1.3, this.position.y);
      context.lineTo(this.position.x, this.position.y + this.style.radius * 1.3);
      context.lineTo(this.position.x - this.style.radius * 1.3, this.position.y);
      context.lineTo(this.position.x, this.position.y - this.style.radius * 1.3);
      context.closePath();
    } else {
      context.beginPath();
      context.arc(this.position.x, this.position.y, this.style.radius, 0, 2 * Math.PI);
    }
    context.fillStyle = this.focus ? '#00ff00' : (this.node.flow.terminalTypeColors[this.dataType] || '#888');
    context.strokeStyle = this.style.borderColor;
    context.shadowBlur = this.style.shadowBlur;
    context.shadowColor = this.style.shadowColor;
    context.fill();
    context.stroke();

    context.restore();

    this.offUIRender();
  }
  connect(otherTerminal: Terminal, style?: ConnectorStyle): boolean {
    // Check if already connected
    if (this.type !== otherTerminal.type) {
      let start = this.type === TerminalType.OUT ? this : otherTerminal;
      let end = this.type === TerminalType.IN ? this : otherTerminal;
      if (end.connectors.length > 0 && start.connectors.includes(end.connectors[0])) return false;
    }

    // Check if these terminals can be connected
    if (canConnect(this, otherTerminal, this.node.flow.rules, this.node.flow.executionGraph)) {
      let newConnector = new Connector(this.node.flow, this.type === TerminalType.OUT ? this : otherTerminal, this.type === TerminalType.IN ? this : otherTerminal, null, style);
      this.node.flow.connectors[newConnector.id] = newConnector;
      return true;
    } else return false;
  }
  private offUIRender() {
    let context = this.node.offUIContext;
    context.save();

    context.beginPath();
    context.arc(this.position.x, this.position.y, this.style.radius + this.node.style.terminalStripMargin, 0, 2 * Math.PI);
    context.fillStyle = this.hitColor.rgbaCSSString;
    context.fill();

    context.restore();
  }

  /** @hidden */
  onEnter(screenPosition: Vector2, realPosition: Vector2): void {
    this.call('enter', this, screenPosition, realPosition);

    this.focus = true;
    this.node.flow.flowConnect.cursor = 'pointer';
  }
  /** @hidden */
  onExit(screenPosition: Vector2, realPosition: Vector2): void {
    this.call('exit', this, screenPosition, realPosition);

    this.focus = false;
    this.node.flow.flowConnect.cursor = 'unset';
  }
  /** @hidden */
  onDown(screenPosition: Vector2, realPosition: Vector2): void {
    this.call('down', this, screenPosition, realPosition);

    if (this.connectors.length > 0) {
      if (this.type === TerminalType.IN) {
        this.connectors[0].endNode.currHitTerminal = null;
        this.connectors[0].end = null;
        this.connectors[0].floatingTip = realPosition;
        this.node.flow.flowConnect.floatingConnector = this.connectors[0];
        this.connectors[0].start.call('disconnect', this.connectors[0].start, this.connectors[0]);
        this.call('disconnect', this, this.connectors[0]);
        this.connectors.pop();
      } else {
        if (this.node.flow.flowConnect.floatingConnector) return;
        let connector = new Connector(this.node.flow, this, null, realPosition, {});
        this.node.flow.connectors[connector.id] = connector;
        this.node.flow.flowConnect.floatingConnector = connector;
      }
    } else {
      if (this.node.flow.flowConnect.floatingConnector) return;
      let connector = new Connector(this.node.flow, this.type === TerminalType.IN ? null : this, this.type === TerminalType.IN ? this : null, realPosition, {});
      this.node.flow.connectors[connector.id] = connector;
      this.node.flow.flowConnect.floatingConnector = connector;
    }
  }
  /** @hidden */
  onUp(screenPosition: Vector2, realPosition: Vector2): void {
    this.call('up', this, screenPosition, realPosition);
  }
  /** @hidden */
  onDrag(screenPosition: Vector2, realPosition: Vector2): void {
    this.call('drag', this, screenPosition, realPosition);
  }
  /** @hidden */
  onClick(screenPosition: Vector2, realPosition: Vector2): void {
    this.call('click', this, screenPosition, realPosition);
  }
  /** @hidden */
  onOver(screenPosition: Vector2, realPosition: Vector2): void {
    this.call('over', this, screenPosition, realPosition);
  }
  /** @hidden */
  onContextMenu(): void {
    this.call('rightclick', this);
  }

  /** @hidden */
  onEvent(data: any): void {
    if (this.type === TerminalType.IN) {
      this.call('event', this, data);
    }
  }
  emit(data: any) {
    if (this.type === TerminalType.OUT && this.connectors.length !== 0) {
      this.connectors.forEach(connector => {
        connector.end && connector.end.onEvent(data);
      });
    }
  }

  serialize(): SerializedTerminal {
    return {
      id: this.id,
      type: this.type,
      dataType: this.dataType,
      name: this.name,
      style: this.style,
      hitColor: this.hitColor.serialize()
    };
  }
  static deSerialize(node: Node, data: SerializedTerminal): Terminal {
    return new Terminal(node, data.type, data.dataType, data.name, data.style, data.id, Color.deSerialize(data.hitColor));
  }
}
