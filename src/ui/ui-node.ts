import { Color } from "../core/color.js";
import { Hooks } from "../core/hooks.js";
import { Node, NodeState } from "../core/node.js";
import { Terminal, TerminalType } from "../core/terminal.js";
import { SerializedVector, Vector } from "../core/vector.js";
import { Align, LOD, ViewPort } from "../common/enums.js";
import { uuid, intersects, capitalize } from "../utils/utils.js";
import { Events, Renderable } from "../common/interfaces.js";
import { FlowConnect, Log } from "../flow-connect.js";

export abstract class UINode<T extends UINodeStyle = UINodeStyle> extends Hooks implements Renderable {
  private _disabled: boolean;
  private _visible: boolean;

  node: Node;
  type: string;

  renderState: ViewPort;
  hitColor: Color;
  abstract style: T;
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

  protected constructor() {
    super();

    this.children = [];
    this.disabled = false;
  }

  static create<T extends UINode = UINode>(
    type: string,
    node: Node,
    options: UINodeOptions = DefaultUINodeOptions(node)
  ): T {
    const construct = FlowConnect.getRegistered("ui", type);
    const uiNode = new construct(node, options);

    const { hitColor, id = uuid(), visible = true, style = {}, propName, position = Vector.Zero() } = options;

    uiNode.type = type;
    uiNode.node = node;
    uiNode.setHitColor(hitColor);
    uiNode.id = id;
    uiNode._visible = visible;
    uiNode.style = style;
    uiNode.position = position;
    uiNode.propName = propName;

    if (propName) {
      node.watch(propName, (oldVal, newVal) => uiNode.onPropChange(oldVal, newVal));
    }

    uiNode.created(options);

    return uiNode as T;
  }

  protected createTerminal(type: TerminalType, dataType: string): Terminal;
  protected createTerminal(type: TerminalType, dataType: string, name: string): Terminal;
  protected createTerminal(type: TerminalType, dataType: string, name?: string): Terminal {
    if ((type === TerminalType.IN && this.input) || (type === TerminalType.OUT && this.output)) {
      Log.error("Terminal for UINode was already configured, ignoring terminal creation");
      return;
    }

    const terminal = name
      ? Terminal.create(this.node, type, dataType, { name })
      : Terminal.create(this.node, type, dataType);

    if (type === TerminalType.IN) {
      this.input = terminal;
      this.node.inputsUI.push(terminal);

      terminal.on("connect", () => (this.disabled = true));
      terminal.on("disconnect", () => (this.disabled = false));
    } else {
      this.output = terminal;
      this.node.outputsUI.push(terminal);
    }

    return terminal;
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
      if (this.type === "core/container") {
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

  sendEvent<T extends UIEvent>(type: string, event: T): void {
    if (this.disabled) return;

    type = `on${type
      .split("-")
      .map((part) => capitalize(part))
      .reduce((prev, curr) => prev + curr, "")}`;

    (this as any)[type](event);
    this.call(type, event);
  }

  onWheel(_: UIWheelEvent): void {}
  onEnter(_disabled: UIEvent): void {}
  onExit(_disabled: UIEvent): void {}
  onOver(_: UIEvent): void {}
  onDown(_: UIEvent): void {}
  onUp(_: UIEvent): void {}
  onClick(_: UIEvent): void {}
  onDrag(_: UIEvent): void {}
  onContextMenu(_: UIEvent): void {}

  protected abstract created(options: UINodeOptions): void;
  protected abstract reflow(): void;
  protected abstract paint(): void;
  protected abstract paintLOD1(): void;
  protected abstract offPaint(): void;
  protected abstract onPropChange(oldValue: any, newValue: any): void;
}

export interface UINodeStyle {
  grow?: number;
  align?: Align;
}

export interface UINodeOptions<T extends UINodeStyle = UINodeStyle> {
  input?: boolean;
  output?: boolean;
  style?: T;
  id?: string;
  hitColor?: Color;
  visible?: boolean;
  propName?: string;
  height?: number;
  position?: Vector;
}
const DefaultUINodeOptions = (node: Node): UINodeOptions => {
  return {
    visible: true,
    style: {},
    propName: null,
    id: uuid(),
    hitColor: null,
    height: node.style.rowHeight,
    position: Vector.Zero(),
  };
};

export interface UINodeRenderParams {
  position: SerializedVector;
  width: number;
  height: number;
}

export interface UIEvent<T extends UINode = UINode> {
  screenPos: Vector;
  realPos: Vector;
  target: T;
}

export interface UIWheelEvent extends UIEvent {
  direction: boolean;
}
