import { Rules } from "../core/interfaces";
import { Vector2 } from "./vector";

export class Constant {
  static TAU = 0.0174532925199432;
  static PI = 3.1415926535897932;
  static PHI = 1.6180339887498948;    // golden ratio
  static LN2 = 0.6931471805599453;    // natural logarithm of 2
  static LN10 = 2.302585092994046;    // natural logarithm of 10
  static LOG2E = 1.4426950408889634;  // base2 logarithm of e
  static LOG10E = 0.4342944819032518; // base10 logarithm of e
  static SIN_60 = 0.866;

  /** Default rules every [[Flow]] will have, for e.g. a string output can only be connected to string inputs.
   *  ```javascript
   *  {
   *    'string': ['string'],
   *    'number': ['number'],
   *    'boolean': ['boolean'],
   *    'file': ['file'],
   *    'event': ['event']
   *  }
   *  ```
   */
  static DefaultRules: Rules = {
    'string': ['string', 'any'],
    'number': ['number', 'any'],
    'boolean': ['boolean', 'any'],
    'array': ['array', 'any'],
    'file': ['file', 'any'],
    'event': ['event', 'any'],
    'vector2': ['vector2', 'any'],
    'any': ['any']
  };
  /** Default colors for [[Group]]s */
  static DefaultGroupColors = {
    colors: [
      ['rgba(239, 134, 119, 1)', 'rgba(239, 134, 119, .5)'],
      ['rgba(160, 231, 125, 1)', 'rgba(160, 231, 125, .5)'],
      ['rgba(130, 182, 217, 1)', 'rgba(130, 182, 217, .5)']
    ],
    RED: () => Constant.DefaultGroupColors.colors[0],
    GREEN: () => Constant.DefaultGroupColors.colors[1],
    BLUE: () => Constant.DefaultGroupColors.colors[2],
    Random: () => Constant.DefaultGroupColors.colors[Math.floor(Math.random() * Constant.DefaultGroupColors.colors.length)]
  };

  /** @hidden */
  static DefaultNodeStyle = () => {
    return {
      font: 'arial',
      fontSize: '.75rem',
      titleFont: 'arial',
      titleFontSize: '.85rem',
      color: '#000',
      titleColor: '#000',
      maximizeButtonColor: 'darkgrey',
      nodeButtonSize: 10,
      nodeButtonSpacing: 5,
      expandButtonColor: '#000',
      padding: 10,
      spacing: 10,
      rowHeight: 20,
      titleHeight: 29,
      terminalRowHeight: 24,
      terminalStripMargin: 8
    };
  };
  /** @hidden */
  static DefaultConnectorStyle = () => {
    return {
      width: 5,
      color: '#7fff00aa'
    };
  };
  /** @hidden */
  static DefaultGroupStyle = () => {
    return {
      titleColor: '#000',
      fontSize: '16px',
      font: 'arial'
    };
  };
  /** @hidden */
  static DefaultTerminalStyle = () => {
    return {
      radius: 4,
      borderColor: '#222',
      shadowBlur: 0,
      shadowColor: '#ccc',
      focusColor: '#bbbbbb80'
    };
  };
  /** @hidden */
  static DefaultButtonStyle = () => {
    return {
      backgroundColor: '#666',
      padding: 5,
      color: '#fff',
      font: 'arial',
      fontSize: '11px'
    };
  };
  /** @hidden */
  static DefaultContainerStyle = () => {
    return {
      backgroundColor: '#dddddd',
      shadowColor: '#666',
      shadowBlur: 3,
      shadowOffset: new Vector2(3, 3),
      borderWidth: 1,
      borderColor: '#444'
    };
  };
  /** @hidden */
  static DefaultDisplayStyle = () => {
    return {
      borderColor: '#000'
    };
  };
  /** @hidden */
  static DefaultHorizontalLayoutStyle = () => {
    return {
      spacing: 0
    };
  };
  /** @hidden */
  static DefaultStackStyle = () => {
    return {
      spacing: 0
    };
  };
  /** @hidden */
  static DefaultImageStyle = () => {
    return {
      align: Align.Left
    };
  };
  /** @hidden */
  static DefaultInputStyle = () => {
    return {
      backgroundColor: '#eee',
      color: '#000',
      fontSize: '11px',
      font: 'arial',
      border: '1px solid black',
      align: Align.Left,
      type: InputType.Text
    };
  };
  /** @hidden */
  static DefaultLabelStyle = () => {
    return {
      color: '#000',
      fontSize: '11px',
      font: 'arial',
      align: Align.Left
    };
  };
  /** @hidden */
  static DefaultSelectStyle = () => {
    return {
      arrowColor: '#000'
    };
  };
  /** @hidden */
  static DefaultSliderStyle = (height: number) => {
    return {
      color: '#444',
      thumbColor: '#000',
      railHeight: 3,
      thumbRadius: height / 2
    }
  }
  /** @hidden */
  static DefaultSourceStyle = () => {
    return {
      borderColor: '#000'
    };
  };
  /** @hidden */
  static DefaultToggleStyle = () => {
    return {
      backgroundColor: '#999',
      color: '#000'
    };
  };
}

/** @hidden Constants to determine whether two rectangles are inside one another or intersecting or disconnected */
export enum ViewPort {
  INSIDE = 'INSIDE',
  OUTSIDE = 'OUTSIDE',
  INTERSECT = 'INTERSECT'
}
export enum NodeState {
  MAXIMIZED,
  MINIMIZED
}
/** @hidden Levels of Detail, affects rendering while zooming in/out */
export enum LOD {
  LOD0,
  LOD1,
  LOD2
}
export enum TerminalType {
  IN = 1,
  OUT = 2
}
export enum InputType {
  Text = "text",
  Number = "number"
}
export enum Align {
  Left,
  Center,
  Right
}
export enum UIType {
  Button,
  Container,
  Display,
  HorizontalLayout,
  Stack,
  Image,
  Input,
  Label,
  Select,
  Slider,
  Source,
  Toggle
}
export enum FlowState {
  Running,
  Idle,
  Stopped
}
export enum CustomRendererType {
  Manual,
  Auto
}