import { Flow } from "../../core/flow";
import { Vector } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { List, ListNode } from "../../utils/linked-list";
import { Node } from "../../core/node";
import { InputType } from "../../ui/index";

interface BufferedEvent {
  data: any;
  timeoutId: number,
  start: number,
  remaining?: number
}

export class Delay extends Node {

  static DefaultState: any = { delay: 0, eventQueue: null };

  constructor(flow: Flow, options: NodeCreatorOptions = {}) {
    super(flow, options.name || 'Delay', options.position || new Vector(50, 50), options.width || 130,
      [{ name: 'event', dataType: 'event' }],
      [{ name: 'trigger', dataType: 'event' }],
      {
        state: options.state ? { ...Delay.DefaultState, ...options.state } : Delay.DefaultState,
        style: options.style || { rowHeight: 10 },
        terminalStyle: options.terminalStyle || {}
      }
    );

    this.setupUI();

    this.state.eventQueue = new List<BufferedEvent>((a, b) => a.timeoutId - b.timeoutId);
    this.state.eventQueue.on('removefirst', () => {
      while (this.state.eventQueue.head && (performance.now() - this.state.eventQueue.head.data.start) >= this.state.delay) {
        let bufferedEvent = this.state.eventQueue.removeFirst(false);
        this.outputs[0].emit(bufferedEvent.data);
      }
    });
    this.inputs[0].on('event', (_, data) => {
      let eventNode = new ListNode<BufferedEvent>();
      eventNode.data = {
        data,
        timeoutId: window.setTimeout(() => this.triggerEvent(eventNode), this.state.delay),
        start: performance.now()
      }
      this.state.eventQueue.append(eventNode);
    });
    flow.on('start', () => {
      this.state.eventQueue.forEach((eventNode: ListNode<BufferedEvent>) => {
        eventNode.data.start = performance.now() + eventNode.data.remaining - this.state.delay;
        eventNode.data.timeoutId = window.setTimeout(() => this.triggerEvent(eventNode), eventNode.data.remaining);
      })
    });
    flow.on('stop', () => {
      this.state.eventQueue.forEach((eventNode: ListNode<BufferedEvent>) => {
        clearTimeout(eventNode.data.timeoutId);
        eventNode.data.remaining = performance.now() - eventNode.data.start;
      });
    });
  }

  triggerEvent(eventNode: ListNode<BufferedEvent>) {
    if (eventNode === this.state.eventQueue.head) {
      let bufferedEvent = this.state.eventQueue.removeFirst();
      this.outputs[0].emit(bufferedEvent.data);
    }
  }
  setupUI() {
    this.ui.append(this.createHozLayout([
      this.createLabel('Delay', { style: { grow: .3 } }),
      this.createInput({ propName: 'delay', input: true, output: true, height: 20, style: { type: InputType.Number, grow: .7 } })
    ], { style: { spacing: 10 } }));
  }
}
