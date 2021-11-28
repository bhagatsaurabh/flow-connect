import { Flow } from "../../core/flow";
import { Vector2 } from "../../math/vector";
import { DisplayStyle, NodeCreatorOptions } from "../../core/interfaces";
import { Color } from "../../core/color";
import { InputType } from "../../math/constants";

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

    let display = node.createDisplay(height, (context, width, height) => {
        let data = node.getInputs();
        if (!data || !data[0]) return;
        data[0].forEach((input: number[], index: number) => {
            if (!input) return;
            let spacing = Number((width / (node.props.size - 1)).toFixed(2));
            context.strokeStyle = colors[index] || Color.Random().rgbaCSSString;
            context.lineWidth = 2;
            context.beginPath();
            context.moveTo(0, (1 - input[0]) * height);
            for (let i = 1; i < input.length; i += 1) context.lineTo(i * spacing, (1 - input[i]) * height);
            context.stroke();
        });
    }, displayStyle ? displayStyle : {});
    node.ui.append(display);
    let sizeInput = node.createInput(node.props.size, 'size', true, true, 20, { type: InputType.Number, grow: '.5' } as any);
    node.ui.append(node.createHozLayout([
        node.createLabel('Size', null, false, false),
        sizeInput
    ], { spacing: 20 }));

    return node;
};
