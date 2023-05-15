import { SerializedVector, Vector } from "./vector.js";
import { get, getNewUUID, intersects } from "../utils/utils.js";
import { Color, SerializedColor } from "./color.js";
import { Flow } from './flow.js';
import { Hooks } from './hooks.js';
import { Node } from './node.js';
import { Renderable, RenderResolver, Serializable } from "../common/interfaces.js";
import { ViewPort } from "../common/enums.js";

export class Group extends Hooks implements Serializable<SerializedGroup>, Renderable {
  renderResolver: RenderResolver<Group, GroupRenderParams> = () => null;

  nodes: Node[] = [];
  get name(): string { return this._name; }
  set name(name: string) {
    if (!name || name.trim() === '') this._name = 'No Name';
    else this._name = name;
    this.computeTextMetrics();
  }
  get position(): Vector { return this._position; }
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
  height: number
  style: GroupStyle;
  id: string;

  constructor(
    public flow: Flow,
    position: Vector,
    options: GroupOptions = DefaultGroupOptions()
  ) {

    super();

    this.width = get(options.width, 0);
    this.height = get(options.height, 0);
    this.style = get(options.style, {});
    this.id = get(options.id, getNewUUID());

    this.hitColor = options.hitColor;
    this.style = { ...DefaultGroupStyle(), ...options.style };
    this.id = getNewUUID();
    this._position = position;
    if (!this.style.color || !this.style.borderColor) {
      let colors = DefaultGroupColors.Random();
      this.style.borderColor = colors[0];
      this.style.color = colors[1];
    }
    this.name = options.name;
    this.setHitColor(options.hitColor);
    this.computeTextMetrics();

    this.flow.on('transform', () => this.updateRenderState());
  }

  private setHitColor(hitColor: Color) {
    if (!hitColor) {
      hitColor = Color.Random();
      while (this.flow.groupHitColors.get(hitColor.rgbaString)) hitColor = Color.Random();
    }
    this.hitColor = hitColor;
    this.flow.groupHitColors.set(this.hitColor.rgbaString, this);
  }
  private computeTextMetrics() {
    let context = this.flow.flowConnect.context;
    context.font = this.style.fontSize + ' ' + this.style.font;
    let metrics = context.measureText(this.name);
    this.textWidth = metrics.width;
    metrics = context.measureText('M');
    context.font = null;
    this.textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

    if (typeof this.textHeight === 'undefined') {
      let d = document.createElement("span");
      d.textContent = "M";
      d.style.font = this.style.fontSize + ' ' + this.style.font;
      document.body.appendChild(d);
      this.textHeight = d.offsetHeight;
      document.body.removeChild(d);
    }
  }
  private updateRenderState() {
    let realPos = this.position.transform(this.flow.flowConnect.transform);
    this.renderState = intersects(
      0, 0,
      this.flow.flowConnect.canvasDimensions.width, this.flow.flowConnect.canvasDimensions.height,
      realPos.x, realPos.y,
      realPos.x + this.width * this.flow.flowConnect.scale,
      realPos.y + this.height * this.flow.flowConnect.scale
    );
  }
  setContainedNodes() {
    let groupRealPos = this.position.transform(this.flow.flowConnect.transform);

    this.nodes = [...this.flow.nodes.values()]
      .filter(node => !node.group && node.renderState.viewport === ViewPort.INSIDE)
      .filter(node => {
        let nodeRealPos = node.position.transform(this.flow.flowConnect.transform);

        return intersects(groupRealPos.x, groupRealPos.y,
          groupRealPos.x + this.width * this.flow.flowConnect.scale,
          groupRealPos.y + this.height * this.flow.flowConnect.scale,
          nodeRealPos.x, nodeRealPos.y,
          nodeRealPos.x + node.width * this.flow.flowConnect.scale,
          nodeRealPos.y + node.ui.height * this.flow.flowConnect.scale
        ) === ViewPort.INSIDE;
      });

    this.nodes.forEach((node, index) => {
      node.group = this;
      this.nodeDeltas[index] = node.position.subtract(this.position);
    });
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
    let flowRenderResolver = this.flow.renderResolver.group;
    let flowConnectRenderResolver = this.flow.flowConnect.renderResolver.group;
    ((this.renderResolver && this.renderResolver(this))
      || (flowRenderResolver && flowRenderResolver(this))
      || (flowConnectRenderResolver && flowConnectRenderResolver(this))
      || this._render
    )(context, this.getRenderParams(), this);
    context.restore();

    this.flow.flowConnect.offGroupContext.save();
    this._offRender();
    this.flow.flowConnect.offGroupContext.restore();

    this.call('render', this);
  }
  private _render(context: CanvasRenderingContext2D, params: GroupRenderParams, group: Group) {
    context.strokeStyle = group.style.borderColor;
    context.lineWidth = 2;
    context.fillStyle = group.style.color;
    context.strokeRect(params.position.x, params.position.y, params.width, params.height);
    context.fillRect(params.position.x, params.position.y, params.width, params.height);
    context.fillStyle = group.style.titleColor;
    context.textBaseline = 'bottom';
    context.font = group.style.fontSize + ' ' + group.style.font;
    context.fillText(group.name, params.position.x, params.position.y - 10);
  }
  private _offRender() {
    this.flow.flowConnect.offGroupContext.fillStyle = this.hitColor.rgbaCSSString;
    this.flow.flowConnect.offGroupContext.fillRect(this.position.x, this.position.y, this.width, this.height);
    this.flow.flowConnect.offGroupContext.fillRect(this.position.x, this.position.y - this.textHeight - 10, this.textWidth, this.textHeight + 10);
  }
  private getRenderParams(): GroupRenderParams {
    return {
      position: this.position.serialize(),
      width: this.width,
      height: this.height
    };
  }

  onClick(screenPosition: Vector, realPosition: Vector) {
    this.call('click', this, screenPosition, realPosition);

    let thisRealPosition = this.position.transform(this.flow.flowConnect.transform);
    if (screenPosition.y < thisRealPosition.y) {
      this.flow.flowConnect.showGenericInput(thisRealPosition.subtract(0, (10 + this.textHeight) * this.flow.flowConnect.scale), this.name, {
        width: Math.max(this.textWidth, 50) * this.flow.flowConnect.scale + 'px',
        height: this.textHeight * this.flow.flowConnect.scale + 'px',
        fontSize: parseInt(this.style.fontSize.replace('px', '')) * this.flow.flowConnect.scale + 'px',
        fontFamily: this.style.font
      }, {
        type: 'text'
      }, (value) => {
        this.name = value;
      });
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
      nodes: this.nodes.map(node => node.id),
      nodeDeltas: this.nodeDeltas.map(nodeDelata => nodeDelata.serialize())
    };
  }
  static deSerialize(flow: Flow, data: SerializedGroup): Group {
    let group = new Group(flow, Vector.deSerialize(data.position), {
      width: data.width,
      height: data.height,
      name: data.name,
      style: data.style,
      id: data.id,
      hitColor: Color.deSerialize(data.hitColor)
    });

    data.nodes.forEach(nodeId => {
      group.nodes.push(flow.nodes.get(nodeId));
      flow.nodes.get(nodeId).group = group;

    });
    data.nodeDeltas.forEach(serializedVector => {
      group.nodeDeltas.push(Vector.deSerialize(serializedVector));
    });

    return group;
  }
}

export interface SerializedGroup {
  position: SerializedVector,
  width: number,
  height: number,
  name: string,
  style: GroupStyle,
  id: string,
  hitColor: SerializedColor,
  nodes: string[],
  nodeDeltas: SerializedVector[]
}

let DefaultGroupColors = {
  colors: [
    ['rgba(239, 134, 119, 1)', 'rgba(239, 134, 119, .5)'],
    ['rgba(160, 231, 125, 1)', 'rgba(160, 231, 125, .5)'],
    ['rgba(130, 182, 217, 1)', 'rgba(130, 182, 217, .5)']
  ],
  RED: () => DefaultGroupColors.colors[0],
  GREEN: () => DefaultGroupColors.colors[1],
  BLUE: () => DefaultGroupColors.colors[2],
  Random: () => DefaultGroupColors.colors[Math.floor(Math.random() * DefaultGroupColors.colors.length)]
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
    titleColor: '#000',
    fontSize: '16px',
    font: 'arial'
  };
}

export interface GroupOptions {
  width?: number,
  height?: number,
  name?: string,
  style?: GroupStyle,
  id?: string,
  hitColor?: Color
}

let DefaultGroupOptions = (): GroupOptions => {
  return {
    width: 0,
    height: 0,
    style: {},
    id: getNewUUID()
  }
}

export interface GroupRenderParams {
  position: SerializedVector,
  width: number,
  height: number
}
