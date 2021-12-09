import { SerializedVector2, Vector2 } from "./vector";
import { ViewPort, LOD, Align } from '../common/enums';
import { Container, Label, Slider, UINode, Button, Image, HorizontalLayout, Toggle, Select, Source, Display, Input, Stack, CustomRendererConfig, ToggleStyle, SourceStyle, SliderStyle, SelectStyle, LabelStyle, InputStyle, ButtonStyle, DisplayStyle, HorizontalLayoutStyle, StackStyle, ImageStyle } from "../ui/index";
import { getNewGUID, intersects } from "../utils/utils";
import { Color, SerializedColor } from "./color";
import { Flow, FlowState, SerializedFlow } from './flow';
import { Group } from './group';
import { Terminal, TerminalType, TerminalStyle, SerializedTerminal } from './terminal';
import { Hooks } from './hooks';
import { Events, RenderState, Serializable, TerminalOutputs } from "../common/interfaces";
import { Connector } from "./connector";
import { Log } from "../utils/logger";
import { SerializedContainer } from "../ui/container";

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
  props: { [key: string]: any };
  group: Group = null;
  //#endregion

  //#region Accessors
  get context(): CanvasRenderingContext2D { return this.flow.flowConnect.context };
  get offContext(): OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D { return this.flow.flowConnect.offContext };
  get offUIContext(): OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D { return this.flow.flowConnect.offUIContext };
  get position(): Vector2 { return this._position };
  set position(position: Vector2) {
    this._position = position;
    this.reflow();
    this.ui.update();
    this.updateRenderState();
  }
  get zIndex(): number { return this._zIndex };
  set zIndex(zIndex: number) {
    if (this.flow.sortedNodes.remove(this)) {
      this._zIndex = zIndex;
      this.flow.sortedNodes.add(this);
    } else {
      this._zIndex = zIndex;
    }
  }
  get width(): number { return this._width };
  set width(width: number) {
    this._width = width;
    this.ui.width = width;
    this.ui.update();
  }
  //#endregion

  constructor(
    public flow: Flow,
    public name: string,
    position: Vector2,
    width: number,
    inputs: SerializedTerminal[], outputs: SerializedTerminal[],
    public style: NodeStyle = {},
    public terminalStyle: TerminalStyle = {},
    props: Object = {},
    public id: string = getNewGUID(),
    hitColor?: Color,
    ui?: Container | SerializedContainer
  ) {

    super();
    this.hitColor = hitColor;
    this._width = width;
    this.style = { ...DefaultNodeStyle(), ...style }
    this._position = position;
    this.setupProps(props);
    this.hitColorToUI = {};
    this.hitColorToTerminal = {};
    this.hitColorToNodeButton = {};
    this._zIndex = 0;
    this.setHitColor(hitColor);
    this.inputs.push(...inputs.map(input => new Terminal(this, TerminalType.IN, input.dataType, input.name, input.style ? input.style : { ...terminalStyle }, input.id ? input.id : null, input.hitColor ? Color.deSerialize(input.hitColor) : null)));
    this.outputs.push(...outputs.map(output => new Terminal(this, TerminalType.OUT, output.dataType, output.name, output.style ? output.style : { ...terminalStyle }, output.id ? output.id : null, output.hitColor ? Color.deSerialize(output.hitColor) : null)));
    this.ui = ui ? (ui instanceof Container ? ui : Container.deSerialize(this, ui)) : new Container(this, width);

    this.addNodeButton(() => this.toggleNodeState(), (_: NodeButton, position: Vector2) => {
      this.context.fillStyle = this.style.maximizeButtonColor;
      this.context.fillRect(position.x, position.y, this.style.nodeButtonSize, this.style.nodeButtonSize);
    }, Align.Left);

    this.reflow();
    this.ui.update();

    this.flow.on('transform', () => this.updateRenderState());
  }

  //#region Methods
  private setupProps(props: any) {
    this.props = new Proxy<any>({}, {
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

    Object.keys(props).forEach(key => {
      this.props[key] = props[key];
    });
  }
  /** @hidden */
  watch(propName: string, callback: (oldVal: any, newVal: any) => void) {
    if (/^.+\[\d+\]$/g.test(propName)) {
      let arrName = /^(.+)\[\d+\]$/g.exec(propName)[1];
      if (Array.isArray(this.props[arrName])) {
        this.propObservers[arrName].push(callback);
      } else {
        Log.error('Indexed prop observer can only be added for array-like props');
      }
    } else if (typeof this.props[propName] !== 'undefined') {
      this.propObservers[propName].push(callback);
    } else {
      Log.error('Prop \'', propName, '\' not found');
    }
  }
  /** @hidden */
  removePropObserver(propName: string, callback: (oldVal: any, newVal: any) => void) {
    if (this.propObservers[propName]) {
      this.propObservers[propName].splice(this.propObservers[propName].indexOf(callback), 1);
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
      let inputTerminalsWidth = this.inputs.length === 0 ? (this.inputsUI.length === 0 ? 0 : this.inputsUI[0].style.radius * 2) : this.inputs[0].style.radius * 2;
      inputTerminalsWidth += this.style.terminalStripMargin * 2;
      let outputTerminalsWidth = this.outputs.length === 0 ? (this.outputsUI.length === 0 ? 0 : this.outputsUI[0].style.radius * 2) : this.outputs[0].style.radius * 2;
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
  getInput(terminal: string | number): any {
    if (typeof terminal === 'string') {
      let inputTerminal = this.inputs.find(currTerm => (currTerm.name === terminal));
      if (inputTerminal) return (inputTerminal as any)['getData']();
    } else {
      if (this.inputs[terminal]) return (this.inputs[terminal] as any)['getData']();
    }
    return null;
  }
  getInputs(): any[] {
    return this.inputs.map(terminal => (terminal as any)['getData']());
  }
  setOutputs(outputs: string | number | TerminalOutputs, data?: any) {
    if (typeof outputs === 'string') {
      let outputTerminal = this.outputs.find(term => (term.name === outputs));
      if (outputTerminal) (outputTerminal as any)['setData'](data);
    } else if (typeof outputs === 'number') {
      if (this.outputs[outputs]) (this.outputs[outputs] as any)['setData'](data);
    } else {
      let outputData = new Map<Terminal, any>();
      Object.entries(outputs).forEach(entry => {
        let terminal = this.outputs.find(terminal => terminal.name === entry[0]);
        if (terminal) outputData.set(terminal, entry[1]);
        else throw Log.error("Terminal '" + entry[0] + "' not found");
      });
      let groupedConnectors = new Map<Node, Connector[]>();
      let outputDataIterator = outputData.keys();
      let curr: Terminal;
      while ((curr = outputDataIterator.next().value) && curr) {
        curr.connectors.forEach(connector => {
          if (groupedConnectors.has(connector.endNode)) groupedConnectors.get(connector.endNode).push(connector);
          else groupedConnectors.set(connector.endNode, [connector]);
        });
      }
      let gCntrsIterator = groupedConnectors.values();
      let connectors: Connector[];
      while ((connectors = gCntrsIterator.next().value) && connectors) {
        for (let i = 1; i < connectors.length; i += 1) connectors[i].setData(outputData.get(connectors[i].start));
        connectors[0].data = outputData.get(connectors[0].start);
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
  createLabel(text: string, propName?: string, input?: boolean, output?: boolean, style?: LabelStyle): Label {
    return new Label(this, text, propName, input, output, style);
  }
  createImage(source: string, propName?: string, style?: ImageStyle): Image {
    return new Image(this, source, propName, style);
  }
  createSlider(min: number, max: number, value: number, precision?: number, propName?: string, input?: boolean, output?: boolean, height?: number, style?: SliderStyle) {
    return new Slider(this, min, max, value, precision, propName, input, output, height, style);
  }
  createHozLayout(childs?: UINode[], style?: HorizontalLayoutStyle) {
    return new HorizontalLayout(this, childs, style);
  }
  createStack(childs?: UINode[], style?: StackStyle) {
    return new Stack(this, childs, style);
  }
  createButton(text: string, input?: boolean, output?: boolean, height?: number, style?: ButtonStyle) {
    return new Button(this, text, input, output, height, style);
  }
  createToggle(propName?: string, input?: boolean, output?: boolean, height?: number, style?: ToggleStyle) {
    return new Toggle(this, propName, input, output, height, style);
  }
  createSelect(options: string[], propName?: string, input?: boolean, output?: boolean, height?: number, style?: SelectStyle) {
    return new Select(this, options, propName, input, output, height, style);
  }
  createSource(accept?: string, propName?: string, input?: boolean, output?: boolean, height?: number, style?: SourceStyle) {
    return new Source(this, accept, propName, input, output, height, style);
  }
  createDisplay(height: number, renderers: CustomRendererConfig[], style?: DisplayStyle) {
    return new Display(this, height, renderers, style);
  }
  createInput(value: string | number, propName?: string, input?: boolean, output?: boolean, height?: number, style?: InputStyle) {
    return new Input(this, value, propName, input, output, height, style);
  }
  //#endregion

  serialize(): SerializedNode {
    return {
      id: this.id,
      name: this.name,
      position: this.position.serialize(),
      width: this.width,
      props: this.props,
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
    return new Node(flow, data.name, Vector2.deSerialize(data.position), data.width, data.inputs, data.outputs, data.style, data.terminalStyle, data.props, data.id, Color.deSerialize(data.hitColor), data.ui);
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
  props: { [key: string]: any },
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
