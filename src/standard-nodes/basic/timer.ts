import { Flow } from "../../core/flow";
import { Vector2 } from "../../math/vector";
import { InputType } from "../../math/constants";
import { NodeCreatorOptions } from "../../core/interfaces";

export const Timer = (flow: Flow, options: NodeCreatorOptions = {}) => {
    let lastTrigger: number = Number.MIN_VALUE;

    let node = flow.createNode(
        options.name || 'Timer',
        options.position || new Vector2(50, 50),
        options.width || 150,
        [], [{ name: 'timer', dataType: 'event' }],
        options.style || { rowHeight: 10 },
        options.terminalStyle || {},
        options.props ? { delay: 1000, ...options.props } : { delay: 1000 }
    );

    node.ui.append(node.createInput(node.props.delay, 'delay', false, false, 20, { type: InputType.Number }));

    flow.flowConnect.on('tickreset', () => lastTrigger = Number.MIN_VALUE);
    flow.flowConnect.on('tick', () => {
        let current = flow.flowConnect.time;
        if (current - lastTrigger >= node.props.delay) {
            node.outputs[0].emit(null);
            lastTrigger = current;
        }
    });

    return node;
};