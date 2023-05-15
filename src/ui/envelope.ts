import { SerializedVector, Vector } from "../core/vector.js";
import { SerializedUINode, UINode, UINodeStyle, UIType } from "./ui-node.js";
import { Node } from '../core/node.js';
import { Terminal, TerminalType, SerializedTerminal } from "../core/terminal.js";
import { Serializable } from "../common/interfaces.js";
import { Color } from "../core/color.js";
import { FlowState } from "../core/flow.js";
import { Constant } from "../resource/constants.js";
import { List, ListNode } from "../utils/linked-list.js";
import { BiMap } from "../utils/bidirectional-map.js";

export class Envelope extends UINode implements Serializable<SerializedEnvelope> {
  private _value: List<Vector>;
  private pointHitColorPoint: BiMap<string, ListNode<Vector>> = new BiMap();
  offPointsCanvas: OffscreenCanvas | HTMLCanvasElement;
  private offPointsContext: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;
  private pointDiameter: number = 10;

  get value(): Vector[] {
    return this._value.toArray().map(vec => vec.clone());
  }
  set value(value: Vector[]) {
    let oldVal = this.value;
    value.forEach(vector => vector.clampInPlace(0, 1, 0, 1));
    value.sort((a, b) => a.x - b.x);
    this._value = new List((a, b) => a.x - b.x, value);
    this.pointHitColorPoint.clear();
    this._value.forEach(node => this.pointHitColorPoint.set(Color.Random().hexValue, node));
    this.renderOffPoints();

    if (this.node.flow.state !== FlowState.Stopped) this.call('change', this, oldVal, this._value.toArray());
  }

  constructor(
    node: Node,
    height: number,
    values: Vector[] = [],
    options: EnvelopeOptions = DefaultEnvelopeOptions()
  ) {
    super(node, Vector.Zero(), UIType.Envelope, {
      draggable: true,
      style: options.style ? { ...DefaultEnvelopeStyle(), ...options.style } : DefaultEnvelopeStyle(),
      input: options.input && (typeof options.input === 'boolean'
        ? new Terminal(node, TerminalType.IN, 'array', '', {})
        : Terminal.deSerialize(node, options.input)),
      output: options.output && (typeof options.output === 'boolean'
        ? new Terminal(node, TerminalType.OUT, 'array', '', {})
        : Terminal.deSerialize(node, options.output)),
      id: options.id,
      hitColor: options.hitColor
    });

    this.height = height;
    values.forEach(vector => vector.clampInPlace(0, 1, 0, 1));
    values.sort((a, b) => a.x - b.x);
    this._value = new List((a, b) => a.x - b.x, values);
    this.pointHitColorPoint.clear();
    this._value.forEach(pointNode => this.pointHitColorPoint.set(Color.Random().hexValue, pointNode));

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
    let [width, height] = [this.width - this.pointDiameter, this.height - this.pointDiameter];
    this.offPointsContext.clearRect(0, 0, width, height);

    this._value.forEach(node => {
      let coord = new Vector(node.data.x, 1 - node.data.y).multiply(width, height).add(this.pointDiameter / 2);
      this.offPointsContext.fillStyle = this.pointHitColorPoint.get(node) as string;
      this.offPointsContext.beginPath();
      this.offPointsContext.arc(coord.x, coord.y, this.pointDiameter / 2, 0, Constant.TAU);
      this.offPointsContext.fill();
    });
  }

  paint(): void {
    let context = this.node.context;

    context.fillStyle = this.style.backgroundColor;
    context.strokeStyle = this.style.borderColor;
    context.lineWidth = this.style.borderWidth;
    context.fillRect(this.position.x, this.position.y, this.width, this.height);
    context.strokeRect(this.position.x, this.position.y, this.width, this.height);

    let [width, height] = [this.width - this.pointDiameter, this.height - this.pointDiameter];
    let points: Vector[] = this._value.map(node =>
      new Vector(node.data.x, 1 - node.data.y)
        .multiplyInPlace(width, height)
        .addInPlace(this.position)
        .addInPlace(this.pointDiameter / 2)
    );

    if (points.length > 0) {
      context.strokeStyle = this.style.lineColor;
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(this.position.x, points[0].y);
      points.forEach(point => context.lineTo(point.x, point.y));
      context.lineTo(this.position.x + this.width, points[points.length - 1].y);
      context.stroke();
    }

    context.fillStyle = this.style.pointColor;
    points.forEach(point => {
      context.beginPath();
      context.arc(point.x, point.y, this.pointDiameter / 2, 0, Constant.TAU);
      context.fill();
    });
  }
  paintLOD1() {
    this.context.fillStyle = this.style.backgroundColor;
    this.context.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
  offPaint(): void {
    this.offUIContext.fillStyle = this.hitColor.hexValue;
    this.offUIContext.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  reflow(): void {
    let [newWidth, newHeight] = [this.width, this.height];

    if (
      Math.floor(this.offPointsCanvas.width) !== Math.floor(newWidth)
      || Math.floor(this.offPointsCanvas.height) !== Math.floor(newHeight)
    ) {

      this.offPointsCanvas.width = newWidth;
      this.offPointsCanvas.height = newHeight;
      this.renderOffPoints();
    }

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

  getHitPoint(realPosition: Vector): ListNode<Vector> {
    let coord = realPosition.subtract(this.position);
    let hitColor = Color.rgbaToHex(this.offPointsContext.getImageData(coord.x, coord.y, 1, 1).data);
    let hitPointNode = this.pointHitColorPoint.get(hitColor);
    return hitPointNode as ListNode<Vector>;
  }
  movePoint(realPosition: Vector) {
    let [width, height] = [this.width - this.pointDiameter, this.height - this.pointDiameter];

    this.currHitPoint.data = realPosition
      .clamp(
        this.position.x + this.pointDiameter / 2, this.position.x + this.width - this.pointDiameter / 2,
        this.position.y + this.pointDiameter / 2, this.position.y + this.height - this.pointDiameter / 2
      )
      .subtractInPlace(this.position.add(this.pointDiameter / 2))
      .clampInPlace(0, width, 0, height)
      .normalizeInPlace(0, width, 0, height)
      .clampInPlace(
        this.currHitPoint.prev?.data.x || 0, this.currHitPoint.next?.data.x || 1,
        -Infinity, Infinity
      );
    this.currHitPoint.data = new Vector(this.currHitPoint.data.x, 1 - this.currHitPoint.data.y);

    this.renderOffPoints();
  }
  newPoint(realPosition: Vector, width: number, height: number) {
    let oldVal = this._value.toArray();

    let newPoint = realPosition
      .subtract(this.position.add(this.pointDiameter / 2))
      .normalizeInPlace(0, width, 0, height);
    newPoint = new Vector(newPoint.x, 1 - newPoint.y);

    let newPointNode;
    let anchor = this._value.searchTail(node => node.data.x <= newPoint.x);

    if (anchor === null) newPointNode = this._value.prepend(newPoint);
    else newPointNode = this._value.addAfter(newPoint, anchor);

    this.pointHitColorPoint.set(Color.Random().hexValue, newPointNode);
    this.renderOffPoints();
    if (this.node.flow.state !== FlowState.Stopped) this.call('change', this, oldVal, this._value.toArray());
  }
  deletePoint() {
    let oldVal = this._value.toArray();
    this._value.delete(this.currHitPoint);
    this.pointHitColorPoint.delete(this.currHitPoint);
    this.renderOffPoints();

    if (this.node.flow.state !== FlowState.Stopped) this.call('change', this, oldVal, this._value.toArray());
  }

  onPropChange() { /**/ }
  onOver(screenPosition: Vector, realPosition: Vector): void {
    if (this.disabled) return;

    this.call('over', this, screenPosition, realPosition);
  }

  private currHitPoint: ListNode<Vector>;
  private lastDownPosition: Vector;
  onDown(screenPosition: Vector, realPosition: Vector): void {
    if (this.disabled) return;

    this.currHitPoint = this.getHitPoint(realPosition);
    this.lastDownPosition = realPosition;

    this.call('down', this, screenPosition, realPosition);
  }
  onUp(screenPosition: Vector, realPosition: Vector): void {
    if (this.disabled) return;

    let [width, height] = [this.width - this.pointDiameter, this.height - this.pointDiameter];
    if (!this.currHitPoint && this.lastDownPosition) {
      if (Vector.Distance(this.lastDownPosition, realPosition) <= 2) {
        this.newPoint(realPosition, width, height);
      }
    } else if (
      this.currHitPoint && this.currHitPoint === this.getHitPoint(realPosition)
      && this.lastDownPosition && this.lastDownPosition.isEqual(realPosition, 0.5)
    ) {
      this.deletePoint();
    } else if (this.currHitPoint) {
      // Point has finished moving
      if (this.node.flow.state !== FlowState.Stopped) this.call('change', this, null, this._value.toArray());
    }

    this.currHitPoint = null;
    this.lastDownPosition = null;

    this.call('up', this, screenPosition, realPosition);
  }
  onClick(screenPosition: Vector, realPosition: Vector): void {
    if (this.disabled) return;

    this.call('click', this, screenPosition, realPosition);
  }
  onDrag(screenPosition: Vector, realPosition: Vector): void {
    if (this.disabled) return;

    if (this.currHitPoint) this.movePoint(realPosition);

    this.call('drag', this, screenPosition, realPosition);
  }
  onEnter(screenPosition: Vector, realPosition: Vector) {
    if (this.disabled) return;

    this.call('enter', this, screenPosition, realPosition);
  }
  onExit(screenPosition: Vector, realPosition: Vector) {
    if (this.disabled) return;

    if (this.currHitPoint) {
      this.movePoint(realPosition);
      if (this.node.flow.state !== FlowState.Stopped) this.call('change', this, null, this._value.toArray());
    }
    this.currHitPoint = null;
    this.lastDownPosition = null;

    this.call('exit', this, screenPosition, realPosition);
  }
  onWheel(direction: boolean, screenPosition: Vector, realPosition: Vector) {
    if (this.disabled) return;

    this.call('wheel', this, direction, screenPosition, realPosition);
  }
  onContextMenu(): void {
    if (this.disabled) return;
  }

  serialize(): SerializedEnvelope {
    return {
      values: this.value.map(vector => vector.serialize()),
      propName: this.propName,
      input: this.input ? this.input.serialize() : null,
      output: this.output ? this.output.serialize() : null,
      id: this.id,
      hitColor: this.hitColor.serialize(),
      style: this.style,
      height: this.height,
      type: this.type,
      childs: []
    }
  }
  static deSerialize(node: Node, data: SerializedEnvelope): Envelope {
    return new Envelope(node, data.height, data.values.map(serialVec => Vector.deSerialize(serialVec)), {
      input: data.input,
      output: data.output,
      style: data.style,
      id: data.id,
      hitColor: Color.deSerialize(data.hitColor)
    });
  }
}

export interface EnvelopeStyle extends UINodeStyle {
  backgroundColor?: string,
  pointColor?: string,
  lineColor?: string,
  borderColor?: string,
  borderWidth?: number
}
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

export interface SerializedEnvelope extends SerializedUINode {
  values: SerializedVector[],
  height: number
}

interface EnvelopeOptions {
  input?: boolean | SerializedTerminal,
  output?: boolean | SerializedTerminal,
  style?: EnvelopeStyle,
  id?: string,
  hitColor?: Color
}
let DefaultEnvelopeOptions = () => {
  return {};
};
