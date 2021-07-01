import { Color } from "../core/color";
import { Hooks } from "../core/hooks";
import { Node } from "../core/node";
import { Terminal } from "../core/terminal";
import { Vector2 } from "../math/vector";
import { LOD, NodeState, UIType, ViewPort } from '../math/constants';
import { getNewGUID, intersects } from "../utils/utils";
import { Events } from "../core/interfaces";

export abstract class UINode extends Hooks implements Events {
  draggable: boolean;
  width: number = 0;
  height: number = 0;
  children: UINode[];
  context: CanvasRenderingContext2D;
  offUIContext: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;
  position: Vector2;
  renderState: ViewPort;
  _disabled: boolean;

  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(disabled: boolean) {
    this._disabled = disabled;
    this.children.forEach(child => child.disabled = disabled);
  }

  constructor(
    public node: Node,
    position: Vector2,
    public type: UIType,
    draggable: boolean,
    public style: any,
    public propName?: string,
    public input: Terminal = null, public output: Terminal = null,
    public id: string = getNewGUID(),
    public hitColor?: Color
  ) {

    super();
    this.id = getNewGUID();
    this.context = this.node.context;
    this.offUIContext = this.node.offUIContext;
    this.setHitColor(hitColor);
    this.position = position;
    this.children = [];
    this.draggable = draggable;
    this.disabled = false;
    if (this.propName) this.node.addPropObserver(this.propName, this.onPropChange.bind(this));

    if (input) {
      this.node.inputsUI.push(this.input);
      this.input.on('connect', () => this.disabled = true);
      this.input.on('disconnect', () => this.disabled = false);
    }
    if (output) this.node.outputsUI.push(this.output);
  }

  append(childs: UINode | UINode[]) {
    if (Array.isArray(childs)) {
      this.children.push(...childs);
    } else {
      this.children.push(childs);
    }
    this.update();
  }
  update(): void {
    this.reflow();
    this.children.forEach(child => child.update());
  }
  updateRenderState() {
    if (this.node.renderState.nodeState === NodeState.MINIMIZED) return;

    let realPos = this.position.transform(this.node.flow.flowConnect.transform);
    this.renderState = intersects(
      0, 0,
      this.node.flow.flowConnect.canvasDimensions.width, this.node.flow.flowConnect.canvasDimensions.height,
      realPos.x, realPos.y,
      realPos.x + this.width * this.node.flow.flowConnect.scale,
      realPos.y + this.height * this.node.flow.flowConnect.scale
    );

    this.children.forEach(child => child.updateRenderState());
  }
  setHitColor(hitColor: Color) {
    //if (typeof this.hitColor !== 'undefined') return;

    if (!hitColor) {
      hitColor = Color.Random();
      while (this.node.hitColorToUI[hitColor.rgbaString] || this.node.hitColorToTerminal[hitColor.rgbaString]) hitColor = Color.Random();
    }
    this.hitColor = hitColor;
    this.node.hitColorToUI[this.hitColor.rgbaString] = this;
  }
  render() {
    if (this.renderState === ViewPort.OUTSIDE) return;

    if (this.node.renderState.lod === LOD.LOD1) {
      this.context.save();
      this.paintLOD1();
      this.context.restore();
    } else if (this.node.renderState.lod === LOD.LOD2) {
      this.context.save();
      this.paint();
      this.context.restore();

      this.offUIContext.save();
      this.offPaint();
      this.offUIContext.restore();
    } else {
      if (this.type === UIType.Container) {
        this.context.save();
        this.paintLOD1();
        this.context.restore();
      }
    }

    if (this.node.renderState.lod > 0) {
      if (this.input) this.input.render();
      if (this.output) this.output.render();
    }

    this.children.forEach(child => child.render());
  }

  abstract reflow(): void;
  abstract paint(): void;
  abstract paintLOD1(): void;
  abstract offPaint(): void;

  abstract onOver(screenPosition: Vector2, realPosition: Vector2): void;
  abstract onDown(screenPosition: Vector2, realPosition: Vector2): void;
  abstract onUp(screenPosition: Vector2, realPosition: Vector2): void;
  abstract onClick(screenPosition: Vector2, realPosition: Vector2): void;
  abstract onDrag(screenPosition: Vector2, realPosition: Vector2): void;
  abstract onEnter(screenPosition: Vector2, realPosition: Vector2): void;
  abstract onExit(screenPosition: Vector2, realPosition: Vector2): void;
  abstract onContextMenu(): void;

  abstract onPropChange(oldValue: any, newValue: any): void;
}
