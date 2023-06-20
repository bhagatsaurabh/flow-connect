import { Flow } from "./core/flow.js";
import { Group } from "./core/group.js";
import { Node } from "./core/node.js";
import { Color } from "./core/color.js";
import { Hooks } from "./core/hooks.js";
import { Vector } from "./core/vector.js";
import {
  DataFetchProvider,
  DataPersistenceProvider,
  DefaultStyles,
  Dimension,
  FlowConnectCacheKeys,
  FlowConnectCacheValues,
  FlowConnectCaches,
  FlowConnectRenderers,
  PluginMetadata,
  PluginType,
  Plugins,
  Pointer,
} from "./common/interfaces.js";
import { cloneAudioBuffer, intersects, noop } from "./utils/utils.js";
import { Log } from "./utils/logger.js";
import { TerminalType } from "./core/terminal.js";
import { FlowState, FlowOptions, SerializedFlow } from "./core/flow.js";
import { ViewPort } from "./common/enums.js";
import { generateAudioWorklets, generateWorkletUtils } from "./resource/audio-worklets.js";
import { TunaInitializer } from "./lib/tuna.js";
import { EmptyNode } from "./core/empty-node.js";
import { SubFlowNode } from "./core/subflow-node.js";
import { TunnelNode } from "./core/tunnel-node.js";
import {
  Button,
  Label,
  Dial,
  Display,
  Envelope,
  HorizontalLayout,
  Image,
  Input,
  RadioGroup,
  Select,
  Slider2D,
  Slider,
  Source,
  Stack,
  Toggle,
  VSlider,
  Container,
} from "./flow-connect.js";

declare global {
  interface CanvasRenderingContext2D {
    roundRect: (x: number, y: number, width: number, height: number, radius: number) => void;
    strokeRoundRect: (x: number, y: number, width: number, height: number, radius: number) => void;
    fillRoundRect: (x: number, y: number, width: number, height: number, radius: number) => void;
  }
}

/**
 * FlowConnect is like a placeholder that contains references to all Flows created by this instance and can render one flow at a time on-screen
 *
 * One FlowConnect instance is bound to exactly one HTMLCanvasElement, this instance maintains/tracks the dimensions of HTMLCanvasElement,
 * it registers user-interaction events (mouse, keyboard, touch) and creates additional OffScreenCanvas's to track/act-upon these events
 */
export class FlowConnect extends Hooks {
  private static audioWorkletsRegistered = false;
  static async create(mount?: HTMLCanvasElement | HTMLDivElement): Promise<FlowConnect> {
    let flowConnect = new FlowConnect(mount);
    await flowConnect.setupAudioContext();
    if (!(window as any).__tuna__)
      (window as any).__tuna__ = new (TunaInitializer.initialize() as any)(flowConnect.audioContext);
    return flowConnect;
  }

  private static plugins: Plugins = {
    node: {
      "core/empty": EmptyNode,
      "core/subflow": SubFlowNode,
      "core/tunnel": TunnelNode,
    },
    ui: {
      "core/container": Container,
      "core/button": Button,
      "core/dial": Dial,
      "core/display": Display,
      "core/envelope": Envelope,
      "core/x-layout": HorizontalLayout,
      "core/image": Image,
      "core/input": Input,
      "core/label": Label,
      "core/radio-group": RadioGroup,
      "core/select": Select,
      "core/2d-slider": Slider2D,
      "core/slider": Slider,
      "core/source": Source,
      "core/stack": Stack,
      "core/toggle": Toggle,
      "core/v-slider": VSlider,
    },
  };
  static register<K extends keyof PluginType>(metadata: PluginMetadata, executor: PluginType[K]): boolean {
    if (!metadata.name) return false;
    if (this.plugins[metadata.type][metadata.name]) return false;

    this.plugins[metadata.type][metadata.name] = executor;

    return true;
  }
  static getRegistered<K extends keyof PluginType>(type: K, name: string): PluginType[K] {
    return this.plugins[type][name];
  }

  readonly version = process.env.FLOWCONNECT_VERSION;

  //#region Properties and Accessors
  /** Reference to the canvas element on which the flows will be rendered by FlowConnect instance */
  canvas: HTMLCanvasElement;
  private _context: CanvasRenderingContext2D;
  get context(): CanvasRenderingContext2D {
    return this._context;
  }

  /** Reference to the AudioContext (one FlowConnect instance will only have one audio context) */
  private _audioContext: AudioContext;
  get audioContext(): AudioContext {
    return this._audioContext;
  }

  /** @hidden Cached buffers */
  private caches: FlowConnectCaches = {
    array: new Map(),
    audio: new Map(),
  };
  setCache<K extends keyof FlowConnectCacheKeys>(
    type: K,
    key: FlowConnectCacheKeys[K],
    cache: FlowConnectCacheValues[K]
  ) {
    if (type === "array") {
      this.caches[type].set(key, (cache as ArrayBuffer).slice(0) as FlowConnectCacheValues[K]);
    } else if (type === "audio") {
      this.caches[type].set(key, cloneAudioBuffer(cache as AudioBuffer) as FlowConnectCacheValues[K]);
    } else {
      this.caches[type].set(key, cache);
    }
  }
  getCache<K extends keyof FlowConnectCacheKeys>(type: K, key: FlowConnectCacheKeys[K]): FlowConnectCacheValues[K] {
    const cache = this.caches[type].get(key);
    if (!cache) return null;

    if (type === "array") {
      return (cache as ArrayBuffer).slice(0) as FlowConnectCacheValues[K];
    } else if (type === "audio") {
      return cloneAudioBuffer(cache as AudioBuffer) as FlowConnectCacheValues[K];
    }
    return cache;
  }

  /** For rendering color hit-maps for Nodes */
  offCanvas: OffscreenCanvas | HTMLCanvasElement;
  private _offContext: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;
  get offContext(): OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D {
    return this._offContext;
  }

  /** For rendering color hit-maps for UI elements and Terminals of Nodes */
  offUICanvas: OffscreenCanvas | HTMLCanvasElement;
  private _offUIContext: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;
  get offUIContext(): OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D {
    return this._offUIContext;
  }

  /** For rendering color hit-maps for Groups */
  offGroupCanvas: OffscreenCanvas | HTMLCanvasElement;
  private _offGroupContext: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;
  get offGroupContext(): OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D {
    return this._offGroupContext;
  }

  /** Canvas's absolute position and dimension from viewport origin (top-left) (for e.g. if the canvas element is inside a scrollable parent) */
  canvasDimensions: Dimension = { top: 0, left: 0, width: 0, height: 0 };

  get cursor(): string {
    return this.canvas.style.cursor;
  }
  set cursor(cursor: string) {
    this.canvas.style.cursor = cursor;
  }

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
  private groupStartPoint: Vector;

  /** For controlling user-interaction */
  pointers: Pointer[] = [];
  private keymap: Record<string, boolean> = {};
  private touchControls: Record<string, boolean> = { CreateGroup: false };

  /** @hidden HTML input overlayed on canvas when focused */
  private genericInput: HTMLInputElement = document.createElement("input");
  /** @hidden ResizeObservers to trigger re-render when dimensions change */
  private parentResizeObserver: ResizeObserver;
  private bodyResizeObserver: ResizeObserver;

  minScale: number = 0.1;
  maxScale: number = 5;
  wheelScaleDelta: number = 1.05;
  pinchScaleDelta: number = 1.02;
  get scale(): number {
    return this._transform.a;
  }
  disableScale: boolean = false;
  private _transform: DOMMatrix = new DOMMatrix();

  /** Current transformation matrix */
  get transform(): DOMMatrix {
    return this._transform;
  }
  private inverseTransform: DOMMatrix = new DOMMatrix();
  private identity: DOMMatrix = new DOMMatrix();

  /** Time (in ms) when one or more flows created by this FlowConnect instance was started */
  startTime: number = -1;
  private timerId: number;
  /** No. of milliseconds passed since the start of one or more flows */
  get time(): number {
    return this.startTime < 0 ? this.startTime : performance.now() - this.startTime;
  }

  private readonly renderers: FlowConnectRenderers = {};
  registerRenderer<K extends keyof FlowConnectRenderers>(type: K, renderer: FlowConnectRenderers[K]): boolean {
    if (!type || !renderer) return false;

    this.renderers[type] = renderer;
    return true;
  }
  getRegisteredRenderer<K extends keyof FlowConnectRenderers>(type: K): FlowConnectRenderers[K] {
    return this.renderers[type];
  }

  private readonly defaultStyles: DefaultStyles = {
    global: {
      node: {},
      ui: {},
    },
    node: {},
    ui: {},
    connector: {},
    terminal: {},
    group: {},
  };
  setDefaultStyle<T>(type: "node" | "ui" | "connector" | "group" | "terminal", style: T): void;
  setDefaultStyle<T>(type: "node" | "ui" | "connector" | "group" | "terminal", name: string, style: T): void;
  setDefaultStyle<T>(
    type: "node" | "ui" | "connector" | "group" | "terminal",
    nameOrStyle: string | T,
    style?: T
  ): void {
    if ((type === "node" || type === "ui") && typeof nameOrStyle === "string") {
      this.defaultStyles[type][nameOrStyle] = style;
    } else if ((type === "node" || type === "ui") && typeof nameOrStyle === "object") {
      this.defaultStyles.global[type] = nameOrStyle as T;
    } else if (type !== "node" && type !== "ui") {
      this.defaultStyles[type] = nameOrStyle as T;
    }
  }
  getDefaultStyle<T>(type: "node" | "ui" | "connector" | "group" | "terminal", name?: string): T {
    if (type === "node" || type === "ui") {
      return (this.defaultStyles[type][name] ?? this.defaultStyles.global[type]) as T;
    } else {
      return this.defaultStyles[type] as T;
    }
  }
  private throttle = false;
  //#endregion

  /**
   * @param mount HTML element (div or canvas) on which FlowConnect will render Flows, if no mount is provided, a new canvas element will be created and attached to document.body
   */
  constructor(mount?: HTMLCanvasElement | HTMLDivElement) {
    super();
    this.prepareCanvas(mount);
    this.setupHitCanvas();
    this.calcCanvasDimension(true);
    this.registerChangeListeners();
    this.attachStyles();
    this.canvasUtils();
    this.registerEvents();
    this.setGenericInput();
  }

  //#region Methods
  /** Re-calculates cavnvas position/dimension when scrolling/resizing happens */
  private registerChangeListeners() {
    document.addEventListener("scroll", this.scrollListener.bind(this));
    this.registerObservers(this.canvas.parentElement);
  }
  private deRegisterChangeListeners() {
    document.removeEventListener("scroll", this.scrollListener);
  }
  private scrollListener() {
    if (!this.throttle) {
      window.requestAnimationFrame(() => {
        this.calcCanvasDimension(false);
        this.throttle = false;
      });
      this.throttle = true;
    }
  }
  private registerObservers(parent: HTMLElement) {
    this.deRegisterObservers();

    this.parentResizeObserver = new ResizeObserver(() => {
      this.calcCanvasDimension(true);
      this.updateTransform(null, null, null);
    });
    this.parentResizeObserver.observe(parent);
    if (parent !== document.body) {
      this.bodyResizeObserver = new ResizeObserver(() => {
        this.calcCanvasDimension(true);
        this.updateTransform(null, null, null);
      });
      this.bodyResizeObserver.observe(document.body);
    }
  }
  private deRegisterObservers() {
    this.parentResizeObserver && this.parentResizeObserver.disconnect();
    this.bodyResizeObserver && this.bodyResizeObserver.disconnect();
  }
  private prepareCanvas(mount?: HTMLCanvasElement | HTMLDivElement) {
    if (!mount) {
      this.canvas = document.createElement("canvas");
      this.canvas.width = document.body.clientWidth;
      this.canvas.height = document.body.clientHeight;
      document.body.appendChild(this.canvas);
    } else if (mount instanceof HTMLDivElement) {
      this.canvas = document.createElement("canvas");
      this.canvas.width = mount.clientWidth;
      this.canvas.height = mount.clientHeight;
      mount.appendChild(this.canvas);
    } else if (mount instanceof HTMLCanvasElement) {
      this.canvas = mount;
    } else {
      Log.error("'mount' provided is not of type HTMLDivElement or HTMLCanvasElement");
    }

    Object.assign(this.canvas.style, {
      position: "absolute",
      left: 0,
      top: 0,
      width: "100%",
      height: "100%",
    });
    this._context = this.canvas.getContext("2d");
  }
  /** Creates additional canvases for rendering color hit-maps */
  private setupHitCanvas() {
    if (typeof OffscreenCanvas !== "undefined" && typeof OffscreenCanvasRenderingContext2D !== "undefined") {
      this.offCanvas = new OffscreenCanvas(this.canvasDimensions.width, this.canvasDimensions.height);
      this.offUICanvas = new OffscreenCanvas(this.canvasDimensions.width, this.canvasDimensions.height);
      this.offGroupCanvas = new OffscreenCanvas(this.canvasDimensions.width, this.canvasDimensions.height);
    } else {
      this.offCanvas = document.createElement("canvas");
      this.offUICanvas = document.createElement("canvas");
      this.offGroupCanvas = document.createElement("canvas");
    }
    this._offContext = this.offCanvas.getContext("2d", { willReadFrequently: true });
    this._offUIContext = this.offUICanvas.getContext("2d", { willReadFrequently: true });
    this._offGroupContext = this.offGroupCanvas.getContext("2d", { willReadFrequently: true });
  }
  private attachStyles() {
    this.canvas.style.touchAction = "none";

    let inputStyle = document.createElement("style");
    inputStyle.innerHTML =
      "input.flow-connect-input { position: fixed; visibility: hidden; pointer-events: none; z-index: 100; border: none; border-radius: 0; box-sizing: border-box;} input.flow-connect-input:focus { outline: none; }";
    document.getElementsByTagName("head")[0].appendChild(inputStyle);
  }
  private calcCanvasDimension(adjust: boolean) {
    if (adjust && this.canvas.parentElement) {
      let parentBoundingRect = this.canvas.parentElement.getBoundingClientRect();
      this.canvas.width = parentBoundingRect.width;
      this.canvas.height = parentBoundingRect.height;
      this.call("dimension-change", this, this.canvas.width, this.canvas.height);
    }

    let boundingRect = this.canvas.getBoundingClientRect();
    this.canvasDimensions = {
      top: Math.round(boundingRect.top),
      left: Math.round(boundingRect.left),
      width: Math.round(boundingRect.width),
      height: Math.round(boundingRect.height),
    };

    this.offCanvas.width = this.canvasDimensions.width;
    this.offCanvas.height = this.canvasDimensions.height;
    this.offUICanvas.width = this.canvasDimensions.width;
    this.offUICanvas.height = this.canvasDimensions.height;
    this.offGroupCanvas.width = this.canvasDimensions.width;
    this.offGroupCanvas.height = this.canvasDimensions.height;
  }
  private canvasUtils() {
    FlowConnect.prototype.canvasUtils = noop;
    CanvasRenderingContext2D.prototype.roundRect = function (
      x: number,
      y: number,
      width: number,
      height: number,
      radius: number
    ) {
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
    };
    CanvasRenderingContext2D.prototype.strokeRoundRect = function (
      x: number,
      y: number,
      width: number,
      height: number,
      radius: number
    ) {
      if (typeof radius === "undefined") radius = 5;
      this.roundRect(x, y, width, height, radius);
      this.stroke();
    };
    CanvasRenderingContext2D.prototype.fillRoundRect = function (
      x: number,
      y: number,
      width: number,
      height: number,
      radius: number
    ) {
      if (typeof radius === "undefined") radius = 5;
      this.roundRect(x, y, width, height, radius);
      this.fill();
    };
  }
  private handleKeyDown(ev: KeyboardEvent) {
    !this.keymap[ev.key] && (this.keymap[ev.key] = true);
  }
  private registerEvents(): void {
    let dragDelta: Vector;
    let prevPanPosition: Vector = Vector.Zero();
    let prevPinchDistance: number = -1;
    let longPressTimerId = -1;
    let longPressPointer: Pointer = null;

    document.onkeydown = (ev: KeyboardEvent) => this.handleKeyDown(ev);
    document.onkeyup = (ev: KeyboardEvent) => {
      this.keymap[ev.key] = false;
    };

    this.canvas.onpointerdown = (ev: PointerEvent) => {
      if (!this.currFlow) return;

      this.addPointer(ev.pointerId, this.getRelativePosition(ev));
      if (this.pointers.length === 1) {
        prevPanPosition = this.pointers[0].screenPosition;
        this.currHitNode = this.getHitNode(this.pointers[0].screenPosition);

        if (this.currHitNode) {
          this.currHitNode.zIndex = Number.MAX_SAFE_INTEGER;
          if (this.keymap["Control"]) {
            this.currHitNode.focused = !this.currHitNode.focused;
          } else {
            this.currFlow.removeAllFocus();
            this.currHitNode.focused = true;
          }
          this.currHitNode.onDown(this.pointers[0].screenPosition.clone(), this.pointers[0].realPosition.clone());
          dragDelta = this.currHitNode.position.subtract(this.pointers[0].realPosition);

          if (!this.currHitNode.currHitUINode) {
            longPressTimerId = window.setTimeout(() => {
              this.currHitNode.onContextMenu(this.pointers[0].screenPosition, this.pointers[0].realPosition);
              this.call("context-menu", {
                screenPos: this.pointers[0].screenPosition,
                realPos: this.pointers[0].realPosition,
                target: this.currHitNode,
              });
            }, 1000);
            longPressPointer = this.pointers[0];
          }
        } else {
          if (!this.keymap["Control"]) {
            this.currFlow.removeAllFocus();

            this.currHitGroup = this.getHitGroup(this.pointers[0].screenPosition);
            this.currHitGroup && (dragDelta = this.currHitGroup.position.subtract(this.pointers[0].realPosition));
          } else if (this.keymap["Control"] || this.touchControls["CreateGroup"]) {
            this.groupStartPoint = this.pointers[0].realPosition.clone();
            this.currGroup = Group.create(this.currFlow, this.groupStartPoint.clone(), {
              name: "New Group",
              width: 0,
              height: 0,
            });
          }
        }
      } else {
        clearTimeout(longPressTimerId);
        longPressPointer = null;
        this.currHitNode = null;
        this.currHitGroup = null;
        this.currFlow.removeAllFocus();
        this.currFlow.removeFloatingConnector();
      }
    };
    this.canvas.onpointerup = (ev) => {
      if (!this.currFlow) return;

      this.removePointer(this.pointers, ev);

      if (longPressPointer?.id === ev.pointerId) {
        clearTimeout(longPressTimerId);
        longPressPointer = null;
      }

      if (this.pointers.length < 2) prevPinchDistance = -1;

      let screenPosition = this.getRelativePosition(ev);
      let realPosition = screenPosition.transform(this.inverseTransform);

      if (this.currHitNode) this.handleGrouping(screenPosition);

      this.currHitNode = null;
      this.currHitGroup = null;

      let hitNode = this.getHitNode(screenPosition);
      hitNode?.onUp(screenPosition.clone(), realPosition.clone());

      if (this.currGroup) {
        this.addCurrAsNewGroup();
      }
      if (this.currFlow.floatingConnector) this.handleConnection(hitNode, screenPosition, realPosition);
    };
    this.canvas.onpointerout = (ev) => {
      if (!this.currFlow) return;

      this.removePointer(this.pointers, ev);
      if (longPressPointer?.id === ev.pointerId) {
        clearTimeout(longPressTimerId);
        longPressPointer = null;
      }

      if (this.pointers.length === 0) {
        if (this.currHitNode) {
          let screenPosition = this.getRelativePosition(ev);
          this.handleGrouping(screenPosition);
        }
        this.currHitNode = null;
        this.currHitGroup = null;
      }

      if (this.currGroup) {
        this.addCurrAsNewGroup();
      }

      if (this.currFlow.floatingConnector) this.currFlow.removeFloatingConnector();

      if (this.prevHitNode) {
        let screenPosition = this.getRelativePosition(ev);
        let realPosition = screenPosition.transform(this.inverseTransform);
        this.prevHitNode.onExit(screenPosition, realPosition);
        this.prevHitNode = null;
      }
    };
    this.canvas.onpointermove = (ev) => {
      if (!this.currFlow) return;

      let screenPosition = this.getRelativePosition(ev);
      let realPosition = screenPosition.transform(this.inverseTransform);

      if (longPressPointer?.id === ev.pointerId) {
        clearTimeout(longPressTimerId);
        longPressPointer = null;
      }

      this.updatePointer(ev.pointerId, screenPosition, realPosition);

      if (this.pointers.length === 2) {
        let currPinchDistance = Vector.Distance(this.pointers[0].screenPosition, this.pointers[1].screenPosition);
        if (prevPinchDistance > 0) {
          if (currPinchDistance !== prevPinchDistance) {
            this.handleZoom(
              currPinchDistance > prevPinchDistance,
              Vector.Midpoint(this.pointers[0].screenPosition, this.pointers[1].screenPosition),
              this.pinchScaleDelta
            );
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
          if (
            (!this.currHitNode.currHitUINode || !this.currHitNode.currHitUINode.draggable) &&
            !this.currHitNode.currHitTerminal &&
            !this.currFlow.floatingConnector
          ) {
            this.currHitNode.position = realPosition.add(dragDelta);

            let hitGroup = this.getHitGroup(screenPosition);
            if (hitGroup && hitGroup === this.currHitNode.group) {
              let groupRealPos = hitGroup.position.transform(this._transform);
              let nodeRealPos = this.currHitNode.position.transform(this._transform);

              let intersection = intersects(
                groupRealPos.x,
                groupRealPos.y,
                groupRealPos.x + hitGroup.width * this.scale,
                groupRealPos.y + hitGroup.height * this.scale,
                nodeRealPos.x,
                nodeRealPos.y,
                nodeRealPos.x + this.currHitNode.width * this.scale,
                nodeRealPos.y + this.currHitNode.ui.height * this.scale
              );

              if (intersection === ViewPort.INSIDE) {
                let nodeIndex = hitGroup.nodes.findIndex((node) => node.id === this.currHitNode.id);
                hitGroup.nodeDeltas[nodeIndex] = this.currHitNode.position.subtract(hitGroup.position);
              }
            }
          }
        }
      } else {
        if (this.currHitGroup) {
          this.currHitGroup.position = realPosition.add(dragDelta);
        } else if (this.pointers.length === 1 && !this.keymap["Control"] && !this.touchControls["CreateGroup"]) {
          let delta = screenPosition.subtract(prevPanPosition).multiplyInPlace(1 / this.scale);
          prevPanPosition = screenPosition;
          this.updateTransform(null, null, delta);
        }
      }
      if (this.currFlow.floatingConnector) this.currFlow.floatingConnector.floatingTip = realPosition;

      if (ev.pointerType === "mouse" && !this.currHitNode) {
        let hitNode = this.getHitNode(screenPosition);
        if (hitNode !== this.prevHitNode) {
          this.prevHitNode?.onExit(screenPosition, realPosition);
          hitNode?.onEnter(screenPosition, realPosition);
        } else {
          hitNode && !this.currHitNode && hitNode.onOver(screenPosition, realPosition);
        }
        this.prevHitNode = hitNode;
      }
    };
    this.canvas.onclick = (ev) => {
      if (!this.currFlow) return;

      let screenPosition = this.getRelativePosition(ev);
      let realPosition = screenPosition.transform(this.inverseTransform);
      let hitNode = this.getHitNode(screenPosition);
      hitNode?.onClick(screenPosition.clone(), realPosition.clone());

      if (!hitNode) {
        let hitGroup = this.getHitGroup(screenPosition);
        hitGroup?.onClick(screenPosition.clone(), realPosition.clone());
      }
    };
    this.canvas.oncontextmenu = (ev) => {
      if (!this.currFlow) return;

      ev.preventDefault();

      let screenPosition = this.getRelativePosition(ev);
      let realPosition = screenPosition.transform(this.inverseTransform);

      let hitNode = this.getHitNode(screenPosition);
      hitNode?.onContextMenu(screenPosition, realPosition);
      this.call("context-menu", { screenPos: screenPosition, realPos: realPosition, target: hitNode ?? this });
      if (!this.keymap["Control"]) this.currFlow.removeAllFocus();
      hitNode && (hitNode.focused = true);
    };
    this.canvas.ondblclick = (ev) => {
      if (!this.currFlow) return;

      ev.preventDefault();

      let screenPosition = this.getRelativePosition(ev);
      let realPosition = screenPosition.transform(this.inverseTransform);

      let hitNode = this.getHitNode(screenPosition);
      let hitColor = Color.rgbaToString(this.offUIContext.getImageData(screenPosition.x, screenPosition.y, 1, 1).data);
      let currHitUINode = hitNode.getHitUINode(hitColor);
      if (!currHitUINode) {
        this.call("dbl-press", { screenPos: screenPosition, realPos: realPosition, target: hitNode ?? this });
      }
    };
    this.canvas.onwheel = (ev: WheelEvent) => {
      if (!this.currFlow) return;

      let screenPosition = this.getRelativePosition(ev);
      let hitNode = this.getHitNode(screenPosition);
      if (hitNode) {
        let hitColor = Color.rgbaToString(
          this.offUIContext.getImageData(screenPosition.x, screenPosition.y, 1, 1).data
        );
        let hitUINode = hitNode.getHitUINode(hitColor);

        // Need to add touch compability for pinch on UINodes
        if (hitUINode?.zoomable) {
          hitNode.onWheel(ev.deltaY < 0, screenPosition, screenPosition.transform(this.inverseTransform));
          return;
        }
      }

      if (!this.disableScale) {
        ev.preventDefault();
        this.handleZoom(ev.deltaY < 0, screenPosition, this.wheelScaleDelta);
      }
    };
  }
  private deRegisterEvents() {
    document.onkeydown = null;
    document.onkeyup = null;
    this.canvas.onpointerdown = null;
    this.canvas.onpointerup = null;
    this.canvas.onpointerout = null;
    this.canvas.onpointermove = null;
    this.canvas.onclick = null;
    this.canvas.oncontextmenu = null;
    this.canvas.ondblclick = null;
    this.canvas.onwheel = null;
  }
  private addCurrAsNewGroup() {
    let newGroup = this.currGroup;
    this.currGroup = null;
    if (newGroup.width > 10 && newGroup.height > 10) {
      this.currFlow.groups.push(newGroup);

      [...this.currFlow.nodes.values()]
        .filter((node) => !node.group && node.renderState.viewport === ViewPort.INSIDE)
        .forEach((node) => newGroup.add(node));
    }
  }
  private setGenericInput() {
    this.genericInput.className = "flow-connect-input";
    this.genericInput.style.visibility = "hidden";
    this.genericInput.style.pointerEvents = "none";
    this.genericInput.style.padding = "0";

    this.genericInput.onblur = () => {
      this.genericInput.style.visibility = "hidden";
      this.genericInput.style.pointerEvents = "none";

      this.genericInput.onchange = null;
    };

    document.body.appendChild(this.genericInput);
  }
  async setupAudioContext() {
    if ((window as any).__FLOWCONNECT_AUDIO_CTX__) {
      this._audioContext = (window as any).__FLOWCONNECT_AUDIO_CTX__;
    } else {
      this._audioContext = new AudioContext();
      (window as any).__FLOWCONNECT_AUDIO_CTX__ = this._audioContext;
    }

    // This one-time setup is not at all related to FlowConnect, couldn't find any place to do this
    // Might be a better idea to do this somewhere in StandardNodes Audio package

    if (!FlowConnect.audioWorkletsRegistered) {
      let workletUtils = generateWorkletUtils();
      let audioWorklets = generateAudioWorklets(workletUtils.CircularBuffer);
      await this.audioContext.audioWorklet.addModule(workletUtils.CircularBuffer);
      await Promise.all(
        Object.keys(audioWorklets).map((key) => this.audioContext.audioWorklet.addModule(audioWorklets[key]))
      );

      FlowConnect.audioWorkletsRegistered = true;
    }
  }

  showGenericInput(
    position: Vector | DOMPoint,
    value: string,
    styles: Record<string, any>,
    attributes: Record<string, any>,
    callback: (value: string) => void
  ) {
    if (document.activeElement === this.genericInput) return;

    Object.assign(this.genericInput.style, styles);
    Object.assign(this.genericInput, attributes);

    Object.assign(this.genericInput.style, {
      left: position.x + this.canvasDimensions.left + "px",
      top: position.y + this.canvasDimensions.top - 3 + "px",
      visibility: "visible",
      pointerEvents: "all",
    });
    this.genericInput.value = value;
    this.genericInput.onchange = () => callback(this.genericInput.value);
    this.genericInput.focus();
  }
  changeParent(newParent: HTMLElement) {
    this.registerObservers(newParent);
  }
  private updatePointer(id: number, screenPosition: Vector, realPosition: Vector) {
    let pointer = this.pointers.find((pntr) => pntr.id === id);
    if (pointer) {
      pointer.screenPosition = screenPosition;
      pointer.realPosition = realPosition;
    }
  }
  private handleZoom(zoomIn: boolean, origin: Vector, scaleDelta: number) {
    if ((this._transform.a >= this.maxScale && zoomIn) || (this._transform.a <= this.minScale && !zoomIn)) return;
    this.updateTransform(zoomIn ? scaleDelta : 1 / scaleDelta, origin, null);
    this.currFlow?.call("scale", this.scale);
    this.call("scale", this.scale);
  }
  private handleGrouping(screenPosition: Vector) {
    let hitGroup = this.getHitGroup(screenPosition);

    let intersection;
    if (hitGroup) {
      let groupRealPos = hitGroup.position.transform(this._transform);
      let nodeRealPos = this.currHitNode.position.transform(this._transform);

      intersection = intersects(
        groupRealPos.x,
        groupRealPos.y,
        groupRealPos.x + hitGroup.width * this.scale,
        groupRealPos.y + hitGroup.height * this.scale,
        nodeRealPos.x,
        nodeRealPos.y,
        nodeRealPos.x + this.currHitNode.width * this.scale,
        nodeRealPos.y + this.currHitNode.height * this.scale
      );
    }

    if (this.currHitNode.group && (this.currHitNode.group !== hitGroup || intersection !== ViewPort.INSIDE)) {
      this.currHitNode.group.remove(this.currHitNode);
    }
    if (hitGroup && intersection === ViewPort.INSIDE) {
      hitGroup.add(this.currHitNode);
    }
  }
  private handleConnection(hitNode: Node, screenPosition: Vector, realPosition: Vector) {
    if (!hitNode) {
      this.currFlow.removeFloatingConnector();
      return;
    }
    let hitTerminal = hitNode.getHitTerminal(
      Color.rgbaToString(this._offUIContext.getImageData(screenPosition.x, screenPosition.y, 1, 1).data),
      screenPosition.clone(),
      realPosition.clone()
    );
    if (hitTerminal) hitNode.currHitTerminal = hitTerminal;
    if (!hitTerminal) {
      this.currFlow.removeFloatingConnector();
      return;
    }

    let destination = hitNode.currHitTerminal;
    if (!this.currFlow.floatingConnector.canConnect(destination)) {
      this.currFlow.removeFloatingConnector();
      hitNode.currHitTerminal = null;
      destination.node.currHitTerminal = null;
    } else {
      if (destination.type === TerminalType.OUT) {
        const terminal = this.currFlow.removeFloatingConnector();
        hitNode.currHitTerminal?.onExit(null, null);
        hitNode.currHitTerminal = null;
        destination.node.currHitTerminal?.onExit(null, null);
        destination.node.currHitTerminal = null;
        terminal.connect(destination);
      } else {
        if (destination.connectors.length > 0) {
          if (destination.connectors[0].start === this.currFlow.floatingConnector.start) {
            this.currFlow.removeFloatingConnector();
            hitNode.currHitTerminal = null;
            return;
          }

          destination.disconnect();
          const terminal = this.currFlow.removeFloatingConnector();
          hitNode.currHitTerminal?.onExit(null, null);
          hitNode.currHitTerminal = null;
          destination.node.currHitTerminal?.onExit(null, null);
          destination.node.currHitTerminal = null;
          terminal.connect(destination);
        } else {
          const terminal = this.currFlow.removeFloatingConnector();
          hitNode.currHitTerminal?.onExit(null, null);
          hitNode.currHitTerminal = null;
          destination.node.currHitTerminal?.onExit(null, null);
          destination.node.currHitTerminal = null;
          terminal.connect(destination);
        }
      }
    }
  }
  private getRelativePosition(ev: PointerEvent | WheelEvent | MouseEvent) {
    return Vector.create(ev.clientX - this.canvasDimensions.left, ev.clientY - this.canvasDimensions.top);
  }
  private updateTransform(scale?: number, scaleOrigin?: Vector, translate?: Vector) {
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

    this.currFlow?.transform();

    this.call("transform", this);
  }
  translateBy(delta: Vector) {
    this.updateTransform(null, null, delta);
  }
  scaleBy(scale: number, scaleOrigin: Vector) {
    this.updateTransform(scale, scaleOrigin);
  }
  private addPointer(pointerId: number, position: Vector) {
    this.pointers.push({
      id: pointerId,
      screenPosition: position,
      realPosition: position.transform(this.inverseTransform),
    });
  }
  screenToReal(pos: Vector) {
    return pos.transform(this.inverseTransform);
  }
  private removePointer(pointers: Pointer[], ev: PointerEvent) {
    pointers.splice(
      pointers.findIndex((pointer) => pointer.id === ev.pointerId),
      1
    );
  }
  private getHitNode(position: Vector): Node {
    let rgbaString = Color.rgbaToString(this._offContext.getImageData(position.x, position.y, 1, 1).data);
    return this.currFlow.nodeHitColors.get(rgbaString);
  }
  private getHitGroup(position: Vector): Group {
    let rgbaString = Color.rgbaToString(this._offGroupContext.getImageData(position.x, position.y, 1, 1).data);
    return this.currFlow.groupHitColors.get(rgbaString);
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

  startGlobalTime() {
    if (this.startTime < 0) {
      this.startTime = performance.now();
      this._startGlobalTime();
      this.state = FlowConnectState.Running;
      this.call("start", this);
    }
  }
  private _startGlobalTime() {
    this.call("tick", this);
    this.currFlow?.call("tick");
    this.timerId = window.requestAnimationFrame(this._startGlobalTime.bind(this));
  }

  stopGlobalTime() {
    if (this.isRootFlowStopped()) {
      cancelAnimationFrame(this.timerId);
      this.startTime = -1;
      this.state = FlowConnectState.Stopped;
      this.call("tickreset", this);
      this.currFlow?.call("tickreset");
      this.call("stop", this);
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
    this.call("render", this);

    this.frameId = window.requestAnimationFrame(this._render.bind(this));
  }

  private addFlow(flow: Flow): void {
    this.flows.push(flow);

    flow.on("start", () => this.startGlobalTime());
    flow.on("stop", () => this.stopGlobalTime());
  }
  createFlow(options: FlowOptions): Flow {
    const flow = Flow.create(this, options);
    this.addFlow(flow);
    return flow;
  }
  render(flow: Flow) {
    if (flow === this.currFlow) return;
    if (this.currFlow) {
      window.cancelAnimationFrame(this.frameId);
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
  /** Serializes a flow to json
   * @param flow The flow
   */
  async toJson(flow: Flow, persist?: DataPersistenceProvider): Promise<string> {
    try {
      let serializedFlow: SerializedFlow = await flow.serialize(persist);
      return JSON.stringify(serializedFlow, null);
    } catch (error) {
      Log.error(error);
    }
  }
  /** Creates a flow from json
   * @param json Json string with schema SerializedFlow
   */
  async fromJson(json: string, receive?: DataFetchProvider): Promise<Flow> {
    let data: SerializedFlow;
    let flow: Flow = null;

    try {
      data = JSON.parse(json);
      flow = await Flow.deSerialize(this, data, receive);
      this.addFlow(flow);
    } catch (error) {
      Log.error(error);
    }
    return flow;
  }
  detach() {
    this.currFlow?.stop();
    this.deRegisterObservers();
    this.deRegisterEvents();
    this.deRegisterChangeListeners();
  }
  //#endregion
}

export enum FlowConnectState {
  Stopped = "Stopped",
  Running = "Running",
}

export * from "./common/index.js";
export * from "./core/index.js";
export * from "./utils/index.js";
export * from "./ui/index.js";
