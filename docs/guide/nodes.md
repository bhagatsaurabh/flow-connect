# Nodes

## Creating a Node

A Node is a singular processing unit in a <Ref to="/reference/api/classes/flow">Flow</Ref> accepting inputs through input <Ref to="/reference/api/classes/terminal">terminals</Ref> and producing output through output <Ref to="/reference/api/classes/terminal">terminals</Ref> for other connected nodes/flows.

### Using Node constructor

<br/>
<Ref to="/reference/api/classes/node#constructor">Node.constructor</Ref>

```js
let multiplyNode = new Node(flow, 'Multiply', new Vector(552, 76), 100,
  [{ name: 'a', dataType: 'number' }, { name: 'b', dataType: 'number' }],
  [{ name: 'result', dataType: 'number' }]
);
```

### Using Flow.createNode

<br/>
<Ref to="/reference/api/classes/flow#createnode">Flow.createNode</Ref>

```js
let randomNode = flow.createNode('Random', new Vector(285, 50), 120, {
  inputs: [{ name: 'trigger', dataType: 'event' }],
  outputs: [{ name: 'random', dataType: 'number' }],
});
```

### Extending Node class

```js
class TimerNode extends Node {
  timerId = -1;
  constructor(flowInstance, position, interval) {
    super(
      flowInstance, 'Timer',
      position, 100,
      [], [{ name: 'trigger', dataType: 'event' }],
      { state: { interval } }
    );

    flowInstance.on('start', () => {
      this.outputs[0].emit();
      this.timerId = setInterval(() => this.outputs[0].emit(), this.state.interval);
    });
    flowInstance.on('stop', () => clearInterval(this.timerId));
  }
}

let timerNode = new TimerNode(flow, new Vector(45, 7), 500);
```

### Using StandardNodes.*

There are a few <Ref to="/reference/standard-nodes/common/">StandardNodes</Ref> that can be re-used instead of creating nodes from scratch:

```js
let numberSource = new StandardNodes.Common.NumberSource(flow, {
  position: new Vector(245, 128), state: { value: 100 }
});
```

<script setup>
  import Ref from "../../../components/api/Ref.vue";
</script>
