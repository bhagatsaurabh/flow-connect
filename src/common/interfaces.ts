import { Vector2 } from "../core/vector";
import { LOD, ViewPort } from './enums';
import { NodeState, NodeStyle } from "../core/node";
import { TerminalStyle } from "../core/terminal";

/** @hidden 
 *  To track canvas position and dimension when scrolling or resizing
 */
export interface Dimension {
  left: number,
  top: number,
  width: number,
  height: number
}

/** @hidden
 *  A mouse or touch pointer
 */
export interface Pointer {
  id: number,
  screenPosition: Vector2,
  realPosition: Vector2
}

/** @hidden
 *  Common events for [[Node]] and [[UINode]]
 */
export interface Events {
  onEnter(screenPosition: Vector2, realPosition: Vector2): void;
  onExit(screenPosition: Vector2, realPosition: Vector2): void;
  onOver(screenPosition: Vector2, realPosition: Vector2): void;
  onDown(screenPosition: Vector2, realPosition: Vector2): void;
  onUp(screenPosition: Vector2, realPosition: Vector2): void;
  onClick(screenPosition: Vector2, realPosition: Vector2): void;
  onDrag(screenPosition: Vector2, realPosition: Vector2): void;
  onContextMenu(): void;
}

/** @hidden
 *  A set of three states on [[Node]] determining whether a node is
 *  inside/outside the viewport, minimized/maximized and level of detail for rendering
 */
export interface RenderState {
  viewport: ViewPort;
  nodeState: NodeState
  lod: LOD
}

export interface Serializable {
  serialize(): any;
}
export type RenderFunction<T, P> = (context: CanvasRenderingContext2D, params: P, target: T) => void;
export type RenderResolver<T, P> = () => RenderFunction<T, P>;

export interface Renderable<T, P> {
  renderFunction: RenderFunction<T, P>;
}

/** A set of connection rules among different data types */
export interface Rules {
  [dataType: string]: string[];
}

export interface NodeCreatorOptions {
  name?: string,
  position?: Vector2,
  width?: number,
  state?: {},
  style?: NodeStyle,
  terminalStyle?: TerminalStyle
}
