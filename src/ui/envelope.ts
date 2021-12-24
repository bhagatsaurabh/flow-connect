import { SerializedVector2, Vector2 } from "../core/vector";
import { SerializedUINode, UINode, UINodeStyle, UIType } from "./ui-node";
import { Node } from '../core/node';
import { Terminal, TerminalType, SerializedTerminal } from "../core/terminal";
import { Serializable } from "../common/interfaces";
import { Color } from "../core/color";
import { FlowState } from "../core/flow";
import { Constant } from "../resource/constants";
import { List, ListNode } from "../utils/linked-list";
import { BiMap } from "../utils";

export class Envelope extends UINode implements Serializable {
  private _value: List<Vector2>;
  private pointHitColorPoint: BiMap<string, ListNode<Vector2>> = new BiMap();
  offPointsCanvas: OffscreenCanvas | HTMLCanvasElement;
  private offPointsContext: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;
  private pointDiameter: number = 10;

  get value(): Vector2[] {
    return this._value.toArray().map(vec => vec.clone());
  }
  set value(value: Vector2[]) {
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
    values: Vector2[] = [],
    options: EnvelopeOptions = DefaultEnvelopeOptions()
  ) {
    super(node, Vector2.Zero(), UIType.Envelope, {
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
      let coord = new Vector2(node.data.x, 1 - node.data.y).multiply(width, height).add(this.pointDiameter / 2);
      this.offPointsContext.fillStyle = this.pointHitColorPoint.get(node) as string;
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

    let [width, height] = [this.width - this.pointDiameter, this.height - this.pointDiameter];
    let points: Vector2[] = this._value.map(node =>
      new Vector2(node.data.x, 1 - node.data.y)
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

  getHitPoint(realPosition: Vector2): ListNode<Vector2> {
    let coord = realPosition.subtract(this.position);
    let hitColor = Color.rgbaToHex(this.offPointsContext.getImageData(coord.x, coord.y, 1, 1).data);
    let hitPointNode = this.pointHitColorPoint.get(hitColor);
    return hitPointNode as ListNode<Vector2>;
  }
  movePoint(realPosition: Vector2) {
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
    this.currHitPoint.data = new Vector2(this.currHitPoint.data.x, 1 - this.currHitPoint.data.y);

    this.renderOffPoints();
  }
  newPoint(realPosition: Vector2, width: number, height: number) {
    let oldVal = this._value.toArray();

    let newPoint = realPosition
      .subtract(this.position.add(this.pointDiameter / 2))
      .normalizeInPlace(0, width, 0, height);
    newPoint = new Vector2(newPoint.x, 1 - newPoint.y);

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

  /** @hidden */
  onPropChange() { /**/ }
  /** @hidden */
  onOver(screenPosition: Vector2, realPosition: Vector2): void {
    if (this.disabled) return;

    this.call('over', this, screenPosition, realPosition);
  }

  private currHitPoint: ListNode<Vector2>;
  private lastDownPosition: Vector2;
  /** @hidden */
  onDown(screenPosition: Vector2, realPosition: Vector2): void {
    if (this.disabled) return;

    this.currHitPoint = this.getHitPoint(realPosition);
    this.lastDownPosition = realPosition;

    this.call('down', this, screenPosition, realPosition);
  }
  /** @hidden */
  onUp(screenPosition: Vector2, realPosition: Vector2): void {
    if (this.disabled) return;

    let [width, height] = [this.width - this.pointDiameter, this.height - this.pointDiameter];
    if (!this.currHitPoint && this.lastDownPosition) {
      if (Vector2.Distance(this.lastDownPosition, realPosition) <= 2) {
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
  /** @hidden */
  onClick(screenPosition: Vector2, realPosition: Vector2): void {
    if (this.disabled) return;

    this.call('click', this, screenPosition, realPosition);
  }
  /** @hidden */
  onDrag(screenPosition: Vector2, realPosition: Vector2): void {
    if (this.disabled) return;

    if (this.currHitPoint) this.movePoint(realPosition);

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
      this.movePoint(realPosition);
      if (this.node.flow.state !== FlowState.Stopped) this.call('change', this, null, this._value.toArray());
    }
    this.currHitPoint = null;
    this.lastDownPosition = null;

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
    return new Envelope(node, data.height, data.values.map(serialVec => Vector2.deSerialize(serialVec)), {
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

export interface SerializedEnvelope extends SerializedUINode {
  values: SerializedVector2[],
  height: number
}

interface EnvelopeOptions {
  input?: boolean | SerializedTerminal,
  output?: boolean | SerializedTerminal,
  style?: EnvelopeStyle,
  id?: string,
  hitColor?: Color
}
/** @hidden */
let DefaultEnvelopeOptions = () => {
  return {};
};
