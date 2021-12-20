import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { Color } from "../../core/color";
import { InputType } from "../../ui/input";
import { CustomRendererType, DisplayStyle } from "../../ui/display";

export const LineChartMini = (flow: Flow, options: NodeCreatorOptions = {}, height: number, colors: string[], displayStyle: DisplayStyle) => {

  let node = flow.createNode(
    options.name || 'Line Chart Mini',
    options.position || new Vector2(50, 50),
    options.width || 150,
    [{ name: 'data', dataType: 'array' }], [],
    options.style || { rowHeight: 10 },
    options.terminalStyle || {},
    options.props ? { size: 10, ...options.props } : { size: 10 }
  );

  let display = node.createDisplay(height, [{
    type: CustomRendererType.Auto,
    renderer: (context, wdth, hght) => {
      let data = node.getInputs();
      if (!data || !data[0]) return true;
      data[0].forEach((input: number[], index: number) => {
        if (!input) return;
        let spacing = Number((wdth / (node.props.size - 1)).toFixed(2));
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
  node.ui.append(display);
  let sizeInput = node.createInput({ propName: 'size', input: true, output: true, height: 20, style: { type: InputType.Number, grow: .5 } });
  node.ui.append(node.createHozLayout([
    node.createLabel('Size'),
    sizeInput
  ], { style: { spacing: 20 } }));

  return node;
};
