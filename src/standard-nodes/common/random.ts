import { Flow } from "../../core/flow";
import { Vector2 } from "../../math/vector";
import { NodeCreatorOptions } from "../../core/interfaces";
import { getRandom } from "../../utils/utils";
import { InputType } from "../../math/constants";

export const Random = (flow: Flow, options: NodeCreatorOptions = {}) => {

    let node = flow.createNode(
        options.name || 'Random',
        options.position || new Vector2(50, 50),
        options.width || 150,
        [{ name: 'trigger', dataType: 'event' }],
        [{ name: 'value', dataType: 'number' }],
        options.style || { rowHeight: 10 },
        options.terminalStyle || {},
        options.props ? { min: 0, max: 100, fractional: false, ...options.props } : { fractional: false, min: 0, max: 100 }
    );

    node.ui.append(node.createHozLayout([
        node.createLabel('Min:', null, false, false),
        node.createInput(node.props.min, 'min', true, true, 20, { type: InputType.Number, grow: '.5', step: 'any' } as any)
    ], { spacing: 20 }));
    node.ui.append(node.createHozLayout([
        node.createLabel('Max:', null, false, false),
        node.createInput(node.props.max, 'max', true, true, 20, { type: InputType.Number, grow: '.5', step: 'any' } as any)
    ], { spacing: 20 }));
    node.ui.append(node.createHozLayout([
        node.createLabel('Fractional ?', null, false, false),
        node.createToggle('fractional', true, true, 10, { grow: '.2' } as any)
    ], { spacing: 10 }));

    let getValue = () => {
        if (node.props.fractional) return getRandom(node.props.min, node.props.max)
        else return Math.floor(getRandom(Math.floor(node.props.min), Math.floor(node.props.max)));
    }
    node.inputs[0].on('event', () => node.setOutputs(0, getValue()));
    node.on('process', () => node.setOutputs(0, getValue()));

    return node;
};
