import { Vector2 } from "../math/vector";
import { Align, InputType, LOD, NodeState, TerminalType, UIType, ViewPort } from '../math/constants';

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
export interface TerminalTypeColors {
  [terminalType: string]: string;
}
export interface FlowOptions {
  name: string,
  rules: Rules,
  terminalTypeColors: TerminalTypeColors
}
export interface NodeCreatorOptions {
  name?: string,
  position?: Vector2,
  width?: number,
  props?: {},
  style?: NodeStyle,
  terminalStyle?: TerminalStyle
}

export interface ConnectorStyle {
  width?: number,
  color?: string
}
export interface GroupStyle {
  color?: string;
  borderColor?: string;
  titleColor?: string;
  fontSize?: string;
  font?: string;
}
export interface NodeStyle {
  font?: string,
  fontSize?: string,
  titleFont?: string,
  titleFontSize?: string,
  padding?: number,
  spacing?: number,
  rowHeight?: number,
  color?: string,
  titleColor?: string,
  titleHeight?: number,
  terminalRowHeight?: number,
  terminalStripMargin?: number,
  maximizeButtonColor?: string,
  expandButtonColor?: string;
  nodeButtonSize?: number,
  nodeButtonSpacing?: number,
}
export interface TerminalStyle {
  borderColor?: string,
  shadowColor?: string,
  shadowBlur?: number,
  focusColor?: string,
  radius?: number
}
export interface ToggleStyle {
  backgroundColor?: string,
  color?: string
}
export interface SourceStyle {
  borderColor?: string,
  font?: string,
  fontSize?: string,
  color?: string
}
export interface SliderStyle {
  railHeight?: number,
  thumbRadius?: number,
  color?: string,
  thumbColor?: string
}
export interface SelectStyle {
  font?: string,
  fontSize?: string,
  color?: string,
  arrowColor?: string
}
export interface LabelStyle {
  color?: string,
  fontSize?: string,
  font?: string,
  align?: Align
}
export interface InputStyle {
  backgroundColor?: string,
  color?: string,
  fontSize?: string,
  font?: string,
  border?: string,
  type?: InputType,
  align?: Align
}
export interface ButtonStyle {
  backgroundColor?: string,
  color?: string,
  fontSize?: string,
  font?: string,
  padding?: number
}
export interface ContainerStyle {
  backgroundColor?: string,
  shadowColor?: string,
  shadowBlur?: number,
  shadowOffset?: Vector2,
  borderColor?: string,
  borderWidth?: number
}
export interface DisplayStyle {
  borderColor?: string
}
export interface HorizontalLayoutStyle { }
export interface ImageStyle {
  align?: Align
}

export interface SerializedVector2 {
  x: number, y: number
}
export interface SerializedTerminal {
  id: string;
  hitColor: SerializedColor;
  type: TerminalType;
  dataType: string;
  name: string;
  style: TerminalStyle
}
export interface SerializedNode {
  hitColor: SerializedColor,
  zIndex: number,
  focused: boolean,
  id: string,
  position: SerializedVector2,
  props: { [key: string]: any },
  renderState: RenderState,
  inputs: SerializedTerminal[],
  outputs: SerializedTerminal[],
  name: string,
  style: NodeStyle,
  terminalStyle: TerminalStyle,
  ui: SerializedContainer,
  width: number,
  subFlow?: SerializedFlow
}
export interface SerializedConnector {
  startNodeId: string,
  endNodeId: string,
  startId: string,
  endId: string,
  id: string,
  style: ConnectorStyle
}
export interface SerializedFlow {
  id: string,
  name: string,
  rules: { [type: string]: string[] },
  terminalTypeColors: { [key: string]: string },
  nodes: SerializedNode[],
  groups: SerializedGroup[],
  connectors: SerializedConnector[],
  inputs: SerializedTunnelNode[],
  outputs: SerializedTunnelNode[],
  executionGraph: SerializedGraph
}
export interface SerializedGroup {
  position: SerializedVector2,
  width: number,
  height: number,
  name: string,
  style: GroupStyle,
  id: string,
  hitColor: SerializedColor,
  nodes: string[],
  nodeDeltas: SerializedVector2[]
}
export interface SerializedTunnelNode extends SerializedNode {
  proxyTerminalId: string
}
export interface SerializedUINode {
  id: string,
  type: UIType
  hitColor: SerializedColor,
  style: any,
  propName: string,
  input: SerializedTerminal,
  output: SerializedTerminal,
  childs: any[]
}
export interface SerializedContainer extends SerializedUINode {
  width: number
}
export interface SerializedButton extends SerializedUINode {
  text: string,
  height: number
}
export interface SerializedDisplay extends SerializedUINode {
  height: number
}
export interface SerializedHorizontalLayout extends SerializedUINode {
}
export interface SerializedImage extends SerializedUINode {
  source: string
}
export interface SerializedInput extends SerializedUINode {
  value: string | number,
  height: number
}
export interface SerializedLabel extends SerializedUINode {
  text: string,
  height: number
}
export interface SerializedSelect extends SerializedUINode {
  options: string[],
  height: number
}
export interface SerializedSlider extends SerializedUINode {
  min: number,
  max: number,
  value: number,
  precision: number,
  height: number
}
export interface SerializedSource extends SerializedUINode {
  accept: string,
  height: number
}
export interface SerializedToggle extends SerializedUINode {
  checked: boolean,
  height: number
}
export interface SerializedColor {
  rgba: number[]
}
export interface SerializedGraph {
  nodes: SerializedGraphNode[][],
  nodeToGraphNode: { [key: string]: string }
}
export interface SerializedGraphNode {
  id: string,
  nodeId: string,
  order: number,
  childs: string[]
}