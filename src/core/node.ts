import { SerializedVector, Vector } from "./vector.js";
import { ViewPort, LOD, Align } from "../common/enums.js";
import {
  VSlider,
  VSliderStyle,
  Slider2D,
  Slider2DStyle,
  RadioGroup,
  RadioGroupStyle,
  Envelope,
  EnvelopeStyle,
  Dial,
  DialStyle,
  Container,
  ContainerRenderParams,
  SerializedContainer,
  Label,
  LabelStyle,
  Button,
  ButtonStyle,
  Image,
  ImageStyle,
  HorizontalLayout,
  HorizontalLayoutStyle,
  Toggle,
  ToggleStyle,
  Select,
  SelectStyle,
  Source,
  SourceStyle,
  Display,
  DisplayStyle,
  CustomRendererConfig,
  Input,
  InputStyle,
  Stack,
  StackStyle,
  Slider,
  SliderStyle,
  UINode,
} from "../ui/index.js";
import { get, uuid, intersects } from "../utils/utils.js";
import { Color, SerializedColor } from "./color.js";
import { Flow, FlowState, SerializedFlow } from "./flow.js";
import { Group } from "./group.js";
import { Terminal, TerminalType, TerminalStyle, SerializedTerminal, TerminalRenderParams } from "./terminal.js";
import { Hooks } from "./hooks.js";
import {
  DataPersistenceProvider,
  Events,
  Renderable,
  RenderFunction,
  RenderResolver,
  RenderState,
  Serializable,
} from "../common/interfaces.js";
import { Connector } from "./connector.js";
import { Log } from "../utils/logger.js";
import { FlowConnect } from "../flow-connect.js";

export abstract class Node extends Hooks implements Events, Serializable<SerializedNode>, Renderable {
  //#region Properties
  renderResolver: {
    node?: RenderResolver<Node, NodeRenderParams>;
    nodeButton?: RenderResolver<NodeButton, NodeButtonRenderParams>;
    terminal?: RenderResolver<Terminal, TerminalRenderParams>;
    uiContainer?: RenderResolver<Container, ContainerRenderParams>;
  } = {};

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
  style: NodeStyle;
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
    const construct = flow.flowConnect.getRegistered(type);
    const node = new construct(flow, options);

    node.flow = flow;
    node.type = type;
    options = get(options, DefaultNodeOptions());
    node.name = get(options.name, "New Node");
    node._width = get(options.width, 100);
    node.style = { ...DefaultNodeStyle(), ...get(options.style, {}) };
    node.id = get(options.id, uuid());
    node.state = get(options.state, {});
    node._position = position;
    node.ui = new Container(node, node.width);

    node.setHitColor(options.hitColor);
    node.setupTerminals(options.inputs, options.outputs);
    node.reflow();
    node.ui.update();
    node.addNodeButton((n) => n.toggle(), Node.renderControlButton, Align.Left);
    node.on("transform", (n) => n.updateRenderState());

    !isDeserialized && node.setupIO(options);
    node.setupState(node.state);
    node.created();

    return node as T;
  }

  protected abstract setupIO(options: NodeOptions): void;
  protected abstract created(): void;
  protected abstract process(inputs: any[]): void;

  //#region Methods
  setupTerminals(inputs: SerializedTerminal[], outputs: SerializedTerminal[]) {
    inputs &&
      this.inputs.push(
        ...inputs.map((input) =>
          Terminal.create(input.name, TerminalType.IN, input.dataType, {
            id: input.id ? input.id : null,
            hitColor: input.hitColor ? Color.create(input.hitColor) : null,
          }).build(this)
        )
      );
    outputs &&
      this.outputs.push(
        ...outputs.map((output) =>
          Terminal.create(output.name, TerminalType.OUT, output.dataType, {
            id: output.id ? output.id : null,
            hitColor: output.hitColor ? Color.create(output.hitColor) : null,
          }).build(this)
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
    render: RenderFunction<NodeButton, NodeButtonRenderParams>,
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

    this.process(this.inputs.map((terminal) => (terminal.connectors.length > 0 ? terminal.connectors[0].data : null)));
  }

  render(): void {
    if (this.renderState.viewport === ViewPort.OUTSIDE) return;
    if (this.renderState.nodeState === NodeState.MAXIMIZED) this.ui.render();

    let context = this.context;
    context.save();
    this.renderTerminals(context);
    this.renderName(context);
    this.renderFocused(context);
    let flowRenderResolver = this.flow.renderResolver.node;
    let flowConnectRenderResolver = this.flow.flowConnect.renderResolver.node;
    (
      (this.renderResolver.node && this.renderResolver.node(this)) ||
      (flowRenderResolver && flowRenderResolver(this)) ||
      (flowConnectRenderResolver && flowConnectRenderResolver(this)) ||
      this._render
    )(context, this.getRenderParams(), this);
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
  addTerminal(terminal: Terminal | SerializedTerminal) {
    if (!(terminal instanceof Terminal)) {
      terminal = Terminal.create(terminal.name, terminal.type, terminal.dataType, {
        propName: terminal.propName,
        style: terminal.style,
        id: terminal.id,
        hitColor: Color.create(terminal.hitColor),
      }).build(this);
    }

    (terminal.type === TerminalType.IN ? this.inputs : this.outputs).push(terminal);
    this.ui.update();
    this.reflow();
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
  //#endregion

  //#region Events
  onDown(screenPosition: Vector, realPosition: Vector): void {
    this.call("down", this, screenPosition, realPosition);

    let hitColor = Color.rgbaToString(
      this.flow.flowConnect.offUIContext.getImageData(screenPosition.x, screenPosition.y, 1, 1).data
    );

    this.currHitUINode = this.getHitUINode(hitColor);
    this.currHitUINode && this.currHitUINode.onDown(screenPosition, realPosition);

    let hitTerminal = this.getHitTerminal(hitColor, screenPosition, realPosition);
    if (hitTerminal) {
      this.currHitTerminal = hitTerminal;
      this.currHitTerminal.onDown(screenPosition, realPosition);
    }
  }
  onOver(screenPosition: Vector, realPosition: Vector): void {
    this.call("over", this, screenPosition, realPosition);

    let hitColor = Color.rgbaToString(
      this.flow.flowConnect.offUIContext.getImageData(screenPosition.x, screenPosition.y, 1, 1).data
    );

    let hitTerminal = this.getHitTerminal(hitColor, screenPosition, realPosition);

    if (hitTerminal !== this.prevHitTerminal) {
      this.prevHitTerminal && this.prevHitTerminal.onExit(screenPosition, realPosition);
      hitTerminal && hitTerminal.onEnter(screenPosition, realPosition);
    } else {
      hitTerminal && !this.currHitTerminal && hitTerminal.onOver(screenPosition, realPosition);
    }
    this.prevHitTerminal = hitTerminal;

    let hitUINode = this.getHitUINode(hitColor);
    if (hitUINode !== this.prevHitUINode) {
      this.prevHitUINode && this.prevHitUINode.onExit(screenPosition, realPosition);
      hitUINode && hitUINode.onEnter(screenPosition, realPosition);
    } else {
      hitUINode && !this.currHitUINode && hitUINode.onOver(screenPosition, realPosition);
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
  onUp(screenPosition: Vector, realPosition: Vector): void {
    this.call("up", this, screenPosition, realPosition);

    let hitColor = Color.rgbaToString(
      this.flow.flowConnect.offUIContext.getImageData(screenPosition.x, screenPosition.y, 1, 1).data
    );

    this.currHitUINode = null;
    let hitUINode = this.getHitUINode(hitColor);
    hitUINode && hitUINode.onUp(screenPosition.clone(), realPosition.clone());

    let hitTerminal = this.getHitTerminal(hitColor, screenPosition, realPosition);
    hitTerminal && hitTerminal.onUp(screenPosition, realPosition);
  }
  onClick(screenPosition: Vector, realPosition: Vector): void {
    this.call("click", this, screenPosition, realPosition);

    let hitColor = Color.rgbaToString(
      this.flow.flowConnect.offUIContext.getImageData(screenPosition.x, screenPosition.y, 1, 1).data
    );
    if (realPosition.y < this.position.y + this.style.titleHeight * this.flow.flowConnect.scale) {
      let hitNodeButton = this.getHitNodeButton(hitColor);
      hitNodeButton && hitNodeButton.onClick(this);
    } else {
      this.currHitTerminal && this.currHitTerminal.onClick(screenPosition, realPosition);

      let hitUINode = this.getHitUINode(hitColor);
      hitUINode && hitUINode.onClick(screenPosition.clone(), realPosition.clone());
    }
  }
  onDrag(screenPosition: Vector, realPosition: Vector): void {
    this.call("drag", this, screenPosition, realPosition);

    let hitColor = Color.rgbaToString(
      this.flow.flowConnect.offUIContext.getImageData(screenPosition.x, screenPosition.y, 1, 1).data
    );
    let hitUINodeWhileDragging = this.getHitUINode(hitColor);

    if (this.currHitUINode && this.currHitUINode.draggable) {
      if (hitUINodeWhileDragging === this.currHitUINode) {
        this.currHitUINode.onDrag(screenPosition, realPosition);
      } else {
        this.currHitUINode.onExit(screenPosition, realPosition);
        this.currHitUINode = null;
        this.flow.flowConnect.currHitNode = null;
        this.flow.flowConnect.pointers = [];
      }
    }
  }
  onContextMenu(): void {
    this.call("rightclick", this);
  }
  onWheel(direction: boolean, screenPosition: Vector, realPosition: Vector): void {
    this.call("wheel", this, direction, screenPosition, realPosition);

    let hitColor = Color.rgbaToString(
      this.flow.flowConnect.offUIContext.getImageData(screenPosition.x, screenPosition.y, 1, 1).data
    );
    let hitUINode = this.getHitUINode(hitColor);

    hitUINode && hitUINode.zoomable && hitUINode.onWheel(direction, screenPosition, realPosition);
  }
  //#endregion

  //#region UICreators
  createLabel(text: string | number, options?: LabelCreatorOptions): Label {
    return new Label(this, text, options);
  }
  createImage(source: string, options?: ImageCreatorOptions): Image {
    return new Image(this, source, options);
  }
  createSlider(min: number, max: number, options?: SliderCreatorOptions) {
    return new Slider(this, min, max, options);
  }
  createSlider2D(options?: Slider2DCreatorOptions) {
    return new Slider2D(this, options);
  }
  createVSlider(min: number, max: number, options?: VSliderCreatorOptions) {
    return new VSlider(this, min, max, options);
  }
  createDial(min: number, max: number, size: number, options?: DialCreatorOptions) {
    return new Dial(this, min, max, size, options);
  }
  createHozLayout(childs: UINode[] = [], options?: HorizontalLayoutCreatorOptions) {
    return new HorizontalLayout(this, childs, options);
  }
  createStack(options?: StackCreatorOptions) {
    return new Stack(this, options);
  }
  createButton(text: string, options?: ButtonCreatorOptions) {
    return new Button(this, text, options);
  }
  createToggle(options?: ToggleCreatorOptions) {
    return new Toggle(this, options);
  }
  createRadioGroup(values?: string[], selected?: string, options?: RadioGroupCreatorOptions) {
    return new RadioGroup(this, values, selected, options);
  }
  createSelect(values: string[], options?: SelectCreatorOptions) {
    return new Select(this, values, options);
  }
  createSource(options?: SourceCreatorOptions) {
    return new Source(this, options);
  }
  createDisplay(height: number, renderers: CustomRendererConfig[], options?: DisplayCreatorOptions) {
    return new Display(this, height, renderers, options);
  }
  createInput(options?: InputCreatorOptions) {
    return new Input(this, options);
  }
  createEnvelope(height: number, values?: Vector[], options?: EnvelopeCreatorOptions): Envelope {
    return new Envelope(this, height, values, options);
  }
  //#endregion

  async serialize(persist?: DataPersistenceProvider): Promise<SerializedNode> {
    const ui = await this.ui.serialize(persist);

    return Promise.resolve<SerializedNode>({
      id: this.id,
      name: this.name,
      type: this.type,
      position: this.position.serialize(),
      width: this.width,
      state: this.state,
      inputs: this.inputs.map((terminal) => terminal.serialize()),
      outputs: this.outputs.map((terminal) => terminal.serialize()),
      style: this.style,
      hitColor: this.hitColor.serialize(),
      zIndex: this.zIndex,
      focused: this.focused,
      renderState: this.renderState,
      ui,
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
let DefaultNodeStyle = () => {
  return {
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
  };
};

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
  ui: SerializedContainer;
  width: number;
}

export interface NodeOptions extends Record<string, any> {
  name: string;
  width?: number;
  style?: NodeStyle;
  state?: Object;
  id?: string;
  hitColor?: Color;
  inputs?: SerializedTerminal[];
  outputs?: SerializedTerminal[];
}
const DefaultNodeOptions = (): NodeOptions => {
  return {
    name: "New Node",
    width: 100,
    style: {},
    state: {},
    id: uuid(),
  };
};

interface ToggleCreatorOptions {
  propName?: string;
  input?: boolean;
  output?: boolean;
  height?: number;
  style?: ToggleStyle;
}
interface StackCreatorOptions {
  childs?: UINode[];
  style?: StackStyle;
}
interface SourceCreatorOptions {
  accept?: string;
  propName?: string;
  input?: boolean;
  output?: boolean;
  height?: number;
  style?: SourceStyle;
}
interface SliderCreatorOptions {
  value?: number;
  propName?: string;
  input?: boolean;
  output?: boolean;
  height?: number;
  style?: SliderStyle;
}
interface VSliderCreatorOptions {
  value?: number;
  propName?: string;
  input?: boolean;
  output?: boolean;
  height?: number;
  width?: number;
  style?: VSliderStyle;
}
interface Slider2DCreatorOptions {
  value?: Vector;
  propName?: string;
  input?: boolean;
  output?: boolean;
  height?: number;
  style?: Slider2DStyle;
}
interface SelectCreatorOptions {
  height?: number;
  propName?: string;
  input?: boolean;
  output?: boolean;
  style?: SelectStyle;
}
interface RadioGroupCreatorOptions {
  propName?: string;
  input?: boolean;
  output?: boolean;
  height?: number;
  style?: RadioGroupStyle;
}
interface LabelCreatorOptions {
  propName?: string;
  input?: boolean;
  output?: boolean;
  style?: LabelStyle;
  height?: number;
}
interface InputCreatorOptions {
  value?: string | number;
  propName?: string;
  input?: boolean;
  output?: boolean;
  height?: number;
  style?: InputStyle;
}
interface ImageCreatorOptions {
  propName?: string;
  style?: ImageStyle;
}
interface HorizontalLayoutCreatorOptions {
  style?: HorizontalLayoutStyle;
  input?: boolean;
  output?: boolean;
}
interface ButtonCreatorOptions {
  input?: boolean;
  output?: boolean;
  height?: number;
  style?: ButtonStyle;
}
interface DialCreatorOptions {
  value?: number;
  propName?: string;
  input?: boolean;
  output?: boolean;
  style?: DialStyle;
}
interface DisplayCreatorOptions {
  style?: DisplayStyle;
}
interface EnvelopeCreatorOptions {
  input?: boolean;
  output?: boolean;
  style?: EnvelopeStyle;
}

export class NodeButton extends Hooks implements Renderable {
  renderer: RenderResolver<NodeButton, NodeButtonRenderParams> = () => null;
  defaultRenderFn: RenderFunction<NodeButton, NodeButtonRenderParams>;
  style: Record<string, any> = {};

  hitColor: Color;
  deltaX: number = 0;

  constructor(
    public node: Node,
    public onClick: (n: Node) => void,
    renderer: RenderFunction<NodeButton, NodeButtonRenderParams>,
    public align: Align,
    style?: Record<string, any>
  ) {
    super();

    this.style = get(style, {});
    this.setHitColor();
    this.defaultRenderFn = renderer;
  }

  private setHitColor() {
    let color = Color.Random();
    while (this.node.nodeButtons.get(color.rgbaString)) color = Color.Random();
    this.hitColor = color;
    this.node.nodeButtons.set(this.hitColor.rgbaString, this);
  }
  render() {
    this.node.context.save();
    const scopeFlowConnect = this.node.flow.flowConnect.renderResolver.nodeButton;
    const scopeFlow = this.node.flow.renderResolver.nodeButton;
    const scopeNode = this.node.renderResolver.nodeButton;
    const renderFn =
      (this.renderer && this.renderer(this)) ||
      (scopeNode && scopeNode(this)) ||
      (scopeFlow && scopeFlow(this)) ||
      (scopeFlowConnect && scopeFlowConnect(this)) ||
      this.defaultRenderFn;
    renderFn(this.node.context, this.getRenderParams(), this);
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
