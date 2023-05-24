import { SerializedVector, Vector } from "./vector.js";
import { get, uuid, intersects } from "../utils/utils.js";
import { Color, SerializedColor } from "./color.js";
import { Flow } from "./flow.js";
import { Hooks } from "./hooks.js";
import { Node } from "./node.js";
import { Renderable, Renderer, Serializable } from "../common/interfaces.js";
import { ViewPort } from "../common/enums.js";

export class Group extends Hooks implements Serializable<SerializedGroup>, Renderable {
  renderer: Renderer<Group, GroupRenderParams> = () => null;

  flow: Flow;
  nodes: Node[] = [];
  get name(): string {
    return this._name;
  }
  set name(name: string) {
    if (!name || name.trim() === "") this._name = "No Name";
    else this._name = name;
    this.computeTextMetrics();
  }
  get position(): Vector {
    return this._position;
  }
  set position(position: Vector) {
    this._position = position;
    this.updateRenderState();
    this.recomputeNodePositions();
  }

  nodeDeltas: Vector[] = [];

  hitColor: Color;
  private textWidth: number;
  private textHeight: number;
  private _name: string;
  private renderState: ViewPort = ViewPort.INSIDE;
  private _position: Vector;

  width: number;
  height: number;
  style: GroupStyle;
  id: string;

  private constructor() {
    super();
  }

  static create(flow: Flow, position: Vector, options: GroupOptions = DefaultGroupOptions()): Group {
    const group = new Group();

    const { name, width = 200, height = 200, id = uuid(), hitColor, style } = options;

    group.flow = flow;
    group._name = name;
    group.width = width;
    group.height = height;
    group.id = id;
    group.style = { ...DefaultGroupStyle(), ...get(style, {}) };

    if (!group.style.color || !group.style.borderColor) {
      let colors = DefaultGroupColors.Random();
      group.style.borderColor = colors[0];
      group.style.color = colors[1];
    }

    group.setHitColor(hitColor);
    group.position = position;
    group.computeTextMetrics();

    group.on("transform", (g) => g.updateRenderState());

    return group;
  }

  add(node: Node): boolean {
    if (!node) return false;

    const scale = this.flow.flowConnect.scale;
    const transform = this.flow.flowConnect.transform;
    if (!Group.isNodeInside(this, node, scale, transform)) return false;

    node.group = this;
    this.nodes.push(node);
    this.nodeDeltas.push(node.position.subtract(this.position));
  }
  remove(node: Node): boolean {
    let idx = this.nodes.findIndex((cNode) => cNode.id === node.id);
    if (idx < 0) return false;

    this.nodes.splice(idx, 1);
    this.nodeDeltas.splice(idx, 1);
    node.group = null;
    return true;
  }
  static isNodeInside(group: Group, node: Node, scale: number, transform: DOMMatrix): boolean {
    let groupRealPos = group.position.transform(transform);
    let nodeRealPos = node.position.transform(transform);

    return (
      intersects(
        groupRealPos.x,
        groupRealPos.y,
        groupRealPos.x + group.width * scale,
        groupRealPos.y + group.height * scale,
        nodeRealPos.x,
        nodeRealPos.y,
        nodeRealPos.x + node.width * scale,
        nodeRealPos.y + node.height * scale
      ) === ViewPort.INSIDE
    );
  }
  private setHitColor(hitColor?: Color) {
    if (!hitColor) {
      hitColor = Color.Random();
      while (this.flow.groupHitColors.get(hitColor.rgbaString)) hitColor = Color.Random();
    }
    this.hitColor = hitColor;
    this.flow.groupHitColors.set(this.hitColor.rgbaString, this);
  }
  private computeTextMetrics() {
    let context = this.flow.flowConnect.context;
    context.font = this.style.fontSize + " " + this.style.font;
    let metrics = context.measureText(this.name);
    this.textWidth = metrics.width;
    metrics = context.measureText("M");
    context.font = null;
    this.textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

    if (typeof this.textHeight === "undefined") {
      let d = document.createElement("span");
      d.textContent = "M";
      d.style.font = this.style.fontSize + " " + this.style.font;
      document.body.appendChild(d);
      this.textHeight = d.offsetHeight;
      document.body.removeChild(d);
    }
  }
  private updateRenderState() {
    let realPos = this.position.transform(this.flow.flowConnect.transform);
    this.renderState = intersects(
      0,
      0,
      this.flow.flowConnect.canvasDimensions.width,
      this.flow.flowConnect.canvasDimensions.height,
      realPos.x,
      realPos.y,
      realPos.x + this.width * this.flow.flowConnect.scale,
      realPos.y + this.height * this.flow.flowConnect.scale
    );
  }
  private recomputeNodePositions() {
    this.nodes.forEach((node, index) => {
      node.position = this.position.add(this.nodeDeltas[index]);
    });
  }

  render() {
    if (this.renderState === ViewPort.OUTSIDE) return;

    let context = this.flow.flowConnect.context;
    context.save();
    let scopeFlowConnect = this.flow.flowConnect.renderers.group;
    let scopeFlow = this.flow.renderers.group;
    let scopeGroup = this.renderer;
    const renderFn =
      (scopeGroup && scopeGroup(this)) ||
      (scopeFlow && scopeFlow(this)) ||
      (scopeFlowConnect && scopeFlowConnect(this)) ||
      this._render;
    renderFn(context, this.getRenderParams(), this);
    context.restore();

    this.flow.flowConnect.offGroupContext.save();
    this._offRender();
    this.flow.flowConnect.offGroupContext.restore();

    this.call("render", this);
  }
  private _render(context: CanvasRenderingContext2D, params: GroupRenderParams, group: Group) {
    context.strokeStyle = group.style.borderColor;
    context.lineWidth = 2;
    context.fillStyle = group.style.color;
    context.strokeRect(params.position.x, params.position.y, params.width, params.height);
    context.fillRect(params.position.x, params.position.y, params.width, params.height);
    context.fillStyle = group.style.titleColor;
    context.textBaseline = "bottom";
    context.font = group.style.fontSize + " " + group.style.font;
    context.fillText(group.name, params.position.x, params.position.y - 10);
  }
  private _offRender() {
    this.flow.flowConnect.offGroupContext.fillStyle = this.hitColor.rgbaCSSString;
    this.flow.flowConnect.offGroupContext.fillRect(this.position.x, this.position.y, this.width, this.height);
    this.flow.flowConnect.offGroupContext.fillRect(
      this.position.x,
      this.position.y - this.textHeight - 10,
      this.textWidth,
      this.textHeight + 10
    );
  }
  private getRenderParams(): GroupRenderParams {
    return {
      position: this.position.serialize(),
      width: this.width,
      height: this.height,
    };
  }

  onClick(screenPosition: Vector, realPosition: Vector) {
    this.call("click", this, screenPosition, realPosition);

    let thisRealPosition = this.position.transform(this.flow.flowConnect.transform);
    if (screenPosition.y < thisRealPosition.y) {
      this.flow.flowConnect.showGenericInput(
        thisRealPosition.subtract(0, (10 + this.textHeight) * this.flow.flowConnect.scale),
        this.name,
        {
          width: Math.max(this.textWidth, 50) * this.flow.flowConnect.scale + "px",
          height: this.textHeight * this.flow.flowConnect.scale + "px",
          fontSize: parseInt(this.style.fontSize.replace("px", "")) * this.flow.flowConnect.scale + "px",
          fontFamily: this.style.font,
        },
        {
          type: "text",
        },
        (value) => {
          this.name = value;
        }
      );
    }
  }

  serialize(): SerializedGroup {
    return {
      id: this.id,
      hitColor: this.hitColor.serialize(),
      position: this.position.serialize(),
      name: this.name,
      width: this.width,
      height: this.height,
      style: this.style,
      nodes: this.nodes.map((node) => node.id),
    };
  }
}

export interface SerializedGroup {
  position: SerializedVector;
  width: number;
  height: number;
  name: string;
  style: GroupStyle;
  id: string;
  hitColor: SerializedColor;
  nodes: string[];
}

let DefaultGroupColors = {
  colors: [
    ["rgba(239, 134, 119, 1)", "rgba(239, 134, 119, .5)"],
    ["rgba(160, 231, 125, 1)", "rgba(160, 231, 125, .5)"],
    ["rgba(130, 182, 217, 1)", "rgba(130, 182, 217, .5)"],
  ],
  RED: () => DefaultGroupColors.colors[0],
  GREEN: () => DefaultGroupColors.colors[1],
  BLUE: () => DefaultGroupColors.colors[2],
  Random: () => DefaultGroupColors.colors[Math.floor(Math.random() * DefaultGroupColors.colors.length)],
};

export interface GroupStyle {
  color?: string;
  borderColor?: string;
  titleColor?: string;
  fontSize?: string;
  font?: string;
}
let DefaultGroupStyle = () => {
  return {
    titleColor: "#000",
    fontSize: "16px",
    font: "arial",
  };
};

export interface GroupOptions {
  name: string;
  width?: number;
  height?: number;
  style?: GroupStyle;
  id?: string;
  hitColor?: Color;
}

let DefaultGroupOptions = (): GroupOptions => {
  return {
    name: "New Group",
    width: 200,
    height: 200,
    style: {},
    id: uuid(),
  };
};

export interface GroupRenderParams {
  position: SerializedVector;
  width: number;
  height: number;
}
