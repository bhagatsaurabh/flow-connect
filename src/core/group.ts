import { Vector2 } from "../math/vector";
import { Constant, ViewPort } from '../math/constants';
import { getNewGUID, intersects } from "../utils/utils";
import { Color } from "./color";
import { Flow } from './flow';
import { Hooks } from './hooks';
import { Node } from './node';
import { GroupStyle, Serializable, SerializedGroup } from "./interfaces";

export class Group extends Hooks implements Serializable {
  nodes: Node[] = [];
  get name(): string { return this._name; }
  set name(name: string) {
    if (!name || name.trim() === '') this._name = 'No Name';
    else this._name = name;
    this.computeTextMetrics();
  }
  get position(): Vector2 { return this._position; }
  set position(position: Vector2) {
    this._position = position;
    this.updateRenderState();
    this.recomputeNodePositions();
  }

  /** @hidden */
  nodeDeltas: Vector2[] = [];
  /** @hidden */
  hitColor: Color;
  private textWidth: number;
  private textHeight: number;
  private _name: string;
  private renderState: ViewPort = ViewPort.INSIDE;
  private _position: Vector2;

  constructor(
    public flow: Flow,
    position: Vector2,
    public width: number = 0, public height: number = 0,
    name?: string,
    public style: GroupStyle = {},
    public id: string = getNewGUID(),
    hitColor?: Color
  ) {

    super();
    this.hitColor = hitColor;
    this.style = { ...Constant.DefaultGroupStyle(), ...style };
    this.id = getNewGUID();
    this._position = position;
    if (!this.style.color || !this.style.borderColor) {
      let colors = Constant.DefaultGroupColors.Random();
      this.style.borderColor = colors[0];
      this.style.color = colors[1];
    }
    this.name = name;
    this.setHitColor(hitColor);
    this.computeTextMetrics();

    this.flow.on('transform', () => this.updateRenderState());
  }

  private setHitColor(hitColor: Color) {
    if (!hitColor) {
      hitColor = Color.Random();
      while (this.flow.hitColorToGroup[hitColor.rgbaString]) hitColor = Color.Random();
    }
    this.hitColor = hitColor;
    this.flow.hitColorToGroup[this.hitColor.rgbaString] = this;
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
  /** @hidden */
  setContainedNodes() {
    let groupRealPos = this.position.transform(this.flow.flowConnect.transform);

    this.nodes = Object.keys(this.flow.nodes)
      .map(key => this.flow.nodes[key])
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

    this.flow.flowConnect.context.save();
    this._render();
    this.flow.flowConnect.context.restore();

    this.flow.flowConnect.offGroupContext.save();
    this._offRender();
    this.flow.flowConnect.offGroupContext.restore();
  }
  private _render() {
    let context = this.flow.flowConnect.context;
    context.strokeStyle = this.style.borderColor;
    context.lineWidth = 2;
    context.fillStyle = this.style.color;
    context.strokeRect(this.position.x, this.position.y, this.width, this.height);
    context.fillRect(this.position.x, this.position.y, this.width, this.height);
    context.fillStyle = this.style.titleColor;
    context.textBaseline = 'bottom';
    context.font = this.style.fontSize + ' ' + this.style.font;
    context.fillText(this.name, this.position.x, this.position.y - 10);
  }
  private _offRender() {
    this.flow.flowConnect.offGroupContext.fillStyle = this.hitColor.rgbaCSSString;
    this.flow.flowConnect.offGroupContext.fillRect(this.position.x, this.position.y, this.width, this.height);
    this.flow.flowConnect.offGroupContext.fillRect(this.position.x, this.position.y - this.textHeight - 10, this.textWidth, this.textHeight + 10);
  }

  /** @hidden */
  onClick(screenPosition: Vector2, realPosition: Vector2) {
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
    let group = new Group(flow, Vector2.deSerialize(data.position), data.width, data.height, data.name, data.style, data.id, Color.deSerialize(data.hitColor));
    data.nodes.forEach(nodeId => {
      group.nodes.push(flow.nodes[nodeId]);
    });
    data.nodeDeltas.forEach(serializedVector => {
      group.nodeDeltas.push(Vector2.deSerialize(serializedVector));
    });

    return group;
  }
}
