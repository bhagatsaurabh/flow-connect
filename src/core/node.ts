import { SerializedVector2, Vector2 } from "./vector";
import { ViewPort, LOD, Align } from '../common/enums';
import { Container, Label, Slider, UINode, Button, Image, HorizontalLayout, Toggle, Select, Source, Display, Input, Stack, CustomRendererConfig, ToggleStyle, SourceStyle, SliderStyle, SelectStyle, LabelStyle, InputStyle, ButtonStyle, DisplayStyle, HorizontalLayoutStyle, StackStyle, ImageStyle } from "../ui/index";
import { get, getNewUUID, intersects } from "../utils/utils";
import { Color, SerializedColor } from "./color";
import { Flow, FlowState, SerializedFlow } from './flow';
import { Group } from './group';
import { Terminal, TerminalType, TerminalStyle, SerializedTerminal } from './terminal';
import { Hooks } from './hooks';
import { Events, RenderState, Serializable, TerminalOutputs } from "../common/interfaces";
import { Connector } from "./connector";
import { Log } from "../utils/logger";
import { SerializedContainer } from "../ui/container";
import { Dial, DialStyle } from "../ui/dial";
import { Envelope, EnvelopeStyle } from "../ui/envelope";
import { RadioGroup, RadioGroupStyle } from "../ui/radio-group";
import { Slider2D, Slider2DStyle } from "../ui/2d-slider";
import { VSlider, VSliderStyle } from "../ui/v-slider";

export class Node extends Hooks implements Events, Serializable {
  //#region Properties
  /** @hidden */
  hitColor: Color;
  private _width: number;
  /** @hidden */
  hitColorToUI: { [key: string]: UINode };
  /** @hidden */
  hitColorToTerminal: { [key: string]: Terminal };
  /** @hidden */
  hitColorToNodeButton: { [key: string]: NodeButton };
  private _zIndex: number;
  private nodeButtons: NodeButton[] = [];
  private _position: Vector2;
  private propObservers: any = {};
  /** @hidden */
  renderState: RenderState = { viewport: ViewPort.INSIDE, nodeState: NodeState.MAXIMIZED, lod: LOD.LOD2 };
  /** @hidden */
  currHitTerminal: Terminal;
  /** @hidden */
  prevHitTerminal: Terminal;
  /** @hidden */
  currHitUINode: UINode;
  /** @hidden */
  prevHitUINode: UINode;

  focused: boolean = false;
  inputs: Terminal[] = [];
  outputs: Terminal[] = [];
  inputsUI: Terminal[] = [];
  outputsUI: Terminal[] = [];
  ui: Container;
  state: { [key: string]: any };
  group: Group = null;
  //#endregion

  //#region Accessors
  get context(): CanvasRenderingContext2D { return this.flow.flowConnect.context }
  get offContext(): OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D { return this.flow.flowConnect.offContext }
  get offUIContext(): OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D { return this.flow.flowConnect.offUIContext }
  get position(): Vector2 { return this._position }
  set position(position: Vector2) {
    this._position = position;
    this.reflow();
    this.ui.update();
    this.updateRenderState();
  }
  get zIndex(): number { return this._zIndex }
  set zIndex(zIndex: number) {
    if (this.flow.sortedNodes.remove(this)) {
      this._zIndex = zIndex;
      this.flow.sortedNodes.add(this);
    } else {
      this._zIndex = zIndex;
    }
  }
  get width(): number { return this._width }
  set width(width: number) {
    this._width = width;
    this.ui.width = width;
    this.ui.update();
  }
  //#endregion

  style: NodeStyle;
  terminalStyle: TerminalStyle;
  id: string;

  constructor(
    public flow: Flow,
    public name: string,
    position: Vector2,
    width: number,
    inputs: SerializedTerminal[], outputs: SerializedTerminal[],
    options: NodeConstructorOptions = DefaultNodeConstructorOptions()
  ) {

    super();

    this.style = get(options.style, {});
    this.terminalStyle = get(options.terminalStyle, {});
    this.id = get(options.id, getNewUUID());
    options.state = get(options.state, {});

    this.hitColor = options.hitColor;
    this._width = width;
    this.style = { ...DefaultNodeStyle(), ...options.style }
    this._position = position;
    this.setupState(options.state);
    this.hitColorToUI = {};
    this.hitColorToTerminal = {};
    this.hitColorToNodeButton = {};
    this._zIndex = 0;
    this.setHitColor(options.hitColor);

    this.setupTerminals(options, inputs, outputs);

    if (options.ui) {
      this.ui = options.ui instanceof Container ? options.ui : Container.deSerialize(this, options.ui)
    } else {
      this.ui = new Container(this, width);
    }

    this.addNodeButton(() => this.toggleNodeState(), (_: NodeButton, pos: Vector2) => {
      this.context.fillStyle = this.style.maximizeButtonColor;
      this.context.fillRect(pos.x, pos.y, this.style.nodeButtonSize, this.style.nodeButtonSize);
    }, Align.Left);

    this.reflow();
    this.ui.update();

    this.flow.on('transform', () => this.updateRenderState());

    this.flow.nodes[this.id] = this;
    this.flow.sortedNodes.add(this);
    this.flow.executionGraph.add(this);
  }

  //#region Methods
  setupTerminals(options: NodeConstructorOptions, inputs: SerializedTerminal[], outputs: SerializedTerminal[]) {
    this.inputs.push(...inputs.map(input =>
      new Terminal(this, TerminalType.IN, input.dataType, input.name,
        input.style ? input.style : { ...options.terminalStyle },
        input.id ? input.id : null,
        input.hitColor ? Color.deSerialize(input.hitColor) : null)
    ));
    this.outputs.push(...outputs.map(output =>
      new Terminal(this, TerminalType.OUT, output.dataType, output.name,
        output.style ? output.style : { ...options.terminalStyle },
        output.id ? output.id : null,
        output.hitColor ? Color.deSerialize(output.hitColor) : null)
    ));
  }
  private setupState(state: any) {
    this.state = new Proxy<any>({}, {
      set: (target, prop, value) => {
        if (typeof target[prop] === 'undefined') {
          this.propObservers[prop] = [];
        }

        let oldValue = target[prop];
        target[prop] = value;
        this.propObservers[prop].forEach((callback: any) => callback(oldValue, value));

        return true;
      }
    });

    Object.keys(state).forEach(key => {
      this.state[key] = state[key];
    });
  }
  watch(propName: string, callback: (oldVal: any, newVal: any) => void) {
    if (typeof this.state[propName] !== 'undefined') {
      this.propObservers[propName].push(callback);
    } else {
      Log.error(`Cannot watch prop '${propName}', prop not found`);
    }
  }
  unwatch(propName: string, callback: (oldVal: any, newVal: any) => void) {
    if (typeof this.state[propName] !== 'undefined') {
      this.propObservers[propName].splice(this.propObservers[propName].indexOf(callback), 1);
    } else {
      Log.error(`Cannot unwatch prop '${propName}', prop not found`);
    }
  }
  private setHitColor(hitColor: Color) {
    if (!hitColor) {
      hitColor = Color.Random();
      while (this.flow.hitColorToNode[hitColor.rgbaString]) hitColor = Color.Random();
    }
    this.hitColor = hitColor;
    this.flow.hitColorToNode[this.hitColor.rgbaString] = this;
  }
  /** @hidden */
  addNodeButton(callback: () => void, render: (nodeButton: NodeButton, position: Vector2) => void, align: Align): NodeButton {
    let newNodeButton = new NodeButton(this, callback, render, align);

    let noOfButtons = this.nodeButtons.filter(nodeButton => nodeButton.align === newNodeButton.align).length;
    let deltaX;
    if (align === Align.Left) deltaX = noOfButtons * (this.style.nodeButtonSize + this.style.nodeButtonSpacing);
    else deltaX = this.width - noOfButtons * (this.style.nodeButtonSize + this.style.nodeButtonSpacing) - this.style.nodeButtonSize;
    newNodeButton.deltaX = deltaX;
    this.nodeButtons.push(newNodeButton);

    return newNodeButton;
  }
  private reflow(): void {
    let y = this.position.y + this.style.terminalRowHeight / 2 + this.style.padding / 2 + this.style.titleHeight;
    if (this.inputs.length > this.outputs.length) {
      this.recalculateInputTerminals(y);
      y = this.position.y + (this.inputs.length * this.style.terminalRowHeight) / 2 - (this.outputs.length * this.style.terminalRowHeight) / 2 + this.style.terminalRowHeight / 2 + this.style.padding / 2 + this.style.titleHeight;
      this.recalculateOutputTerminals(y);
    } else {
      this.recalculateOutputTerminals(y);
      y = this.position.y + (this.outputs.length * this.style.terminalRowHeight) / 2 - (this.inputs.length * this.style.terminalRowHeight) / 2 + this.style.terminalRowHeight / 2 + this.style.padding / 2 + this.style.titleHeight;
      this.recalculateInputTerminals(y);
    }
  }
  private updateRenderState() {
    let realPos = this.position.transform(this.flow.flowConnect.transform);
    this.renderState.viewport = intersects(
      0, 0,
      this.flow.flowConnect.canvasDimensions.width, this.flow.flowConnect.canvasDimensions.height,
      realPos.x, realPos.y,
      realPos.x + this.width * this.flow.flowConnect.scale,
      realPos.y + (this.renderState.nodeState === NodeState.MAXIMIZED ? this.ui.height : this.style.titleHeight) * this.flow.flowConnect.scale
    );

    if (this.flow.flowConnect.scale > 0.6) this.renderState.lod = LOD.LOD2;
    else if (this.flow.flowConnect.scale <= 0.6 && this.flow.flowConnect.scale > .3) this.renderState.lod = LOD.LOD1;
    else this.renderState.lod = LOD.LOD0;

    if (this.renderState.viewport === ViewPort.INTERSECT) {
      this.ui.updateRenderState();
    }
  }
  /** @hidden */
  recalculateInputTerminals(y: number) {
    this.inputs.forEach(terminal => {
      terminal.position.x = this.position.x - this.style.terminalStripMargin - terminal.style.radius;
      terminal.position.y = y;
      y += this.style.terminalRowHeight;
    });
  }
  private recalculateOutputTerminals(y: number) {
    this.outputs.forEach(terminal => {
      terminal.position.x = this.position.x + this.ui.width + this.style.terminalStripMargin + terminal.style.radius;
      terminal.position.y = y;
      y += this.style.terminalRowHeight;
    });
  }
  /** @hidden */
  getHitTerminal(hitColor: string, screenPosition: Vector2, realPosition: Vector2) {
    let hitTerminal = null;

    realPosition = realPosition.transform(this.flow.flowConnect.transform);
    let thisRealPosition = this.position.transform(this.flow.flowConnect.transform);
    if (
      (this.inputs.length + this.inputsUI.length > 0 && realPosition.x < thisRealPosition.x) ||
      (this.outputs.length + this.outputsUI.length > 0 && realPosition.x > thisRealPosition.x + this.ui.width * this.flow.flowConnect.scale)
    ) {
      hitTerminal = this.hitColorToTerminal[hitColor];
    }

    if (this.currHitTerminal && this.currHitTerminal !== hitTerminal) {
      this.currHitTerminal.onExit(screenPosition, realPosition);
      hitTerminal && hitTerminal.onEnter(screenPosition, realPosition);
    }

    return hitTerminal;
  }
  /** @hidden */
  getHitUINode(hitColor: string): UINode {
    let uiNode = this.hitColorToUI[hitColor];
    if (uiNode instanceof Container) return null;
    return uiNode;
  }
  private getHitNodeButton(hitColor: string): NodeButton {
    return this.hitColorToNodeButton[hitColor];
  }
  /** @hidden */
  run() {
    if (this.flow.state === FlowState.Stopped) return;

    this.call('process', this, this.inputs.map(terminal => terminal.connectors.length > 0 ? terminal.connectors[0].data : null));
  }
  private _render() {
    let context = this.context;
    if (this.renderState.nodeState === NodeState.MAXIMIZED) {
      if (this.renderState.lod > 0) {
        this.inputs.forEach(terminal => terminal.render());
        this.outputs.forEach(terminal => terminal.render());
      }
    } else {
      context.fillStyle = 'green';
      if ((this.inputs.length + this.inputsUI.length) > 0) {
        let radius = this.inputs.length > 0 ? this.inputs[0].style.radius : this.inputsUI[0].style.radius;
        context.fillRect(this.position.x - this.style.terminalStripMargin - radius * 2, this.position.y + this.style.titleHeight / 2 - radius, radius * 2, radius * 2);
      }
      if ((this.outputs.length + this.outputsUI.length) > 0) {
        let radius = this.outputs.length > 0 ? this.outputs[0].style.radius : this.outputsUI[0].style.radius;
        context.fillRect(this.position.x + this.width + this.style.terminalStripMargin, this.position.y + this.style.titleHeight / 2 - radius, radius * 2, radius * 2);
      }
    }

    context.fillStyle = this.style.titleColor;
    context.font = this.style.titleFontSize + ' ' + this.style.titleFont;
    context.textBaseline = 'middle';
    context.fillText(this.name, this.position.x + this.ui.width / 2 - context.measureText(this.name).width / 2, this.position.y + this.style.titleHeight / 2);

    if (this.renderState.nodeState === NodeState.MAXIMIZED) {
      context.fillStyle = this.style.color;
      context.font = this.style.fontSize + ' ' + this.style.font;
      context.textBaseline = 'middle';
      this.inputs.forEach(terminal => {
        context.fillText(terminal.name, terminal.position.x + terminal.style.radius + this.style.terminalStripMargin + this.style.padding, terminal.position.y);
      });
      this.outputs.forEach(terminal => {
        context.fillText(terminal.name, terminal.position.x - terminal.style.radius - this.style.terminalStripMargin - this.style.padding - context.measureText(terminal.name).width, terminal.position.y);
      });
    }

    if (this.focused) {
      context.strokeStyle = '#000';
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
        this.renderState.nodeState === NodeState.MAXIMIZED ? (this.ui.height + this.style.padding) : this.style.titleHeight,
        4
      );
    }
  }
  private _offRender() {
    this.offContext.fillStyle = this.hitColor.rgbaCSSString;
    let x = this.position.x;
    let y = this.position.y;
    let inputTerminalsStripWidth = 0, outputTerminalsStripWidth = 0;
    if ((this.inputs.length + this.inputsUI.length) !== 0) {
      let radius = this.inputs.length > 0 ? this.inputs[0].style.radius : this.inputsUI[0].style.radius;
      x -= this.style.terminalStripMargin + radius * 2;
      inputTerminalsStripWidth = radius * 2 + this.style.terminalStripMargin;
    }
    if ((this.outputs.length + this.outputsUI.length) !== 0) {
      let radius = this.outputs.length > 0 ? this.outputs[0].style.radius : this.outputsUI[0].style.radius;
      outputTerminalsStripWidth = radius * 2 + this.style.terminalStripMargin;
    }
    this.offContext.fillRect(x, y,
      this.ui.width + inputTerminalsStripWidth + outputTerminalsStripWidth,
      this.renderState.nodeState === NodeState.MAXIMIZED ? this.ui.height : this.style.titleHeight
    );
  }

  addTerminal(terminal: Terminal | SerializedTerminal) {
    if (!(terminal instanceof Terminal)) {
      terminal = Terminal.deSerialize(this, terminal);
    }
    if (terminal.type === TerminalType.IN) this.inputs.push(terminal);
    else this.outputs.push(terminal);
    this.ui.update();
    this.reflow();
  }
  removeTerminal(terminal: Terminal) {
    let type = terminal.type;
    let index = type === TerminalType.IN ? this.inputs.indexOf(terminal) : this.outputs.indexOf(terminal);
    if (index < 0) {
      Log.error('Cannot remove terminal, terminal not found');
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
    if (typeof terminal === 'string') {
      let inputTerminal = this.inputs.find(currTerm => (currTerm.name === terminal));
      if (inputTerminal) return inputTerminal.getData();
    } else {
      if (this.inputs[terminal]) return this.inputs[terminal].getData();
    }
    return null;
  }
  getInputs(): any[] {
    return this.inputs.map(terminal => terminal.getData());
  }
  setOutputs(outputs: string | number | TerminalOutputs, data?: any) {
    if (typeof outputs === 'string') {
      let outputTerminal = this.outputs.find(term => (term.name === outputs));
      if (outputTerminal) outputTerminal.setData(data);
    } else if (typeof outputs === 'number') {
      if (this.outputs[outputs]) this.outputs[outputs].setData(data);
    } else {
      let outputData = new Map<Terminal, any>();
      Object.entries(outputs).forEach(entry => {
        let terminal = this.outputs.find(term => term.name === entry[0]);
        if (terminal) outputData.set(terminal, entry[1]);
        else throw Log.error("Terminal '" + entry[0] + "' not found");
      });
      let groupedConnectors = new Map<Node, Connector[]>();
      let outputDataIterator = outputData.keys();

      let curr: Terminal = outputDataIterator.next().value;
      while (curr) {
        curr.connectors.forEach(connector => {
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
  toggleNodeState() {
    this.renderState.nodeState = this.renderState.nodeState === NodeState.MAXIMIZED ? NodeState.MINIMIZED : NodeState.MAXIMIZED;
  }
  dispose(): void {
    this.flow.removeNode(this.id);
  }
  render(): void {
    if (this.renderState.viewport === ViewPort.OUTSIDE) return;
    if (this.renderState.nodeState === NodeState.MAXIMIZED) this.ui.render();

    this.context.save();
    this._render();
    this.context.restore();

    this.nodeButtons.forEach(nodeButton => nodeButton.render())

    this.offContext.save();
    this._offRender();
    this.offContext.restore();
  }
  //#endregion

  //#region Events
  /** @hidden */
  onDown(screenPosition: Vector2, realPosition: Vector2): void {
    this.call('down', this, screenPosition, realPosition);

    let hitColor = Color.rgbaToString(this.flow.flowConnect.offUIContext.getImageData(screenPosition.x, screenPosition.y, 1, 1).data);

    this.currHitUINode = this.getHitUINode(hitColor);
    this.currHitUINode && this.currHitUINode.onDown(screenPosition, realPosition);

    let hitTerminal = this.getHitTerminal(hitColor, screenPosition, realPosition);
    if (hitTerminal) {
      this.currHitTerminal = hitTerminal;
      this.currHitTerminal.onDown(screenPosition, realPosition);
    }
  }
  /** @hidden */
  onOver(screenPosition: Vector2, realPosition: Vector2): void {
    this.call('over', this, screenPosition, realPosition);

    let hitColor = Color.rgbaToString(this.flow.flowConnect.offUIContext.getImageData(screenPosition.x, screenPosition.y, 1, 1).data);

    let hitTerminal = this.getHitTerminal(hitColor, screenPosition, realPosition);

    if (hitTerminal !== this.prevHitTerminal) {
      this.prevHitTerminal && this.prevHitTerminal.onExit(screenPosition, realPosition);
      hitTerminal && hitTerminal.onEnter(screenPosition, realPosition);
    } else {
      hitTerminal && (!this.currHitTerminal) && hitTerminal.onOver(screenPosition, realPosition);
    }
    this.prevHitTerminal = hitTerminal;

    let hitUINode = this.getHitUINode(hitColor);
    if (hitUINode !== this.prevHitUINode) {
      this.prevHitUINode && this.prevHitUINode.onExit(screenPosition, realPosition);
      hitUINode && hitUINode.onEnter(screenPosition, realPosition);
    } else {
      hitUINode && (!this.currHitUINode) && hitUINode.onOver(screenPosition, realPosition);
    }
    this.prevHitUINode = hitUINode;
  }
  /** @hidden */
  onEnter(screenPosition: Vector2, realPosition: Vector2): void {
    this.call('enter', this, screenPosition, realPosition);
  }
  /** @hidden */
  onExit(screenPosition: Vector2, realPosition: Vector2): void {
    this.call('exit', this, screenPosition, realPosition);

    let hitColor = Color.rgbaToString(this.flow.flowConnect.offUIContext.getImageData(screenPosition.x, screenPosition.y, 1, 1).data);

    let hitTerminal = this.getHitTerminal(hitColor, screenPosition, realPosition);
    hitTerminal && hitTerminal.onExit(screenPosition, realPosition);
    this.prevHitTerminal && this.prevHitTerminal.onExit(screenPosition, realPosition);
    this.prevHitTerminal = null;
    this.currHitTerminal && this.currHitTerminal.onExit(screenPosition, realPosition);
  }
  /** @hidden */
  onUp(screenPosition: Vector2, realPosition: Vector2): void {
    this.call('up', this, screenPosition, realPosition);

    let hitColor = Color.rgbaToString(this.flow.flowConnect.offUIContext.getImageData(screenPosition.x, screenPosition.y, 1, 1).data);

    this.currHitUINode = null;
    let hitUINode = this.getHitUINode(hitColor);
    hitUINode && hitUINode.onUp(screenPosition.clone(), realPosition.clone());

    let hitTerminal = this.getHitTerminal(hitColor, screenPosition, realPosition);
    hitTerminal && hitTerminal.onUp(screenPosition, realPosition);
  }
  /** @hidden */
  onClick(screenPosition: Vector2, realPosition: Vector2): void {
    this.call('click', this, screenPosition, realPosition);

    let hitColor = Color.rgbaToString(this.flow.flowConnect.offUIContext.getImageData(screenPosition.x, screenPosition.y, 1, 1).data);
    if (realPosition.y < this.position.y + this.style.titleHeight * this.flow.flowConnect.scale) {
      let hitNodeButton = this.getHitNodeButton(hitColor);
      hitNodeButton && hitNodeButton.callback();
    } else {
      this.currHitTerminal && this.currHitTerminal.onClick(screenPosition, realPosition);

      let hitUINode = this.getHitUINode(hitColor);
      hitUINode && hitUINode.onClick(screenPosition.clone(), realPosition.clone());
    }
  }
  /** @hidden */
  onDrag(screenPosition: Vector2, realPosition: Vector2): void {
    this.call('drag', this, screenPosition, realPosition);

    let hitColor = Color.rgbaToString(this.flow.flowConnect.offUIContext.getImageData(screenPosition.x, screenPosition.y, 1, 1).data);
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
  /** @hidden */
  onContextMenu(): void {
    this.call('rightclick', this);
  }
  /** @hidden */
  onWheel(direction: boolean, screenPosition: Vector2, realPosition: Vector2): void {
    this.call('wheel', this, direction, screenPosition, realPosition);

    let hitColor = Color.rgbaToString(this.flow.flowConnect.offUIContext.getImageData(screenPosition.x, screenPosition.y, 1, 1).data);
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
  createButton(text: string, options?: ButtonCreatorOption) {
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
  createEnvelope(height: number, values?: Vector2[], options?: EnvelopeCreatorOptions): Envelope {
    return new Envelope(this, height, values, options);
  }
  //#endregion

  serialize(): SerializedNode {
    return {
      id: this.id,
      name: this.name,
      position: this.position.serialize(),
      width: this.width,
      state: this.state,
      inputs: this.inputs.map(terminal => terminal.serialize()),
      outputs: this.outputs.map(terminal => terminal.serialize()),
      style: this.style,
      terminalStyle: this.terminalStyle,
      hitColor: this.hitColor.serialize(),
      zIndex: this.zIndex,
      focused: this.focused,
      renderState: this.renderState,
      ui: this.ui.serialize()
    };
  }
  static deSerialize(flow: Flow, data: SerializedNode): Node {
    return new Node(flow, data.name, Vector2.deSerialize(data.position), data.width, data.inputs, data.outputs, {
      style: data.style,
      terminalStyle: data.terminalStyle,
      state: data.state,
      id: data.id,
      hitColor: Color.deSerialize(data.hitColor),
      ui: data.ui
    });
  }
}

export interface NodeStyle {
  font?: string,
  fontSize?: string,
  titleFont?: string,
  titleFontSize?: string,
  padding?: number,
  spacing?: number,
  rowHeight?: number,
  color?: string,
  titleColor?: string,
  titleHeight?: number,
  terminalRowHeight?: number,
  terminalStripMargin?: number,
  maximizeButtonColor?: string,
  expandButtonColor?: string;
  nodeButtonSize?: number,
  nodeButtonSpacing?: number,
}
/** @hidden */
let DefaultNodeStyle = () => {
  return {
    font: 'arial',
    fontSize: '.75rem',
    titleFont: 'arial',
    titleFontSize: '.85rem',
    color: '#000',
    titleColor: '#000',
    maximizeButtonColor: 'darkgrey',
    nodeButtonSize: 10,
    nodeButtonSpacing: 5,
    expandButtonColor: '#000',
    padding: 10,
    spacing: 10,
    rowHeight: 20,
    titleHeight: 29,
    terminalRowHeight: 24,
    terminalStripMargin: 8
  };
};

export enum NodeState {
  MAXIMIZED,
  MINIMIZED
}

export interface SerializedNode {
  hitColor: SerializedColor,
  zIndex: number,
  focused: boolean,
  id: string,
  position: SerializedVector2,
  state: { [key: string]: any },
  renderState: RenderState,
  inputs: SerializedTerminal[],
  outputs: SerializedTerminal[],
  name: string,
  style: NodeStyle,
  terminalStyle: TerminalStyle,
  ui: SerializedContainer,
  width: number,
  subFlow?: SerializedFlow
}

/** @hidden */
export class NodeButton {
  hitColor: Color;
  deltaX: number = 0;

  constructor(
    public node: Node,
    public callback: () => void,
    public _render: (nodeButton: NodeButton, position: Vector2) => void,
    public align: Align
  ) {
    this.setHitColor();
  }

  private setHitColor() {
    let color = Color.Random();
    while (this.node.hitColorToNodeButton[color.rgbaString]) color = Color.Random();
    this.hitColor = color;
    this.node.hitColorToNodeButton[this.hitColor.rgbaString] = this;
  }
  render() {
    this.node.context.save();
    this._render(this, this.node.position.add(this.deltaX, this.node.style.titleHeight / 2 - this.node.style.nodeButtonSize / 2));
    this.node.context.restore();

    this.node.offUIContext.save();
    this._offUIRender();
    this.node.offUIContext.restore();
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

export interface NodeConstructorOptions {
  style?: NodeStyle,
  terminalStyle?: TerminalStyle,
  state?: Object,
  id?: string,
  hitColor?: Color,
  ui?: Container | SerializedContainer
}
let DefaultNodeConstructorOptions = (): NodeConstructorOptions => {
  return {
    style: {},
    terminalStyle: {},
    state: {},
    id: getNewUUID(),
  }
}

interface ToggleCreatorOptions {
  propName?: string,
  input?: boolean,
  output?: boolean,
  height?: number,
  style?: ToggleStyle
}
interface StackCreatorOptions {
  childs?: UINode[],
  style?: StackStyle
}
interface SourceCreatorOptions {
  accept?: string,
  propName?: string,
  input?: boolean,
  output?: boolean,
  height?: number,
  style?: SourceStyle
}
interface SliderCreatorOptions {
  value?: number,
  propName?: string,
  input?: boolean,
  output?: boolean,
  height?: number,
  style?: SliderStyle
}
interface VSliderCreatorOptions {
  value?: number,
  propName?: string,
  input?: boolean,
  output?: boolean,
  height?: number,
  width?: number,
  style?: VSliderStyle
}
interface Slider2DCreatorOptions {
  value?: Vector2,
  propName?: string,
  input?: boolean,
  output?: boolean,
  height?: number,
  style?: Slider2DStyle
}
interface SelectCreatorOptions {
  height?: number,
  propName?: string,
  input?: boolean,
  output?: boolean,
  style?: SelectStyle
}
interface RadioGroupCreatorOptions {
  propName?: string,
  input?: boolean,
  output?: boolean,
  height?: number,
  style?: RadioGroupStyle
}
interface LabelCreatorOptions {
  propName?: string,
  input?: boolean,
  output?: boolean,
  style?: LabelStyle,
  height?: number
}
interface InputCreatorOptions {
  value?: string | number,
  propName?: string,
  input?: boolean,
  output?: boolean,
  height?: number,
  style?: InputStyle
}
interface ImageCreatorOptions {
  propName?: string,
  style?: ImageStyle
}
interface HorizontalLayoutCreatorOptions {
  style?: HorizontalLayoutStyle,
  input?: boolean,
  output?: boolean
}
interface ButtonCreatorOption {
  input?: boolean,
  output?: boolean,
  height?: number,
  style?: ButtonStyle
}
interface DialCreatorOptions {
  value?: number
  propName?: string,
  input?: boolean,
  output?: boolean,
  style?: DialStyle,
}
interface DisplayCreatorOptions {
  style?: DisplayStyle
}
interface EnvelopeCreatorOptions {
  input?: boolean,
  output?: boolean,
  style?: EnvelopeStyle
}
