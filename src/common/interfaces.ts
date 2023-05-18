import { Vector } from "../core/vector.js";
import { LOD, ViewPort } from "./enums.js";
import { NodeState, NodeStyle } from "../core/node.js";
import { TerminalStyle } from "../core/terminal.js";

/**
 *  To track canvas position and dimension when scrolling or resizing
 */
export interface Dimension {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** @hidden
 *  A mouse or touch pointer
 */
export interface Pointer {
  id: number;
  screenPosition: Vector;
  realPosition: Vector;
}

/** @hidden
 *  Common events for [[Node]] and [[UINode]]
 */
export interface Events {
  onEnter(screenPosition: Vector, realPosition: Vector): void;
  onExit(screenPosition: Vector, realPosition: Vector): void;
  onOver(screenPosition: Vector, realPosition: Vector): void;
  onDown(screenPosition: Vector, realPosition: Vector): void;
  onUp(screenPosition: Vector, realPosition: Vector): void;
  onClick(screenPosition: Vector, realPosition: Vector): void;
  onDrag(screenPosition: Vector, realPosition: Vector): void;
  onContextMenu(): void;
}

/** @hidden
 *  A set of three states on [[Node]] determining whether a node is
 *  inside/outside the viewport, minimized/maximized and level of detail for rendering
 */
export interface RenderState {
  viewport: ViewPort;
  nodeState: NodeState;
  lod: LOD;
}

export interface Serializable<T> {
  serialize(persist?: DataPersistenceProvider): Promise<T> | T;
}
export type RenderFunction<T, P> = (context: CanvasRenderingContext2D, params: P, target: T) => void;
export type RenderResolver<T, P> = (instance: T) => RenderFunction<T, P>;

export interface Renderable {
  render: () => void;
}

/** A set of connection rules among different data types */
export interface Rules {
  [dataType: string]: string[];
}

export interface NodeCreatorOptions {
  name?: string;
  position?: Vector;
  width?: number;
  state?: {};
  style?: NodeStyle;
  terminalStyle?: TerminalStyle;
}

export type DataPersistenceProvider = (id: string, ref: Blob) => Promise<void>;
export type DataFetchProvider = (id: string) => Promise<Blob>;
