import { SerializedVector, Vector } from "./vector.js";
import { ViewPort, LOD, Align } from "../common/enums.js";
import { UINode, UINodeOptions, UIWheelEvent } from "../ui/ui-node.js";
import { Container, ContainerOptions } from "../ui/container.js";
import { uuid, intersects } from "../utils/utils.js";
import { Color, SerializedColor } from "./color.js";
import { Flow, FlowState } from "./flow.js";
import { Group } from "./group.js";
import { Terminal, TerminalType, SerializedTerminal } from "./terminal.js";
import { Hooks } from "./hooks.js";
import {
  DataPersistenceProvider,
  Events,
  NodeRenderers,
  Renderable,
  RenderFn,
  RenderState,
  Serializable,
} from "../common/interfaces.js";
import { Connector } from "./connector.js";
import { Log } from "../utils/logger.js";
import { FlowConnect } from "../flow-connect.js";

export abstract class Node extends Hooks implements Events, Serializable<SerializedNode>, Renderable {
  //#region Properties
  renderers: NodeRenderers = {};

  private _width: number;
  private _zIndex: number;
  private _position: Vector;
  private stateObserver;

  currHitTerminal: Terminal;
  prevHitTerminal: Terminal;
  currHitUINode: UINode;
  prevHitUINode: UINode;

  flow: Flow;
  name: string;
  id: string;
  type: string;
  hitColor: Color;
  private _style: NodeStyle;
  focused: boolean = false;
  ui: Container;
  uiNodes: Map<string, UINode>;
  terminals: Map<string, Terminal>;
  inputs: Terminal[] = [];
  outputs: Terminal[] = [];
  inputsUI: Terminal[] = [];
  outputsUI: Terminal[] = [];
  state: Record<string, any>;
  group: Group = null;
  nodeButtons: Map<string, NodeButton>;
  renderState: RenderState = { viewport: ViewPort.INSIDE, nodeState: NodeState.MAXIMIZED, lod: LOD.LOD2 };
  //#endregion

  //#region Accessors
  get style(): NodeStyle {
    return this._style;
  }
  set style(style: NodeStyle) {
    this._style = { ...this._style, ...style };
  }
  get height(): number {
    return this.ui.height;
  }
  get context(): CanvasRenderingContext2D {
    return this.flow.flowConnect.context;
  }
  get offContext(): OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D {
    return this.flow.flowConnect.offContext;
  }
  get offUIContext(): OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D {
    return this.flow.flowConnect.offUIContext;
  }
  get position(): Vector {
    return this._position;
  }
  set position(position: Vector) {
    this._position = position;
    this.reflow();
    this.ui.update();
    this.updateRenderState();
  }
  get zIndex(): number {
    return this._zIndex;
  }
  set zIndex(zIndex: number) {
    if (this.flow.sortedNodes.remove(this)) {
      this._zIndex = zIndex;
      this.flow.sortedNodes.add(this);
    } else {
      this._zIndex = zIndex;
    }
  }
  get width(): number {
    return this._width;
  }
  set width(width: number) {
    this._width = width;
    this.ui.width = width;
    this.ui.update();
  }
  //#endregion

  protected constructor() {
    super();

    this._zIndex = 0;

    this.stateObserver = new Hooks();
    this.uiNodes = new Map();
    this.terminals = new Map();
    this.nodeButtons = new Map();
  }

  static create<T extends Node = Node>(
    type: string,
    flow: Flow,
    position: Vector,
    options: NodeOptions = DefaultNodeOptions(),
    isDeserialized: boolean = false
  ): T {
    const construct = FlowConnect.getRegistered("node", type);
    const node = new construct(flow, options);

    const { name = "New Node", width = 100, style = {}, id = uuid(), state = {}, hitColor, inputs, outputs } = options;

    node.flow = flow;
    node.type = type;
    node.name = name;
    node._width = width;
    node.style = { ...DefaultNodeStyle(), ...(flow.flowConnect.getDefaultStyle("node", type) || {}), ...style };
    node.id = id;
    node.state = state;
    node._position = position;
    node.ui = node.createUI<Container, ContainerOptions>("core/container", { width: node.width });

    node.setHitColor(hitColor);
    node.setupTerminals(inputs, outputs);
    node.reflow();
    node.ui.update();
    node.addNodeButton((n) => n.toggle(), Node.renderControlButton, Align.Left);
    node.on("transform", (n) => n.updateRenderState());

    !isDeserialized && node.setupIO(options);
    node.created(options);
    node.setupState(node.state);

    node.ui.update();
    node.reflow();

    return node as T;
  }

  protected abstract setupIO(options: NodeOptions): void;
  protected abstract created(options: NodeOptions): void;
  protected abstract process(inputs: any[]): void;

  //#region Methods
  private setupTerminals(inputs: SerializedTerminal[], outputs: SerializedTerminal[]) {
    inputs &&
      this.inputs.push(
        ...inputs.map((input) =>
          Terminal.create(this, TerminalType.IN, input.dataType, {
            name: input.name,
            id: input.id ? input.id : null,
            hitColor: input.hitColor ? Color.create(input.hitColor) : null,
          })
        )
      );
    outputs &&
      this.outputs.push(
        ...outputs.map((output) =>
          Terminal.create(this, TerminalType.OUT, output.dataType, {
            name: output.name,
            id: output.id ? output.id : null,
            hitColor: output.hitColor ? Color.create(output.hitColor) : null,
          })
        )
      );
  }
  private setupState(state: any) {
    this.state = new Proxy<any>(
      {},
      {
        set: (target, prop, value) => {
          let oldValue = target[prop];
          target[prop] = value;
          this.stateObserver.call(prop as string, oldValue, value);
          return true;
        },
      }
    );

    Object.keys(state).forEach((key) => (this.state[key] = state[key]));
  }
  watch(propName: string, callback: (oldVal: any, newVal: any) => void): number {
    if (typeof this.state[propName] !== "undefined") {
      return this.stateObserver.on(propName, callback);
    } else {
      Log.error(`Cannot watch prop '${propName}', prop not found`);
    }
  }
  unwatch(propName: string, id: number) {
    if (typeof this.state[propName] !== "undefined") {
      this.stateObserver.off(propName, id);
    } else {
      Log.error(`Cannot unwatch prop '${propName}', prop not found`);
    }
  }
  private setHitColor(hitColor?: Color) {
    if (!hitColor) {
      hitColor = Color.Random();
      while (this.flow.nodeHitColors.get(hitColor.rgbaString)) hitColor = Color.Random();
    }
    this.hitColor = hitColor;
    this.flow.nodeHitColors.set(this.hitColor.rgbaString, this);
  }
  addNodeButton(
    onClick: (node: Node) => void,
    render: RenderFn<NodeButton, NodeButtonRenderParams>,
    align: Align
  ): NodeButton {
    let newNodeButton = new NodeButton(this, onClick, render, align);

    let noOfButtons =
      [...this.nodeButtons.values()].filter((nodeButton) => nodeButton.align === newNodeButton.align).length - 1;
    let deltaX;
    if (align === Align.Left) deltaX = noOfButtons * (this.style.nodeButtonSize + this.style.nodeButtonSpacing);
    else
      deltaX =
        this.width -
        noOfButtons * (this.style.nodeButtonSize + this.style.nodeButtonSpacing) -
        this.style.nodeButtonSize;
    newNodeButton.deltaX = deltaX;

    return newNodeButton;
  }
  private reflow(): void {
    let y = this.position.y + this.style.terminalRowHeight / 2 + this.style.padding / 2 + this.style.titleHeight;
    if (this.inputs.length > this.outputs.length) {
      this.recalculateInputTerminals(y);
      y =
        this.position.y +
        (this.inputs.length * this.style.terminalRowHeight) / 2 -
        (this.outputs.length * this.style.terminalRowHeight) / 2 +
        this.style.terminalRowHeight / 2 +
        this.style.padding / 2 +
        this.style.titleHeight;
      this.recalculateOutputTerminals(y);
    } else {
      this.recalculateOutputTerminals(y);
      y =
        this.position.y +
        (this.outputs.length * this.style.terminalRowHeight) / 2 -
        (this.inputs.length * this.style.terminalRowHeight) / 2 +
        this.style.terminalRowHeight / 2 +
        this.style.padding / 2 +
        this.style.titleHeight;
      this.recalculateInputTerminals(y);
    }
  }
  private updateRenderState() {
    let realPos = this.position.transform(this.flow.flowConnect.transform);
    this.renderState.viewport = intersects(
      0,
      0,
      this.flow.flowConnect.canvasDimensions.width,
      this.flow.flowConnect.canvasDimensions.height,
      realPos.x,
      realPos.y,
      realPos.x + this.width * this.flow.flowConnect.scale,
      realPos.y +
        (this.renderState.nodeState === NodeState.MAXIMIZED ? this.ui.height : this.style.titleHeight) *
          this.flow.flowConnect.scale
    );

    if (this.flow.flowConnect.scale > 0.6) this.renderState.lod = LOD.LOD2;
    else if (this.flow.flowConnect.scale <= 0.6 && this.flow.flowConnect.scale > 0.3) this.renderState.lod = LOD.LOD1;
    else this.renderState.lod = LOD.LOD0;

    if (this.renderState.viewport === ViewPort.INTERSECT) {
      this.ui.updateRenderState();
    }
  }
  private recalculateInputTerminals(y: number) {
    this.inputs.forEach((terminal) => {
      terminal.position.x = this.position.x - this.style.terminalStripMargin - terminal.style.radius;
      terminal.position.y = y;
      y += this.style.terminalRowHeight;
    });
  }
  private recalculateOutputTerminals(y: number) {
    this.outputs.forEach((terminal) => {
      terminal.position.x = this.position.x + this.ui.width + this.style.terminalStripMargin + terminal.style.radius;
      terminal.position.y = y;
      y += this.style.terminalRowHeight;
    });
  }
  getHitTerminal(hitColor: string, screenPosition: Vector, realPosition: Vector) {
    let hitTerminal = null;

    realPosition = realPosition.transform(this.flow.flowConnect.transform);
    let thisRealPosition = this.position.transform(this.flow.flowConnect.transform);
    if (
      (this.inputs.length + this.inputsUI.length > 0 && realPosition.x < thisRealPosition.x) ||
      (this.outputs.length + this.outputsUI.length > 0 &&
        realPosition.x > thisRealPosition.x + this.ui.width * this.flow.flowConnect.scale)
    ) {
      hitTerminal = this.terminals.get(hitColor);
    }

    if (this.currHitTerminal && this.currHitTerminal !== hitTerminal) {
      this.currHitTerminal.onExit(screenPosition, realPosition);
      hitTerminal?.onEnter(screenPosition, realPosition);
    }

    return hitTerminal;
  }
  getHitUINode(hitColor: string): UINode {
    let uiNode = this.uiNodes.get(hitColor);
    if (uiNode instanceof Container) return null;
    return uiNode;
  }
  private getHitNodeButton(hitColor: string): NodeButton {
    return this.nodeButtons.get(hitColor);
  }
  run() {
    if (this.flow.state === FlowState.Stopped) return;

    const inputs = this.inputs.map((terminal) => (terminal.connectors.length > 0 ? terminal.connectors[0].data : null));

    this.process(inputs);
    this.call("process", this, inputs);
  }

  render(): void {
    if (this.renderState.viewport === ViewPort.OUTSIDE) return;
    if (this.renderState.nodeState === NodeState.MAXIMIZED) this.ui.render();

    let context = this.context;
    context.save();
    this.renderTerminals(context);
    this.renderName(context);
    this.renderFocused(context);

    let scopeFlowConnect = this.flow.flowConnect.getRegisteredRenderer("node");
    let scopeFlow = this.flow.renderers.node;
    let scopeNode = this.renderers.node;
    const renderFn =
      (scopeNode && scopeNode(this)) ||
      (scopeFlow && scopeFlow(this)) ||
      (scopeFlowConnect && scopeFlowConnect(this)) ||
      this._render;
    renderFn(context, this.getRenderParams(), this);
    context.restore();

    this.nodeButtons.forEach((nodeButton) => nodeButton.render());

    this.offContext.save();
    this._offRender();
    this.offContext.restore();

    this.call("render", this);
  }
  private renderTerminals(context: CanvasRenderingContext2D) {
    if (this.renderState.nodeState === NodeState.MAXIMIZED) {
      if (this.renderState.lod > 0) {
        this.inputs.forEach((terminal) => terminal.render());
        this.outputs.forEach((terminal) => terminal.render());
      }

      context.fillStyle = this.style.color;
      context.font = this.style.fontSize + " " + this.style.font;
      context.textBaseline = "middle";
      this.inputs.forEach((terminal) => {
        context.fillText(
          terminal.name,
          terminal.position.x + terminal.style.radius + this.style.terminalStripMargin + this.style.padding,
          terminal.position.y
        );
      });
      this.outputs.forEach((terminal) => {
        context.fillText(
          terminal.name,
          terminal.position.x -
            terminal.style.radius -
            this.style.terminalStripMargin -
            this.style.padding -
            context.measureText(terminal.name).width,
          terminal.position.y
        );
      });
    } else {
      context.fillStyle = this.style.minimizedTerminalColor;
      if (this.inputs.length + this.inputsUI.length > 0) {
        let radius = this.inputs.length > 0 ? this.inputs[0].style.radius : this.inputsUI[0].style.radius;
        context.fillRect(
          this.position.x - this.style.terminalStripMargin - radius * 2,
          this.position.y + this.style.titleHeight / 2 - radius,
          radius * 2,
          radius * 2
        );
      }
      if (this.outputs.length + this.outputsUI.length > 0) {
        let radius = this.outputs.length > 0 ? this.outputs[0].style.radius : this.outputsUI[0].style.radius;
        context.fillRect(
          this.position.x + this.width + this.style.terminalStripMargin,
          this.position.y + this.style.titleHeight / 2 - radius,
          radius * 2,
          radius * 2
        );
      }
    }
  }
  private renderName(context: CanvasRenderingContext2D) {
    context.fillStyle = this.style.titleColor;
    context.font = this.style.titleFontSize + " " + this.style.titleFont;
    context.textBaseline = "middle";
    context.fillText(
      this.name,
      this.position.x + this.ui.width / 2 - context.measureText(this.name).width / 2,
      this.position.y + this.style.titleHeight / 2
    );
  }
  private renderFocused(context: CanvasRenderingContext2D) {
    if (this.focused) {
      context.strokeStyle = this.style.outlineColor;
      context.lineWidth = 2;

      let inputTerminalsWidth;
      if (this.inputs.length === 0) {
        inputTerminalsWidth = this.inputsUI.length === 0 ? 0 : this.inputsUI[0].style.radius * 2;
      } else {
        inputTerminalsWidth = this.inputs[0].style.radius * 2;
      }
      inputTerminalsWidth += this.style.terminalStripMargin * 2;

      let outputTerminalsWidth;
      if (this.outputs.length === 0) {
        outputTerminalsWidth = this.outputsUI.length === 0 ? 0 : this.outputsUI[0].style.radius * 2;
      } else {
        outputTerminalsWidth = this.outputs[0].style.radius * 2;
      }
      outputTerminalsWidth += this.style.terminalStripMargin * 2;

      context.strokeRoundRect(
        this.position.x - inputTerminalsWidth,
        this.position.y,
        this.width + inputTerminalsWidth + outputTerminalsWidth,
        this.renderState.nodeState === NodeState.MAXIMIZED
          ? this.ui.height + this.style.padding
          : this.style.titleHeight,
        4
      );
    }
  }
  private _render() {
    /**/
  }
  private _offRender() {
    this.offContext.fillStyle = this.hitColor.rgbaCSSString;
    let x = this.position.x;
    let y = this.position.y;
    let inputTerminalsStripWidth = 0,
      outputTerminalsStripWidth = 0;
    if (this.inputs.length + this.inputsUI.length !== 0) {
      let radius = this.inputs.length > 0 ? this.inputs[0].style.radius : this.inputsUI[0].style.radius;
      x -= this.style.terminalStripMargin + radius * 2;
      inputTerminalsStripWidth = radius * 2 + this.style.terminalStripMargin;
    }
    if (this.outputs.length + this.outputsUI.length !== 0) {
      let radius = this.outputs.length > 0 ? this.outputs[0].style.radius : this.outputsUI[0].style.radius;
      outputTerminalsStripWidth = radius * 2 + this.style.terminalStripMargin;
    }
    this.offContext.fillRect(
      x,
      y,
      this.ui.width + inputTerminalsStripWidth + outputTerminalsStripWidth,
      this.renderState.nodeState === NodeState.MAXIMIZED ? this.ui.height : this.style.titleHeight
    );
  }
  private static renderControlButton(
    context: CanvasRenderingContext2D,
    params: NodeButtonRenderParams,
    nodeButton: NodeButton
  ) {
    let style = nodeButton.node.style;
    context.fillStyle = style.maximizeButtonColor;
    context.fillRect(params.position.x, params.position.y, style.nodeButtonSize, style.nodeButtonSize);
  }
  private getRenderParams(): NodeRenderParams {
    return {
      position: this.position.serialize(),
      width: this.width,
      height: this.ui.height,
      focus: this.focused,
    };
  }
  addTerminals(terminals: Terminal[] | SerializedTerminal[]) {
    terminals?.forEach((terminal) => this.addTerminal(terminal));
  }
  addTerminal(terminal: Terminal | SerializedTerminal): Terminal {
    let t: Terminal = null;
    if (!(terminal instanceof Terminal)) {
      t = Terminal.create(this, terminal.type, terminal.dataType, {
        name: terminal.name,
        propName: terminal.propName,
        style: terminal.style,
        id: terminal.id,
        hitColor: terminal.hitColor ? Color.create(terminal.hitColor) : null,
      });
    } else {
      t = terminal;
    }

    (terminal.type === TerminalType.IN ? this.inputs : this.outputs).push(t);
    this.ui.update();
    this.reflow();

    return t;
  }
  removeTerminal(terminal: Terminal) {
    let type = terminal.type;
    let index = type === TerminalType.IN ? this.inputs.indexOf(terminal) : this.outputs.indexOf(terminal);
    if (index < 0) {
      Log.error("Cannot remove terminal, terminal not found");
      return;
    }
    terminal.disconnect();
    if (type === TerminalType.IN) this.inputs.splice(index, 1);
    else this.outputs.splice(index, 1);
    terminal.offAll();

    this.ui.update();
    this.reflow();
  }
  getInput(terminal: string | number): any {
    if (typeof terminal === "string") {
      let inputTerminal = this.inputs.find((currTerm) => currTerm.name === terminal);
      if (inputTerminal) return inputTerminal.getData();
    } else {
      if (this.inputs[terminal]) return this.inputs[terminal].getData();
    }
    return null;
  }
  getInputs(): any[] {
    return this.inputs.map((terminal) => terminal.getData());
  }
  setOutputs(outputs: string | number | Record<string, any>, data?: any) {
    if (typeof outputs === "string") {
      let outputTerminal = this.outputs.find((term) => term.name === outputs);
      if (outputTerminal) outputTerminal.setData(data);
    } else if (typeof outputs === "number") {
      if (this.outputs[outputs]) this.outputs[outputs].setData(data);
    } else {
      let outputData = new Map<Terminal, any>();
      Object.entries(outputs).forEach((entry) => {
        let terminal = this.outputs.find((term) => term.name === entry[0]);
        if (terminal) outputData.set(terminal, entry[1]);
        else throw Log.error("Terminal '" + entry[0] + "' not found");
      });
      let groupedConnectors = new Map<Node, Connector[]>();
      let outputDataIterator = outputData.keys();

      let curr: Terminal = outputDataIterator.next().value;
      while (curr) {
        curr.connectors.forEach((connector) => {
          if (groupedConnectors.has(connector.endNode)) groupedConnectors.get(connector.endNode).push(connector);
          else groupedConnectors.set(connector.endNode, [connector]);
        });
        curr = outputDataIterator.next().value;
      }
      let gCntrsIterator = groupedConnectors.values();

      let connectors: Connector[] = gCntrsIterator.next().value;
      while (connectors) {
        for (let i = 1; i < connectors.length; i++) connectors[i].setData(outputData.get(connectors[i].start));
        connectors[0].data = outputData.get(connectors[0].start);
        connectors = gCntrsIterator.next().value;
      }
    }

    // If FlowState is Idle, start a partial run of all the dirty nodes this method has created
    if (this.flow.state === FlowState.Idle) {
      this.flow.executionGraph.start();
    }
  }
  toggle() {
    this.renderState.nodeState =
      this.renderState.nodeState === NodeState.MAXIMIZED ? NodeState.MINIMIZED : NodeState.MAXIMIZED;
  }
  dispose(): void {
    this.flow.removeNode(this.id);
  }
  createUI<T extends UINode = UINode, O extends UINodeOptions = UINodeOptions>(type: string, options: O): T {
    const uiNode = UINode.create<T>(type, this, options);
    return uiNode;
  }
  //#endregion

  //#region Events
  onDown(screenPos: Vector, realPos: Vector): void {
    this.call("down", this, screenPos, realPos);

    let hitColor = Color.rgbaToString(
      this.flow.flowConnect.offUIContext.getImageData(screenPos.x, screenPos.y, 1, 1).data
    );

    this.currHitUINode = this.getHitUINode(hitColor);
    this.currHitUINode && this.currHitUINode.sendEvent("down", { screenPos, realPos, target: this.currHitUINode });

    let hitTerminal = this.getHitTerminal(hitColor, screenPos, realPos);
    if (hitTerminal) {
      this.currHitTerminal = hitTerminal;
      this.currHitTerminal.onDown(screenPos, realPos);
    }
  }
  onOver(screenPos: Vector, realPos: Vector): void {
    this.call("over", this, screenPos, realPos);

    let hitColor = Color.rgbaToString(
      this.flow.flowConnect.offUIContext.getImageData(screenPos.x, screenPos.y, 1, 1).data
    );

    let hitTerminal = this.getHitTerminal(hitColor, screenPos, realPos);

    if (hitTerminal !== this.prevHitTerminal) {
      this.prevHitTerminal && this.prevHitTerminal.onExit(screenPos, realPos);
      hitTerminal && hitTerminal.onEnter(screenPos, realPos);
    } else {
      hitTerminal && !this.currHitTerminal && hitTerminal.onOver(screenPos, realPos);
    }
    this.prevHitTerminal = hitTerminal;

    let hitUINode = this.getHitUINode(hitColor);
    if (hitUINode !== this.prevHitUINode) {
      this.prevHitUINode && this.prevHitUINode.sendEvent("exit", { screenPos, realPos, target: this.prevHitUINode });
      hitUINode && hitUINode.sendEvent("enter", { screenPos, realPos, target: hitUINode });
    } else {
      hitUINode && !this.currHitUINode && hitUINode.sendEvent("over", { screenPos, realPos, target: hitUINode });
    }
    this.prevHitUINode = hitUINode;
  }
  onEnter(screenPosition: Vector, realPosition: Vector): void {
    this.call("enter", this, screenPosition, realPosition);
  }
  onExit(screenPosition: Vector, realPosition: Vector): void {
    this.call("exit", this, screenPosition, realPosition);

    let hitColor = Color.rgbaToString(
      this.flow.flowConnect.offUIContext.getImageData(screenPosition.x, screenPosition.y, 1, 1).data
    );

    let hitTerminal = this.getHitTerminal(hitColor, screenPosition, realPosition);
    hitTerminal && hitTerminal.onExit(screenPosition, realPosition);
    this.prevHitTerminal && this.prevHitTerminal.onExit(screenPosition, realPosition);
    this.prevHitTerminal = null;
    this.currHitTerminal && this.currHitTerminal.onExit(screenPosition, realPosition);
  }
  onUp(screenPos: Vector, realPos: Vector): void {
    this.call("up", this, screenPos, realPos);

    let hitColor = Color.rgbaToString(
      this.flow.flowConnect.offUIContext.getImageData(screenPos.x, screenPos.y, 1, 1).data
    );

    this.currHitUINode = null;
    let hitUINode = this.getHitUINode(hitColor);
    hitUINode &&
      hitUINode.sendEvent("up", { screenPos: screenPos.clone(), realPos: realPos.clone(), target: hitUINode });

    let hitTerminal = this.getHitTerminal(hitColor, screenPos, realPos);
    hitTerminal && hitTerminal.onUp(screenPos, realPos);
  }
  onClick(screenPos: Vector, realPos: Vector): void {
    this.call("click", this, screenPos, realPos);

    let hitColor = Color.rgbaToString(
      this.flow.flowConnect.offUIContext.getImageData(screenPos.x, screenPos.y, 1, 1).data
    );
    if (realPos.y < this.position.y + this.style.titleHeight * this.flow.flowConnect.scale) {
      let hitNodeButton = this.getHitNodeButton(hitColor);
      hitNodeButton && hitNodeButton.onClick(this);
    } else {
      this.currHitTerminal && this.currHitTerminal.onClick(screenPos, realPos);

      let hitUINode = this.getHitUINode(hitColor);
      hitUINode &&
        hitUINode.sendEvent("click", { screenPos: screenPos.clone(), realPos: realPos.clone(), target: hitUINode });
    }
  }
  onDrag(screenPos: Vector, realPos: Vector): void {
    this.call("drag", this, screenPos, realPos);

    let hitColor = Color.rgbaToString(
      this.flow.flowConnect.offUIContext.getImageData(screenPos.x, screenPos.y, 1, 1).data
    );
    let hitUINodeWhileDragging = this.getHitUINode(hitColor);

    if (this.currHitUINode && this.currHitUINode.draggable) {
      if (hitUINodeWhileDragging === this.currHitUINode) {
        this.currHitUINode.sendEvent("drag", { screenPos, realPos, target: this.currHitUINode });
      } else {
        this.currHitUINode.sendEvent("exit", { screenPos, realPos, target: this.currHitUINode });
        this.currHitUINode = null;
        this.flow.flowConnect.currHitNode = null;
        this.flow.flowConnect.pointers = [];
      }
    }
  }
  onContextMenu(screenPos: Vector, realPos: Vector): void {
    this.call("rightclick", this);

    if (this.currHitUINode)
      this.currHitUINode.sendEvent("context-menu", { screenPos, realPos, target: this.currHitUINode });
  }
  onWheel(direction: boolean, screenPos: Vector, realPos: Vector): void {
    this.call("wheel", this, direction, screenPos, realPos);

    let hitColor = Color.rgbaToString(
      this.flow.flowConnect.offUIContext.getImageData(screenPos.x, screenPos.y, 1, 1).data
    );
    let hitUINode = this.getHitUINode(hitColor);

    hitUINode &&
      hitUINode.zoomable &&
      hitUINode.sendEvent<UIWheelEvent>("wheel", { screenPos, realPos, target: hitUINode, direction });
  }
  //#endregion

  private async serializeState(
    state: Record<string, any>,
    persist?: DataPersistenceProvider
  ): Promise<Record<string, any>> {
    for (let key in state) {
      if (state[key] instanceof File) {
        if (persist) {
          const id = uuid();
          await persist(id, state[key]);
          state[key] = `raw##${id}`;
        } else {
          state[key] = null;
        }
      } else if (state[key] instanceof Vector) {
        state[key] = state[key].serialize();
      } else if (state[key] instanceof AudioBuffer) {
        state[key] = null;
      } else if (typeof state[key] === "object") {
        state[key] = await this.serializeState(state[key]);
      }
    }
    return state;
  }

  async serialize(persist?: DataPersistenceProvider): Promise<SerializedNode> {
    const serializedState = await this.serializeState({ ...this.state }, persist);

    return Promise.resolve<SerializedNode>({
      id: this.id,
      name: this.name,
      type: this.type,
      position: this.position.serialize(),
      width: this.width,
      state: serializedState,
      inputs: this.inputs.map((terminal) => terminal.serialize()),
      outputs: this.outputs.map((terminal) => terminal.serialize()),
      style: this.style,
      hitColor: this.hitColor.serialize(),
      zIndex: this.zIndex,
      focused: this.focused,
      renderState: this.renderState,
    });
  }
}

export interface NodeRenderParams {
  position: SerializedVector;
  width: number;
  height: number;
  focus: boolean;
}
export enum NodeState {
  MAXIMIZED = "Maximized",
  MINIMIZED = "Minimized",
}

export interface NodeStyle {
  font?: string;
  fontSize?: string;
  titleFont?: string;
  titleFontSize?: string;
  padding?: number;
  spacing?: number;
  rowHeight?: number;
  color?: string;
  titleColor?: string;
  titleHeight?: number;
  terminalRowHeight?: number;
  terminalStripMargin?: number;
  maximizeButtonColor?: string;
  expandButtonColor?: string;
  minimizedTerminalColor?: string;
  nodeButtonSize?: number;
  nodeButtonSpacing?: number;
  outlineColor?: string;
}
const DefaultNodeStyle = (): NodeStyle => ({
  font: "arial",
  fontSize: ".75rem",
  titleFont: "arial",
  titleFontSize: ".85rem",
  color: "#000",
  titleColor: "#000",
  maximizeButtonColor: "darkgrey",
  nodeButtonSize: 10,
  nodeButtonSpacing: 5,
  expandButtonColor: "#000",
  minimizedTerminalColor: "green",
  outlineColor: "#000",
  padding: 10,
  spacing: 10,
  rowHeight: 20,
  titleHeight: 29,
  terminalRowHeight: 24,
  terminalStripMargin: 8,
});

export interface SerializedNode {
  hitColor: SerializedColor;
  zIndex: number;
  focused: boolean;
  id: string;
  position: SerializedVector;
  state: Record<string, any>;
  renderState: RenderState;
  inputs: SerializedTerminal[];
  outputs: SerializedTerminal[];
  name: string;
  type: string;
  style: NodeStyle;
  width: number;
}

export interface NodeOptions {
  name: string;
  width?: number;
  style?: NodeStyle;
  state?: Object;
  id?: string;
  hitColor?: Color;
  inputs?: SerializedTerminal[];
  outputs?: SerializedTerminal[];
}
const DefaultNodeOptions = (): NodeOptions => ({
  name: "New Node",
  width: 100,
  style: {},
  state: {},
  id: uuid(),
});

export class NodeButton extends Hooks implements Renderable {
  renderer: RenderFn<NodeButton, NodeButtonRenderParams>;
  style: Record<string, any> = {};

  hitColor: Color;
  deltaX: number = 0;

  constructor(
    public node: Node,
    public onClick: (n: Node) => void,
    renderer: RenderFn<NodeButton, NodeButtonRenderParams>,
    public align: Align,
    style?: Record<string, any>
  ) {
    super();

    this.style = style ?? {};
    this.setHitColor();
    this.renderer = renderer;
  }

  private setHitColor() {
    let color = Color.Random();
    while (this.node.nodeButtons.get(color.rgbaString)) color = Color.Random();
    this.hitColor = color;
    this.node.nodeButtons.set(this.hitColor.rgbaString, this);
  }
  render() {
    this.node.context.save();
    this.renderer(this.node.context, this.getRenderParams(), this);
    this.node.context.restore();

    this.node.offUIContext.save();
    this._offUIRender();
    this.node.offUIContext.restore();

    this.call("render", this);
  }
  private getRenderParams(): NodeButtonRenderParams {
    let position = this.node.position.serialize();
    position.x += this.deltaX;
    position.y += this.node.style.titleHeight / 2 - this.node.style.nodeButtonSize / 2;
    return { position };
  }
  private _offUIRender() {
    this.node.offUIContext.fillStyle = this.hitColor.rgbaCSSString;
    this.node.offUIContext.fillRect(
      this.node.position.x + this.deltaX,
      this.node.position.y + this.node.style.titleHeight / 2 - this.node.style.nodeButtonSize / 2,
      this.node.style.nodeButtonSize,
      this.node.style.nodeButtonSize
    );
  }
}
export interface NodeButtonRenderParams {
  position: SerializedVector;
}
