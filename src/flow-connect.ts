import { Connector, Flow, Group, Node, Color, Hooks } from "./core/index";
import { Vector2 } from "./core/vector";
import { Dimension, Pointer, Rules } from "./common/interfaces";
import { intersects } from "./utils/utils";
import { Log } from './utils/logger';
import { TerminalType } from './core/terminal';
import { FlowState, FlowOptions, SerializedFlow } from './core/flow';
import { ViewPort } from './common/enums';
import { generateAudioWorklets, WorkletUtils } from "./resource/audio-worklets";

declare global {
  interface CanvasRenderingContext2D {
    roundRect: (x: number, y: number, width: number, height: number, radius: number) => void,
    strokeRoundRect: (x: number, y: number, width: number, height: number, radius: number) => void,
    fillRoundRect: (x: number, y: number, width: number, height: number, radius: number) => void
  }
}
/**
 * FlowConnect is like a placeholder that contains references to all Flows created by this instance and can render one flow at a time on-screen
 * 
 * One FlowConnect instance is bound to exactly one HTMLCanvasElement, this instance maintains/tracks the dimensions of HTMLCanvasElement,
 * it registers user-interaction events (mouse, keyboard, touch) and creates additional OffScreenCanvas's to track/act-upon these events
 */
export class FlowConnect extends Hooks {
  static async create(mount?: HTMLCanvasElement | HTMLDivElement): Promise<FlowConnect> {
    let flowConnect = new FlowConnect(mount);
    await flowConnect.setupAudioContext();
    return flowConnect;
  }

  /** Reference to the canvas element on which the flows will be rendered by FlowConnect instance */
  canvas: HTMLCanvasElement;
  private _context: CanvasRenderingContext2D;
  get context(): CanvasRenderingContext2D { return this._context }

  /** Reference to the AudioContext (one FlowConnect instance will only have one audio context) */
  private _audioContext: AudioContext;
  get audioContext(): AudioContext { return this._audioContext }

  /** @hidden Only used for audio stuff */
  audioBufferCache: Map<ArrayBuffer, AudioBuffer> = new Map();
  /** @hidden Only used for audio stuff */
  arrayBufferCache: Map<string, ArrayBuffer> = new Map();

  /** For rendering color hit-maps for Nodes */
  offCanvas: OffscreenCanvas | HTMLCanvasElement;
  private _offContext: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;
  get offContext(): OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D { return this._offContext }

  /** For rendering color hit-maps for UI elements and Terminals of Nodes */
  offUICanvas: OffscreenCanvas | HTMLCanvasElement;
  private _offUIContext: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;
  get offUIContext(): OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D { return this._offUIContext }

  /** For rendering color hit-maps for Groups */
  offGroupCanvas: OffscreenCanvas | HTMLCanvasElement;
  private _offGroupContext: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;
  get offGroupContext(): OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D { return this._offGroupContext }

  /** Canvas's absolute position and dimension from viewport origin (top-left) (for e.g. if the canvas element is inside a scrollable parent) */
  canvasDimensions: Dimension = { top: 0, left: 0, width: 0, height: 0 };

  get cursor(): string { return this.canvas.style.cursor; }
  set cursor(cursor: string) { this.canvas.style.cursor = cursor; }

  state: FlowConnectState = FlowConnectState.Stopped;

  /** Id recieved from *requestAnimationFrame* */
  private frameId: number;

  /** Root flow of the flow-tree (Flow that contains SubFlowNodes that again contains SubFlowNodes and so on...) */
  private rootFlow: Flow;
  /** Flow which is currently rendered on the canvas */
  private currFlow: Flow;

  /** All the flows created by this FlowConnect instance  */
  flows: Flow[] = [];

  /** Reference of the current/previous Nodes/Groups under user-interaction (mouse, touch) */
  currHitNode: Node;
  private prevHitNode: Node;
  private currHitGroup: Group;

  /** Reference to the new Group being drawn */
  private currGroup: Group;
  private groupStartPoint: Vector2;

  /** @hidden Reference to the new Connector being drawn */
  floatingConnector: Connector;

  /** For controlling user-interaction */
  pointers: Pointer[] = [];
  private keymap: { [key: string]: boolean } = {};
  private touchControls: { [control: string]: boolean } = { 'CreateGroup': false };

  /** @hidden HTML input overlayed on canvas when focused */
  private genericInput: HTMLInputElement = document.createElement('input');
  /** @hidden ResizeObservers to trigger re-render when dimensions change */
  private parentResizeObserver: ResizeObserver;
  private bodyResizeObserver: ResizeObserver;

  minScale: number = 0.1;
  maxScale: number = 5;
  wheelScaleDelta: number = 1.05;
  pinchScaleDelta: number = 1.02;
  get scale(): number { return this._transform.a }
  private _transform: DOMMatrix = new DOMMatrix();

  /** Current transformation matrix */
  get transform(): DOMMatrix { return this._transform }
  private inverseTransform: DOMMatrix = new DOMMatrix();
  private identity: DOMMatrix = new DOMMatrix();

  /** Time (in ms) when one or more flows created by this FlowConnect instance was started */
  startTime: number = -1;
  private timerId: number;
  /** No. of milliseconds passed since the start of one or more flows */
  get time(): number { return (this.startTime < 0) ? this.startTime : (performance.now() - this.startTime) }

  /**
   * @param mount HTML element (div or canvas) on which FlowConnect will render Flows, if no mount is provided, a new canvas element will be created and attached to document.body
   */
  private constructor(mount?: HTMLCanvasElement | HTMLDivElement) {
    super();
    this.prepareCanvas(mount);
    this.setupHitCanvas();
    this.calculateCanvasDimension(true);
    this.registerChangeListeners();
    this.attachStyles();
    this.polyfill();
    this.registerEvents();
    this.setGenericInput();
  }

  /** Re-calculates cavnvas position/dimension when scrolling/resizing happens */
  private registerChangeListeners() {
    let throttle = false;
    document.addEventListener('scroll', () => {
      if (!throttle) {
        window.requestAnimationFrame(() => {
          this.calculateCanvasDimension(false);
          throttle = false;
        });
        throttle = true;
      }
    });
    this.registerObservers(this.canvas.parentElement);
  }
  private registerObservers(parent: HTMLElement) {
    this.parentResizeObserver && this.parentResizeObserver.disconnect();
    this.bodyResizeObserver && this.bodyResizeObserver.disconnect();

    this.parentResizeObserver = new ResizeObserver(() => {
      this.calculateCanvasDimension(true);
      this.updateTransform(null, null, null);
    });
    this.parentResizeObserver.observe(parent);
    if (parent !== document.body) {
      this.bodyResizeObserver = new ResizeObserver(() => {
        this.calculateCanvasDimension(true);
        this.updateTransform(null, null, null);
      });
      this.bodyResizeObserver.observe(document.body);
    }
  }
  private prepareCanvas(mount?: HTMLCanvasElement | HTMLDivElement) {
    if (!mount) {
      this.canvas = document.createElement('canvas');
      this.canvas.width = document.body.clientWidth;
      this.canvas.height = document.body.clientHeight;
      document.body.appendChild(this.canvas);
    } else if (mount instanceof HTMLDivElement) {
      this.canvas = document.createElement('canvas');
      this.canvas.width = mount.clientWidth;
      this.canvas.height = mount.clientHeight;
      mount.appendChild(this.canvas);
    } else if (mount instanceof HTMLCanvasElement) {
      this.canvas = mount;
    } else {
      Log.error('mount provided is not of type HTMLDivElement or HTMLCanvasElement')
    }
    this._context = this.canvas.getContext('2d');
  }
  /** Creates additional canvas's for rendering color hit-maps */
  private setupHitCanvas() {
    if (typeof OffscreenCanvas !== 'undefined' && typeof OffscreenCanvasRenderingContext2D !== 'undefined') {
      this.offCanvas = new OffscreenCanvas(this.canvasDimensions.width, this.canvasDimensions.height);
      this.offUICanvas = new OffscreenCanvas(this.canvasDimensions.width, this.canvasDimensions.height);
      this.offGroupCanvas = new OffscreenCanvas(this.canvasDimensions.width, this.canvasDimensions.height);
    } else {
      this.offCanvas = document.createElement('canvas');
      this.offUICanvas = document.createElement('canvas');
      this.offGroupCanvas = document.createElement('canvas');
    }
    this._offContext = this.offCanvas.getContext('2d');
    this._offUIContext = this.offUICanvas.getContext('2d');
    this._offGroupContext = this.offGroupCanvas.getContext('2d');
  }
  private attachStyles() {
    this.canvas.style.touchAction = 'none';

    let inputStyle = document.createElement('style');
    inputStyle.innerHTML = 'input.flow-connect-input { position: fixed; visibility: hidden; pointer-events: none; z-index: 100; border: none; border-radius: 0; box-sizing: border-box;} input.flow-connect-input:focus { outline: none; }';
    document.getElementsByTagName('head')[0].appendChild(inputStyle);
  }
  private calculateCanvasDimension(adjust: boolean) {
    if (adjust) {
      let parentBoundingRect = this.canvas.parentElement.getBoundingClientRect();
      this.canvas.width = Math.round(parentBoundingRect.width);
      this.canvas.height = Math.round(parentBoundingRect.height);
    }

    let boundingRect = this.canvas.getBoundingClientRect();
    this.canvasDimensions = {
      top: Math.round(boundingRect.top - window.scrollY),
      left: Math.round(boundingRect.left - window.scrollX),
      width: Math.round(boundingRect.width),
      height: Math.round(boundingRect.height)
    }

    this.offCanvas.width = this.canvasDimensions.width;
    this.offCanvas.height = this.canvasDimensions.height;
    this.offUICanvas.width = this.canvasDimensions.width;
    this.offUICanvas.height = this.canvasDimensions.height;
    this.offGroupCanvas.width = this.canvasDimensions.width;
    this.offGroupCanvas.height = this.canvasDimensions.height;
  }
  private polyfill() {
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
  private registerEvents(): void {
    let dragDelta: Vector2;
    let prevPanPosition: Vector2 = Vector2.Zero();
    let prevPinchDistance: number = -1;

    window.onkeydown = (ev: KeyboardEvent) => {
      !this.keymap[ev.key] && (this.keymap[ev.key] = true);
    }
    window.onkeyup = (ev: KeyboardEvent) => {
      this.keymap[ev.key] = false;
    }

    this.canvas.onpointerdown = (ev: PointerEvent) => {
      if (!this.currFlow) return;

      this.addPointer(ev.pointerId, this.getRelativePosition(ev));
      if (this.pointers.length === 1) {
        prevPanPosition = this.pointers[0].screenPosition;
        this.currHitNode = this.getHitNode(this.pointers[0].screenPosition);
        if (this.currHitNode) {
          this.currHitNode.zIndex = Number.MAX_SAFE_INTEGER;
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
            this.currGroup = new Group(this.currFlow, this.groupStartPoint.clone(), { name: 'New Group' });
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
    this.canvas.onpointerup = (ev) => {
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
    this.canvas.onpointerout = (ev) => {
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
    this.canvas.onpointermove = (ev) => {
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
        if (realPosition.x < this.groupStartPoint.x) this.currGroup.position.x = realPosition.x;
        this.currGroup.width = Math.abs(this.groupStartPoint.x - realPosition.x);

        if (realPosition.y < this.groupStartPoint.y) this.currGroup.position.y = realPosition.y;
        this.currGroup.height = Math.abs(this.groupStartPoint.y - realPosition.y);
      }

      if (this.currHitNode) {
        // If dragging UINode outside its bounds, Node can pre-empt currHitNode
        this.currHitNode.onDrag(screenPosition.clone(), realPosition.clone());
        if (this.currHitNode) {
          if ((!this.currHitNode.currHitUINode || !this.currHitNode.currHitUINode.draggable) && !this.currHitNode.currHitTerminal && !this.floatingConnector) {
            this.currHitNode.position = realPosition.add(dragDelta);

            let hitGroup = this.getHitGroup(screenPosition);
            if (hitGroup && hitGroup === this.currHitNode.group) {
              let groupRealPos = hitGroup.position.transform(this._transform);
              let nodeRealPos = this.currHitNode.position.transform(this._transform);

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
    this.canvas.onclick = (ev) => {
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
    this.canvas.oncontextmenu = (ev) => {
      if (!this.currFlow) return;

      ev.preventDefault();

      let screenPosition = this.getRelativePosition(ev);
      let hitNode = this.getHitNode(screenPosition);
      hitNode && hitNode.onContextMenu();
      if (!this.keymap['Control']) this.currFlow.removeAllFocus();
      hitNode && (hitNode.focused = true);
    }
    this.canvas.onwheel = (ev: WheelEvent) => {
      if (!this.currFlow) return;

      let screenPosition = this.getRelativePosition(ev);
      let hitNode = this.getHitNode(screenPosition);
      if (hitNode) {
        let hitColor = Color.rgbaToString(this.offUIContext.getImageData(screenPosition.x, screenPosition.y, 1, 1).data);
        let hitUINode = hitNode.getHitUINode(hitColor);

        // Need to add touch compability for pinch on UINodes
        if (hitUINode && hitUINode.zoomable) {
          hitNode.onWheel(ev.deltaY < 0, screenPosition, screenPosition.transform(this.inverseTransform));
          return;
        }
      }

      this.handleZoom(ev.deltaY < 0, screenPosition, this.wheelScaleDelta);
    }
  }
  private setGenericInput() {
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
  private async setupAudioContext() {
    this._audioContext = new AudioContext();

    // This one-time setup is not at all related to FlowConnect, couldn't find any place to do this
    // Might be a better idea to do this somewhere in StandardNodes.Audio scope

    let audioWorklets = generateAudioWorklets(WorkletUtils.CircularBuffer);
    await this.audioContext.audioWorklet.addModule(WorkletUtils.CircularBuffer);
    return Promise.all(Object.keys(audioWorklets).map(key => this.audioContext.audioWorklet.addModule(audioWorklets[key])));
  }
  /** @hidden */
  showGenericInput(position: Vector2 | DOMPoint, value: string, styles: { [key: string]: any }, attributes: { [key: string]: any }, callback: (value: string) => void) {
    if (document.activeElement === this.genericInput) return;

    Object.assign(this.genericInput.style, styles);
    Object.assign(this.genericInput, attributes);

    Object.assign(this.genericInput.style, {
      left: (position.x + this.canvasDimensions.left) + 'px',
      top: (position.y + this.canvasDimensions.top - 3) + 'px',
      visibility: 'visible',
      pointerEvents: 'all'
    });
    this.genericInput.value = value;
    this.genericInput.onchange = () => callback(this.genericInput.value);
    this.genericInput.focus();
  }
  changeParent(newParent: HTMLElement) {
    this.registerObservers(newParent);
  }
  private updatePointer(id: number, screenPosition: Vector2, realPosition: Vector2) {
    let pointer = this.pointers.find(pntr => pntr.id === id);
    if (pointer) {
      pointer.screenPosition = screenPosition;
      pointer.realPosition = realPosition;
    }
  }
  private handleZoom(zoomIn: boolean, origin: Vector2, scaleDelta: number) {
    if ((this._transform.a >= this.maxScale && zoomIn) || (this._transform.a <= this.minScale && !zoomIn)) return;
    this.updateTransform(zoomIn ? scaleDelta : (1 / scaleDelta), origin, null);
    this.call('scale', this.scale);
  }
  private handleGrouping(screenPosition: Vector2) {
    let hitGroup = this.getHitGroup(screenPosition);

    let intersection;
    if (hitGroup) {
      let groupRealPos = hitGroup.position.transform(this._transform);
      let nodeRealPos = this.currHitNode.position.transform(this._transform);

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
  private handleConnection(hitNode: Node, screenPosition: Vector2, realPosition: Vector2) {
    if (!hitNode) {
      this.fallbackConnection();
      return;
    }
    let hitTerminal = hitNode.getHitTerminal(
      Color.rgbaToString(this._offUIContext.getImageData(screenPosition.x, screenPosition.y, 1, 1).data),
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
          let [startTerm, endTerm] = [oldConnector.start, oldConnector.end];
          delete this.currFlow.connectors[oldConnector.id];
          this.currFlow.executionGraph.disconnect(startTerm.node, endTerm.node);
          oldConnector.start.onDisconnect(oldConnector, startTerm, endTerm);
          oldConnector.end.onDisconnect(oldConnector, startTerm, endTerm);

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
  private getRelativePosition(ev: PointerEvent | WheelEvent | MouseEvent) {
    return new Vector2(ev.clientX - this.canvasDimensions.left, ev.clientY - this.canvasDimensions.top);
  }
  private updateTransform(scale: number, scaleOrigin: Vector2, translate: Vector2) {
    if (scale) {
      let realSpaceOrigin = scaleOrigin.transform(this.inverseTransform);
      this._transform
        .translateSelf(realSpaceOrigin.x, realSpaceOrigin.y)
        .scaleSelf(scale, scale)
        .translateSelf(-realSpaceOrigin.x, -realSpaceOrigin.y);
    }
    if (translate) {
      this._transform.translateSelf(translate.x, translate.y);
    }

    this.inverseTransform = this._transform.inverse();

    this._context.setTransform(this._transform);
    this._offContext.setTransform(this._transform);
    this._offUIContext.setTransform(this._transform);
    this._offGroupContext.setTransform(this._transform);

    this.call('transform', this);
  }
  private fallbackConnection() {
    this.floatingConnector.removeConnection();
    this.currFlow.removeConnector(this.floatingConnector.id);
  }
  private addPointer(pointerId: number, position: Vector2) {
    this.pointers.push({
      id: pointerId,
      screenPosition: position,
      realPosition: position.transform(this.inverseTransform)
    });
  }
  private removePointer(pointers: Pointer[], ev: PointerEvent) {
    pointers.splice(pointers.findIndex(pointer => pointer.id === ev.pointerId), 1);
  }
  private getHitNode(position: Vector2): Node {
    let rgbaString = Color.rgbaToString(this._offContext.getImageData(position.x, position.y, 1, 1).data);
    return this.currFlow.hitColorToNode[rgbaString];
  }
  private getHitGroup(position: Vector2): Group {
    let rgbaString = Color.rgbaToString(this._offGroupContext.getImageData(position.x, position.y, 1, 1).data);
    return this.currFlow.hitColorToGroup[rgbaString];
  }
  private clear() {
    this._context.save();
    this._context.setTransform(this.identity);
    this._context.clearRect(0, 0, this.canvasDimensions.width, this.canvasDimensions.height);
    this._context.restore();

    this._offContext.save();
    this._offContext.setTransform(this.identity);
    this._offContext.clearRect(0, 0, this.canvasDimensions.width, this.canvasDimensions.height);
    this._offContext.restore();

    this._offUIContext.save();
    this._offUIContext.setTransform(this.identity);
    this._offUIContext.clearRect(0, 0, this.canvasDimensions.width, this.canvasDimensions.height);
    this._offUIContext.restore();

    this._offGroupContext.save();
    this._offGroupContext.setTransform(this.identity);
    this._offGroupContext.clearRect(0, 0, this.canvasDimensions.width, this.canvasDimensions.height);
    this._offGroupContext.restore();
  }
  /** @hidden */
  startGlobalTime() {
    if (this.startTime < 0) {
      this.startTime = performance.now();
      this._startGlobalTime();
      this.state = FlowConnectState.Running;
      this.call('start', this);
    }
  }
  private _startGlobalTime() {
    this.call('tick', this);
    this.timerId = window.requestAnimationFrame(this._startGlobalTime.bind(this));
  }
  /** @hidden */
  stopGlobalTime() {
    if (this.isRootFlowStopped()) {
      cancelAnimationFrame(this.timerId);
      this.startTime = -1;
      this.state = FlowConnectState.Stopped;
      this.call('tickreset', this);
      this.call('stop', this);
    }
  }
  private isRootFlowStopped(): boolean {
    let root = this.currFlow;
    while (true) {
      if (root.parentFlow) root = root.parentFlow;
      else return root.state === FlowState.Stopped;
    }
  }
  private _render() {
    this.clear();

    this.currGroup && this.currGroup.render();
    this.currFlow.render();
    this.call('update', this);

    this.frameId = window.requestAnimationFrame(this._render.bind(this));
  }

  createFlow(options: FlowOptions = { name: 'New Flow', rules: {}, terminalTypeColors: {} }): Flow {
    if (!options.rules) options.rules = {};
    if (!options.terminalTypeColors) options.terminalTypeColors = {};

    options.rules = { ...options.rules, ...DefaultRules() };
    let flow = new Flow(this, options.name, options.rules, options.terminalTypeColors);
    this.flows.push(flow);

    flow.on('start', () => this.startGlobalTime());
    flow.on('stop', () => this.stopGlobalTime());

    return flow;
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
  /** Render the root flow of the flow-tree */
  top() {
    this.render(this.rootFlow);
  }
  /** Creates a flow from json
   * @param json Json string with schema SerializedFlow
   */
  fromJson(json: string): Flow {
    let data: SerializedFlow;
    let flow: Flow = null;

    try {
      data = JSON.parse(json);
      flow = Flow.deSerialize(this, data);
    } catch (error) {
      Log.error(error);
    }
    return flow;
  }
  toJson(flow: Flow): string {
    let serializedFlow: SerializedFlow = flow.serialize();
    try {
      return JSON.stringify(serializedFlow, null);
    } catch (error) {
      Log.error(error);
    }
  }
}

export enum FlowConnectState {
  Stopped,
  Running
}

/** Default rules every Flow will have, for e.g. a string output can only be connected to string inputs.
   *  ```javascript
   *  {
   *    'string': ['string'],
   *    'number': ['number'],
   *    'boolean': ['boolean'],
   *    'file': ['file'],
   *    'event': ['event'], ...
   *  }
   *  ```
   */
let DefaultRules: () => Rules = () => ({
  'string': ['string', 'any'],
  'number': ['number', 'audioparam', 'any'],
  'boolean': ['boolean', 'any'],
  'array': ['array', 'any'],
  'file': ['file', 'any'],
  'event': ['event', 'any'],
  'vector2': ['vector2', 'any'],
  'array-buffer': ['array-buffer', 'any'],
  'audio': ['audio', 'audioparam'],
  'audioparam': ['audioparam'],
  'audio-buffer': ['audio-buffer', 'any'],
  'any': ['any']
});

export * from './common/index';
export * from './core/index';
export { Constant } from './resource/constants';
export * from './ui/index';
export * from './utils/index';
