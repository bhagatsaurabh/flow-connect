import { Vector2 } from "./vector";

export class Constant {
  static TAU = (Math.PI / 180);
  static DefaultRules: { [type: string]: string[] } = { 'string': ['string'], 'number': ['number'], 'boolean': ['boolean'], 'file': ['file'], 'event': ['event'] };
  static DefaultGroupColors = {
    colors: [
      ['rgba(239, 134, 119, 1)', 'rgba(239, 134, 119, .5)'],
      ['rgba(160, 231, 125, 1)', 'rgba(160, 231, 125, .5)'],
      ['rgba(130, 182, 217, 1)', 'rgba(130, 182, 217, .5)']
    ],
    RED: () => Constant.DefaultGroupColors.colors[0],
    GREEN: () => Constant.DefaultGroupColors.colors[1],
    BLUE: () => Constant.DefaultGroupColors.colors[2],
    Random: () => Constant.DefaultGroupColors.colors[Math.floor(Math.random() * (Constant.DefaultGroupColors.colors.length - 1))]
  };

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
  static DefaultConnectorStyle = () => {
    return {
      width: 5,
      color: '#7fff00aa'
    };
  };
  static DefaultGroupStyle = () => {
    return {
      titleColor: '#000',
      fontSize: '16px',
      font: 'arial'
    };
  };
  static DefaultTerminalStyle = () => {
    return {
      radius: 4,
      borderColor: '#222',
      shadowBlur: 0,
      shadowColor: '#ccc',
      focusColor: '#bbbbbb80'
    };
  };
  static DefaultButtonStyle = () => {
    return {
      backgroundColor: '#666',
      padding: 5,
      color: '#fff',
      font: 'arial',
      fontSize: '11px'
    };
  };
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
  static DefaultDisplayStyle = () => {
    return {
      borderColor: '#000'
    };
  };
  static DefaultHorizontalLayoutStyle = () => {
    return {};
  };
  static DefaultImageStyle = () => {
    return {
      align: 'left'
    };
  };
  static DefaultInputStyle = () => {
    return {
      backgroundColor: '#eee',
      color: '#000',
      fontSize: '11px',
      font: 'arial',
      border: '1px solid black',
      align: 'left',
      type: InputType.Text
    };
  };
  static DefaultLabelStyle = () => {
    return {
      color: '#000',
      fontSize: '11px',
      font: 'arial',
      align: 'left'
    };
  };
  static DefaultSelectStyle = () => {
    return {
      arrowColor: '#000'
    };
  };
  static DefaultSliderStyle = (height: number) => {
    return {
      color: '#444',
      thumbColor: '#000',
      railHeight: 3,
      thumbRadius: height / 2
    }
  }
  static DefaultSourceStyle = () => {
    return {
      borderColor: '#000'
    };
  };
  static DefaultToggleStyle = () => {
    return {
      backgroundColor: '#999',
      color: '#000'
    };
  };
}

export enum ViewPort {
  INSIDE,
  OUTSIDE,
  INTERSECT
}
export enum NodeState {
  MAXIMIZED,
  MINIMIZED
}
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
  Right
}
export enum UIType {
  Button,
  Container,
  Display,
  HorizontalLayout,
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
  Stopped
}
export enum GraphState {
  Running,
  FullRun,
  Idle,
  Stopped
}