import { Connector, Flow, Group, Node, Color, Hooks } from "./core/index";
import { Vector2 } from "./math/vector";
import { Constant, TerminalType, ViewPort } from './math/constants';
import { Dimension, FlowOptions, Pointer, SerializedFlow } from "./core/interfaces";
import { intersects } from "./utils/utils";

export class FlowConnect extends Hooks {
  canvasDimensions: Dimension = { top: 0, left: 0, width: 0, height: 0 };
  canvasElement: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  offCanvasElement: OffscreenCanvas | HTMLCanvasElement;
  offContext: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;
  offUICanvasElement: OffscreenCanvas | HTMLCanvasElement;
  offUIContext: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;
  offGroupCanvasElement: OffscreenCanvas | HTMLCanvasElement;
  offGroupContext: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;
  get cursor(): string { return this.canvasElement.style.cursor; }
  set cursor(cursor: string) { this.canvasElement.style.cursor = cursor; }
  frameId: number;

  rootFlow: Flow;
  currFlow: Flow;

  floatingConnector: Connector;
  currHitNode: Node;
  prevHitNode: Node;
  currHitGroup: Group;
  currGroup: Group;
  groupStartPoint: Vector2;
  pointers: Pointer[] = [];
  keymap: { [key: string]: boolean } = {};
  touchControls: { [control: string]: boolean } = { 'CreateGroup': false };
  minScale: number = 0.1;
  maxScale: number = 5;
  wheelScaleDelta: number = 1.05;
  pinchScaleDelta: number = 1.02;
  genericInput: HTMLInputElement = document.createElement('input');
  get scale(): number { return this.transform.a; }
  transform: DOMMatrix = new DOMMatrix();
  inverseTransform: DOMMatrix = new DOMMatrix();
  identity: DOMMatrix = new DOMMatrix();

  constructor(mount?: HTMLCanvasElement | HTMLDivElement, width?: number, height?: number) {
    super();
    this.prepareCanvas(mount, width, height);
    this.setupHitCanvas();
    this.calculateCanvasDimension();
    this.registerChangeListeners();
    this.attachStyles();
    this.polyfill();

    this.registerEvents();
    this.setGenericInput();
  }

  registerChangeListeners() {
    let throttle = false;
    document.addEventListener('scroll', () => {
      if (!throttle) {
        window.requestAnimationFrame(() => {
          this.calculateCanvasDimension();
          throttle = false;
        });
        throttle = true;
      }
    });

    const resizeObserver = new ResizeObserver(() => {
      this.calculateCanvasDimension();
    })
    resizeObserver.observe(this.canvasElement);
  }
  prepareCanvas(mount?: HTMLCanvasElement | HTMLDivElement, width?: number, height?: number) {
    if (!mount) {
      this.canvasElement = document.createElement('canvas');
      this.canvasElement.width = document.body.clientWidth;
      this.canvasElement.height = document.body.clientHeight;
      document.body.appendChild(this.canvasElement);
    } else if (mount instanceof HTMLDivElement) {
      this.canvasElement = document.createElement('canvas');
      if (width && height) {
        this.canvasElement.width = width;
        this.canvasElement.height = height;
      } else {
        this.canvasElement.width = mount.clientWidth;
        this.canvasElement.height = mount.clientHeight;
      }
      mount.appendChild(this.canvasElement);
    } else {
      this.canvasElement = mount;
      if (width && height) {
        this.canvasElement.width = width;
        this.canvasElement.height = height;
      }
    }
    this.context = this.canvasElement.getContext('2d');
  }
  setupHitCanvas() {
    if (typeof OffscreenCanvas !== 'undefined' && typeof OffscreenCanvasRenderingContext2D !== 'undefined') {
      this.offCanvasElement = new OffscreenCanvas(this.canvasDimensions.width, this.canvasDimensions.height);
      this.offUICanvasElement = new OffscreenCanvas(this.canvasDimensions.width, this.canvasDimensions.height);
      this.offGroupCanvasElement = new OffscreenCanvas(this.canvasDimensions.width, this.canvasDimensions.height);
    } else {
      this.offCanvasElement = document.createElement('canvas');
      this.offUICanvasElement = document.createElement('canvas');
      this.offGroupCanvasElement = document.createElement('canvas');
    }
    this.offContext = this.offCanvasElement.getContext('2d');
    this.offUIContext = this.offUICanvasElement.getContext('2d');
    this.offGroupContext = this.offGroupCanvasElement.getContext('2d');
  }
  attachStyles() {
    this.canvasElement.style.touchAction = 'none';

    let inputStyle = document.createElement('style');
    inputStyle.innerHTML = 'input.flow-connect-input { position: fixed; visibility: hidden; pointer-events: none; z-index: 100; border: none; border-radius: 0; box-sizing: border-box;} input.flow-connect-input:focus { outline: none; }';
    document.getElementsByTagName('head')[0].appendChild(inputStyle);
  }
  calculateCanvasDimension() {
    let boundingRect = this.canvasElement.getBoundingClientRect();
    this.canvasDimensions = {
      top: Math.round(boundingRect.top - window.scrollY),
      left: Math.round(boundingRect.left - window.scrollX),
      width: Math.round(boundingRect.width),
      height: Math.round(boundingRect.height)
    }
    this.offCanvasElement.width = this.canvasDimensions.width;
    this.offCanvasElement.height = this.canvasDimensions.height;
    this.offUICanvasElement.width = this.canvasDimensions.width;
    this.offUICanvasElement.height = this.canvasDimensions.height;
    this.offGroupCanvasElement.width = this.canvasDimensions.width;
    this.offGroupCanvasElement.height = this.canvasDimensions.height;
  }
  polyfill() {
    CanvasRenderingContext2D.prototype.roundRect = function (x: number, y: number, width: number, height: number, radius: number) {
      this.beginPath();
      this.moveTo(x + radius, y);
      this.lineTo(x + width - radius, y);
      this.quadraticCurveTo(x + width, y, x + width, y + radius);
      this.lineTo(x + width, y + height - radius);
      this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      this.lineTo(x + radius, y + height);
      this.quadraticCurveTo(x, y + height, x, y + height - radius);
      this.lineTo(x, y + radius);
      this.quadraticCurveTo(x, y, x + radius, y);
      this.closePath();
    }
    CanvasRenderingContext2D.prototype.strokeRoundRect = function (x: number, y: number, width: number, height: number, radius: number) {
      if (typeof radius === 'undefined') radius = 5;
      this.roundRect(x, y, width, height, radius);
      this.stroke();
    }
    CanvasRenderingContext2D.prototype.fillRoundRect = function (x: number, y: number, width: number, height: number, radius: number) {
      if (typeof radius === 'undefined') radius = 5;
      this.roundRect(x, y, width, height, radius);
      this.fill();
    }
  }
  createFlow(options: FlowOptions = { name: 'New Flow', rules: {}, terminalTypeColors: {} }): Flow {
    Object.keys(Constant.DefaultRules).forEach(key => options.rules[key] = Constant.DefaultRules[key]);
    return new Flow(this, options.name, options.rules, options.terminalTypeColors);
  }

  registerEvents(): void {
    let dragDelta: Vector2;
    let prevPanPosition: Vector2 = Vector2.Zero();
    let prevPinchDistance: number = -1;

    window.onkeydown = (ev: KeyboardEvent) => {
      !this.keymap[ev.key] && (this.keymap[ev.key] = true);
    }
    window.onkeyup = (ev: KeyboardEvent) => {
      this.keymap[ev.key] = false;
    }

    this.canvasElement.onpointerdown = (ev: PointerEvent) => {
      if (!this.currFlow) return;

      this.addPointer(ev.pointerId, this.getRelativePosition(ev));
      if (this.pointers.length === 1) {
        prevPanPosition = this.pointers[0].screenPosition;
        this.currHitNode = this.getHitNode(this.pointers[0].screenPosition);
        if (this.currHitNode) {
          this.currHitNode.zIndex = Infinity;
          if (this.keymap['Control']) {
            this.currHitNode.focused = !this.currHitNode.focused;
          } else {
            this.currFlow.removeAllFocus();
            this.currHitNode.focused = true;
          }
          this.currHitNode.onDown(this.pointers[0].screenPosition.clone(), this.pointers[0].realPosition.clone());
          dragDelta = this.currHitNode.position.subtract(this.pointers[0].realPosition);
        } else {
          if (!this.keymap['Control']) {
            this.currFlow.removeAllFocus();

            this.currHitGroup = this.getHitGroup(this.pointers[0].screenPosition);
            this.currHitGroup && (dragDelta = this.currHitGroup.position.subtract(this.pointers[0].realPosition));
          }
          else if (this.keymap['Control'] || this.touchControls['CreateGroup']) {
            this.groupStartPoint = this.pointers[0].realPosition.clone();
            this.currGroup = new Group(this.currFlow, this.groupStartPoint.clone(), 0, 0, 'New Group');
          }
        }
      } else {
        this.currHitNode = null;
        this.currHitGroup = null;
        this.currFlow.removeAllFocus();
        if (this.floatingConnector) {
          this.fallbackConnection();
        }
      }
    }
    this.canvasElement.onpointerup = (ev) => {
      if (!this.currFlow) return;

      this.removePointer(this.pointers, ev);

      if (this.pointers.length < 2) prevPinchDistance = -1;

      let screenPosition = this.getRelativePosition(ev);
      let realPosition = screenPosition.transform(this.inverseTransform);

      if (this.currHitNode) this.handleGrouping(screenPosition);

      this.currHitNode = null;
      this.currHitGroup = null;

      let hitNode = this.getHitNode(screenPosition);
      hitNode && hitNode.onUp(screenPosition.clone(), realPosition.clone());

      if (this.currGroup) {
        let newGroup = this.currGroup;
        this.currGroup = null;
        if (newGroup.width > 10 && newGroup.height > 10) {
          this.currFlow.groups.push(newGroup);
          newGroup.setContainedNodes();
        }
      }
      if (this.floatingConnector) this.handleConnection(hitNode, screenPosition, realPosition);
    }
    this.canvasElement.onpointerout = (ev) => {
      if (!this.currFlow) return;

      this.removePointer(this.pointers, ev);
      if (this.pointers.length === 0) {
        if (this.currHitNode) {
          let screenPosition = this.getRelativePosition(ev);
          this.handleGrouping(screenPosition);
        }
        this.currHitNode = null;
        this.currHitGroup = null;
      }

      if (this.currGroup) {
        let newGroup = this.currGroup;
        this.currGroup = null;
        if (newGroup.width > 10 && newGroup.height > 10) {
          this.currFlow.groups.push(newGroup);
          newGroup.setContainedNodes();
        }
      }

      if (this.floatingConnector) this.fallbackConnection();

      if (this.prevHitNode) {
        let screenPosition = this.getRelativePosition(ev);
        let realPosition = screenPosition.transform(this.inverseTransform);
        this.prevHitNode.onExit(screenPosition, realPosition);
        this.prevHitNode = null;
      }
    }
    this.canvasElement.onpointermove = (ev) => {
      if (!this.currFlow) return;

      let screenPosition = this.getRelativePosition(ev);
      let realPosition = screenPosition.transform(this.inverseTransform);

      this.updatePointer(ev.pointerId, screenPosition, realPosition);

      if (this.pointers.length === 2) {
        let currPinchDistance = Vector2.Distance(this.pointers[0].screenPosition, this.pointers[1].screenPosition);
        if (prevPinchDistance > 0) {
          if (currPinchDistance !== prevPinchDistance) {
            this.handleZoom(currPinchDistance > prevPinchDistance, Vector2.Midpoint(this.pointers[0].screenPosition, this.pointers[1].screenPosition), this.pinchScaleDelta);
          }
        }
        prevPinchDistance = currPinchDistance;
      }

      if (this.currGroup) {
        if (realPosition.x < this.groupStartPoint.x) this.currGroup._position.x = realPosition.x;
        this.currGroup.width = Math.abs(this.groupStartPoint.x - realPosition.x);

        if (realPosition.y < this.groupStartPoint.y) this.currGroup._position.y = realPosition.y;
        this.currGroup.height = Math.abs(this.groupStartPoint.y - realPosition.y);
      }

      if (this.currHitNode) {
        this.currHitNode.onDrag(screenPosition.clone(), realPosition.clone());
        if ((!this.currHitNode.currHitUINode || !this.currHitNode.currHitUINode.draggable) && !this.currHitNode.currHitTerminal && !this.floatingConnector) {
          this.currHitNode.position = realPosition.add(dragDelta);

          let hitGroup = this.getHitGroup(screenPosition);
          if (hitGroup && hitGroup === this.currHitNode.group) {
            let groupRealPos = hitGroup.position.transform(this.transform);
            let nodeRealPos = this.currHitNode.position.transform(this.transform);

            let intersection = intersects(groupRealPos.x, groupRealPos.y,
              groupRealPos.x + hitGroup.width * this.scale,
              groupRealPos.y + hitGroup.height * this.scale,
              nodeRealPos.x, nodeRealPos.y,
              nodeRealPos.x + this.currHitNode.width * this.scale,
              nodeRealPos.y + this.currHitNode.ui.height * this.scale
            );

            if (intersection === ViewPort.INSIDE) {
              let nodeIndex = hitGroup.nodes.findIndex(node => node.id === this.currHitNode.id);
              hitGroup.nodeDeltas[nodeIndex] = this.currHitNode.position.subtract(hitGroup.position);
            }
          }
        }
      } else {
        if (this.currHitGroup) {
          this.currHitGroup.position = realPosition.add(dragDelta);
        } else if (this.pointers.length === 1 && !this.keymap['Control'] && !this.touchControls['CreateGroup']) {
          let delta = screenPosition.subtract(prevPanPosition).multiplyInPlace(1 / this.scale);
          prevPanPosition = screenPosition;
          this.updateTransform(null, null, delta);
        }
      }
      if (this.floatingConnector) this.floatingConnector.floatingTip = realPosition;

      if (ev.pointerType === 'mouse' && !this.currHitNode) {
        let hitNode = this.getHitNode(screenPosition);
        if (hitNode !== this.prevHitNode) {
          this.prevHitNode && this.prevHitNode.onExit(screenPosition, realPosition);
          hitNode && hitNode.onEnter(screenPosition, realPosition);
        } else {
          hitNode && (!this.currHitNode) && hitNode.onOver(screenPosition, realPosition);
        }
        this.prevHitNode = hitNode;
      }
    }
    this.canvasElement.onclick = (ev) => {
      if (!this.currFlow) return;

      let screenPosition = this.getRelativePosition(ev);
      let realPosition = screenPosition.transform(this.inverseTransform);
      let hitNode = this.getHitNode(screenPosition);
      hitNode && hitNode.onClick(screenPosition.clone(), realPosition.clone());

      if (!hitNode) {
        let hitGroup = this.getHitGroup(screenPosition);
        hitGroup && hitGroup.onClick(screenPosition.clone(), realPosition.clone());
      }
    };
    this.canvasElement.oncontextmenu = (ev) => {
      if (!this.currFlow) return;

      ev.preventDefault();

      let screenPosition = this.getRelativePosition(ev);
      let hitNode = this.getHitNode(screenPosition);
      hitNode && hitNode.onContextMenu();
      if (!this.keymap['Control']) this.currFlow.removeAllFocus();
      hitNode && (hitNode.focused = true);
    }
    this.canvasElement.onwheel = (ev: WheelEvent) => {
      if (!this.currFlow) return;

      this.handleZoom(ev.deltaY < 0, this.getRelativePosition(ev), this.wheelScaleDelta);
    }
  }
  setGenericInput() {
    this.genericInput.className = 'flow-connect-input';
    this.genericInput.style.visibility = 'hidden';
    this.genericInput.style.pointerEvents = 'none';
    this.genericInput.style.padding = '0';

    this.genericInput.onblur = () => {
      this.genericInput.style.visibility = 'hidden';
      this.genericInput.style.pointerEvents = 'none';

      this.genericInput.onchange = null;
    }

    document.body.appendChild(this.genericInput);
  }
  showGenericInput(position: Vector2 | DOMPoint, value: string, styles: { [key: string]: any }, attributes: { [key: string]: any }, callback: (value: string) => void) {
    if (document.activeElement === this.genericInput) return;

    Object.keys(styles).forEach(key => (this.genericInput.style as any)[key] = styles[key]);
    Object.keys(attributes).forEach(key => (this.genericInput as any)[key] = attributes[key]);

    this.genericInput.style.left = (position.x + this.canvasDimensions.left) + 'px';
    this.genericInput.style.top = (position.y + this.canvasDimensions.top - 3) + 'px';
    this.genericInput.style.visibility = 'visible';
    this.genericInput.style.pointerEvents = 'all';
    this.genericInput.value = value;
    this.genericInput.onchange = () => callback(this.genericInput.value);
    this.genericInput.focus();
  }
  updatePointer(id: number, screenPosition: Vector2, realPosition: Vector2) {
    let pointer = this.pointers.find(pointer => pointer.id === id);
    if (pointer) {
      pointer.screenPosition = screenPosition;
      pointer.realPosition = realPosition;
    }
  }
  handleZoom(zoomIn: boolean, origin: Vector2, scaleDelta: number) {
    if ((this.transform.a >= this.maxScale && zoomIn) || (this.transform.a <= this.minScale && !zoomIn)) return;
    this.updateTransform(zoomIn ? scaleDelta : (1 / scaleDelta), origin, null);
  }
  handleGrouping(screenPosition: Vector2) {
    let hitGroup = this.getHitGroup(screenPosition);

    let intersection;
    if (hitGroup) {
      let groupRealPos = hitGroup.position.transform(this.transform);
      let nodeRealPos = this.currHitNode.position.transform(this.transform);

      intersection = intersects(groupRealPos.x, groupRealPos.y,
        groupRealPos.x + hitGroup.width * this.scale,
        groupRealPos.y + hitGroup.height * this.scale,
        nodeRealPos.x, nodeRealPos.y,
        nodeRealPos.x + this.currHitNode.width * this.scale,
        nodeRealPos.y + this.currHitNode.ui.height * this.scale
      );
    }

    if (this.currHitNode.group) {
      if (this.currHitNode.group !== hitGroup) {
        let nodeIndex = this.currHitNode.group.nodes.findIndex(node => node.id === this.currHitNode.id);
        this.currHitNode.group.nodes.splice(nodeIndex, 1);
        this.currHitNode.group.nodeDeltas.splice(nodeIndex, 1);
        this.currHitNode.group = null;
      } else {
        if (intersection !== ViewPort.INSIDE) {
          let nodeIndex = this.currHitNode.group.nodes.findIndex(node => node.id === this.currHitNode.id);
          this.currHitNode.group.nodes.splice(nodeIndex, 1);
          this.currHitNode.group.nodeDeltas.splice(nodeIndex, 1);
          this.currHitNode.group = null;
        }
      }
    }

    if (hitGroup) {
      if (intersection === ViewPort.INSIDE) {
        this.currHitNode.group = hitGroup;
        hitGroup.nodes.push(this.currHitNode);
        hitGroup.nodeDeltas.push(this.currHitNode.position.subtract(hitGroup.position));
      }
    }
  }
  handleConnection(hitNode: Node, screenPosition: Vector2, realPosition: Vector2) {
    if (!hitNode) {
      this.fallbackConnection();
      return;
    }
    let hitTerminal = hitNode.getHitTerminal(
      Color.rgbaToString(this.offUIContext.getImageData(screenPosition.x, screenPosition.y, 1, 1).data),
      screenPosition.clone(),
      realPosition.clone()
    );
    if (hitTerminal) hitNode.currHitTerminal = hitTerminal;
    if (!hitTerminal) {
      this.fallbackConnection();
      return;
    }

    let destination = hitNode.currHitTerminal;
    if (!this.floatingConnector.canConnect(destination)) {
      this.fallbackConnection();
      hitNode.currHitTerminal = null;
      return;
    } else {
      if (destination.type === TerminalType.OUT) {
        this.floatingConnector.completeConnection(destination);
        hitNode.currHitTerminal = null;
      } else {
        if (destination.connectors.length > 0) {
          if (destination.connectors[0].start === this.floatingConnector.start) {
            this.fallbackConnection();
            hitNode.currHitTerminal = null;
            return;
          }
          let index = destination.connectors[0].start.connectors.indexOf(destination.connectors[0]);
          let [oldConnector] = destination.connectors[0].start.connectors.splice(index, 1);
          delete this.currFlow.connectors[oldConnector.id];
          oldConnector.start.call('disconnect', oldConnector.start, oldConnector);
          oldConnector.end.call('disconnect', oldConnector.end, oldConnector);

          this.floatingConnector.completeConnection(destination);
          hitNode.currHitTerminal = null;
        } else {
          this.floatingConnector.completeConnection(destination);
          hitNode.currHitTerminal = null;
        }
      }
      this.floatingConnector = null;
    }
  }
  getRelativePosition(ev: PointerEvent | WheelEvent | MouseEvent) {
    return new Vector2(ev.clientX - this.canvasDimensions.left, ev.clientY - this.canvasDimensions.top);
  }
  updateTransform(scale: number, scaleOrigin: Vector2, translate: Vector2) {
    if (scale) {
      let realSpaceOrigin = scaleOrigin.transform(this.inverseTransform);
      this.transform
        .translateSelf(realSpaceOrigin.x, realSpaceOrigin.y)
        .scaleSelf(scale, scale)
        .translateSelf(-realSpaceOrigin.x, -realSpaceOrigin.y);
    }
    if (translate) {
      this.transform.translateSelf(translate.x, translate.y);
    }

    this.inverseTransform = this.transform.inverse();

    this.context.setTransform(this.transform);
    this.offContext.setTransform(this.transform);
    this.offUIContext.setTransform(this.transform);
    this.offGroupContext.setTransform(this.transform);

    this.call('transform', this);
  }
  fallbackConnection() {
    this.floatingConnector.removeConnection();
    this.currFlow.removeConnector(this.floatingConnector.id);
  }
  addPointer(pointerId: number, position: Vector2) {
    this.pointers.push({
      id: pointerId,
      screenPosition: position,
      realPosition: position.transform(this.inverseTransform)
    });
  }
  removePointer(pointers: Pointer[], ev: PointerEvent) {
    pointers.splice(pointers.findIndex(pointer => pointer.id === ev.pointerId), 1);
  }
  getHitNode(position: Vector2): Node {
    let rgbaString = Color.rgbaToString(this.offContext.getImageData(position.x, position.y, 1, 1).data);
    return this.currFlow.hitColorToNode[rgbaString];
  }
  getHitGroup(position: Vector2): Group {
    let rgbaString = Color.rgbaToString(this.offGroupContext.getImageData(position.x, position.y, 1, 1).data);
    return this.currFlow.hitColorToGroup[rgbaString];
  }
  clear() {
    this.context.save();
    this.context.setTransform(this.identity);
    this.context.clearRect(0, 0, this.canvasDimensions.width, this.canvasDimensions.height);
    this.context.restore();

    this.offContext.save();
    this.offContext.setTransform(this.identity);
    this.offContext.clearRect(0, 0, this.canvasDimensions.width, this.canvasDimensions.height);
    this.offContext.restore();

    this.offUIContext.save();
    this.offUIContext.setTransform(this.identity);
    this.offUIContext.clearRect(0, 0, this.canvasDimensions.width, this.canvasDimensions.height);
    this.offUIContext.restore();

    this.offGroupContext.save();
    this.offGroupContext.setTransform(this.identity);
    this.offGroupContext.clearRect(0, 0, this.canvasDimensions.width, this.canvasDimensions.height);
    this.offGroupContext.restore();
  }

  top() {
    this.render(this.rootFlow);
  }
  render(flow: Flow) {
    if (flow === this.currFlow) return;
    if (this.currFlow) {
      window.cancelAnimationFrame(this.frameId);
      this.currFlow.deregisterListeners();
    }
    if (!this.rootFlow || !this.rootFlow.existsInFlow(flow)) {
      this.rootFlow = flow;
    }
    this.currFlow = flow;
    this._render();
  }
  _render() {
    this.clear();

    this.currGroup && this.currGroup.render();
    this.currFlow.render();
    this.call('update', this);

    this.frameId = window.requestAnimationFrame(this._render.bind(this));
  }

  fromJson(json: string): Flow {
    let data: SerializedFlow;
    let flow: Flow = null;

    try {
      data = JSON.parse(json);
      flow = Flow.deSerialize(this, data);
    } catch (error) {
      console.log(error);
    }
    return flow;
  }
  toJson(flow: Flow): string {
    let serializedFlow: SerializedFlow = flow.serialize();
    try {
      return JSON.stringify(serializedFlow, null);
    } catch (error) {
      console.log(error);
    }
  }
}

export * from './core/index';
export * from './math/index';
export * from './ui/index';
export * from './utils/index';
