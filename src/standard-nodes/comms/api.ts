import { Flow } from "../../core/flow";
import { Vector2 } from "../../math/vector";
import { NodeCreatorOptions } from "../../core/interfaces";
import { Align } from "../../math/constants";
import { Log } from "../../utils/logger";

export const API = (flow: Flow, options: NodeCreatorOptions = {}) => {

    let node = flow.createNode(
        options.name || 'API',
        options.position || new Vector2(50, 50),
        options.width || 150,
        [{ name: 'trigger', dataType: 'event' }],
        [{ name: 'data', dataType: 'event' }],
        options.style || { padding: 10, spacing: 10, rowHeight: 10 },
        options.terminalStyle || {},
        options.props ? { src: '', ...options.props } : { src: '' }
    );

    node.ui.append(node.createLabel('', 'src', true, true, { align: Align.Center }));
    node.inputs[0].on('event', async () => {
        if (!node.props.src || node.props.src === '') Log.error("Prop 'src' of API Node is invalid, cannot make an API call");
        else {
            let data = await (await fetch(node.props.src)).json();
            node.outputs[0].emit(data);
        }
    });
    return node;
};