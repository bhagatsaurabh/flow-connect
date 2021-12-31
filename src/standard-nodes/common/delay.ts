import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { List, ListNode } from "../../utils/linked-list";
import { InputType } from "../../ui/input";
import { Node } from "../../core/node";

interface BufferedEvent {
  data: any;
  timeoutId: number,
  start: number,
  remaining?: number
}

export class Delay extends Node {

  static DefaultProps: any = { delay: 0, eventQueue: null };

  constructor(flow: Flow, options: NodeCreatorOptions = {}) {
    super(flow, options.name || 'Delay', options.position || new Vector2(50, 50), options.width || 130,
      [{ name: 'event', dataType: 'event' }],
      [{ name: 'trigger', dataType: 'event' }],
      {
        props: options.props ? { ...Delay.DefaultProps, ...options.props } : Delay.DefaultProps,
        style: options.style || { rowHeight: 10 },
        terminalStyle: options.terminalStyle || {}
      }
    );

    this.setupUI();

    this.props.eventQueue = new List<BufferedEvent>((a, b) => a.timeoutId - b.timeoutId);
    this.props.eventQueue.on('removefirst', () => {
      while (this.props.eventQueue.head && (performance.now() - this.props.eventQueue.head.data.start) >= this.props.delay) {
        let bufferedEvent = this.props.eventQueue.removeFirst(false);
        this.outputs[0].emit(bufferedEvent.data);
      }
    });
    this.inputs[0].on('event', (_, data) => {
      let eventNode = new ListNode<BufferedEvent>();
      eventNode.data = {
        data,
        timeoutId: window.setTimeout(() => this.triggerEvent(eventNode), this.props.delay),
        start: performance.now()
      }
      this.props.eventQueue.append(eventNode);
    });
    flow.on('start', () => {
      this.props.eventQueue.forEach((eventNode: ListNode<BufferedEvent>) => {
        eventNode.data.start = performance.now() + eventNode.data.remaining - this.props.delay;
        eventNode.data.timeoutId = window.setTimeout(() => this.triggerEvent(eventNode), eventNode.data.remaining);
      })
    });
    flow.on('stop', () => {
      this.props.eventQueue.forEach((eventNode: ListNode<BufferedEvent>) => {
        clearTimeout(eventNode.data.timeoutId);
        eventNode.data.remaining = performance.now() - eventNode.data.start;
      });
    });
  }

  triggerEvent(eventNode: ListNode<BufferedEvent>) {
    if (eventNode === this.props.eventQueue.head) {
      let bufferedEvent = this.props.eventQueue.removeFirst();
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
