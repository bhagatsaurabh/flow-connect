import { FlowConnect } from 'flow-connect';
import { Vector, Node } from 'flow-connect/core';
import { NumberSource } from '@flow-connect/common';

// Create an instance of FlowConnect by passing it a reference of <div> or <canvas> element
let flowConnect = new FlowConnect(document.getElementById('canvas'));
// Create a Flow (which is a container of nodes that you will create)
let flow = flowConnect.createFlow({ name: 'Basic Example' });

/* There are many ways to create a node, for example
 * you can create your own custom node class that extends Node */
class TimerNode extends Node {
  timerId = -1;
  constructor(flowInstance, position, interval) {
    super(flowInstance, 'Timer', position, 100, [], [{ name: 'trigger', dataType: 'event' }], {
      state: { interval }
    });

    flowInstance.on('start', () => {
      this.outputs[0].emit();
      this.timerId = setInterval(() => this.outputs[0].emit(), this.state.interval);
    });
    flowInstance.on('stop', () => clearInterval(this.timerId));
  }
}
let timerNode = new TimerNode(flow, new Vector(45, 7), 500);

/* Or, you can create a node using Flow.createNode() */
let randomNode = flow.createNode('Random', new Vector(285, 50), 120, {
  inputs: [{ name: 'trigger', dataType: 'event' }],
  outputs: [{ name: 'random', dataType: 'number' }],
});
randomNode.inputs[0].on('event', () => {
  randomNode.setOutputs({ random: Math.random() });
});

/* Or, you can create an instance of Node class directly by using 'new Node()' */
let multiplyNode = new Node(flow, 'Multiply', new Vector(552, 76), 100,
  [{ name: 'a', dataType: 'number' }, { name: 'b', dataType: 'number' }],
  [{ name: 'result', dataType: 'number' }]
);
multiplyNode.on('process', () => {
  let a = multiplyNode.getInput('a');
  let b = multiplyNode.getInput('b');
  multiplyNode.setOutputs({ result: a * b });
});

/* There are also a whole set of pre-built nodes for specific uses */
let numberSource = new NumberSource(flow, {
  position: new Vector(245, 128), state: { value: 100 }
});

let labelNode = flow.createNode('Label', new Vector(755, 119), 120, [], []);
labelNode.ui.append(labelNode.createLabel('', { input: true, style: { precision: 2, fontSize: '14px' } }));

// Connect all the nodes
timerNode.outputs[0].connect(randomNode.inputs[0]);
randomNode.outputs[0].connect(multiplyNode.inputs[0]);
numberSource.outputs[0].connect(multiplyNode.inputs[1]);
multiplyNode.outputs[0].connect(labelNode.inputsUI[0]);

/* Specify which Flow to render on the canvas
 * you can create any number of flows, but only one can be rendered at a time */
flowConnect.render(flow);

// Now you can go ahead and run this example
