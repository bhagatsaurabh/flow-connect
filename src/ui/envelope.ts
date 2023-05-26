import { Vector } from "../core/vector.js";
import { UIEvent, UINode, UINodeOptions, UINodeStyle } from "./ui-node.js";
import { Node } from "../core/node.js";
import { TerminalType } from "../core/terminal.js";
import { Color } from "../core/color.js";
import { FlowState } from "../core/flow.js";
import { Constant } from "../resource/constants.js";
import { List, ListNode } from "../utils/linked-list.js";
import { BiMap } from "../utils/bidirectional-map.js";
import { clampMin } from "../flow-connect.js";

export class Envelope extends UINode<EnvelopeStyle> {
  style: EnvelopeStyle;

  private _value: List<Vector>;
  private pointHitColorPoint: BiMap<string, ListNode<Vector>> = new BiMap();
  offPointsCanvas: OffscreenCanvas | HTMLCanvasElement;
  private offPointsContext: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;

  get value(): Vector[] {
    return this._value.toArray().map((vec) => vec.clone());
  }
  set value(value: Vector[]) {
    const oldVal = this.value;

    this.handleEnvelopeChange(value);

    if (this.node.flow.state !== FlowState.Stopped) this.call("change", this, oldVal, this._value.toArray());
  }

  constructor(_node: Node, options: EnvelopeOptions = DefaultEnvelopeOptions()) {
    super();

    options = { ...DefaultEnvelopeOptions(), ...options };
    const { height = 100, style = {} } = options;

    this.draggable = true;
    this.height = height;
    this.style = { ...DefaultEnvelopeStyle(), ...style };
    this.style.pointDiameter = clampMin(this.style.pointDiameter, 2);
  }

  protected created(options: EnvelopeOptions): void {
    const { values = [] } = options;

    if (options.input) {
      const terminal = this.createTerminal(TerminalType.IN, "array");
      terminal.on("connect", (_, connector) => {
        if (connector.data) this.value = connector.data;
      });
      terminal.on("data", (_, data) => {
        if (data) this.value = data;
      });
    }
    if (options.output) {
      const terminal = this.createTerminal(TerminalType.OUT, "array");
      terminal.on("connect", (_, connector) => (connector.data = this.value));
    }

    if (typeof OffscreenCanvas !== "undefined") {
      this.offPointsCanvas = new OffscreenCanvas(this.width, this.height);
    } else {
      this.offPointsCanvas = document.createElement("canvas");
      this.offPointsCanvas.width = this.width;
      this.offPointsCanvas.height = this.height;
    }
    this.offPointsContext = this.offPointsCanvas.getContext("2d");

    this.handleEnvelopeChange(values);
  }

  handleEnvelopeChange(values: Vector[]) {
    values.forEach((vec) => vec.clampInPlace(0, 1, 0, 1));
    values.sort((a, b) => a.x - b.x);
    this._value = new List((a, b) => a.x - b.x, values);
    this.pointHitColorPoint.clear();
    this._value.forEach((node) => this.pointHitColorPoint.set(Color.Random().hexValue, node));
    this.renderOffPoints();
  }
  renderOffPoints() {
    let [width, height] = [this.width - this.style.pointDiameter, this.height - this.style.pointDiameter];
    this.offPointsContext.clearRect(0, 0, width, height);

    this._value.forEach((node) => {
      let coord = new Vector(node.data.x, 1 - node.data.y).multiply(width, height).add(this.style.pointDiameter / 2);
      this.offPointsContext.fillStyle = this.pointHitColorPoint.get(node) as string;
      this.offPointsContext.beginPath();
      this.offPointsContext.arc(coord.x, coord.y, this.style.pointDiameter / 2, 0, Constant.TAU);
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

    let [width, height] = [this.width - this.style.pointDiameter, this.height - this.style.pointDiameter];
    let points: Vector[] = this._value.map((node) =>
      new Vector(node.data.x, 1 - node.data.y)
        .multiplyInPlace(width, height)
        .addInPlace(this.position)
        .addInPlace(this.style.pointDiameter / 2)
    );

    if (points.length > 0) {
      context.strokeStyle = this.style.lineColor;
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(this.position.x, points[0].y);
      points.forEach((point) => context.lineTo(point.x, point.y));
      context.lineTo(this.position.x + this.width, points[points.length - 1].y);
      context.stroke();
    }

    context.fillStyle = this.style.pointColor;
    points.forEach((point) => {
      context.beginPath();
      context.arc(point.x, point.y, this.style.pointDiameter / 2, 0, Constant.TAU);
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
      Math.floor(this.offPointsCanvas.width) !== Math.floor(newWidth) ||
      Math.floor(this.offPointsCanvas.height) !== Math.floor(newHeight)
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
    let [width, height] = [this.width - this.style.pointDiameter, this.height - this.style.pointDiameter];

    this.currHitPoint.data = realPosition
      .clamp(
        this.position.x + this.style.pointDiameter / 2,
        this.position.x + this.width - this.style.pointDiameter / 2,
        this.position.y + this.style.pointDiameter / 2,
        this.position.y + this.height - this.style.pointDiameter / 2
      )
      .subtractInPlace(this.position.add(this.style.pointDiameter / 2))
      .clampInPlace(0, width, 0, height)
      .normalizeInPlace(0, width, 0, height)
      .clampInPlace(this.currHitPoint.prev?.data.x || 0, this.currHitPoint.next?.data.x || 1, -Infinity, Infinity);
    this.currHitPoint.data = new Vector(this.currHitPoint.data.x, 1 - this.currHitPoint.data.y);

    this.renderOffPoints();
  }
  newPoint(realPosition: Vector, width: number, height: number) {
    let oldVal = this._value.toArray();

    let newPoint = realPosition
      .subtract(this.position.add(this.style.pointDiameter / 2))
      .normalizeInPlace(0, width, 0, height);
    newPoint = new Vector(newPoint.x, 1 - newPoint.y);

    let newPointNode;
    let anchor = this._value.searchTail((node) => node.data.x <= newPoint.x);

    if (anchor === null) newPointNode = this._value.prepend(newPoint);
    else newPointNode = this._value.addAfter(newPoint, anchor);

    this.pointHitColorPoint.set(Color.Random().hexValue, newPointNode);
    this.renderOffPoints();
    if (this.node.flow.state !== FlowState.Stopped) this.call("change", this, oldVal, this._value.toArray());
  }
  deletePoint() {
    let oldVal = this._value.toArray();
    this._value.delete(this.currHitPoint);
    this.pointHitColorPoint.delete(this.currHitPoint);
    this.renderOffPoints();

    if (this.node.flow.state !== FlowState.Stopped) this.call("change", this, oldVal, this._value.toArray());
  }

  onPropChange() {}

  private currHitPoint: ListNode<Vector>;
  private lastDownPosition: Vector;
  onDown(event: UIEvent): void {
    this.currHitPoint = this.getHitPoint(event.realPos);
    this.lastDownPosition = event.realPos;
  }
  onUp(event: UIEvent): void {
    let [width, height] = [this.width - this.style.pointDiameter, this.height - this.style.pointDiameter];
    if (!this.currHitPoint && this.lastDownPosition) {
      if (Vector.Distance(this.lastDownPosition, event.realPos) <= 2) {
        this.newPoint(event.realPos, width, height);
      }
    } else if (
      this.currHitPoint &&
      this.currHitPoint === this.getHitPoint(event.realPos) &&
      this.lastDownPosition &&
      this.lastDownPosition.isEqual(event.realPos, 0.5)
    ) {
      this.deletePoint();
    } else if (this.currHitPoint) {
      // Point has finished moving
      if (this.node.flow.state !== FlowState.Stopped) this.call("change", this, null, this._value.toArray());
    }

    this.currHitPoint = null;
    this.lastDownPosition = null;
  }
  onDrag(event: UIEvent): void {
    if (this.currHitPoint) this.movePoint(event.realPos);
  }
  onExit(event: UIEvent) {
    if (this.currHitPoint) {
      this.movePoint(event.realPos);
      if (this.node.flow.state !== FlowState.Stopped) this.call("change", this, null, this._value.toArray());
    }
    this.currHitPoint = null;
    this.lastDownPosition = null;
  }
}

export interface EnvelopeStyle extends UINodeStyle {
  backgroundColor?: string;
  pointColor?: string;
  pointDiameter?: number;
  lineColor?: string;
  borderColor?: string;
  borderWidth?: number;
}
const DefaultEnvelopeStyle = (): EnvelopeStyle => ({
  backgroundColor: "#4a4a4a",
  pointDiameter: 10,
  pointColor: "#9cffee",
  lineColor: "#9cd6ff",
  borderColor: "#000",
  borderWidth: 1,
});

export interface EnvelopeOptions extends UINodeOptions<EnvelopeStyle> {
  height: number;
  values?: Vector[];
}
const DefaultEnvelopeOptions = (): EnvelopeOptions => ({
  height: 100,
  values: [],
});
