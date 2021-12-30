import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { GlobalEventType } from "../../common/enums";
import { InputType } from "../../ui/input";
import { Log } from "../../utils/logger";

export const GlobalEvent = (flow: Flow, type: GlobalEventType, name: string, options: NodeCreatorOptions = {}) => {
  if (!name) {
    Log.error('Global event name not specified');
    return;
  }

  let node = flow.createNode(options.name || 'Global Event', options.position || new Vector2(50, 50), options.width || 150, {
    inputs: type === GlobalEventType.Emitter ? [{ name: 'emit', dataType: 'event' }] : [],
    outputs: type === GlobalEventType.Receiver ? [{ name: 'receive', dataType: 'event' }] : [],
    props: options.props ? { prevEvent: '', eventId: -1, ...options.props } : { prevEvent: '', eventId: -1 },
    style: options.style || { rowHeight: 10 },
    terminalStyle: options.terminalStyle || {}
  });
  node.props.prevEvent = name;
  node.props.name = name;

  let eventInput = node.createInput({ propName: 'name', height: 20, style: { type: InputType.Text, grow: .6 } });
  node.ui.append(node.createHozLayout([
    node.createLabel('Event', { style: { grow: .4 } }),
    eventInput
  ], { style: { spacing: 10 } }));

  if (type === GlobalEventType.Emitter) {
    node.inputs[0].on('event', (_, data) => flow.globalEvents.call(node.props.name, data));
  } else {
    node.props.eventId = flow.globalEvents.on(node.props.name, data => node.outputs[0].emit(data));

    eventInput.on('change', (_, __, prevVal) => {
      flow.globalEvents.off(prevVal, node.props.eventId);
      node.props.eventId = flow.globalEvents.on(node.props.name, data => node.outputs[0].emit(data));
    });
  }

  return node;
};
