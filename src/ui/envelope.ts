import { SerializedVector2, Vector2 } from "../core/vector";
import { SerializedUINode, UINode, UINodeStyle, UIType } from "./ui-node";
import { Node } from '../core/node';
import { Terminal, TerminalType, SerializedTerminal } from "../core/terminal";
import { Serializable } from "../common/interfaces";
import { Color } from "../core/color";
import { FlowState } from "../core/flow";
import { Constant } from "../resource/constants";
import { LinkedList, LinkedListNode } from "../utils/linked-list";
import { BiMap } from "../utils";
import { normalize } from "../utils/utils";

export class Envelope extends UINode implements Serializable {
  private _value: LinkedList<Vector2>;
  private pointHitColorPoint: BiMap<string, LinkedListNode<Vector2>> = new BiMap();
  offPointsCanvas: OffscreenCanvas | HTMLCanvasElement;
  private offPointsContext: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;
  private currHitPoint: LinkedListNode<Vector2>;

  get value(): Vector2[] {
    if (this.propName) return this.getProp();
    return this._value.toArray();
  }
  set value(value: Vector2[]) {
    value.forEach(vector => vector.clamp(0, 1, 0, 1));
    value.sort((a, b) => a.x - b.x);

    this._value = new LinkedList((a, b) => a.x - b.x, value);
    this.pointHitColorPoint.clear();
    this._value.forEach(node => this.pointHitColorPoint.set(Color.Random().hexValue, node));

    let prevVal = this.value;
    let newVal = this._value.toArray();

    if (this.propName) this.setProp(newVal);

    this.renderOffPoints();

    if (this.node.flow.state !== FlowState.Stopped) this.call('change', this, newVal, prevVal);
  }

  constructor(
    node: Node,
    height: number,
    value: Vector2[] = [],
    propName?: string,
    input?: boolean | SerializedTerminal,
    output?: boolean | SerializedTerminal,
    style: EnvelopeStyle = {},
    id?: string,
    hitColor?: Color
  ) {

    super(node, Vector2.Zero(), UIType.Envelope, true, false, true, { ...DefaultEnvelopeStyle(), ...style }, propName,
      input
        ? (typeof input === 'boolean' ? new Terminal(node, TerminalType.IN, 'array', '', {}) : Terminal.deSerialize(node, input))
        : null,
      output
        ? (typeof output === 'boolean' ? new Terminal(node, TerminalType.OUT, 'array', '', {}) : Terminal.deSerialize(node, output))
        : null,
      id, hitColor
    );

    this.height = height;
    value.forEach(vector => vector.clamp(0, 1, 0, 1));
    value.sort((a, b) => a.x - b.x);
    this._value = new LinkedList((a, b) => a.x - b.x, value);
    this.pointHitColorPoint.clear();
    this._value.forEach(node => this.pointHitColorPoint.set(Color.Random().hexValue, node));

    if (this.input) {
      this.input.on('connect', (_, connector) => {
        if (connector.data) this.value = connector.data;
      });
      this.input.on('data', (_, data) => {
        if (data) this.value = data;
      });
    }
    if (this.output) this.output.on('connect', (_, connector) => connector.data = this.value);

    if (typeof OffscreenCanvas !== 'undefined') {
      this.offPointsCanvas = new OffscreenCanvas(this.width, this.height);
    } else {
      this.offPointsCanvas = document.createElement('canvas');
      this.offPointsCanvas.width = this.width;
      this.offPointsCanvas.height = this.height;
    }
    this.offPointsContext = this.offPointsCanvas.getContext('2d');
    this.renderOffPoints();
  }

  renderOffPoints() {
    this.offPointsContext.clearRect(0, 0, this.width, this.height);

    this._value.forEach(node => {
      let coord = node.data.multiply(this.width, this.height);
      this.offPointsContext.fillStyle = (this.pointHitColorPoint.get(node) as string);
      this.offPointsContext.beginPath();
      this.offPointsContext.arc(coord.x, coord.y, 5, 0, Constant.TAU);
      this.offPointsContext.fill();
    });
  }

  /** @hidden */
  paint(): void {
    let context = this.node.context;

    context.fillStyle = this.style.backgroundColor;
    context.strokeStyle = this.style.borderColor;
    context.lineWidth = this.style.borderWidth;
    context.fillRect(this.position.x, this.position.y, this.width, this.height);
    context.strokeRect(this.position.x, this.position.y, this.width, this.height);

    let points: Vector2[] = this._value.map(node =>
      node.data
        .multiply(this.width, this.height)
        .add(this.position)
    );

    if (points.length > 0) {
      context.strokeStyle = this.style.lineColor;
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(this.position.x, points[0].y);
      points.forEach(point => {
        context.lineTo(point.x, point.y);
      });
      context.lineTo(this.position.x + this.width, points[points.length - 1].y);
      context.stroke();
    }

    context.fillStyle = this.style.pointColor;
    points.forEach(point => {
      context.beginPath();
      context.arc(point.x, point.y, 5, 0, Constant.TAU);
      context.fill();
    });
  }
  /** @hidden */
  paintLOD1() {
    this.context.fillStyle = this.style.backgroundColor;
    this.context.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
  /** @hidden */
  offPaint(): void {
    this.offUIContext.fillStyle = this.hitColor.hexValue;
    this.offUIContext.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
  /** @hidden */
  reflow(): void {
    let newWidth = this.width;
    let newHeight = this.height;

    if (Math.floor(this.offPointsCanvas.width) !== Math.floor(newWidth) || Math.floor(this.offPointsCanvas.height) !== Math.floor(newHeight)) {
      this.offPointsCanvas.width = newWidth;
      this.offPointsCanvas.height = newHeight;

      this.renderOffPoints();
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

  getHitPoint(coord: Vector2): LinkedListNode<Vector2> {
    let hitColor = Color.rgbaToHex(this.offPointsContext.getImageData(coord.x, coord.y, 1, 1).data);
    let hitPointNode = this.pointHitColorPoint.get(hitColor);
    return hitPointNode as LinkedListNode<Vector2>;
  }

  /** @hidden */
  onPropChange(_: any, newVal: Vector2[]) {
    newVal.forEach((vector: Vector2) => vector.clamp(0, 1, 0, 1));
    newVal.sort((a: Vector2, b: Vector2) => a.x - b.x);

    this._value = new LinkedList((a, b) => a.x - b.x, newVal);
    this.pointHitColorPoint.clear();
    this._value.forEach(node => this.pointHitColorPoint.set(Color.Random().hexValue, node));

    this.renderOffPoints();

    this.output && (this.output as any)['setData'](this.value);
  }
  /** @hidden */
  onOver(screenPosition: Vector2, realPosition: Vector2): void {
    if (this.disabled) return;

    this.call('over', this, screenPosition, realPosition);
  }
  /** @hidden */
  onDown(screenPosition: Vector2, realPosition: Vector2): void {
    if (this.disabled) return;

    this.currHitPoint = this.getHitPoint(realPosition.subtract(this.position));

    this.call('down', this, screenPosition, realPosition);
  }
  /** @hidden */
  onUp(screenPosition: Vector2, realPosition: Vector2): void {
    if (this.disabled) return;

    if (this.currHitPoint) {
      let coord = realPosition.subtract(this.position);
      this.currHitPoint.data.x = normalize(coord.x, 0, this.width);
      this.currHitPoint.data.y = normalize(coord.y, 0, this.height);
      this.renderOffPoints();
      // Maybe setter ? onchange ? props ?
    }
    this.currHitPoint = null;

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

    if (this.currHitPoint) {
      let coord = realPosition.subtract(this.position);
      this.currHitPoint.data.x = normalize(coord.x, 0, this.width);
      this.currHitPoint.data.y = normalize(coord.y, 0, this.height);
      this.renderOffPoints();
      // Maybe setter ? onchange ? props ?
    }

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

    if (this.currHitPoint) {
      let coord = realPosition.subtract(this.position);
      this.currHitPoint.data.x = normalize(coord.x, 0, this.width);
      this.currHitPoint.data.y = normalize(coord.y, 0, this.height);
      this.renderOffPoints();
      // Maybe setter ? onchange ? props ?
    }
    this.currHitPoint = null;

    this.call('exit', this, screenPosition, realPosition);
  }
  /** @hidden */
  onWheel(direction: boolean, screenPosition: Vector2, realPosition: Vector2) {
    this.call('wheel', this, direction, screenPosition, realPosition);
  }
  /** @hidden */
  onContextMenu(): void {
    if (this.disabled) return;
  }

  serialize(): SerializedEnvelope {
    return {
      id: this.id,
      hitColor: this.hitColor.serialize(),
      type: this.type,
      style: this.style,
      propName: this.propName,
      input: this.input ? this.input.serialize() : null,
      output: this.output ? this.output.serialize() : null,
      value: this.value.map(vector => vector.serialize()),
      height: this.height,
      childs: []
    }
  }
  static deSerialize(node: Node, data: SerializedEnvelope): Envelope {
    return new Envelope(node, data.height, data.value.map(serialVec => Vector2.deSerialize(serialVec)), data.propName, data.input, data.output, data.style, data.id, Color.deSerialize(data.hitColor));
  }
}

export interface EnvelopeStyle extends UINodeStyle {
  backgroundColor?: string,
  pointColor?: string,
  lineColor?: string,
  borderColor?: string,
  borderWidth?: number
}

export interface SerializedEnvelope extends SerializedUINode {
  value: SerializedVector2[],
  height: number
}

/** @hidden */
let DefaultEnvelopeStyle = () => {
  return {
    backgroundColor: '#4a4a4a',
    pointColor: '#9cffee',
    lineColor: '#9cd6ff',
    borderColor: '#000',
    borderWidth: 1,
    visible: true
  };
};
