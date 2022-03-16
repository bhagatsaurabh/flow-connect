import { Flow } from "../../core/flow";
import { Vector } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { Color } from "../../core/color";
import { Node } from "../../core/node";
import { InputType, DisplayStyle } from "../../ui/index";

export class LineChartMini extends Node {

  static DefaultState = { size: 10 };

  constructor(flow: Flow, height: number, colors: string[], displayStyle: DisplayStyle, options: NodeCreatorOptions = {}) {
    super(flow, options.name || 'Line Chart Mini', options.position || new Vector(50, 50), options.width || 150,
      [{ name: 'data', dataType: 'array' }], [],
      {
        state: options.state ? { ...LineChartMini.DefaultState, ...options.state } : LineChartMini.DefaultState,
        style: options.style || { rowHeight: 10 },
        terminalStyle: options.terminalStyle || {}
      }
    );

    this.setupUI(height, colors, displayStyle);
  }

  setupUI(height: number, colors: string[], displayStyle: DisplayStyle) {
    let display = this.createDisplay(height, [{
      auto: true,
      renderer: (context, wdth, hght) => {
        let data = this.getInputs();
        if (!data || !data[0]) return true;
        data[0].forEach((input: number[], index: number) => {
          if (!input) return;
          let spacing = Number((wdth / (this.state.size - 1)).toFixed(2));
          context.strokeStyle = colors[index] || Color.Random().rgbaCSSString;
          context.lineWidth = 2;
          context.beginPath();
          context.moveTo(0, (1 - input[0]) * hght);
          for (let i = 1; i < input.length; i += 1) context.lineTo(i * spacing, (1 - input[i]) * hght);
          context.stroke();
        });
        return true;
      }
    }], { style: displayStyle ? displayStyle : {} });
    this.ui.append(display);
    let sizeInput = this.createInput({ propName: 'size', input: true, output: true, height: 20, style: { type: InputType.Number, grow: .5 } });
    this.ui.append(this.createHozLayout([
      this.createLabel('Size'),
      sizeInput
    ], { style: { spacing: 20 } }));
  }
}
