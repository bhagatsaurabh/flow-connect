import { Vector2 } from "../core/vector";
import { LOD, ViewPort } from './enums';
import { NodeState, NodeStyle } from "../core/node";
import { TerminalStyle } from "../core/terminal";

export interface Dimension {
  left: number,
  top: number,
  width: number,
  height: number
};
export interface Pointer {
  id: number,
  screenPosition: Vector2,
  realPosition: Vector2
};
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
export interface RenderState {
  viewport: ViewPort;
  nodeState: NodeState
  lod: LOD
}
export interface Serializable {
  serialize(): any;
}
export interface Rules {
  [dataType: string]: string[];
}
export interface NodeCreatorOptions {
  name?: string,
  position?: Vector2,
  width?: number,
  props?: {},
  style?: NodeStyle,
  terminalStyle?: TerminalStyle
}
export interface TerminalOutputs {
  [name: string]: any
}
