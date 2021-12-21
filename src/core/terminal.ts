import { Vector2 } from "./vector";
import { getNewGUID, canConnect } from "../utils/utils";
import { Color, SerializedColor } from "./color";
import { Connector, ConnectorStyle } from './connector';
import { Hooks } from './hooks';
import { Node } from './node';
import { Events, Serializable } from "../common/interfaces";
import { Log } from "../utils/logger";

export class Terminal extends Hooks implements Events, Serializable {
  connectors: Connector[];
  focus: boolean;

  /**
   * Terminals can hold any user-defined reference, using this variable to store a reference to something (and thereby binding it to this terminal) is helpful in special applications
   * for e.g audio connections - terminal can hold a reference to WebAudio Node which can be used to connect said AudioNodes when two terminals are connected,
   * almost all StandardNodes.Audio nodes uses this variable.
   * This can be ignored for other applications where such pattern is not useful or doesn't make sense.
  **/
  ref: any;

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
    this.style = { ...DefaultTerminalStyle(), ...style };
    this.id = id ? id : getNewGUID();
    this.setHitColor(hitColor);
    this.connectors = [];
    this.position = Vector2.Zero();
    this.focus = false;
  }

  getData(): any {
    if (this.type === TerminalType.OUT) { Log.error("Cannot call 'getData' on output terminal"); return; }
    if (this.connectors.length > 0) return this.connectors[0].data;
    return null;
  }
  setData(data: any) {
    if (this.type === TerminalType.IN) { Log.error("Cannot call 'setData' on input terminal"); return; }
    this.connectors.forEach(connector => connector.data = data);
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
      let start: Terminal, end: Terminal;
      if (this.type === TerminalType.OUT) { start = this; end = otherTerminal; }
      else { start = otherTerminal; end = this; }

      let newConnector = new Connector(this.node.flow, this.type === TerminalType.OUT ? this : otherTerminal, this.type === TerminalType.IN ? this : otherTerminal, null, style);
      this.node.flow.connectors[newConnector.id] = newConnector;

      /* start.onConnect(newConnector);
      end.onConnect(newConnector); */

      return true;
    } else return false;
  }
  /**
   * Disconnects terminal to terminal connections.
   * If no parameters are passed and the terminal on which this method is called is an output terminal then,
   * all the connections going out from this terminal will be diconnected.
   * 
   * @param connector optional connector Id or reference, used only when the terminal on which this method is called is an Output terminal
   * @returns 
   */
  disconnect(connector?: string | Connector): boolean {
    if (this.type === TerminalType.IN) {
      this._disconnect(this.connectors[0]);
      return true;
    } else {
      if (typeof connector === 'string') {
        let cntr = this.connectors.find((currCntr => currCntr.id === connector));
        if (!cntr) {
          Log.error('Connector not found while disconnecting', connector);
          return false;
        }
        this._disconnect(cntr);
      } else if (connector instanceof Connector) {
        if (!this.connectors.find(cntr => cntr.id === connector.id)) {
          Log.error('Connector cannot be disconnected from the terminal because its not associated with it', connector);
          return false;
        }
        this._disconnect(connector);
      } else {
        this.connectors.forEach(cntr => this._disconnect(cntr));
      }
      return true;
    }
  }
  private _disconnect(connector: Connector): void {
    let [startTerm, endTerm] = [connector.start, connector.end];
    delete this.node.flow.connectors[connector.id];
    connector.start.connectors.splice(connector.start.connectors.findIndex(cntr => cntr.id === connector.id), 1);
    connector.end.connectors.pop();
    connector.start.onDisconnect(connector, startTerm, endTerm);
    connector.end.onDisconnect(connector, startTerm, endTerm);
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
        let [startTerm, endTerm] = [this.connectors[0].start, this.connectors[0].end];
        this.connectors[0].endNode.currHitTerminal = null;
        this.connectors[0].end = null;
        this.connectors[0].floatingTip = realPosition;
        this.node.flow.flowConnect.floatingConnector = this.connectors[0];
        this.connectors[0].start.onDisconnect(this.connectors[0], startTerm, endTerm);
        this.onDisconnect(this.connectors[0], startTerm, endTerm);
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
  onConnect(connector: Connector) {
    this.call('connect', this, connector);
  }
  /** @hidden */
  onDisconnect(connector: Connector, startTerminal?: Terminal, endTerminal?: Terminal) {
    this.call('disconnect', this, connector, startTerminal, endTerminal);
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

export enum TerminalType {
  IN = 1,
  OUT = 2
}

export interface TerminalTypeColors {
  [terminalType: string]: string;
}

export interface TerminalStyle {
  borderColor?: string,
  shadowColor?: string,
  shadowBlur?: number,
  focusColor?: string,
  radius?: number
}

export interface SerializedTerminal {
  id: string;
  hitColor: SerializedColor;
  type: TerminalType;
  dataType: string;
  name: string;
  style: TerminalStyle
}

/** @hidden */
let DefaultTerminalStyle = () => {
  return {
    radius: 4,
    borderColor: '#222',
    shadowBlur: 0,
    shadowColor: '#ccc',
    focusColor: '#bbbbbb80'
  };
};
