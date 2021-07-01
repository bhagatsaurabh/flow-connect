import { Vector2 } from "../math/vector";
import { ViewPort, NodeState, LOD, TerminalType, Align, Constant, FlowState } from '../math/constants';
import { Container, Label, Slider, UINode, Button, Image, HorizontalLayout, Toggle, Select, Source, Display, Input } from "../ui/index";
import { getNewGUID, intersects } from "../utils/utils";
import { Color } from "./color";
import { Flow } from './flow';
import { Group } from './group';
import { Terminal } from './terminal';
import { Hooks } from './hooks';
import { ButtonStyle, DisplayStyle, Events, HorizontalLayoutStyle, ImageStyle, InputStyle, LabelStyle, NodeStyle, RenderState, SelectStyle, Serializable, SerializedContainer, SerializedNode, SerializedTerminal, SliderStyle, SourceStyle, TerminalStyle, ToggleStyle } from "./interfaces";

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

  setHitColor() {
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
  _offUIRender() {
    this.node.offUIContext.fillStyle = this.hitColor.rgbaCSSString;
    this.node.offUIContext.fillRect(
      this.node.position.x + this.deltaX,
      this.node.position.y + this.node.style.titleHeight / 2 - this.node.style.nodeButtonSize / 2,
      this.node.style.nodeButtonSize,
      this.node.style.nodeButtonSize
    );
  }
}

export class Node extends Hooks implements Events, Serializable {
  //#region Properties
  _width: number;
  context: CanvasRenderingContext2D;
  offContext: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;
  offUIContext: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;
  hitColorToUI: { [key: string]: UINode };
  hitColorToTerminal: { [key: string]: Terminal };
  hitColorToNodeButton: { [key: string]: NodeButton };
  private _zIndex: number;
  focused: boolean = false;
  inputs: Terminal[] = [];
  outputs: Terminal[] = [];
  inputsUI: Terminal[] = [];
  outputsUI: Terminal[] = [];
  ui: Container;
  nodeButtons: NodeButton[] = [];
  private _position: Vector2;
  props: { [key: string]: any };
  propObservers: { [key: string]: Array<(oldVal: any, newVal: any) => void> } = {};
  renderState: RenderState = { viewport: ViewPort.INSIDE, nodeState: NodeState.MAXIMIZED, lod: LOD.LOD2 };
  group: Group = null;

  currHitTerminal: Terminal;
  prevHitTerminal: Terminal;
  currHitUINode: UINode;
  prevHitUINode: UINode;
  //#endregion

  //#region Accessors
  get position(): Vector2 {
    return this._position;
  }
  set position(position: Vector2) {
    this._position = position;
    this.reflow();
    this.ui.update();
    this.updateRenderState();
  }
  get zIndex(): number {
    return this._zIndex;
  }
  set zIndex(zIndex: number) {
    this._zIndex = zIndex;
    if (this.flow.sortedNodes.remove(this)) {
      this.flow.sortedNodes.add(this);
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
    public hitColor?: Color,
    ui?: Container | SerializedContainer
  ) {

    super();
    this._width = width;
    this.style = { ...Constant.DefaultNodeStyle(), ...style }
    this._position = position;
    this.setupProps(props);
    this.hitColorToUI = {};
    this.hitColorToTerminal = {};
    this.hitColorToNodeButton = {};
    this.zIndex = 0;
    this.context = flow.flowConnect.context;
    this.offContext = flow.flowConnect.offContext;
    this.offUIContext = flow.flowConnect.offUIContext;
    this.setHitColor(hitColor);
    this.inputs.push(...inputs.map(input => new Terminal(this, TerminalType.IN, input.dataType, input.name, input.style ? input.style : { ...terminalStyle }, null, input.id ? input.id : null, input.hitColor ? Color.deSerialize(input.hitColor) : null)));
    this.outputs.push(...outputs.map(output => new Terminal(this, TerminalType.OUT, output.dataType, output.name, output.style ? output.style : { ...terminalStyle }, null, output.id ? output.id : null, output.hitColor ? Color.deSerialize(output.hitColor) : null)));
    this.ui = ui ? (ui instanceof Container ? ui : Container.deSerialize(this, ui)) : new Container(this, width);

    this.addNodeButton(() => this.toggleNodeState(), (nodeButton: NodeButton, position: Vector2) => {
      this.context.fillStyle = this.style.maximizeButtonColor;
      this.context.fillRect(position.x, position.y, this.style.nodeButtonSize, this.style.nodeButtonSize);
    }, Align.Left);

    this.reflow();
    this.ui.update();

    this.flow.on('transform', () => this.updateRenderState());
  }

  //#region Methods
  setupProps(props: { [key: string]: any }) {
    let propsTarget: { [key: string]: any } = {};
    this.props = new Proxy(propsTarget, {
      set: (target, prop: string, value) => {
        if (typeof target[prop] === 'undefined') {
          this.propObservers[prop] = [];
        }
        let oldValue = target[prop];
        target[prop] = value;
        this.propObservers[prop].forEach(callback => callback(oldValue, value));

        if (this.registeredEvents['propchange']) {
          this.call('propchange', this, prop, oldValue, value);
        }
        return true;
      }
    });

    Object.keys(props).forEach(key => {
      this.props[key] = props[key];
    });
  }
  addPropObserver(propName: string, callback: (oldVal: any, newVal: any) => void) {
    if (typeof this.props[propName] !== 'undefined') {
      this.propObservers[propName].push(callback);
    }
  }
  removePropObserver(propName: string, callback: (oldVal: any, newVal: any) => void) {
    if (this.propObservers[propName]) {
      this.propObservers[propName].splice(this.propObservers[propName].indexOf(callback), 1);
    }
  }
  setHitColor(hitColor: Color) {
    if (!hitColor) {
      hitColor = Color.Random();
      while (this.flow.hitColorToNode[hitColor.rgbaString]) hitColor = Color.Random();
    }
    this.hitColor = hitColor;
    this.flow.hitColorToNode[this.hitColor.rgbaString] = this;
  }
  addTerminal(terminal: Terminal | SerializedTerminal) {
    if (!(terminal instanceof Terminal)) {
      terminal = Terminal.deSerialize(this, terminal);
    }
    if (terminal.type === TerminalType.IN) this.inputs.push(terminal);
    else this.outputs.push(terminal);
    this.reflow();
    this.ui.reflow();
  }
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
  dispose(): void {
    this.flow.removeNode(this.id);
  }
  reflow(): void {
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
  toggleNodeState() {
    this.renderState.nodeState = this.renderState.nodeState === NodeState.MAXIMIZED ? NodeState.MINIMIZED : NodeState.MAXIMIZED;
  }
  updateRenderState() {
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
  recalculateInputTerminals(y: number) {
    this.inputs.forEach(terminal => {
      terminal.position.x = this.position.x - this.style.terminalStripMargin - terminal.style.radius;
      terminal.position.y = y;
      y += this.style.terminalRowHeight;
    });
  }
  recalculateOutputTerminals(y: number) {
    this.outputs.forEach(terminal => {
      terminal.position.x = this.position.x + this.ui.width + this.style.terminalStripMargin + terminal.style.radius;
      terminal.position.y = y;
      y += this.style.terminalRowHeight;
    });
  }
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
  getHitUINode(hitColor: string): UINode {
    let uiNode = this.hitColorToUI[hitColor];
    if (uiNode instanceof Container) return null;
    return uiNode;
  }
  getHitNodeButton(hitColor: string): NodeButton {
    return this.hitColorToNodeButton[hitColor];
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
  setOutput(terminal: string | number, data: any) {
    if (typeof terminal === 'string') {
      let outputTerminal = this.outputs.find(currTerm => (currTerm.name === terminal));
      if (outputTerminal) return (outputTerminal as any)['setData'](data);
    } else {
      if (this.outputs[terminal]) (this.outputs[terminal] as any)['setData'](data);
    }
  }
  run() {
    if (this.flow.state === FlowState.Stopped) return;

    this.call('process', this, this.inputs.map(terminal => terminal.connectors.length > 0 ? terminal.connectors[0].data : null));
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
  _render() {
    if (this.renderState.nodeState === NodeState.MAXIMIZED) {
      if (this.renderState.lod > 0) {
        this.inputs.forEach(terminal => terminal.render());
        this.outputs.forEach(terminal => terminal.render());
      }
    } else {
      this.context.fillStyle = 'green';
      if ((this.inputs.length + this.inputsUI.length) > 0) {
        let radius = this.inputs.length > 0 ? this.inputs[0].style.radius : this.inputsUI[0].style.radius;
        this.context.fillRect(this.position.x - this.style.terminalStripMargin - radius * 2, this.position.y + this.style.titleHeight / 2 - radius, radius * 2, radius * 2);
      }
      if ((this.outputs.length + this.outputsUI.length) > 0) {
        let radius = this.outputs.length > 0 ? this.outputs[0].style.radius : this.outputsUI[0].style.radius;
        this.context.fillRect(this.position.x + this.width + this.style.terminalStripMargin, this.position.y + this.style.titleHeight / 2 - radius, radius * 2, radius * 2);
      }
    }

    this.context.fillStyle = this.style.titleColor;
    this.context.font = this.style.titleFontSize + ' ' + this.style.titleFont;
    this.context.textBaseline = 'middle';
    this.context.fillText(this.name, this.position.x + this.ui.width / 2 - this.context.measureText(this.name).width / 2, this.position.y + this.style.titleHeight / 2);

    if (this.renderState.nodeState === NodeState.MAXIMIZED) {
      this.context.fillStyle = this.style.color;
      this.context.font = this.style.fontSize + ' ' + this.style.font;
      this.context.textBaseline = 'middle';
      this.inputs.forEach(terminal => {
        this.context.fillText(terminal.name, terminal.position.x + terminal.style.radius + this.style.terminalStripMargin + this.style.padding, terminal.position.y);
      });
      this.outputs.forEach(terminal => {
        this.context.fillText(terminal.name, terminal.position.x - terminal.style.radius - this.style.terminalStripMargin - this.style.padding - this.context.measureText(terminal.name).width, terminal.position.y);
      });
    }

    if (this.focused) {
      this.context.strokeStyle = '#000';
      this.context.lineWidth = 2;
      let inputTerminalsWidth = this.inputs.length === 0 ? (this.inputsUI.length === 0 ? 0 : this.inputsUI[0].style.radius * 2) : this.inputs[0].style.radius * 2;
      inputTerminalsWidth += this.style.terminalStripMargin * 2;
      let outputTerminalsWidth = this.outputs.length === 0 ? (this.outputsUI.length === 0 ? 0 : this.outputsUI[0].style.radius * 2) : this.outputs[0].style.radius * 2;
      outputTerminalsWidth += this.style.terminalStripMargin * 2;
      this.context.strokeRoundRect(
        this.position.x - inputTerminalsWidth,
        this.position.y,
        this.width + inputTerminalsWidth + outputTerminalsWidth,
        this.renderState.nodeState === NodeState.MAXIMIZED ? (this.ui.height + this.style.padding) : this.style.titleHeight,
        4
      );
    }
  }
  _offRender() {
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
  //#endregion

  //#region Events
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
  onEnter(screenPosition: Vector2, realPosition: Vector2): void {
    this.call('enter', this, screenPosition, realPosition);
  }
  onExit(screenPosition: Vector2, realPosition: Vector2): void {
    this.call('exit', this, screenPosition, realPosition);

    let hitColor = Color.rgbaToString(this.flow.flowConnect.offUIContext.getImageData(screenPosition.x, screenPosition.y, 1, 1).data);

    let hitTerminal = this.getHitTerminal(hitColor, screenPosition, realPosition);
    hitTerminal && hitTerminal.onExit(screenPosition, realPosition);
    this.prevHitTerminal && this.prevHitTerminal.onExit(screenPosition, realPosition);
    this.prevHitTerminal = null;
    this.currHitTerminal && this.currHitTerminal.onExit(screenPosition, realPosition);
  }
  onUp(screenPosition: Vector2, realPosition: Vector2): void {
    this.call('up', this, screenPosition, realPosition);

    let hitColor = Color.rgbaToString(this.flow.flowConnect.offUIContext.getImageData(screenPosition.x, screenPosition.y, 1, 1).data);

    this.currHitUINode = null;
    let hitUINode = this.getHitUINode(hitColor);
    hitUINode && hitUINode.onUp(screenPosition.clone(), realPosition.clone());

    let hitTerminal = this.getHitTerminal(hitColor, screenPosition, realPosition);
    hitTerminal && hitTerminal.onUp(screenPosition, realPosition);
  }
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
  onDrag(screenPosition: Vector2, realPosition: Vector2): void {
    this.call('drag', this, screenPosition, realPosition);

    this.currHitUINode && this.currHitUINode.draggable && this.currHitUINode.onDrag(screenPosition, realPosition);
  }
  onContextMenu(): void {
    this.call('rightclick', this);
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
  createDisplay(height: number, render: (context: CanvasRenderingContext2D, width: number, height: number) => void, style?: DisplayStyle) {
    return new Display(this, height, render, style);
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
