import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { LinkedList, LinkedListNode } from "../../utils/linked-list";
import { InputType } from "../../ui/input";

interface BufferedEvent {
  data: any;
  timeoutId: number,
  start: number,
  remaining?: number
}

export const Delay = (flow: Flow, options: NodeCreatorOptions = {}) => {

  let node = flow.createNode(
    options.name || 'Delay',
    options.position || new Vector2(50, 50),
    options.width || 130, [{ name: 'event', dataType: 'event' }],
    [{ name: 'trigger', dataType: 'event' }],
    options.style || { rowHeight: 10 },
    options.terminalStyle || {},
    options.props ? { delay: 0, eventQueue: null, ...options.props } : { delay: 0, eventQueue: null }
  );

  node.ui.append(node.createHozLayout([
    node.createLabel('Delay', null, false, false, { grow: .3 } as any),
    node.createInput(node.props.delay, 'delay', true, true, 20, { type: InputType.Number, grow: .7 } as any)
  ], { spacing: 10 }));

  node.props.eventQueue = new LinkedList<BufferedEvent>((a, b) => a.timeoutId - b.timeoutId);
  node.props.eventQueue.on('removefirst', () => {
    while (node.props.eventQueue.head && (performance.now() - node.props.eventQueue.head.data.start) >= node.props.delay) {
      let bufferedEvent = node.props.eventQueue.removeFirst(false);
      node.outputs[0].emit(bufferedEvent.data);
    }
  });
  node.inputs[0].on('event', (_, data) => {
    let eventNode = new LinkedListNode<BufferedEvent>();
    eventNode.data = {
      data,
      timeoutId: window.setTimeout(() => {
        if (eventNode === node.props.eventQueue.head) {
          let bufferedEvent = node.props.eventQueue.removeFirst();
          node.outputs[0].emit(bufferedEvent.data);
        }
      }, node.props.delay),
      start: performance.now()
    }
    node.props.eventQueue.append(eventNode);
  });
  flow.on('start', () => {
    node.props.eventQueue.forEach((eventNode: LinkedListNode<BufferedEvent>) => {
      eventNode.data.start = performance.now() + eventNode.data.remaining - node.props.delay;
      eventNode.data.timeoutId = window.setTimeout(() => {
        if (eventNode === node.props.eventQueue.head) {
          let bufferedEvent = node.props.eventQueue.removeFirst();
          node.outputs[0].emit(bufferedEvent.data);
        }
      }, eventNode.data.remaining);
    })
  });
  flow.on('stop', () => {
    node.props.eventQueue.forEach((eventNode: LinkedListNode<BufferedEvent>) => {
      clearTimeout(eventNode.data.timeoutId);
      eventNode.data.remaining = performance.now() - eventNode.data.start;
    });
  });

  return node;
};