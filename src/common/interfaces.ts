import { Vector } from "../core/vector.js";
import { LOD, ViewPort } from "./enums.js";
import { Node, NodeOptions, NodeRenderParams, NodeState } from "../core/node.js";
import {
  Color,
  Connector,
  ConnectorRenderParams,
  Container,
  ContainerRenderParams,
  Flow,
  Group,
  GroupRenderParams,
  SerializedColor,
  Terminal,
  TerminalRenderParams,
  UINode,
  UINodeOptions,
} from "../flow-connect.js";

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
  onContextMenu(screenPosition: Vector, realPosition: Vector): void;
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
export type RenderFn<T, P> = (context: CanvasRenderingContext2D, params: P, target: T) => void;
export type Renderer<T, P> = (instance: T) => RenderFn<T, P>;

export interface NodeRenderers {
  node?: Renderer<Node, NodeRenderParams>;
  background?: Renderer<Container, ContainerRenderParams>;
  terminal?: Renderer<Terminal, TerminalRenderParams>;
}
export interface FlowConnectRenderers extends NodeRenderers {
  group?: Renderer<Group, GroupRenderParams>;
  connector?: Renderer<Connector, ConnectorRenderParams>;
}
export interface FlowRenderers extends NodeRenderers {
  group?: Renderer<Group, GroupRenderParams>;
  connector?: Renderer<Connector, ConnectorRenderParams>;
}

export interface Renderable {
  render: () => void;
}

/** A set of connection rules among different data types */
export interface Rules {
  [dataType: string]: string[];
}
export interface RuleColors {
  [dataType: string]: Color;
}
export interface SerializedRuleColors {
  [dataType: string]: SerializedColor;
}

export type DataPersistenceProvider = (id: string, ref: Blob) => Promise<void>;
export type DataFetchProvider = (id: string) => Promise<Blob>;

export type NodeConstructor<T extends Node = Node, O extends NodeOptions = NodeOptions> = {
  new (flow: Flow, options: O): T;
};
export type UIConstructor<T extends UINode = UINode, O extends UINodeOptions = UINodeOptions> = {
  new (node: Node, options: O): T;
};
export interface PluginType {
  node: NodeConstructor;
  ui: UIConstructor;
}
export type Plugins = {
  [key in keyof PluginType]: Record<string, PluginType[key]>;
};
export interface PluginMetadata {
  name: string;
  type: keyof PluginType;
}

export interface FlowConnectGlobals {
  broadcastError: boolean;
}

export interface FlowConnectCacheKeys {
  array: string;
  audio: ArrayBuffer;
}
export interface FlowConnectCacheValues {
  array: ArrayBuffer;
  audio: AudioBuffer;
}
export type FlowConnectCaches = {
  [K in keyof FlowConnectCacheKeys]: Map<FlowConnectCacheKeys[K], FlowConnectCacheValues[K]>;
};
