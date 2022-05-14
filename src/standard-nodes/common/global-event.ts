import { Flow } from "../../core/flow.js";
import { Vector } from "../../core/vector.js";
import { NodeCreatorOptions } from "../../common/interfaces.js";
import { GlobalEventType } from "../../common/enums.js";
import { Node } from "../../core/node.js";
import { get, getNewUUID } from "../../utils/utils.js";
import { InputType, Input } from "../../ui/index.js";

export class GlobalEvent extends Node {
  eventInput: Input;

  static DefaultState = { prevEvent: '', eventId: -1 };

  constructor(flow: Flow, type: GlobalEventType, name: string, options: NodeCreatorOptions = {}) {
    super(flow, options.name || 'Global Event', options.position || new Vector(50, 50), options.width || 150,
      type === GlobalEventType.Emitter ? [{ name: 'emit', dataType: 'event' }] : [],
      type === GlobalEventType.Receiver ? [{ name: 'receive', dataType: 'event' }] : [],
      {
        state: options.state ? { ...GlobalEvent.DefaultState, ...options.state } : GlobalEvent.DefaultState,
        style: options.style || { rowHeight: 10 },
        terminalStyle: options.terminalStyle || {}
      }
    );

    this.state.prevEvent = name;
    this.state.name = get(name, getNewUUID());

    this.setupUI();

    if (type === GlobalEventType.Emitter) {
      this.inputs[0].on('event', (_, data) => flow.globalEvents.call(this.state.name, data));
    } else {
      this.state.eventId = flow.globalEvents.on(this.state.name, data => this.outputs[0].emit(data));

      this.on('change', (_, __, prevVal) => {
        flow.globalEvents.off(prevVal, this.state.eventId);
        this.state.eventId = flow.globalEvents.on(this.state.name, data => this.outputs[0].emit(data));
      });
    }
  }

  setupUI() {
    this.eventInput = this.createInput({ propName: 'name', height: 20, style: { type: InputType.Text, grow: .6 } });
    this.ui.append(this.createHozLayout([
      this.createLabel('Event', { style: { grow: .4 } }),
      this.eventInput
    ], { style: { spacing: 10 } }));
  }
}
