import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { InputType } from "../../ui/input";
import { NodeCreatorOptions } from "../../common/interfaces";

export const Timer = (flow: Flow, options: NodeCreatorOptions = {}) => {
  let lastTrigger: number = Number.MIN_VALUE;

  let node = flow.createNode(options.name || 'Timer', options.position || new Vector2(50, 50), options.width || 150, {
    outputs: [{ name: 'timer', dataType: 'event' }],
    props: options.props ? { delay: 1000, ...options.props } : { delay: 1000 },
    style: options.style || { rowHeight: 10 },
    terminalStyle: options.terminalStyle || {}
  });

  node.ui.append(node.createInput({ propName: 'delay', height: 20, style: { type: InputType.Number } }));

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
