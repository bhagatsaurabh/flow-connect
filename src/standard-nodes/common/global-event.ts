import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { GlobalEventType } from "../../common/enums";
import { InputType, Input } from "../../ui/input";
import { Node } from "../../core/node";
import { get, getNewUUID } from "../../utils/utils";

export class GlobalEvent extends Node {
  eventInput: Input;

  static DefaultProps = { prevEvent: '', eventId: -1 };

  constructor(flow: Flow, type: GlobalEventType, name: string, options: NodeCreatorOptions = {}) {
    super(flow, options.name || 'Global Event', options.position || new Vector2(50, 50), options.width || 150,
      type === GlobalEventType.Emitter ? [{ name: 'emit', dataType: 'event' }] : [],
      type === GlobalEventType.Receiver ? [{ name: 'receive', dataType: 'event' }] : [],
      {
        props: options.props ? { ...GlobalEvent.DefaultProps, ...options.props } : GlobalEvent.DefaultProps,
        style: options.style || { rowHeight: 10 },
        terminalStyle: options.terminalStyle || {}
      }
    );

    this.props.prevEvent = name;
    this.props.name = get(name, getNewUUID());

    this.setupUI();

    if (type === GlobalEventType.Emitter) {
      this.inputs[0].on('event', (_, data) => flow.globalEvents.call(this.props.name, data));
    } else {
      this.props.eventId = flow.globalEvents.on(this.props.name, data => this.outputs[0].emit(data));

      this.on('change', (_, __, prevVal) => {
        flow.globalEvents.off(prevVal, this.props.eventId);
        this.props.eventId = flow.globalEvents.on(this.props.name, data => this.outputs[0].emit(data));
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
