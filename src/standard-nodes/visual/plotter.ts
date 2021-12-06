import { Flow } from "../../core/flow";
import { Vector2 } from "../../math/vector";
import { DisplayStyle, NodeCreatorOptions } from "../../core/interfaces";
import { Color } from "../../core/color";
import { CustomRendererType } from "../../math/constants";

export const Plotter = (flow: Flow, options: NodeCreatorOptions = {}, height: number, color: string, displayStyle: DisplayStyle) => {

    let node = flow.createNode(
        options.name || 'Plotter',
        options.position || new Vector2(50, 50),
        options.width || 150,
        [{ name: 'data', dataType: 'vector2' }], [],
        options.style || { rowHeight: 10 },
        options.terminalStyle || {},
        options.props ? { ...options.props } : {}
    );

    let display = node.createDisplay(height, [
        { type: CustomRendererType.Auto, renderer: (ctx, width, height) => { return true; } },
        { type: CustomRendererType.Manual }
    ], displayStyle ? displayStyle : {});
    let context = display.manualOffCanvases[0].context;

    node.ui.append(display);

    node.on('process', (_, inputs) => {
        context.fillStyle = 'red';
        context.fillRect(10, 10, 100, 100);
    });

    return node;
};
