import { Vector2 } from "../math/vector";
import { Constant, TerminalType } from '../math/constants';
import { getNewGUID } from "../utils/utils";
import { Color } from "./color";
import { Connector } from './connector';
import { Hooks } from './hooks';
import { Node } from './node';
import { Events, Serializable, SerializedTerminal, TerminalStyle } from "./interfaces";

export class Terminal extends Hooks implements Events, Serializable {
  connectors: Connector[];
  position: Vector2;
  focus: boolean;

  constructor(
    public node: Node,
    public type: TerminalType,
    public dataType: string,
    public name: string,
    public style: TerminalStyle = {},
    public eventCallback?: (...args: any) => void,
    public id?: string,
    public hitColor?: Color) {

    super();
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

  setHitColor(hitColor: Color) {
    if (!hitColor) {
      hitColor = Color.Random();
      while (this.node.hitColorToTerminal[hitColor.rgbaString] || this.node.hitColorToUI[hitColor.rgbaString]) hitColor = Color.Random();
    }
    this.hitColor = hitColor;
    this.node.hitColorToTerminal[this.hitColor.rgbaString] = this;
  }
  render() {
    this.node.context.save();

    if (this.focus) {
      this.node.context.beginPath();
      this.node.context.arc(this.position.x, this.position.y, this.style.radius * 3, 0, 2 * Math.PI);
      this.node.context.fillStyle = this.style.focusColor;
      this.node.context.fill();
    }

    if (this.dataType === 'event') {
      this.node.context.beginPath();
      this.node.context.moveTo(this.position.x, this.position.y - this.style.radius * 1.3);
      this.node.context.lineTo(this.position.x + this.style.radius * 1.3, this.position.y);
      this.node.context.lineTo(this.position.x, this.position.y + this.style.radius * 1.3);
      this.node.context.lineTo(this.position.x - this.style.radius * 1.3, this.position.y);
      this.node.context.lineTo(this.position.x, this.position.y - this.style.radius * 1.3);
      this.node.context.closePath();
    } else {
      this.node.context.beginPath();
      this.node.context.arc(this.position.x, this.position.y, this.style.radius, 0, 2 * Math.PI);
    }
    this.node.context.fillStyle = this.focus ? '#00ff00' : (this.node.flow.terminalTypeColors[this.dataType] || '#888');
    this.node.context.strokeStyle = this.style.borderColor;
    this.node.context.shadowBlur = this.style.shadowBlur;
    this.node.context.shadowColor = this.style.shadowColor;
    this.node.context.fill();
    this.node.context.stroke();

    this.node.context.restore();

    this.offUIRender();
  }
  offUIRender() {
    this.node.offUIContext.save();

    this.node.offUIContext.beginPath();
    this.node.offUIContext.arc(this.position.x, this.position.y, this.style.radius + this.node.style.terminalStripMargin, 0, 2 * Math.PI);
    this.node.offUIContext.fillStyle = this.hitColor.rgbaCSSString;
    this.node.offUIContext.fill();

    this.node.offUIContext.restore();
  }

  onEnter(screenPosition: Vector2, realPosition: Vector2): void {
    this.call('enter', this, screenPosition, realPosition);

    this.focus = true;
    this.node.flow.flowConnect.cursor = 'pointer';
  }
  onExit(screenPosition: Vector2, realPosition: Vector2): void {
    this.call('exit', this, screenPosition, realPosition);

    this.focus = false;
    this.node.flow.flowConnect.cursor = 'unset';
  }
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
  onUp(screenPosition: Vector2, realPosition: Vector2): void {
    this.call('up', this, screenPosition, realPosition);
  }
  onDrag(screenPosition: Vector2, realPosition: Vector2): void {
    this.call('drag', this, screenPosition, realPosition);
  }
  onClick(screenPosition: Vector2, realPosition: Vector2): void {
    this.call('click', this, screenPosition, realPosition);
  }
  onOver(screenPosition: Vector2, realPosition: Vector2): void {
    this.call('over', this, screenPosition, realPosition);
  }
  onContextMenu(): void {
    this.call('rightclick', this);
  }

  onEvent(data: any): void {
    if (this.type === TerminalType.IN && this.eventCallback) this.eventCallback(data);
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
    return new Terminal(node, data.type, data.dataType, data.name, data.style, null, data.id, Color.deSerialize(data.hitColor));
  }
}
