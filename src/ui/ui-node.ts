import { Color, SerializedColor } from "../core/color.js";
import { Hooks } from "../core/hooks.js";
import { Node, NodeState } from "../core/node.js";
import { SerializedTerminal, Terminal } from "../core/terminal.js";
import { SerializedVector, Vector } from "../core/vector.js";
import { LOD, ViewPort } from "../common/enums.js";
import { get, uuid, intersects } from "../utils/utils.js";
import { Events, Renderable } from "../common/interfaces.js";

export abstract class UINode extends Hooks implements Events, Renderable {
  private _disabled: boolean;
  private _visible: boolean;

  renderState: ViewPort;
  hitColor: Color;
  style: any;
  propName: string;
  input: Terminal;
  output: Terminal;
  id: string;
  draggable: boolean;
  zoomable: boolean;
  width: number = 0;
  height: number = 0;
  children: UINode[];
  get context(): CanvasRenderingContext2D {
    return this.node.context;
  }
  get offUIContext(): OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D {
    return this.node.offUIContext;
  }
  position: Vector;

  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(disabled: boolean) {
    this._disabled = disabled;
    this.children.forEach((child) => (child.disabled = disabled));
  }
  get visible(): boolean {
    return this._visible;
  }
  set visible(value: boolean) {
    this._visible = value;
    this.node.ui.update();
  }

  constructor(
    public node: Node,
    position: Vector,
    public type: UIType,
    options: UINodeOptions = DefaultUINodeOptions()
  ) {
    super();

    this.setHitColor(options.hitColor);
    this.id = get(options.id, uuid());
    this.draggable = get(options.draggable, false);
    this.zoomable = get(options.zoomable, false);
    this._visible = get(options.visible, true);
    this.style = get(options.style, {});
    this.children = [];
    this.position = position;
    this.disabled = false;
    this.propName = options.propName;
    if (this.propName) {
      this.node.watch(this.propName, (oldVal, newVal) => this.onPropChange(oldVal, newVal));
    }
    this.input = options.input;
    this.output = options.output;

    if (this.input) {
      this.node.inputsUI.push(this.input);
      this.input.on("connect", () => (this.disabled = true));
      this.input.on("disconnect", () => (this.disabled = false));
    }
    if (this.output) this.node.outputsUI.push(this.output);
  }

  append(childs: UINode | UINode[]) {
    if (Array.isArray(childs)) this.children.push(...childs);
    else this.children.push(childs);

    this.update();

    // To fix a bug, when appending childs to UINodes in-between the tree, UI container's height won't update
    this.node.ui.update();
  }
  update(): void {
    this.reflow();
    this.call("update", this);
    this.children.forEach((child) => child.update());
  }
  updateRenderState() {
    if (this.node.renderState.nodeState === NodeState.MINIMIZED) return;

    let realPos = this.position.transform(this.node.flow.flowConnect.transform);
    this.renderState = intersects(
      0,
      0,
      this.node.flow.flowConnect.canvasDimensions.width,
      this.node.flow.flowConnect.canvasDimensions.height,
      realPos.x,
      realPos.y,
      realPos.x + this.width * this.node.flow.flowConnect.scale,
      realPos.y + this.height * this.node.flow.flowConnect.scale
    );

    this.children.forEach((child) => child.updateRenderState());
  }
  private setHitColor(hitColor: Color) {
    if (!hitColor) {
      hitColor = Color.Random();
      while (this.node.uiNodes.get(hitColor.rgbaString) || this.node.terminals.get(hitColor.rgbaString))
        hitColor = Color.Random();
    }
    this.hitColor = hitColor;
    this.node.uiNodes.set(this.hitColor.rgbaString, this);
  }
  render() {
    if (!this.visible) return;
    if (this.renderState === ViewPort.OUTSIDE) return;

    let context = this.context;
    if (this.node.renderState.lod === LOD.LOD1) {
      context.save();
      this.paintLOD1();
      context.restore();
    } else if (this.node.renderState.lod === LOD.LOD2) {
      context.save();
      this.paint();
      context.restore();

      this.offUIContext.save();
      this.offPaint();
      this.offUIContext.restore();
    } else {
      if (this.type === UIType.Container) {
        context.save();
        this.paintLOD1();
        context.restore();
      }
    }

    if (this.node.renderState.lod > 0) {
      if (this.input) this.input.render();
      if (this.output) this.output.render();
    }

    this.call("render", this);
    this.children.forEach((child) => child.render());
  }

  getProp() {
    return this.node.state[this.propName];
  }
  setProp(propValue: any) {
    this.node.state[this.propName] = propValue;
  }

  query(query: string): Array<UINode> {
    let result = [];
    query = query.trim();
    let queue: UINode[] = [this];
    while (queue.length !== 0) {
      let curr = queue.shift();
      if (curr.type === query) result.push(curr);
      curr.children.forEach((child) => queue.push(child));
    }

    return result;
  }

  abstract reflow(): void;
  abstract paint(): void;
  abstract paintLOD1(): void;
  abstract offPaint(): void;

  abstract onOver(screenPosition: Vector, realPosition: Vector): void;
  abstract onDown(screenPosition: Vector, realPosition: Vector): void;
  abstract onUp(screenPosition: Vector, realPosition: Vector): void;
  abstract onClick(screenPosition: Vector, realPosition: Vector): void;
  abstract onDrag(screenPosition: Vector, realPosition: Vector): void;
  abstract onEnter(screenPosition: Vector, realPosition: Vector): void;
  abstract onExit(screenPosition: Vector, realPosition: Vector): void;
  abstract onWheel(direction: boolean, screenPosition: Vector, realPosition: Vector): void;
  abstract onContextMenu(): void;
  abstract onPropChange(oldValue: any, newValue: any): void;
}

export interface UINodeStyle {
  grow?: number;
}

export interface SerializedUINode {
  id: string;
  type: UIType;
  hitColor: SerializedColor;
  style: any;
  propName: string;
  input: SerializedTerminal;
  output: SerializedTerminal;
  childs: SerializedUINode[];
}

export enum UIType {
  Button = "button",
  Container = "container",
  Display = "display",
  HorizontalLayout = "horizontal-layout",
  Stack = "stack",
  Image = "image",
  Input = "input",
  Label = "label",
  Select = "select",
  Slider = "slider",
  Dial = "dial",
  Source = "source",
  Toggle = "toggle",
  Envelope = "envelope",
  RadioGroup = "radiogroup",
  Slider2D = "slider2d",
  VSlider = "vslider",
}

interface UINodeOptions {
  draggable?: boolean;
  zoomable?: boolean;
  visible?: boolean;
  style?: any;
  propName?: string;
  input?: Terminal;
  output?: Terminal;
  id?: string;
  hitColor?: Color;
}
let DefaultUINodeOptions = (): UINodeOptions => {
  return {
    draggable: false,
    zoomable: false,
    visible: true,
    style: {},
    propName: null,
    input: null,
    output: null,
    id: uuid(),
    hitColor: null,
  };
};

export interface UINodeRenderParams {
  position: SerializedVector;
  width: number;
  height: number;
}
