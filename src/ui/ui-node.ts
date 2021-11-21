import { Color } from "../core/color";
import { Hooks } from "../core/hooks";
import { Node } from "../core/node";
import { Terminal } from "../core/terminal";
import { Vector2 } from "../math/vector";
import { LOD, NodeState, UIType, ViewPort } from '../math/constants';
import { getNewGUID, intersects } from "../utils/utils";
import { Events } from "../core/interfaces";

export abstract class UINode extends Hooks implements Events {
  /** @hidden */
  renderState: ViewPort;
  private _disabled: boolean;
  /** @hidden */
  hitColor: Color;

  draggable: boolean;
  width: number = 0;
  height: number = 0;
  children: UINode[];
  get context(): CanvasRenderingContext2D { return this.node.context };
  get offUIContext(): OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D { return this.node.offUIContext };
  position: Vector2;
  get disabled(): boolean { return this._disabled };
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
    hitColor?: Color
  ) {

    super();
    this.hitColor = hitColor;
    this.id = getNewGUID();
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
  /** @hidden */
  update(): void {
    this.reflow();
    this.children.forEach(child => child.update());
  }
  /** @hidden */
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
  private setHitColor(hitColor: Color) {
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
      if (this.type === UIType.Container) {
        context.save();
        this.paintLOD1();
        context.restore();
      }
    }

    if (this.node.renderState.lod > 0) {
      if (this.input) this.input.render();
      if (this.output) this.output.render();
    }

    this.children.forEach(child => child.render());
  }

  /** @hidden */
  abstract reflow(): void;
  /** @hidden */
  abstract paint(): void;
  /** @hidden */
  abstract paintLOD1(): void;
  /** @hidden */
  abstract offPaint(): void;

  /** @hidden */
  abstract onOver(screenPosition: Vector2, realPosition: Vector2): void;
  /** @hidden */
  abstract onDown(screenPosition: Vector2, realPosition: Vector2): void;
  /** @hidden */
  abstract onUp(screenPosition: Vector2, realPosition: Vector2): void;
  /** @hidden */
  abstract onClick(screenPosition: Vector2, realPosition: Vector2): void;
  /** @hidden */
  abstract onDrag(screenPosition: Vector2, realPosition: Vector2): void;
  /** @hidden */
  abstract onEnter(screenPosition: Vector2, realPosition: Vector2): void;
  /** @hidden */
  abstract onExit(screenPosition: Vector2, realPosition: Vector2): void;
  /** @hidden */
  abstract onContextMenu(): void;

  /** @hidden */
  abstract onPropChange(oldValue: any, newValue: any): void;
}